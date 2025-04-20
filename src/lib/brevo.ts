import { getAbsoluteUrl } from './url';

// Function to send password reset email
export async function sendPasswordResetEmail(email: string, token: string) {
  try {
    // Use the utility function to safely construct the URL
    const resetLink = getAbsoluteUrl(`/sifre-sifirlama/${token}`);
    
    // Use your Brevo template here
    // Example code (replace with your actual implementation):
    // const response = await brevoClient.sendTransacEmail({
    //   to: [{ email }],
    //   templateId: parseInt(process.env.BREVO_PASSWORD_RESET_TEMPLATE_ID || '1'),
    //   params: {
    //     resetLink,
    //     email
    //   }
    // });
    
    // For demo purposes, log the link
    console.log('Password reset link:', resetLink);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: 'Failed to send password reset email' };
  }
} 