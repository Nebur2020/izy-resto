import { Currency, Language, Order, RestaurantSettings } from '../types';
import { formatCurrency } from './currency';
import { formatDate } from './date';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { formatTaxRate } from './tax';

type Translations = {
  customerLabel: string;
  qtyLabel: string;
  itemLabel: string;
  amountLabel: string;
  paymentMethodLabel: string;
  thankYouLabel: string;
  restaurantName: string;
  transactionLabel: string;
  deliveryLabel: string;
  onSiteLabel: string;
  noteLabel: string;
  subtotalLabel: string;
  tipLabel: string;
  totalLabel: string;
  amountReceivedLabel: string;
  amountDueLabel: string;
  paymentOnSiteLabel: string;
  paymentReceiveLabel: string;
  paymentMethodName: string;
  servedByLabel: string;
};

type Settings = {
  logo?: string;
  logoWidth?: number;
  name?: string;
  address?: string;
  currency?: Currency;
};

export const getPdfSettings = (settings: Settings | null) => {
  return {
    logo: settings?.logo,
    logoWidth: settings?.logoWidth,
    name: settings?.name,
    address: settings?.address,
    currency: settings?.currency,
  };
};

export const getPdfTranslationValues = (
  t: (key: string) => string
): Translations => {
  return {
    restaurantName: t('the-plate'),
    transactionLabel: t('common:transaction'),
    deliveryLabel: t('order:delivery'),
    onSiteLabel: t('order:on-site'),
    noteLabel: t('note'),
    subtotalLabel: t('cart:sub-total'),
    tipLabel: t('order:tip'),
    totalLabel: t('common:total'),
    amountReceivedLabel: t('common:amount-received'),
    amountDueLabel: t('amount-due'),
    paymentOnSiteLabel: t('common:payment-on-site'),
    paymentReceiveLabel: t('common:payment-receive'),
    servedByLabel: t('common:serve-by'),
    customerLabel: t('common:customer-label'),
    qtyLabel: t('common:qty-label'),
    itemLabel: t('common:item-label'),
    amountLabel: t('common:amount-label'),
    paymentMethodLabel: t('settingData:payment-methods'),
    thankYouLabel: t('common:thank-you-label'),
    paymentMethodName: t('common:payment-by'),
  };
};

