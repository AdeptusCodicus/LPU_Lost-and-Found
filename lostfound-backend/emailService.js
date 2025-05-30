import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const verifiedSendingDomain = "valdoria-software.works";
const frontendBaseUrl = process.env.FRONTEND_URL || "https://lpu-lostfound-tyh24.ondigitalocean.app/auth";

export async function sendVerificationEmail(toEMail, otp) {
    try {
        const { data, error } = await resend.emails.send({
            from: `LPU Lost & Found <noreply@${verifiedSendingDomain}>`,
            to: [toEMail],
            subject: 'Verify your LPU Lost & Found Account',
            html: `
                <h1>Welcome to LPU Lost & Found!</h1>
                <br>
                <p>Please use the following One-Time Password (OTP) to verify your email address and activate your account:</p>
                <h2><strong>${otp}</strong></h2>
                <p>This OTP will expire in 10 minutes. If you did not register for an account, please ignore this email.</p>
                <br>
                <hr>
                <p><small>Enter this OTP on the verification page on our website.</small></p>
                `,
        });
        
        if (error) {
            console.error('Resend sendVerificationEmail error:', error);
            return{ success: false, errorDetail: error };
        }
        console.log('Verification OTP email send successfully via Resend. Message ID:', data.id);
        return { success: true, messageId: data.id };
    } catch (e) {
        console.error('Exception in sendVerificationEmail:', e);
        return { success: false, errorDetail: e };
    }
}

export async function sendPasswordResetEmail(toEmail, otp) {
    try {
        const { data, error } = await resend.emails.send({
            from: `LPU Lost & Found <noreply@${verifiedSendingDomain}>`,
            to: [toEmail],
            subject: 'LPU Lost & Found - Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <br>
                <p>You (or someone else 😳) requested a password reset for your LPU Lost & Found account associated with this email address. </p>
                <p>Please use the following One-Time Password (OTP) to reset your password:</p>
                <h2><strong>${otp}</strong></h2>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you did not request a password reset, please ignore this email. Your password will not be changed.</p>
                <br>
                <hr>
                <p><small>Enter this OTP on the password reset page on our website.</small></p>`,
        });

        if (error) {
            console.error('Resend sendPasswordResetEmail error:', error);
            return { success: false, errorDetail: error };
        }
        console.log('Password reset OTP email sent successfully via Resend. Message ID:', data.id);
        return { success: true, messageId: data.id };
    } catch (e) {
        console.error('Exception in sendPasswordResetEmail:', e);
        return { success: false, errorDetail: e };
    }
}

export async function sendPasswordChangeConfirmationEmail(toEmail, otp) { 
  try {
    const { data, error } = await resend.emails.send({
      from: `LPU Lost & Found <noreply@${verifiedSendingDomain}>`,
      to: [toEmail],
      subject: "Confirm Your Password Change - LPU Lost & Found",
      html: `
        <p>Hello,</p>
        <p>We received a request to change the password for your LPU Lost & Found account.</p>
        <p>To confirm this change, please use the following One-Time Password (OTP) within 10 minutes:</p>
        <h2><strong>${otp}</strong></h2>
        <p>If you did not request this change, please ignore this email or contact support immediately.</p>
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