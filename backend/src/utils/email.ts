import nodemailer from 'nodemailer';

export const sendInvitationEmail = async (to: string, name: string, tempPassword: string) => {
  try {
    // Basic Office365 SMTP configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #175ddc;">Welcome to LDP Logistics!</h2>
        <p>Hi ${name},</p>
        <p>You have been invited to join the LDP Logistics team.</p>
        <p>Here are your temporary login details:</p>
        <div style="background-color: #f8f9fc; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Email:</strong> ${to}</p>
          <p style="margin: 10px 0 0 0;"><strong>Password:</strong> ${tempPassword}</p>
        </div>
        <p>Please log in and update your password as soon as possible.</p>
        <br/>
        <p>Best regards,<br/>The LDP Logistics Team</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"LDP Logistics" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: "Welcome to LDP Logistics - Your Account Details",
      html: htmlContent,
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
