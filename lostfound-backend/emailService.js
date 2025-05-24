import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const verifiedSendingDomain = "valdoria-software.works";
const frontendBaseUrl = "http://0.0.0.0:3000/auth";

export async function sendVerificationEmail(toEMail, verificationToken) {
    const verificationLink = `${frontendBaseUrl}/verify-email?token=${verificationToken}`;

    try {
        const { data, error } = await resend.emails.send({
            from: `LPU Lost & Found <noreply@${verifiedSendingDomain}>`,
            to: [toEMail],
            subject: 'Verify your LPU Lost & Found Account',
            html: `
                <h1>Welcome to LPU Lost & Found!</h1>
                <br>
                <p>Please click the link below to verify your email address and activate your account:</p>
                <a href="${verificationLink}" target="_blank">Verify Email Address</a>
                <p>This link will expire in 1 hour. If you did not register for an account, please ignore this email.</p>
                <br>
                <hr>
                <p><small>If you're having trouble clicking the button, copy and paste this URL into your browser: ${verificationLink}</small></p>
                `,
        });
        
        if (error) {
            console.error('Resend sendVerificationEmail error:', error);
            return{ success: false, errorDetail: error };
        }
        console.log('Verification email send successfully via Resend. Message ID:', data.id);
        return { success: true, messageId: data.id };
    } catch (e) {
        console.error('Exception in sendVerificationEmail:', e);
        return { success: false, errorDetail: e };
    }
}

export async function sendPasswordResetEmail(toEmail, resetToken) {
    const resetLink = `${frontendBaseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;

    try {
        const { data, error } = await resend.emails.send({
            from: `LPU Lost & Found <noreply@${verifiedSendingDomain}>`,
            to: [toEmail],
            subject: 'LPU Lost & Found - Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <br>
                <p>You (or someone else 😳) requested a password reset for your LPU Lost & Found account associated with this email address. </p>
                <p>If this was you, please click the link below to reset your password:</p>
                <a href="${resetLink}" target ="_blank">Reset Your Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request a password reset, please ignore this email. Your password will not be changed.</p>
                <br>
                <hr>
                <p><small>If you're having trouble clicking the button, copy and paste this URL into your browser: ${resetLink}</small></p>`,
        });

        if (error) {
            console.error('Resend sendPasswordResetEmail error:', error);
            return { success: false, errorDetail: error };
        }
        console.log('Password reset email sent successfully via Resend. Message ID:', data.id);
        return { success: true, messageId: data.id };
    } catch (e) {
        console.error('Exception in sendPasswordResetEmail:', e);
        return { success: false, errorDetail: e };
    }
}

export async function sendPasswordChangeConfirmationEmail(toEmail, confirmationToken) {
  const confirmationLink = `${frontendBaseUrl}/confirm-password-change?token=${confirmationToken}&email=${encodeURIComponent(toEmail)}`;
  try {
    const { data, error } = await resend.emails.send({
      from: `LPU Lost & Found <noreply@${verifiedSendingDomain}>`,
      to: [toEmail],
      subject: "Confirm Your Password Change - LPU Lost & Found",
      html: `
        <p>Hello,</p>
        <p>We received a request to change the password for your LPU Lost & Found account.</p>
        <p>To confirm this change, please click the link below within 1 hour:</p>
        <p><a href="${confirmationLink}">Confirm Password Change</a></p>
        <p>If you did not request this change, please ignore this email or contact support immediately.</p>
        <p>Link: ${confirmationLink}</p>
        <p>Thanks,<br>LPU Lost & Found Team</p>
      `,
    });

    if (error) {
      console.error(`Resend API Error for password change confirmation to ${toEmail}:`, error);
      return { success: false, errorDetail: error };
    }
    console.log(`Password change confirmation email sent to ${toEmail}. Message ID: ${data.id}`);
    return { success: true, messageId: data.id };
  } catch (e) {
    console.error(`Exception in sendPasswordChangeConfirmationEmail to ${toEmail}:`, e);
    return { success: false, errorDetail: e };
  }
}

export async function sendPasswordChangedNotification(toEmail) {
    try {
        const { data, error } = await resend.emails.send({
            from: `LPU Lost & Found <noreply@${verifiedSendingDomain}>`,
            to: [toEmail],
            subject: `Your LPU Lost & Found Password Has Been Changed`,
            html: `
                <h1>Password Changed</h1>
                <p>This email confirms that the password for your LPU Lost & Found account has been successfully changed.</p>
                <p>If you did not make this change, please contact support immediately or try to reset your password again.</p>`,
        });
        if (error) {
            console.error('Resend sendPasswordChangedNotification error:', error);
            return { success: false, errorDetail: error };
        }
        console.log('Password changed notification sent successfully. Message ID:', data.id);
        return { success: true, messageId: data.id };
    } catch (e) {
        console.error('Exception in sendPasswordChangedNotification:', e);
        return { success: false, errorDetail: e };
    }
}