import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '8842449617:AAE7fhWMSyN-5GtoeTiPj1SZQ-Tz6GrZhiA';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hkdyuasngmyzrhydariq.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrZHl1YXNuZ215enJoeWRhcmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNjk5OTQsImV4cCI6MjEwNDk0NTk5NH0.quOfiPh96n8nNT7bnO32tQZtZvMQZGvRuKDIOpn7nNU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getAuthorizedAdminIds(): string[] {
  const envVal = process.env.NEXT_PUBLIC_TELEGRAM_ADMIN_CHAT_IDS;
  if (!envVal) return ['7239883874'];
  return envVal
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

const STATUS_MAP: Record<string, { label: string; text: string }> = {
  confirmed: { label: 'مؤكد', text: '✅ تم التأكيد • جاري التجهيز والتغليف الفاخر' },
  shipped: { label: 'قيد الشحن', text: '🚚 في الطريق مع شركة التوصيل' },
  delivered: { label: 'تم التسليم', text: '📦 تم التسليم والدفع نقداً عند الباب بنجاح' },
  cancelled: { label: 'ملغى', text: '❌ طلب ملغى' },
  returned: { label: 'طرد مسترجع', text: '🔄 طرد راجع / مسترجع' },
};

async function callTelegram(method: string, payload: Record<string, unknown>) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error(`Telegram API error (${method}):`, err);
    return null;
  }
}

