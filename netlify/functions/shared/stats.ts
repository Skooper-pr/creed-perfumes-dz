export interface SalesStats {
  todayOrdersCount: number;
  todayRevenue: number;
  todayDeliveredRevenue: number;
  totalDeliveredRevenue: number;
  pendingCount: number;
  inProgressCount: number;
  deliveredCount: number;
  cancelledCount: number;
  topProductToday: string | null;
  topWilayaToday: string | null;
}

export function calculateSalesStats(orders: any[]): SalesStats {
  // Current date in Africa/Algiers timezone (YYYY-MM-DD)
  const algiersDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Algiers',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const todayOrders = (orders || []).filter((o) => {
    if (!o.created_at) return false;
    try {
      const orderDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Africa/Algiers',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(o.created_at));
      return orderDate === algiersDate;
    } catch {
      return (o.created_at || '').startsWith(algiersDate);
    }
  });

  const todayOrdersCount = todayOrders.length;
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const todayDeliveredRevenue = todayOrders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

  const pendingCount = (orders || []).filter((o) => o.status === 'pending').length;
  const inProgressCount = (orders || []).filter((o) => ['confirmed', 'shipped'].includes(o.status)).length;
  const deliveredCount = (orders || []).filter((o) => o.status === 'delivered').length;
  const cancelledCount = (orders || []).filter((o) => ['cancelled', 'returned'].includes(o.status)).length;

  const totalDeliveredRevenue = (orders || [])
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

  // Top selling product today
  const productCounts: Record<string, number> = {};
  for (const order of todayOrders) {
    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        const name = item.name || 'عطر';
        productCounts[name] = (productCounts[name] || 0) + (Number(item.qty) || 1);
      }
    }
  }
  let topProductToday: string | null = null;
  let maxProdCount = 0;
  for (const [name, count] of Object.entries(productCounts)) {
    if (count > maxProdCount) {
      maxProdCount = count;
      topProductToday = `${name} (${count} قطع)`;
    }
  }

  // Top wilaya today
  const wilayaCounts: Record<string, number> = {};
  for (const order of todayOrders) {
    if (order.wilaya) {
      wilayaCounts[order.wilaya] = (wilayaCounts[order.wilaya] || 0) + 1;
    }
  }
  let topWilayaToday: string | null = null;
  let maxWilayaCount = 0;
  for (const [w, c] of Object.entries(wilayaCounts)) {
    if (c > maxWilayaCount) {
      maxWilayaCount = c;
      topWilayaToday = `${w} (${c} طلبات)`;
    }
  }

  return {
    todayOrdersCount,
    todayRevenue,
    todayDeliveredRevenue,
    totalDeliveredRevenue,
    pendingCount,
    inProgressCount,
    deliveredCount,
    cancelledCount,
    topProductToday,
    topWilayaToday,
  };
}

export function formatDailyDigestMessage(stats: SalesStats, dateStr?: string): string {
  const date = dateStr || new Intl.DateTimeFormat('ar-DZ', {
    timeZone: 'Africa/Algiers',
    dateStyle: 'full',
  }).format(new Date());

  return `👑 *التقرير اليومي لمبيعات دار Creed Perfumes الجزائر*
📅 *اليوم:* ${date}
🕒 *التوقيت:* 21:00 بتوقيت الجزائر (UTC+1)
━━━━━━━━━━━━━━━━━━━━
📊 *حصيلة مبيعات اليوم:*
• إجمالي طلبيات اليوم: *${stats.todayOrdersCount}* طلبية
• القيمة التقديرية لطلبيات اليوم: *${stats.todayRevenue.toLocaleString('ar-DZ')} دج*
${stats.topProductToday ? `• العطر الأكثر طلباً اليوم: *${stats.topProductToday}*\n` : ''}${stats.topWilayaToday ? `• الولاية الأكثر طلباً: *${stats.topWilayaToday}*\n` : ''}
⏳ *موقف المخزون وحالات الطلب:*
• طلبيات معلقة بانتظار التأكيد: *${stats.pendingCount}* ${stats.pendingCount > 0 ? '⚠️' : '✨'}
• طلبيات مؤكدة وقيد الشحن: *${stats.inProgressCount}* 🚚
• طلبيات تم تسليمها للزبائن: *${stats.deliveredCount}* 📦
• طلبيات ملغاة أو مسترجعة: *${stats.cancelledCount}*

💰 *إجمالي المداخيل المحصلة نقدًا (Delivered COD):*
*${stats.totalDeliveredRevenue.toLocaleString('ar-DZ')} دج*
━━━━━━━━━━━━━━━━━━━━
✨ _نظام إدارة المبيعات الآلي — متجر دار Creed الجزائر_`;
}
