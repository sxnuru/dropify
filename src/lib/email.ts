/**
 * SendGrid email service — server-side only.
 * Never import this from client code.
 *
 * Structured for easy extension:
 * - sendOrderConfirmationEmail  (customer)
 * - sendAdminNotificationEmail  (admin)
 * - sendOrderShippedEmail       (future)
 * - sendOrderDeliveredEmail     (future)
 * - sendOrderCancelledEmail     (future)
 */

import { Resend } from 'resend';

interface OrderItem {
  product_name: string;
  sku?: string;
  selected_color?: string;
  selected_size?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image?: string;
}

interface EmailOrderData {
  tracking_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: {
    fullName?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    area?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
}

function formatGBP(amount: number): string {
  return `£${Number(amount).toFixed(2)}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function buildItemsHtml(items: OrderItem[]): string {
  return items
    .map(
      (item) => `
      <tr>
        <td width="60" style="padding-bottom: 16px;">
          ${item.image ? `<img src="${item.image}" width="60" height="60" style="border-radius: 8px; border: 1px solid #e5e7eb; object-fit: cover; display: block;" />` : `<div style="width: 60px; height: 60px; border-radius: 8px; background: #f3f4f6; border: 1px solid #e5e7eb;"></div>`}
        </td>
        <td style="padding-left: 16px; padding-bottom: 16px; vertical-align: middle;">
          <div style="font-size: 14px; color: #111827;">${item.product_name} &times; ${item.quantity}</div>
          ${item.selected_color || item.selected_size
            ? `<div style="font-size: 13px; color: #6b7280; margin-top: 4px;">${[item.selected_color, item.selected_size].filter(Boolean).join(' / ')}</div>`
            : ''}
        </td>
        <td style="text-align: right; padding-bottom: 16px; vertical-align: middle; font-size: 14px; font-weight: 500; color: #111827;">
          ${formatGBP(item.total_price)}
        </td>
      </tr>`
    )
    .join('');
}

function buildCustomerEmailHtml(order: EmailOrderData): string {
  const itemsHtml = buildItemsHtml(order.items);
  const addr = order.shipping_address;
  const addressLines = [
    addr.fullName || order.customer_name,
    addr.street,
    [addr.city, addr.state, addr.zipCode].filter(Boolean).join(' '),
    addr.country
  ].filter(Boolean).join('<br/>');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed — ${order.tracking_id}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;text-align:left;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 30px; border-bottom: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: left;">
                    <span style="background-color: #fde68a; padding: 4px 8px; font-size: 24px; font-weight: 400; color: #1f2937;">DreamShelf</span>
                  </td>
                  <td style="text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase;">
                    ORDER #${order.tracking_id.replace('ORD-', '')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Thank you message -->
          <tr>
            <td style="padding: 30px 0;">
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 400; color: #111827;">Thank you for your purchase!</h1>
              <p style="margin: 0 0 24px; font-size: 14px; color: #4b5563; line-height: 1.5;">
                We're getting your order ready to be shipped. We will notify you when it has been sent.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #1a8fce; border-radius: 4px;">
                    <a href="http://localhost:3000" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #ffffff; text-decoration: none;">View your order</a>
                  </td>
                  <td style="padding-left: 16px; font-size: 14px; color: #6b7280;">
                    or <a href="http://localhost:3000" style="color: #1a8fce; text-decoration: none;">Visit our store</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding-top: 30px;">
              <h2 style="margin: 0 0 20px; font-size: 18px; font-weight: 400; color: #111827;">Order summary</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                <tr>
                  <td width="40%"></td>
                  <td width="60%">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 14px; color: #6b7280;">Subtotal</td>
                        <td style="padding-bottom: 8px; text-align: right; font-size: 14px; font-weight: 500; color: #111827;">${formatGBP(order.subtotal)}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 14px; color: #6b7280;">Shipping</td>
                        <td style="padding-bottom: 8px; text-align: right; font-size: 14px; font-weight: 500; color: #111827;">${formatGBP(order.shipping_cost)}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 16px; font-size: 14px; color: #6b7280;">Taxes</td>
                        <td style="padding-bottom: 16px; text-align: right; font-size: 14px; font-weight: 500; color: #111827;">${formatGBP(order.tax)}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-top: 1px solid #e5e7eb; padding-top: 16px;"></td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 16px; font-size: 14px; color: #6b7280;">Total</td>
                        <td style="padding-bottom: 16px; text-align: right; font-size: 20px; font-weight: 600; color: #111827;">${formatGBP(order.total)} GBP</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 16px; font-size: 14px; color: #6b7280;">Total paid today</td>
                        <td style="padding-bottom: 16px; text-align: right; font-size: 14px; font-weight: 500; color: #111827;">${formatGBP(order.total)} GBP</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Customer Information -->
          <tr>
            <td style="padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="margin: 0 0 20px; font-size: 18px; font-weight: 400; color: #111827;">Customer information</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 16px;">
                    <div style="margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #4b5563;">Shipping address</div>
                    <div style="font-size: 14px; color: #6b7280; line-height: 1.5;">
                      ${addressLines}
                    </div>
                  </td>
                  <td width="50%" style="vertical-align: top;">
                    <div style="margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #4b5563;">Billing address</div>
                    <div style="font-size: 14px; color: #6b7280; line-height: 1.5;">
                      ${addressLines}
                    </div>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 16px;">
                    <div style="margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #4b5563;">Payment</div>
                    <div style="font-size: 14px; color: #6b7280; line-height: 1.5;">
                      ${order.payment_method}
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildAdminEmailHtml(order: EmailOrderData): string {
  const addr = order.shipping_address;
  const addressStr = [addr.street, addr.area, addr.city, addr.state, addr.zipCode, addr.country]
    .filter(Boolean)
    .join(', ');

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>New Order — ${order.tracking_id}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:#0f172a;border-radius:16px 16px 0 0;padding:24px 32px;">
              <div style="font-size:18px;font-weight:300;letter-spacing:4px;color:#fff;text-transform:uppercase;">
                DREAM<span style="font-weight:900;color:#10b981;">HUB</span>
              </div>
              <div style="margin-top:8px;font-size:13px;color:#94a3b8;">Admin Order Alert</div>
            </td>
          </tr>
          <tr>
            <td style="background:#fff;padding:32px;border:1px solid #f1f5f9;border-top:none;">
              <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
                <strong style="font-size:13px;color:#92400e;">🛒 New Order Received</strong>
                <span style="float:right;font-family:monospace;font-size:13px;font-weight:700;color:#0f172a;">${order.tracking_id}</span>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;font-size:13px;">
                <tr><td style="padding:5px 0;color:#64748b;width:40%;">Customer</td><td style="padding:5px 0;font-weight:600;color:#0f172a;">${order.customer_name}</td></tr>
                <tr><td style="padding:5px 0;color:#64748b;">Email</td><td style="padding:5px 0;font-weight:600;color:#0f172a;">${order.customer_email}</td></tr>
                <tr><td style="padding:5px 0;color:#64748b;">Phone</td><td style="padding:5px 0;font-weight:600;color:#0f172a;">${order.customer_phone || '—'}</td></tr>
                <tr><td style="padding:5px 0;color:#64748b;">Order Date</td><td style="padding:5px 0;font-weight:600;color:#0f172a;">${formatDate(order.created_at)}</td></tr>
                <tr><td style="padding:5px 0;color:#64748b;">Payment</td><td style="padding:5px 0;font-weight:600;color:#0f172a;">${order.payment_method} — ${order.payment_status}</td></tr>
                <tr><td style="padding:5px 0;color:#64748b;">Shipping To</td><td style="padding:5px 0;font-weight:600;color:#0f172a;">${addressStr}</td></tr>
                <tr><td style="padding:5px 0;color:#64748b;font-weight:700;">Order Total</td><td style="padding:5px 0;font-weight:900;color:#059669;font-size:16px;font-family:monospace;">${formatGBP(order.total)}</td></tr>
              </table>

              <div style="font-size:10px;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;margin-bottom:10px;">Items</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f1f5f9;border-radius:8px;margin-bottom:20px;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:8px 12px;text-align:left;font-size:10px;color:#94a3b8;text-transform:uppercase;">Product</th>
                    <th style="padding:8px 12px;text-align:center;font-size:10px;color:#94a3b8;text-transform:uppercase;">Qty</th>
                    <th style="padding:8px 12px;text-align:right;font-size:10px;color:#94a3b8;text-transform:uppercase;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                  <tr>
                    <td style="padding:8px 12px;font-size:12px;border-bottom:1px solid #f8fafc;">
                      ${item.product_name}
                      ${item.selected_color || item.selected_size ? `<span style="color:#94a3b8;"> (${[item.selected_color, item.selected_size].filter(Boolean).join('/')})</span>` : ''}
                    </td>
                    <td style="padding:8px 12px;text-align:center;font-size:12px;border-bottom:1px solid #f8fafc;">${item.quantity}</td>
                    <td style="padding:8px 12px;text-align:right;font-size:12px;font-weight:700;border-bottom:1px solid #f8fafc;font-family:monospace;">${formatGBP(item.total_price)}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;border:1px solid #f1f5f9;border-top:none;border-radius:0 0 16px 16px;padding:16px;text-align:center;font-size:11px;color:#94a3b8;">
              DreamShelf Admin Notification • ${new Date().getFullYear()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Main export functions ─────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(order: EmailOrderData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'orders@dreamshelf.co.uk';

  if (!apiKey || apiKey === 'YOUR_RESEND_API_KEY') {
    console.warn('[email] RESEND_API_KEY not configured. Logging customer email instead.');
    console.log('[email] Customer email would have been sent to:', order.customer_email);
    console.log('[email] Subject: Order Confirmed —', order.tracking_id);
    return;
  }

  const resend = new Resend(apiKey);
  
  const { data, error } = await resend.emails.send({
    from: `DreamShelf <${fromEmail}>`,
    to: [order.customer_email],
    subject: `Order Confirmed — ${order.tracking_id}`,
    html: buildCustomerEmailHtml(order),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
  
  console.log(`[email] Customer confirmation sent to ${order.customer_email} for ${order.tracking_id} (${data?.id})`);
}

export async function sendAdminNotificationEmail(order: EmailOrderData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'orders@dreamshelf.co.uk';
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn('[email] ADMIN_EMAIL not configured. Skipping admin notification.');
    return;
  }

  if (!apiKey || apiKey === 'YOUR_RESEND_API_KEY') {
    console.warn('[email] RESEND_API_KEY not configured. Logging admin email instead.');
    console.log('[email] Admin email would have been sent to:', adminEmail);
    console.log('[email] Subject: New Order Received —', order.tracking_id);
    return;
  }

  const resend = new Resend(apiKey);
  
  const { data, error } = await resend.emails.send({
    from: `DreamShelf Orders <${fromEmail}>`,
    to: [adminEmail],
    subject: `New Order Received — ${order.tracking_id}`,
    html: buildAdminEmailHtml(order),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
  
  console.log(`[email] Admin notification sent to ${adminEmail} for ${order.tracking_id} (${data?.id})`);
}