export async function generateReceiptPDF(
  order: Order,
  translations: Translations,
  t: (key: string) => string,
  lng: Language,
  settings?: Settings
): Promise<jsPDF> {
  try {
    const receiptDiv = document.createElement('div');
    receiptDiv.style.position = 'relative';
    receiptDiv.style.background = 'white';
    receiptDiv.style.width = '100%';
    receiptDiv.style.maxWidth = '280px';
    receiptDiv.style.margin = '0 auto';
    receiptDiv.style.padding = '15px';
    receiptDiv.style.fontFamily = 'Arial, sans-serif, Courier monospace';
    receiptDiv.style.fontSize = '11px';
    receiptDiv.style.lineHeight = '1.3';
    receiptDiv.style.color = 'rgb(0, 0, 0)';
    receiptDiv.style.printColorAdjust = 'exact';

    const qrCodeUrl = await QRCode.toDataURL(
      `${window.location.origin}/order/${order.id}`,
      {
        margin: 0,
        width: 120,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }
    );

    const baseStyles =
      'color: rgb(0, 0, 0) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;';

    receiptDiv.innerHTML = `
      <div style="${baseStyles} background-color: white;">
        <!-- Header -->
        <div style="text-align: center; ${baseStyles}">
          ${
            settings?.logo
              ? `
            <div style="margin-bottom: 15px; display: flex; justify-content: center;">
              <img src="${settings.logo}" width="${
                  settings.logoWidth || 120
                }px" style="max-width: 80px;" />
            </div>
          `
              : ''
          }
          ${
            settings?.name
              ? `
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 4px; ${baseStyles}">
              ${settings?.name || translations.restaurantName}
            </div>
            `
              : ''
          }
          ${
            settings?.address
              ? `
            <div style="margin-bottom: 2px; ${baseStyles}">
              ${settings?.address || '3000, rue de Mary'}
            </div>
            `
              : ''
          }
        </div>

        <div style="border-bottom: 1px dashed rgb(0, 0, 0); margin: 8px 0;"></div>

        <!-- Order Info -->
        <div style="margin-bottom: 8px; ${baseStyles}">
          <div style="font-weight: bold; ${baseStyles}">${
      translations.transactionLabel || 'Order'
    } #${order.id.slice(0, 6)}</div>
          <div style="${baseStyles}">${formatDate(
      order.createdAt,
      false,
      lng
    )}</div>
          <div style="${baseStyles}">${
      order.diningOption === 'delivery'
        ? translations.deliveryLabel
        : translations.onSiteLabel
    }</div>
          ${
            order.tableNumber
              ? `<div style="${baseStyles}">Table #${order.tableNumber}</div>`
              : ''
          }
        </div>

        <!-- Customer Info -->
        <div style="margin-bottom: 8px; ${baseStyles}">
          <div style="font-weight: bold; ${baseStyles}">${
      translations.customerLabel || 'Customer'
    }:</div>
          <div style="${baseStyles}">${order.customerName}</div>
          ${
            order.customerPhone
              ? `<div style="${baseStyles}">${order.customerPhone}</div>`
              : ''
          }
          ${
            order.customerEmail
              ? `<div style="${baseStyles}">${order.customerEmail}</div>`
              : ''
          }
          ${
            order.customerAddress
              ? `<div style="${baseStyles}">${order.customerAddress}</div>`
              : ''
          }
          ${
            order.delivery
              ? `<div style="${baseStyles}">${translations.deliveryLabel} ${order.delivery.name}</div>`
              : ''
          }
          ${
            order.preference
              ? `<div style="font-style: italic; font-size: 10px; ${baseStyles}">${translations.noteLabel}: ${order.preference}</div>`
              : ''
          }
        </div>

        <div style="border-bottom: 1px dashed rgb(0, 0, 0); margin: 8px 0;"></div>

        <!-- Items Header -->
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px; ${baseStyles}">
          <div style="${baseStyles}">${translations.qtyLabel || 'QTY'}</div>
          <div style="flex-grow: 1; padding-left: 8px; ${baseStyles}">${
      translations.itemLabel || 'ITEM'
    }</div>
          <div style="${baseStyles}">${
      translations.amountLabel || 'AMOUNT'
    }</div>
        </div>

        <!-- Order Items -->
        <div style="margin-bottom: 8px; ${baseStyles}">
          ${order.items
            .map(
              item => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px; ${baseStyles}">
                <div style="width: 24px; ${baseStyles}">${item.quantity}</div>
                <div style="flex-grow: 1; padding-left: 8px; ${baseStyles}">${
                item.name
              }</div>
                <div style="${baseStyles}">${formatCurrency(
                item.price * item.quantity,
                settings?.currency
              )}</div>
              </div>
              ${
                item.specialInstructions
                  ? `
                <div style="display: flex; margin-left: 24px; font-size: 10px; font-style: italic; margin-bottom: 1px; ${baseStyles}">
                  <div style="flex-grow: 1; padding-left: 8px; ${baseStyles}">* ${item.specialInstructions}</div>
                  <div style="${baseStyles}"></div>
                </div>
              `
                  : ''
              }
            `
            )
            .join('')}
        </div>

        <div style="border-bottom: 1px dashed rgb(0, 0, 0); margin: 8px 0;"></div>

        <!-- Order Summary -->
        ${
          order.subtotal > 0
            ? `
          <div style="margin-bottom: 2px; ${baseStyles}">
            <div style="display: flex; justify-content: space-between; ${baseStyles}">
              <div style="${baseStyles}">${translations.subtotalLabel}</div>
              <div style="${baseStyles}">${formatCurrency(
                order.subtotal,
                settings?.currency
              )}</div>
            </div>
          `
            : ''
        }

        ${
          order.taxes?.length > 0
            ? order.taxes
                ?.map(
                  tax => `
                <div style="display: flex; justify-content: space-between; ${baseStyles}">
                  <div style="${baseStyles}">${tax.name} (${Number(
                    tax.rate
                  ).toFixed(2)}%)</div>
                  <div style="${baseStyles}">${formatCurrency(
                    tax.amount,
                    settings?.currency
                  )}</div>
                </div>
              `
                )
                .join('')
            : ''
        }

        ${
          order.tip
            ? `
          <div style="display: flex; justify-content: space-between; ${baseStyles}">
            <div style="${baseStyles}">${translations.tipLabel} ${
                order.tip.percentage ? ` (${order.tip.percentage}%)` : ''
              }</div>
            <div style="${baseStyles}">${formatCurrency(
                order.tip.amount,
                settings?.currency
              )}</div>
          </div>
          `
            : ''
        }

        ${
          order.delivery
            ? `
          <div style="display: flex; justify-content: space-between; ${baseStyles}">
            <div style="${baseStyles}">${translations.deliveryLabel}</div>
            <div style="${baseStyles}">${formatCurrency(
                Number(order.delivery.price),
                settings?.currency
              )}</div>
          </div>
          `
            : ''
        }

        <!-- Total Amount -->
        <div style="display: flex; justify-content: space-between; margin-top: 6px; margin-bottom: 4px; font-weight: bold; font-size: 13px; ${baseStyles}">
          <div style="${baseStyles}">${translations.totalLabel}</div>
          <div style="${baseStyles}">${formatCurrency(
      order.total,
      settings?.currency
    )}</div>
        </div>

        <!-- Payment Information -->
        ${
          order.amountPaid && order.amountPaid > 0
            ? `
          <div style="display: flex; justify-content: space-between; margin-top: 4px; ${baseStyles}">
            <div style="${baseStyles}">${translations.amountReceivedLabel}</div>
            <div style="${baseStyles}">${formatCurrency(
                order.amountPaid,
                settings?.currency
              )}</div>
          </div>
          `
            : ''
        }
        
        ${
          order.change && order.change > 0
            ? `
          <div style="display: flex; justify-content: space-between; margin-top: 4px; ${baseStyles}">
            <div style="${baseStyles}">${translations.amountDueLabel}</div>
            <div style="${baseStyles}">${formatCurrency(
                order.change,
                settings?.currency
              )}</div>
          </div>
          `
            : ''
        }

        <div style="margin-top: 8px; margin-bottom: 8px; ${baseStyles}">
          <div style="font-weight: bold; ${baseStyles}">${
      translations.paymentMethodLabel || 'Payment Method'
    }:</div>
          <div style="${baseStyles}">${translations.paymentMethodName}</div>
        </div>

        <div style="border-bottom: 1px dashed rgb(0, 0, 0); margin: 8px 0;"></div>

        <!-- QR Code Section -->
        <div style="text-align: center; margin: 12px 0; ${baseStyles}">
          <div style="margin-bottom: 8px; ${baseStyles}">${
      translations.paymentReceiveLabel
    }</div>
          <img src="${qrCodeUrl}" width="120" style="margin: 0 auto; display: block;" />
          ${
            order.servedBy
              ? `<div style="margin-top: 8px; ${baseStyles}">${
                  translations.servedByLabel
                } ${
                  t(`common:staff-names.${order.servedBy}`) ===
                  `staff-names.${order.servedBy}`
                    ? order.servedBy
                    : t(`common:staff-names.${order.servedBy}`)
                }</div>`
              : ''
          }
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin: 12px 0; ${baseStyles}">
          <div style="font-weight: bold; margin-bottom: 4px; ${baseStyles}">${
      translations.thankYouLabel || 'THANK YOU FOR YOUR ORDER!'
    }</div>
          <div style="${baseStyles}">${formatDate(
      order.createdAt,
      true,
      lng
    )}</div>
        </div>
        <div style="border-bottom: 1px dashed rgb(0, 0, 0); margin: 8px 0;"></div>
      </div>
    `;

    document.body.appendChild(receiptDiv);

    const canvas = await html2canvas(receiptDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      onclone: document => {
        const elements = document.getElementsByTagName('*');
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i] as HTMLElement;
          if (element.style) {
            element.style.color = 'rgb(0, 0, 0)';
          }
        }
      },
    });

    document.body.removeChild(receiptDiv);

    const contentWidth = 280;
    const contentHeight = canvas.height * (contentWidth / canvas.width);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [contentWidth, contentHeight],
      putOnlyUsedFonts: true,
      compress: true,
    });

    pdf.addImage(
      canvas.toDataURL('image/png', 1.0),
      'PNG',
      0,
      0,
      contentWidth,
      contentHeight,
      undefined,
      'FAST'
    );

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF receipt');
  }
}

