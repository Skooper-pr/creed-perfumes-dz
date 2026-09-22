import { createClient } from '@supabase/supabase-js';
import { calculateSalesStats, formatDailyDigestMessage } from './shared/stats';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

function getAuthorizedAdminIds(): string[] {
  const envVal = process.env.TELEGRAM_ADMIN_CHAT_IDS || '';
  if (!envVal) return [];
  return envVal
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

async function sendTelegramMessage(chatId: string, text: string) {
  if (!BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN is not configured');
    return null;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error(`Failed to send Telegram message to ${chatId}:`, err);
    return null;
  }
}

export const handler = async (event: { httpMethod?: string }) => {
  if (!BOT_TOKEN || !supabase) {
    console.error('Daily digest requires private Telegram and Supabase server credentials');
    return;
  }
  console.log('Daily digest scheduled function triggered at', new Date().toISOString());

  try {
    // 1. Fetch orders from Supabase
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders for daily digest:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database fetch error', details: error.message }),
      };
    }

    // 2. Calculate daily stats
    const stats = calculateSalesStats(orders || []);
    const message = formatDailyDigestMessage(stats);

    // 3. Send to all configured admins
    const adminChatIds = getAuthorizedAdminIds();
    const sendResults: Record<string, bo