export const handler = async (event: { httpMethod: string; body?: string | null }) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, message: 'Telegram webhook is active' }),
    };
  }

  if (!event.body) {
    return { statusCode: 400, body: 'Empty body' };
  }

  try {
    const update = JSON.parse(event.body);
    const authorizedIds = getAuthorizedAdminIds();

    // -------------------------------------------------------------
    // 1. Handle Inline Keyboard Button Clicks (callback_query)
    // -------------------------------------------------------------
    if (update.callback_query) {
      const cq = update.callback_query;
      const fromId = String(cq.from?.id || '');
      const chatId = String(cq.message?.chat?.id || '');

      // Authorization Check
      const isAuthorized = authorizedIds.includes(fromId) || authorizedIds.includes(chatId);
      if (!isAuthorized) {
        await callTelegram('answerCallbackQuery', {
          callback_query_id: cq.id,
          text: '⛔ عذراً، حسابك غير مصرح له بتعديل طلبيات متجر Creed.',
          show_alert: true,
        });
        return { statusCode: 200, body: JSON.stringify({ ok: true }) };
      }

      const data = String(cq.data || '');
      const parts = data.split(':');

      if (parts[0] === 'act' && parts.length >= 3) {
        const newStatus = parts[1];
        const orderId = parts.slice(2).join(':');

        const statusInfo = STATUS_MAP[newStatus];
        if (!statusInfo) {
          await callTelegram('answerCallbackQuery', {
            callback_query_id: cq.id,
            text: 'حالة غير معروفة',
          });
          return { statusCode: 200, body: JSON.stringify({ ok: true }) };
        }

        // Update database in Supabase via RPC (bypasses RLS securely using bot secret)
        const { error: rpcError } = await supabase.rpc('update_order_status_via_bot', {
          p_order_id: orderId,
          p_status: newStatus,
          p_secret: BOT_TOKEN,
        });

        if (rpcError) {
          // Fallback direct update
          const shouldDeduct = ['confirmed', 'shipped', 'delivered'].includes(newStatus);
          await supabase
            .from('orders')
            .update({
              status: newStatus,
              stock_deducted: shouldDeduct,
            })
            .or(`id.eq.${orderId},order_number.eq.${orderId}`);
        }

        const adminName = cq.from?.first_name || cq.from?.username || 'المدير';
        const nowAlgiers = new Date().toLocaleTimeString('ar-DZ', {
          timeZone: 'Africa/Algiers',
          hour: '2-digit',
          minute: '2-digit',
        });

        // Edit original message text
        const originalText = cq.message?.text || '';
        let updatedText = originalText;

        const statusMarker = '📊 الحالة:';
        if (originalText.includes(statusMarker)) {
          const lines = originalText.split('\n');
          const newLines = lines.map((line: string) => {
            if (line.includes(statusMarker)) {
              return `📊 الحالة: ${statusInfo.text}\n👤 آخر تحديث بواسطة: ${adminName} (🕒 ${nowAlgiers})`;
            }
            if (line.includes('👤 آخر تحديث بواسطة:')) {
              return '';
            }
            return line;
          }).filter(Boolean);
          updatedText = newLines.join('\n');
        } else {
          updatedText += `\n━━━━━━━━━━━━━━━━━━━━\n📊 الحالة: ${statusInfo.text}\n👤 حُدث بواسطة: ${adminName} (${nowAlgiers})`;
        }

        // Keep keyboard buttons available so status can be changed again
        await callTelegram('editMessageText', {
          chat_id: cq.message.chat.id,
          message_id: cq.message.message_id,
          text: updatedText,
          parse_mode: 'Markdown',
          reply_markup: cq.message.reply_markup,
          disable_web_page_preview: true,
        });

        // Show quick toast notification to the admin who tapped the button
        await callTelegram('answerCallbackQuery', {
          callback_query_id: cq.id,
          text: `تم التحديث إلى: ${statusInfo.label} بنجاح!`,
        });

        return { statusCode: 200, body: JSON.stringify({ ok: true }) };
      }
    }

    // -------------------------------------------------------------
    // 2. Handle Text Commands (/start, /orders, /stats)
    // -------------------------------------------------------------
    if (update.message && update.message.text) {
      const msg = update.message;
      const fromId = String(msg.from?.id || '');
      const chatId = String(msg.chat?.id || '');
      const text = msg.text.trim();

      const isAuthorized = authorizedIds.includes(fromId) || authorizedIds.includes(chatId);
      if (!isAuthorized) {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: '⛔ هذا البوت مخصص حصرياً لإدارة متجر Creed Perfumes الجزائر.',
        });
        return { statusCode: 200, body: JSON.stringify({ ok: true }) };
      }

      if (text.startsWith('/start')) {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `👑 *مرحباً بك في بوت إدارة Creed Perfumes الجزائر!*

أنت مسجل كأدمن رسمي للمتجر. ستصلك هنا مباشرة تفاصيل كل طلبية جديدة مع أزرار التحكم الفوري في حالتها.

*الأوامر المتوفرة:*
• \`/orders\` — عرض آخر الطلبيات المعلقة لتأكيدها
• \`/stats\` — إحصائيات المبيعات والأرباح
• \`/help\` — تعليمات الاستخدام وإضافة مدراء آخرين`,
          parse_mode: 'Markdown',
        });
      } else if (text.startsWith('/orders')) {
        const { data: pendingOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!pendingOrders || pendingOrders.length === 0) {
          await callTelegram('sendMessage', {
            chat_id: chatId,
            text: '✨ لا توجد حالياً أي طلبيات معلقة بانتظار التأكيد! كل الطلبات تمت معالجتها.',
          });
        } else {
          await callTelegram('sendMessage', {
            chat_id: chatId,
            text: `📋 *توجد ${pendingOrders.length} طلبيات بانتظار التأكيد:*`,
            parse_mode: 'Markdown',
          });

          for (const ord of pendingOrders) {
            const cleanPhone = (ord.phone || '').replace(/[\s\-\+]/g, '');
            const waPhone = cleanPhone.startsWith('0')
              ? '213' + cleanPhone.slice(1)
              : cleanPhone.startsWith('213')
              ? cleanPhone
              : '213' + cleanPhone;

            await callTelegram('sendMessage', {
              chat_id: chatId,
              text: `📦 *طلب رقم:* \`#${ord.order_number}\`
👤 *الزبون:* ${ord.customer_name}
📞 *الهاتف:* ${ord.phone}
📍 *الولاية:* ${ord.wilaya} (${ord.commune})
💰 *المبلغ:* *${Number(ord.total_price).toLocaleString('ar-DZ')} دج*`,
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '✅ تأكيد الطلب', callback_data: `act:confirmed:${ord.id}` },
                    { text: '🚚 تم الشحن', callback_data: `act:shipped:${ord.id}` },
                  ],
                  [
                    { text: '❌ إلغاء الطلب', callback_data: `act:cancelled:${ord.id}` },
                    { text: '💬 مراسلة واتساب', url: `https://wa.me/${waPhone}` },
                  ],
                ],
              },
            });
          }
        }
      } else if (text.startsWith('/stats')) {
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: allOrders } = await supabase
          .from('orders')
          .select('status, total_price, created_at');

        const ordersList = allOrders || [];
        const todayOrders = ordersList.filter((o) => (o.created_at || '').startsWith(todayStr));
        const pendingCount = ordersList.filter((o) => o.status === 'pending').length;
        const deliveredCount = ordersList.filter((o) => o.status === 'delivered').length;
        const confirmedCount = ordersList.filter((o) => o.status === 'confirmed' || o.status === 'shipped').length;

        const totalDeliveredRevenue = ordersList
          .filter((o) => o.status === 'delivered')
          .reduce((acc, o) => acc + (Number(o.total_price) || 0), 0);

        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `📊 *تقرير مبيعات متجر Creed Perfumes:*
━━━━━━━━━━━━━━━━━━━━
📅 *طلبيات اليوم:* ${todayOrders.length} طلبية
⏳ *طلبيات معلقة بانتظار التأكيد:* ${pendingCount}
🚚 *طلبيات مؤكدة وقيد التوصيل:* ${confirmedCount}
📦 *إجمالي الطلبيات المسلمة (الناجحة):* ${deliveredCount}

💰 *إجمالي المداخيل المحصلة (Delivered COD):*
*${totalDeliveredRevenue.toLocaleString('ar-DZ')} دج*
━━━━━━━━━━━━━━━━━━━━`,
          parse_mode: 'Markdown',
        });
      } else if (text.startsWith('/help')) {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `ℹ️ *دليل الاستخدام وإضافة شركاء أو مدراء:*

1. *كيف يشارك أكثر من شخص في إدارة الطلبات؟*
   • يمكنك إنشاء مجموعة تيليجرام خاصة (Private Group).
   • أضف إليها شريكك أو موظفيك.
   • أضف البوت \`@creed_dz_orders_bot\` إلى المجموعة.
   • اكتب في المجموعة \`/start\` وستصل كل الطلبيات هناك ويمكن لأي شخص الضغط على الأزرار!

2. *حماية البوت:*
   • البوت يرفض أي شخص غريب لا يتواجد في قائمة المدراء المعتمدة.`,
          parse_mode: 'Markdown',
        });
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('Webhook execution error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
