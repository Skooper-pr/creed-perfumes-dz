import { Order, OrderStatus } from '@/types';

const DEFAULT_BOT_TOKEN = '8842449617:AAE7fhWMSyN-5GtoeTiPj1SZQ-Tz6GrZhiA';
const DEFAULT_ADMIN_IDS = ['7239883874'];

export function getTelegramBotToken(): string {
  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
}

export function getTelegramAdminChatIds(): string[] {
  const envVal = process.env.NEXT_PUBLIC_TELEGRAM_ADMIN_CHAT_IDS;
  if (!envVal) return DEFAULT_ADMIN_IDS;
  return envVal
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isTelegramConfigured(): boolean {
  const token = getTelegramBotToken();
  const ids = getTelegramAdminChatIds();
  return Boolean(token && token.length > 20 && ids.length > 0);
}

export const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  pending: '⏳ بانتظار التأكيد الهاتفي مع الزبون',
  confirmed: '✅ مؤكد • جاري التجهيز والتغليف الفاخر',
  shipped: '🚚 قيد الشحن مع مندوب التوصيل',
  delivered: '📦 تم التسليم والدفع نقداً عند الباب بنجاح',
  cancelled: '❌ طلب ملغى',
  returned: '🔄 طرد راجع / مسترجع',
};

export function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Builds the Arabic HTML message for an order
 */
export function formatTelegramOrderMessage(order: Order, updatedBy?: string): string {
  const itemsText = (order.items || [])
    .map((item, idx) => `  ${idx + 1}. <b>${escapeHtml(item.name)}</b> × ${item.qty} (${(item.price * item.qty).toLocaleString('ar-DZ')} دج)`)
    .join('\n');

  const formattedDate = new Date(order.created_at).toLocaleString('ar-DZ', {
    timeZone: 'Africa/Algiers',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const cleanPhone = (order.phone || '').replace(/[\s\-\+]/g, '');

  let message = `👑 <b>طلبية عطور جديدة واردة</b> — <code>#${escapeHtml(order.order_number)}</code>
━━━━━━━━━━━━━━━━━━━━
👤 <b>الاسم واللقب:</b> ${escapeHtml(order.customer_name)}
📞 <b>رقم الهاتف:</b> <a href="tel:${cleanPhone}">${escapeHtml(order.phone)}</a>
${order.phone_secondary ? `📞 <b>هاتف ثانوي:</b> <a href="tel:${order.phone_secondary.replace(/[\s\-\+]/g, '')}">${escapeHtml(order.phone_secondary)}</a>\n` : ''}📍 <b>الولاية:</b> ${escapeHtml(order.wilaya)} (${escapeHtml(order.commune)})
🏠 <b>العنوان:</b> ${escapeHtml(order.address)}
${order.notes ? `📝 <b>ملاحظات الزبون:</b> ${escapeHtml(order.notes)}\n` : ''}━━━━━━━━━━━━━━━━━━━━
🛍️ <b>العطور المطلوبة:</b>
${itemsText}

💵 <b>تكلفة التوصيل:</b> ${order.delivery_fee.toLocaleString('ar-DZ')} دج
💰 <b>المبلغ الصافي للتحصيل (COD):</b> <b>${order.total_price.toLocaleString('ar-DZ')} دج</b>
━━━━━━━━━━━━━━━━━━━━
📊 <b>الحالة:</b> ${STATUS_DESCRIPTIONS[order.status] || order.status}
🕒 <b>التوقيت:</b> ${formattedDate}`;

  if (updatedBy) {
    message += `\n👤 <b>آخر تحديث بواسطة:</b> ${escapeHtml(updatedBy)}`;
  }

  return message;
}

/**
 * Creates inline interactive buttons for Telegram
 */
export function createOrderInlineKeyboard(order: Order) {
  const cleanPhone = (order.phone || '').replace(/[\s\-\+]/g, '');
  const waPhone = cleanPhone.startsWith('0')
    ? '213' + cleanPhone.slice(1)
    : cleanPhone.startsWith('213')
    ? cleanPhone
    : '213' + cleanPhone;

  return {
    inline_keyboard: [
      [
        { text: '✅ تأكيد الطلب', callback_data: `act:confirmed:${order.id}` },
        { text: '🚚 تم الشحن', callback_data: `act:shipped:${order.id}` },
      ],
      [
        { text: '📦 تم التسليم', callback_data: `act:delivered:${order.id}` },
        { text: '🔄 طرد راجع', callback_data: `act:returned:${order.id}` },
      ],
      [
        { text: '❌ إلغاء الطلب', callback_data: `act:cancelled:${order.id}` },
        { text: '💬 واتساب الزبون', url: `https://wa.me/${waPhone}` },
      ],
    ],
  };
}

/**
 * Dispatches an order notification to all configured admin Telegram chats/groups
 */
export async function sendTelegramOrderNotification(order: Order): Promise<boolean> {
  const token = getTelegramBotToken();
  const chatIds = getTelegramAdminChatIds();

  if (!token || chatIds.length === 0) {
    return false;
  }

  const text = formatTelegramOrderMessage(order);
  const reply_markup = createOrderInlineKeyboard(order);

  let anySuccess = false;

  await Promise.all(
    chatIds.map(async (chatId) => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            reply_markup,
            disable_web_page_preview: true,
          }),
        });

        const data = await response.json();
        if (data.ok) {
          anySuccess = true;
        } else {
          console.warn(`Telegram HTML send failed for chat_id ${chatId}, retrying plain text:`, data.description);
          // Fallback retry with plain text (without parse_mode)
          const fallbackRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: text.replace(/<[^>]*>?/gm, ''),
              reply_markup,
              disable_web_page_preview: true,
            }),
          });
          const fallbackData = await fallbackRes.json();
          if (fallbackData.ok) anySuccess = true;
        }
      } catch (err) {
        console.warn(`Telegram network error for chat_id ${chatId}:`, err);
      }
    })
  );

  return anySuccess;
}
