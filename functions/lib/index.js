"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOrderConfirmationEmail = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
admin.initializeApp();
// Triggered when a new order document is written to Firestore
exports.sendOrderConfirmationEmail = (0, firestore_1.onDocumentCreated)("orders/{orderId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with this firestore snapshot event.");
        return;
    }
    const orderData = snapshot.data();
    const orderId = event.params.orderId;
    const customerEmail = orderData.customerEmail || orderData.email;
    const customerName = orderData.customerName || orderData.fullName || "Valued Customer";
    if (!customerEmail) {
        console.error(`Order ${orderId} does not contain a customer email address. Skipping email notification.`);
        return;
    }
    // Load Hostinger SMTP credentials from environment configuration
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const fromEmail = process.env.FROM_EMAIL || smtpUser;
    const fromName = process.env.FROM_NAME || "DreamShelf Curation";
    if (!smtpHost || !smtpUser || !smtpPassword) {
        console.error("Missing secure SMTP server credentials. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in Firebase environment secrets.");
        return;
    }
    // Create NodeMailer transport configuration
    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // True for port 465 SSL, false for port 587 TLS
        auth: {
            user: smtpUser,
            pass: smtpPassword,
        },
    });
    // Compile purchase items lists into clean HTML rows
    const items = orderData.items || [];
    let itemsHtml = "";
    items.forEach((item) => {
        const name = item.name || item.title || "Product Piece";
        const price = item.price || 0;
        const qty = item.quantity || 1;
        const colorStr = item.color ? `<span style="color: #64748b; font-size: 11px; display: block; margin-top: 2px;">Color: ${item.color}</span>` : "";
        const sizeStr = item.size ? `<span style="color: #64748b; font-size: 11px; display: block;">Size: ${item.size}</span>` : "";
        itemsHtml += `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 16px 0; text-align: left;">
          <span style="font-weight: 600; color: #0f172a; font-size: 14px; display: block;">${name}</span>
          ${colorStr}
          ${sizeStr}
        </td>
        <td style="padding: 16px 0; text-align: center; color: #475569; font-size: 14px; font-weight: 500;">x${qty}</td>
        <td style="padding: 16px 0; text-align: right; font-family: monospace; font-weight: 700; color: #0f172a; font-size: 14px;">£${(price * qty).toFixed(2)}</td>
      </tr>
    `;
    });
    const total = orderData.total || 0;
    const deliveryType = orderData.shippingSpeed === "express" ? "Express Courier Dispatch" : "Standard Premium Delivery";
    const estimatedDelivery = orderData.estimatedDelivery || "3-5 business days";
    // Build responsive, elegant Apple-inspired HTML template
    const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - ${orderId}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafafa; padding: 48px 0;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #0f172a; padding: 40px 48px; text-align: center;">
                    <span style="font-family: monospace; font-size: 10px; font-weight: 700; color: #3b82f6; letter-spacing: 0.25em; uppercase; display: block; margin-bottom: 8px;">DREAMSHELF CURATION</span>
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; tracking-tight: -0.025em;">Order Confirmed</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 48px;">
                    <p style="margin-top: 0; margin-bottom: 24px; font-size: 15px; line-height: 1.6; color: #334155;">
                      Dear ${customerName},
                    </p>
                    <p style="margin-bottom: 32px; font-size: 15px; line-height: 1.6; color: #334155;">
                      Thank you for choosing DreamShelf. We are pleased to confirm that your transaction was successfully processed. Your order ID is <strong style="font-family: monospace; color: #0f172a;">${orderId}</strong>.
                    </p>

                    <!-- Order Summary -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                      <thead>
                        <tr style="border-bottom: 2px solid #e2e8f0;">
                          <th style="padding-bottom: 12px; text-align: left; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; font-family: monospace; letter-spacing: 0.1em;">Item</th>
                          <th style="padding-bottom: 12px; text-align: center; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; font-family: monospace; letter-spacing: 0.1em; width: 60px;">Qty</th>
                          <th style="padding-bottom: 12px; text-align: right; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; font-family: monospace; letter-spacing: 0.1em; width: 100px;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>

                    <!-- Totals Table -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 40px; background-color: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #f1f5f9;">
                      <tr>
                        <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">Delivery Method</td>
                        <td style="font-size: 13px; text-align: right; color: #0f172a; font-weight: 600; padding-bottom: 8px;">${deliveryType}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">Estimated Arrival</td>
                        <td style="font-size: 13px; text-align: right; color: #10b981; font-weight: 600; padding-bottom: 8px;">${estimatedDelivery}</td>
                      </tr>
                      <tr style="border-top: 1px dashed #e2e8f0;">
                        <td style="font-size: 15px; font-weight: 700; color: #0f172a; padding-top: 16px;">Grand Total</td>
                        <td style="font-size: 18px; font-weight: 800; text-align: right; color: #3b82f6; font-family: monospace; padding-top: 16px;">£${total.toFixed(2)}</td>
                      </tr>
                    </table>

                    <!-- Footer Note -->
                    <p style="margin-bottom: 0; font-size: 13px; line-height: 1.6; color: #64748b; text-align: center;">
                      You can monitor the shipping status directly under the Account section of our store using your tracking number: <strong style="font-family: monospace; color: #0f172a;">${orderData.trackingNumber || "N/A"}</strong>.
                    </p>
                  </td>
                </tr>

                <!-- Bottom Bar -->
                <tr>
                  <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 24px; text-align: center;">
                    <span style="font-size: 11px; color: #94a3b8; display: block;">DreamShelf Ltd • 100% Encrypted Transactions</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
    // Send order confirmation email
    try {
        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: customerEmail,
            subject: `Your DreamShelf Purchase Confirmation - Order #${orderId}`,
            html: emailHtml,
        });
        console.log(`[Cloud Function] Order confirmation email successfully sent to ${customerEmail} for order ID ${orderId}.`);
    }
    catch (error) {
        console.error(`[Cloud Function] Error occurred while sending email to ${customerEmail}:`, error);
    }
});
//# sourceMappingURL=index.js.map