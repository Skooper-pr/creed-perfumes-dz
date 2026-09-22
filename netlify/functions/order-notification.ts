import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
const chatIds = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

export const handler = async (event: { httpMethod: string; body?: string | null }) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  if (!supabase || !botToken || chatIds.length === 0) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'Order notification is not configured' }) };
  }

  try {
    const { orderId } = JSON.parse(event.body || '{}') as { orderId?: string };
    if (!orderId || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid order ID' }) };
    }

    const { error: claimError } = await supabase
      .from('telegram_notified_orders')
      .insert({ order_id: orderId });
    if (claimError?.code === '23505') {
      return { statusCode: 202, headers, body: JSON.stringify({ ok: true, alreadyNotified: true }) };
    }
    if (claimError) throw claimError;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, phone, phone_secondary, wilaya, commune, address, notes, items, total_price, delivery_fee, status, created_at')
      .eq('id', orderId)
      .maybeSingle();
    if (orderError || !order) {
      await supabase.from('telegram_notified_orders').delete().eq('order_id', orderId);
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Order not found' }) };
    }

    const itemLines = (Array.isArray(order.items) ? order.items : [])
      .map((item: { name?: string; qty?: number; price?: number }, index: number) =>
        `${index + 1}. <b>${escapeHtml(item.name)}</b> × ${Number(item.qty || 0)} (${(Number(item.price || 0) * Number(item.qty || 0)).toLocaleString('ar-DZ')} دج)`)
      .join('\n');
    const text = `👑 <b>طلبية عطور جديدة</b> — <code>#${escapeHtml(order.order_number)}</code>
━━━━━━━━━━━━━━━━━━━━
👤 <b>الاسم:</b> ${escapeHtml(order.customer_name)}
📞 <b>الهاتف:</b> ${escapeHtml(order.phone)}${order.phone_secondary ? ` / ${escapeHtml(order.phone_secondary)}` : ''}
📍 <b>الولاية والبلدية:</b> ${escapeHtml(order.wilaya)} (${escapeHtml(order.commune)})
🏠 <b>العنوان:</b> ${escapeHtml(order.address)}
${order.notes ? `📝 <b>ملاحظات:</b> ${escapeHtml(order.notes)}\n` : ''}━━━━━━━━━━━━━━━━━━━━
🛍️ <b>العطور:</b>
${itemLines}
💵 <b>التوصيل:</b> ${Number(order.delivery_fee || 0).toLocaleString('ar-DZ')} دج
💰 <b>الإجمالي:</b> ${Number(order.total_price || 0).toLocaleString('ar-DZ')} دج
📊 <b>الحالة:</b> ${escapeHtml(order.status)}
🕒 <b>التوقيت:</b> ${new Date(order.created_at).toLocaleString('ar-DZ', { timeZone: 'Africa/Algiers' })}`;

    const phone = String(order.phone || '').replace(/[^0-9]/g, '');
    const whatsappPhone = phone.startsWith('0') ? `213${phone.slice(1)}` : phone;
    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '✅ تأكيد الطلب', callback_data: `act:confirmed:${order.id}` },
          { text: '🚚 تم الشحن', callback_data: `act:shipped:${order.id}` },
