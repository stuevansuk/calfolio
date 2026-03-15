function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Calfolio</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#18181b;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Calfolio</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#fafafa;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.5;">
                Calfolio &mdash; Beautiful photo calendars, made simple.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:#18181b;border-radius:6px;">
      <a href="${url}" target="_blank" style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

function unsubscribeFooter(unsubscribeUrl: string): string {
  return `<p style="margin:24px 0 0;font-size:12px;color:#a1a1aa;line-height:1.5;">
  If you no longer wish to receive these emails, you can
  <a href="${unsubscribeUrl}" style="color:#71717a;text-decoration:underline;">unsubscribe here</a>.
</p>`;
}

export function welcomeEmail(name: string, appUrl: string): string {
  const firstName = name.split(" ")[0] || "there";
  const content = `
    <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#18181b;">Welcome to Calfolio, ${firstName}!</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      We're thrilled to have you on board. Calfolio makes it easy to turn your favourite photos into beautiful, printed calendars.
    </p>
    <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#18181b;">Here's how to get started:</p>
    <ol style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#3f3f46;line-height:1.8;">
      <li>Upload your best photos</li>
      <li>Choose a template and customise each month</li>
      <li>Preview your calendar and order a print</li>
    </ol>
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Your free trial gives you 7 days to explore everything Calfolio has to offer. Jump in and create your first calendar today!
    </p>
    ${ctaButton("Create Your First Calendar", `${appUrl}/app`)}
    <p style="margin:0;font-size:14px;color:#71717a;line-height:1.5;">
      Questions? Just reply to this email &mdash; we'd love to hear from you.
    </p>`;
  return baseLayout(content);
}

export function trialDay3Email(
  name: string,
  daysLeft: number,
  appUrl: string,
  unsubscribeUrl: string
): string {
  const firstName = name.split(" ")[0] || "there";
  const content = `
    <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#18181b;">You've got ${daysLeft} days left, ${firstName}</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Your Calfolio trial is flying by! Have you had a chance to create a calendar yet?
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Here are a few things you can try before your trial ends:
    </p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#3f3f46;line-height:1.8;">
      <li>Browse our template collection for inspiration</li>
      <li>Upload your photos and arrange them by month</li>
      <li>Preview how your finished calendar will look</li>
    </ul>
    ${ctaButton("Continue Creating", `${appUrl}/app`)}
    <p style="margin:0 0 16px;font-size:14px;color:#71717a;line-height:1.5;">
      Want to keep all features after your trial? <a href="${appUrl}/app/settings" style="color:#18181b;text-decoration:underline;font-weight:500;">Upgrade anytime</a>.
    </p>
    ${unsubscribeFooter(unsubscribeUrl)}`;
  return baseLayout(content);
}

export function trialDay6Email(
  name: string,
  appUrl: string,
  unsubscribeUrl: string
): string {
  const firstName = name.split(" ")[0] || "there";
  const content = `
    <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#18181b;">Your trial expires tomorrow, ${firstName}</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Just a heads-up: your Calfolio trial ends tomorrow. After that, you'll lose access to creating and editing calendars.
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Upgrade now to keep everything you've built and unlock unlimited calendar creation.
    </p>
    ${ctaButton("Upgrade Now", `${appUrl}/app/settings`)}
    <p style="margin:0;font-size:14px;color:#71717a;line-height:1.5;">
      Your existing calendars won't be deleted, but you won't be able to edit or create new ones on the free tier.
    </p>
    ${unsubscribeFooter(unsubscribeUrl)}`;
  return baseLayout(content);
}

export function trialExpiredEmail(
  name: string,
  appUrl: string,
  unsubscribeUrl: string
): string {
  const firstName = name.split(" ")[0] || "there";
  const content = `
    <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#18181b;">Your trial has ended, ${firstName}</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Your 7-day Calfolio trial has expired. Here's what changes on the free tier:
    </p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#3f3f46;line-height:1.8;">
      <li>You can no longer create or edit calendars</li>
      <li>Existing calendars are read-only</li>
      <li>Photo uploads are disabled</li>
      <li>Print ordering is unavailable</li>
    </ul>
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      The good news? Upgrade today and pick up right where you left off. All your data is still here.
    </p>
    ${ctaButton("Upgrade to Keep Creating", `${appUrl}/app/settings`)}
    ${unsubscribeFooter(unsubscribeUrl)}`;
  return baseLayout(content);
}

export function orderConfirmationEmail(
  name: string,
  orderId: string,
  appUrl: string
): string {
  const firstName = name.split(" ")[0] || "there";
  const content = `
    <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#18181b;">Order confirmed!</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Thanks for your order, ${firstName}! Your calendar is being prepared for printing.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;width:100%;background-color:#fafafa;border-radius:6px;border:1px solid #e4e4e7;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 4px;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Order ID</p>
          <p style="margin:0;font-size:15px;color:#18181b;font-weight:500;">${orderId}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      We'll send you another email once your calendar has been shipped with tracking information.
    </p>
    ${ctaButton("View Order", `${appUrl}/app/orders`)}
    <p style="margin:0;font-size:14px;color:#71717a;line-height:1.5;">
      If you have any questions about your order, reply to this email.
    </p>`;
  return baseLayout(content);
}

export function orderShippedEmail(
  name: string,
  orderId: string,
  trackingUrl: string,
  appUrl: string
): string {
  const firstName = name.split(" ")[0] || "there";
  const content = `
    <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#18181b;">Your calendar is on its way!</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Great news, ${firstName}! Your calendar has been shipped and is heading your way.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;width:100%;background-color:#fafafa;border-radius:6px;border:1px solid #e4e4e7;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 4px;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Order ID</p>
          <p style="margin:0;font-size:15px;color:#18181b;font-weight:500;">${orderId}</p>
        </td>
      </tr>
    </table>
    ${ctaButton("Track Your Order", trackingUrl)}
    <p style="margin:0;font-size:14px;color:#71717a;line-height:1.5;">
      You can also <a href="${appUrl}/app/orders" style="color:#18181b;text-decoration:underline;">view your order details</a> in Calfolio.
    </p>`;
  return baseLayout(content);
}
