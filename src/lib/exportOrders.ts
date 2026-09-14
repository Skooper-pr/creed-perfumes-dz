import * as XLSX from 'xlsx';
import { Order, OrderStatus } from '@/types';

export function exportOrdersToExcel(orders: Order[], filterLabel: string = 'all') {
  if (!orders || orders.length === 0) {
    alert('لا توجد طلبيات لتصديرها.');
    return;
  }

  const statusMap: Record<OrderStatus, string> = {
    pending: 'بانتظار التأكيد الهاتفي',
    confirmed: 'مؤكد وجاري التجهيز',
    shipped: 'قيد الشحن (ياليدين / ZR Express)',
    delivered: 'تم التسليم واستلام المبلغ',
    cancelled: 'طلب ملغى',
    returned: 'طلب راجع / مسترجع',
  };

  const dataRows = orders.map((order) => {
    const dateObj = new Date(order.created_at);
    const isValidDate = !isNaN(dateObj.getTime());
    
    // YYYY-MM-DD
    const dateStr = isValidDate ? dateObj.toLocaleDateString('fr-CA') : '';
    // HH:mm
    const timeStr = isValidDate
      ? dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : '';

    // Perfume items breakdown
    const itemsSummary = (order.items || [])
      .map((item) => `${item.name} [x${item.qty}]`)
      .join(' | ');

    const totalQty = (order.items || []).reduce((sum, item) => sum + Number(item.qty || 1), 0);
    const subtotal = Math.max(0, order.total_price - (order.delivery_fee || 0));

    return {
      'رقم الطلبية': order.order_number,
      'تاريخ الطلب': dateStr,
      'توقيت الطلب': timeStr,
      'اسم الزبون': order.customer_name,
      'رقم الهاتف الرئيسي': String(order.phone),
      'رقم الهاتف الاحتياطي': order.phone_secondary ? String(order.phone_secondary) : '-',
      'رمز الولاية': order.wilaya_code,
      'الولاية': order.wilaya,
      'البلدية': order.commune,
      'العنوان التفصيلي ومكان التسليم': order.address,
      'العطور والكميات المطلوبة': itemsSummary,
      'مجموع عدد العطور': totalQty,
      'مبلغ المنتجات (دج)': subtotal,
      'تكلفة التوصيل (دج)': order.delivery_fee || 0,
      'المجموع الكلي COD للدفع (دج)': order.total_price,
      'حالة الطلبية': statusMap[order.status] || order.status,
      'حالة خصم المخزون': order.stock_deducted ? 'نعم (تم الخصم)' : 'لا (في المخزن)',
      'ملاحظات الزبون': order.notes || '-',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  // Column widths for optimal Excel presentation
  worksheet['!cols'] = [
    { wch: 14 }, // رقم الطلبية
    { wch: 13 }, // تاريخ الطلب
    { wch: 12 }, // توقيت الطلب
    { wch: 22 }, // اسم الزبون
    { wch: 16 }, // رقم الهاتف الرئيسي
    { wch: 16 }, // رقم الهاتف الاحتياطي
    { wch: 11 }, // رمز الولاية
    { wch: 18 }, // الولاية
    { wch: 18 }, // البلدية
    { wch: 36 }, // العنوان ومكان التسليم
    { wch: 42 }, // العطور والكميات المطلوبة
    { wch: 14 }, // مجموع عدد العطور
    { wch: 18 }, // مبلغ المنتجات
    { wch: 18 }, // تكلفة التوصيل
    { wch: 24 }, // المجموع الكلي COD للدفع
    { wch: 25 }, // حالة الطلبية
    { wch: 18 }, // حالة خصم المخزون
    { wch: 30 }, // ملاحظات الزبون
  ];

  // Set Right-To-Left view in Excel
  worksheet['!views'] = [{ rightToLeft: true }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'طلبيات المتجر');

  const now = new Date();
  const dateTag = now.toISOString().slice(0, 10);
  const cleanFilter = filterLabel.replace(/[^a-zA-Z0-9_\u0600-\u06FF]+/g, '_');
  const fileName = `Creed_Perfumes_Orders_${cleanFilter}_${dateTag}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
