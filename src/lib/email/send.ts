import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; id?: string }> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Email send exception:", err);
    return { success: false };
  }
}
