import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { GMAIL_USER, GMAIL_APP_PASSWORD, SMS_GATEWAY_ADDRESS } = process.env;

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !SMS_GATEWAY_ADDRESS) {
      console.error('Notify route is missing GMAIL_USER, GMAIL_APP_PASSWORD, or SMS_GATEWAY_ADDRESS env vars.');
      return Response.json({ error: 'Notification service not configured' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    // SMS gateways are picky about long bodies, keep it tight
    const preview = message.length > 100 ? `${message.slice(0, 100)}…` : message;

    await transporter.sendMail({
      from: GMAIL_USER,
      to: SMS_GATEWAY_ADDRESS,
      subject: '',
      text: `Portfolio contact from ${name} (${email}): ${preview}`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to send SMS notification:', error);
    return Response.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
