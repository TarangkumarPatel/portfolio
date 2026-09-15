import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, email, phone, message } = await request.json();

    if (!name || !email || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { GMAIL_USER, GMAIL_APP_PASSWORD, SMS_GATEWAY_ADDRESS, ADMIN_NOTIFY_EMAIL } = process.env;

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD || (!SMS_GATEWAY_ADDRESS && !ADMIN_NOTIFY_EMAIL)) {
      console.error('Notify route is missing GMAIL_USER, GMAIL_APP_PASSWORD, or a delivery address (SMS_GATEWAY_ADDRESS/ADMIN_NOTIFY_EMAIL) env var.');
      return Response.json({ error: 'Notification service not configured' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    let smsSent = false;
    let emailSent = false;

    // SMS gateways are picky about long bodies, keep it tight
    if (SMS_GATEWAY_ADDRESS) {
      try {
        const preview = message.length > 100 ? `${message.slice(0, 100)}…` : message;
        await transporter.sendMail({
          from: GMAIL_USER,
          to: SMS_GATEWAY_ADDRESS,
          subject: '',
          text: `Portfolio contact from ${name} (${email}${phone ? `, ${phone}` : ''}): ${preview}`,
        });
        smsSent = true;
      } catch (smsErr) {
        console.error('Failed to send SMS-gateway notification:', smsErr);
      }
    }

    // Full-detail backup email - SMS gateways can be slow/unreliable, this arrives independently
    if (ADMIN_NOTIFY_EMAIL) {
      try {
        await transporter.sendMail({
          from: GMAIL_USER,
          to: ADMIN_NOTIFY_EMAIL,
          subject: `Portfolio contact from ${name}`,
          text: [
            `Name: ${name}`,
            `Email: ${email}`,
            phone ? `Phone: ${phone}` : null,
            '',
            message,
          ].filter(line => line !== null).join('\n'),
        });
        emailSent = true;
      } catch (emailErr) {
        console.error('Failed to send backup email notification:', emailErr);
      }
    }

    if (!smsSent && !emailSent) {
      return Response.json({ error: 'Failed to send notification' }, { status: 500 });
    }

    return Response.json({ success: true, smsSent, emailSent });
  } catch (error) {
    console.error('Failed to send notification:', error);
    return Response.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
