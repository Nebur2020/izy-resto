import { Order, Language } from '../types';
import { formatCurrency } from './currency';
import { formatDate } from './date';

/**
 * Enhanced function to export tip data to CSV format
 */
export function exportTipsToCSV(
  orders: Order[],
  settings: any,
  dateRange: { from: Date; to: Date },
  t: (key: string) => string,
  lng: Language
) {
  // Calculate summary statistics
  const totalTips = orders.reduce(
    (sum, order) => sum + (order.tip?.amount || 0),
    0
  );
  const averageTip = orders.length > 0 ? totalTips / orders.length : 0;
  const maxTip = Math.max(...orders.map(order => order.tip?.amount || 0));
  const totalOrdersWithTips = orders.filter(
    order => order.tip?.amount && order.tip.amount > 0
  ).length;
  const percentageWithTips =
    orders.length > 0
      ? ((totalOrdersWithTips / orders.length) * 100).toFixed(1)
      : '0';

  // Define CSV headers with meaningful names
  const headers = [
    t('common:date'),
    t('common:references'),
    t('comptability:order-amount'),
    t('common:tip'),
    t('comptability:tip-percentage'),
    t('comptability:customer-name'),
    t('common:payment-method'),
  ].join(',');

  // Add detailed summary section
  const summary = [
    `"${t('common:period')}","${formatDate(
      dateRange.from,
      false,
      lng
    )} - ${formatDate(dateRange.to, false, lng)}"`,
    `"${t('comptability:total-tips')}","${formatCurrency(
      totalTips,
      settings?.currency
    )}"`,
    `"${t('comptability:tips-average')}","${formatCurrency(
      averageTip,
      settings?.currency
    )}"`,
    `"${t('comptability:max-tip')}","${formatCurrency(
      maxTip,
      settings?.currency
    )}"`,
    `"${t(
      'comptability:orders-with-tips'
    )}","${totalOrdersWithTips} (${percentageWithTips}%)"`,
    `"${t('common:export-date')}","${formatDate(
      new Date().toISOString(),
      false,
      lng
    )}"`,
    '',
  ].join('\n');

  // Format row data with proper escaping and formatting
  const rows = orders
    .map(order => {
      return [
        `"${formatDate(order.createdAt, false, lng)}"`,
        `"${order.id}"`,
        formatCurrency(order.total || 0, settings?.currency),
        formatCurrency(order.tip?.amount || 0, settings?.currency),
        order.tip?.percentage
          ? `"${order.tip.percentage}%"`
          : `"${t('common:personalised')}"`,
        `"${order.customerName || ''}"`,
        `"${order.paymentMethod?.name || '-'}"`,
      ].join(',');
    })
    .join('\n');

  const csv = `${summary}\n${headers}\n${rows}`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  // Set appropriate download filename
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${t('common:tip')}-${formatDate(dateRange.from, false, lng)}-${formatDate(
      dateRange.to,
      false,
      lng
    )}.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Function to export tax data to CSV format
 */
export function exportTaxesToCSV(
  orders: Order[],
  settings: any,
  dateRange: { from: Date; to: Date },
  t: (key: string) => string,
  lng: Language
) {
  // Calculate summary statistics
  const totalTaxes = orders.reduce(
    (sum, order) => sum + (order.taxTotal || 0),
    0
  );

  const totalSales = orders.reduce(
    (sum, order) => sum + (order.subtotal || 0),
    0
  );

  const effectiveTaxRate =
    totalSales > 0 ? ((totalTaxes / totalSales) * 100).toFixed(2) : '0';

  // Define CSV headers with meaningful names
  const headers = [
    t('common:date'),
    t('common:references'),
    t('comptability:taxes'),
    t('comptability:tax-total'),
    t('comptability:amount-ht'),
    t('comptability:amount-ttc'),
  ].join(',');

  // Add detailed summary section
  const summary = [
    `"${t('common:period')}","${formatDate(
      dateRange.from,
      false,
      lng
    )} - ${formatDate(dateRange.to, false, lng)}"`,
    `"${t('comptability:total-taxes')}","${formatCurrency(
      totalTaxes,
      settings?.currency
    )}"`,
    `"${t('comptability:total-sales')}","${formatCurrency(
      totalSales,
      settings?.currency
    )}"`,
    `"${t('comptability:effective-tax-rate')}","${effectiveTaxRate}%"`,
    `"${t('common:export-date')}","${formatDate(
      new Date().toISOString(),
      false,
      lng
    )}"`,
    '',
  ].join('\n');

  // Format row data with proper escaping and formatting
  const rows = orders
    .map(order => {
      const taxDetails = order.taxes
        ? order.taxes
            .map(
              tax =>
                `${tax.name} (${tax.rate}%): ${formatCurrency(
                  tax.amount,
                  settings?.currency
                )}`
            )
            .join('; ')
        : '-';

      return [
        `"${formatDate(order.createdAt, false, lng)}"`,
        `"${order.id}"`,
        `"${taxDetails}"`,
        formatCurrency(order.taxTotal || 0, settings?.currency),
        formatCurrency(order.subtotal || 0, settings?.currency),
        formatCurrency(
          (order.subtotal || 0) + (order.taxTotal || 0),
          settings?.currency
        ),
      ].join(',');
    })
    .join('\n');

  const csv = `${summary}\n${headers}\n${rows}`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  // Set appropriate download filename
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${t('comptability:tax')}-${formatDate(
      dateRange.from,
      false,
      lng
    )}-${formatDate(dateRange.to, false, lng)}.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Function to export delivery data to CSV format
 */
export function exportDeliveryToCSV(
  orders: Order[],
  settings: any,
  dateRange: { from: Date; to: Date },
  t: (key: string) => string,
  lng: Language
) {
  // Calculate summary statistics
  const totalDelivery = orders.reduce(
    (sum, order) => sum + Number(order.delivery?.price || 0),
    0
  );

  const distinctZones = new Set(
    orders.map(order => order.delivery?.name || '').filter(name => name)
  );

  // Define CSV headers with meaningful names
  const headers = [
    t('common:date'),
    t('common:references'),
    t('comptability:delivery-price'),
    t('comptability:customer-name'),
    t('comptability:delivery-zone'),
  ].join(',');

  // Add detailed summary section
  const summary = [
    `"${t('common:period')}","${formatDate(
      dateRange.from,
      false,
      lng
    )} - ${formatDate(dateRange.to, false, lng)}"`,
    `"${t('comptability:total-delivery')}","${formatCurrency(
      totalDelivery,
      settings?.currency
    )}"`,
    `"${t('comptability:delivery-count')}","${orders.length}"`,
    `"${t('comptability:zones-count')}","${distinctZones.size}"`,
    `"${t('common:export-date')}","${formatDate(
      new Date().toISOString(),
      false,
      lng
    )}"`,
    '',
  ].join('\n');

  // Format row data with proper escaping and formatting
  const rows = orders
    .map(order => {
      return [
        `"${formatDate(order.createdAt, false, lng)}"`,
        `"${order.id}"`,
        formatCurrency(Number(order.delivery?.price || 0), settings?.currency),
        `"${order.customerName || order.customerPhone || '-'}"`,
        `"${order.delivery?.name || '-'}"`,
      ].join(',');
    })
    .join('\n');

  const csv = `${summary}\n${headers}\n${rows}`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  // Set appropriate download filename
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${t('comptability:delivery')}-${formatDate(
      dateRange.from,
      false,
      lng
    )}-${formatDate(dateRange.to, false, lng)}.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
