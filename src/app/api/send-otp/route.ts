import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    return NextResponse.json({ error: 'Server misconfiguration: RESEND_API_KEY is not set.' }, { status: 500 });
  }

  const resend = new Resend(resendApiKey);

  try {
    const body = await req.json();
    const { email, otp } = body || {};

    if (!email || !otp) {
      return NextResponse.json({ error: 'Missing email or OTP code' }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'رمز التحقق الخاص بك - حاشية',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f6ff; border-radius: 10px;">
          <h2 style="color: #1e3a8a;">رمز التحقق الخاص بك</h2>
          <p>استخدم الرمز التالي لإكمال عملية التسجيل/تسجيل الدخول:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: white; padding: 10px; border: 2px dashed #1e3a8a; display: inline-block; margin: 10px 0; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 14px;">إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP email' }, { status: 500 });
  }
}