export async function generateUserReceipt(
  order: Order,
  t: (key: string) => string,
  lng: Language,
  settings?: RestaurantSettings | null
): Promise<jsPDF> {
  try {
    const receiptDiv = document.createElement('div');
    receiptDiv.style.position = 'absolute';
    receiptDiv.style.left = '-9999px';
    receiptDiv.style.padding = '20px';
    receiptDiv.style.background = 'white';
    receiptDiv.style.width = '595px';

    receiptDiv.innerHTML = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000000; max-width: 515px; margin: 0 auto;">
        ${
          settings?.logo
            ? `<div style="display: flex; justify-content: center; margin-bottom: 15px;"> 
                <img src="${settings.logo}" width="${settings.logoWidth}px" height="${settings.logoHeight}px" style="max-width: 150px;" />     
              </div>`
            : ''
        }
        
        <h1 style="text-align: center; font-size: 20px; margin: 0 0 15px 0; color: #000000; font-weight: 600;">
          ${settings?.name || 'Restaurant'}
        </h1>

        <div style="text-align: center; margin-bottom: 15px;">
          <p style="color: #000000; font-size: 14px; margin: 0 0 4px 0;">
          ${t('ticket:order-summary')} #${order.id.slice(0, 8)}
          </p>
          <p style="color: #000000; font-size: 13px; margin: 0;">${formatDate(
            order.createdAt,
            true,
            lng
          )}</p>
        </div>

        <div style="margin-bottom: 15px; background: #f8f8f8; padding: 12px; border-radius: 6px;">
          <h2 style="font-size: 15px; margin: 0 0 8px 0; color: #000000;">${t(
            'order:client-details'
          )}</h2>
          <p style="color: #000000; margin: 0 0 4px 0; font-size: 13px;">${
            order.customerName
          }</p>
          <p style="color: #000000; margin: 0 0 4px 0; font-size: 13px;">${
            order.customerPhone
          }</p>
          ${
            order.customerAddress
              ? `<p style="color: #000000; margin: 0; font-size: 13px;">${order.customerAddress}</p>`
              : ''
          }
              ${
                order.delivery
                  ? `<p style="color: #000000; margin: 0; font-size: 13px;">${t(
                      'order:delivery-to'
                    )} #${order.delivery.name}</p>`
                  : ''
              }
        </div>

        <div style="margin-bottom: 15px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f4f4f4; color: #000000;">
              <th style="text-align: left; padding: 8px; font-size: 13px; font-weight: 600;">${t(
                'common:items'
              )}</th>
              <th style="text-align: right; padding: 8px; font-size: 13px; font-weight: 600;">${t(
                'common:quantity'
              )}</th>
              <th style="text-align: right; padding: 8px; font-size: 13px; font-weight: 600;">${t(
                'common:price'
              )}</th>
              <th style="text-align: right; padding: 8px; font-size: 13px; font-weight: 600;">${t(
                'common:total'
              )}</th>
            </tr>
            ${order.items
              .map(
                (item, index) => `
              <tr style="background-color: ${
                index % 2 === 0 ? '#ffffff' : '#fafafa'
              };">
                <td style="padding: 8px; font-size: 13px; color: #000000;">${
                  item.name
                }</td>
                <td style="text-align: right; padding: 8px; font-size: 13px; color: #000000;">${
                  item.quantity
                }</td>
                <td style="text-align: right; padding: 8px; font-size: 13px; color: #000000;">${formatCurrency(
                  item.price,
                  settings?.currency
                )}</td>
                <td style="text-align: right; padding: 8px; font-size: 13px; color: #000000;">${formatCurrency(
                  item.price * item.quantity,
                  settings?.currency
                )}</td>
              </tr>
            `
              )
              .join('')}
          </table>
        </div>
        <hr/> 
        <div style="margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #000000; font-size: 13px;">${t(
              'cart:sub-total'
            )}</span>
            <span style="color: #000000; font-size: 13px;">${formatCurrency(
              order.subtotal,
              settings?.currency
            )}</span>
          </div>

          ${order?.taxes
            .map(
              tax => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #000000; font-size: 13px;">${
                tax.name
              } (${formatTaxRate(tax.rate)})</span>
              <span style="color: #000000; font-size: 13px;">${formatCurrency(
                tax.amount,
                settings?.currency
              )}</span>
            </div>
          `
            )
            .join('')}
          ${
            order.tip
              ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #000000; font-size: 13px;">${
                settings?.tips.label
              }</span>
              <span style="color: #000000; font-size: 13px;">${formatCurrency(
                order.tip.amount,
                settings?.currency
              )}</span>
            </div>
          `
              : ''
          }
          
           ${
             order.delivery
               ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #000000; font-size: 13px;">${t(
                'order:delivery'
              )}</span>
              <span style="color: #000000; font-size: 13px;">${formatCurrency(
                order.delivery.price,
                settings?.currency
              )}</span>
            </div>
          `
               : ''
           }

          <div style="display: flex; justify-content: space-between; margin-top: 20px; border-top: 1px solid #eee;">
            <span style="color: #000000; font-size: 14px; font-weight: 600;">${t(
              'common:total'
            )}</span>
            <span style="color: #000000; font-size: 14px; font-weight: 600;">${formatCurrency(
              order.total,
              settings?.currency
            )}</span>
          </div>
        </div>

        <div style="text-align: center; padding-top: 12px; margin-top: 15px; border-top: 1px solid #eee;">
          <p style="color: #000000; font-size: 13px; margin: 0 0 8px 0;">${t(
            'ticket:receipt-notice'
          )}</p>
          ${
            settings?.address
              ? `<p style="color: #000000; font-size: 12px; margin: 0 0 4px 0;">${settings.address}</p>`
              : ''
          }
          ${
            settings?.phone
              ? `<p style="color: #000000; font-size: 12px; margin: 0;">${settings.phone}</p>`
              : ''
          }
        </div>
      </div>
    `;

    document.body.appendChild(receiptDiv);

    const canvas = await html2canvas(receiptDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
    });

    document.body.removeChild(receiptDiv);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const maxHeight = pdf.internal.pageSize.getHeight();
    let pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    if (pdfHeight > maxHeight) {
      pdfHeight = maxHeight;
    }

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF receipt');
  }
}
