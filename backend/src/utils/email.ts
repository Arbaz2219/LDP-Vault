import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInvitationEmail = async (to: string, name: string, tempPassword: string) => {
  try {
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

    const { data, error } = await resend.emails.send({
      from: 'LDP Logistics <help@vault.ldplogistics.com>',
      to: [to],
      subject: "Welcome to LDP Logistics - Your Account Details",
      html: htmlContent,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return false;
    }

    console.log("Message sent successfully via Resend:", data?.id);
    return true;
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    return false;
  }
};
