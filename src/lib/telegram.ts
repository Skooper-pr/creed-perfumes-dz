/** Ask the server to notify admins without exposing the Telegram bot token. */
export async function sendTelegramOrderNotification(orderId: string): Promise<void> {
  try {
    await fetch('/api/order-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
      kee