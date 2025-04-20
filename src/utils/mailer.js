const nodemailer = require('nodemailer');

// Create a transporter using the provided SMTP settings
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // TLS requires secure:false
  auth: {
    user: '8ac4ee001@smtp-brevo.com',
    pass: 'HMz5vWLx4XnPpasO',
  },
});

/**
 * Send an email using the configured SMTP transport
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content (optional)
 * @returns {Promise<any>} - Nodemailer send result
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: 'sezarpaypals2@gmail.com',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send a password reset email
 * @param {string} to - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} resetUrl - Password reset URL
 * @returns {Promise<any>} - Nodemailer send result
 */
const sendPasswordResetEmail = async (to, resetToken, resetUrl) => {
  const subject = 'SlotJack Şifre Sıfırlama Talebi';
  const text = `
    Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:
    ${resetUrl}
    
    Bu bağlantı 1 saat sonra geçersiz olacaktır.
    
    Eğer şifre sıfırlama talebinde bulunmadıysanız, lütfen bu e-postayı dikkate almayın.
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="background-color: #FF6B00; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">SlotJack</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <h2>Şifre Sıfırlama Talebi</h2>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <p style="text-align: center;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #FF6B00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Şifremi Sıfırla</a>
        </p>
        <p>Veya bu URL'yi tarayıcınıza kopyalayabilirsiniz:</p>
        <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all;">${resetUrl}</p>
        <p>Bu bağlantı 1 saat sonra geçersiz olacaktır.</p>
        <p>Eğer şifre sıfırlama talebinde bulunmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
      </div>
      <div style="text-align: center; padding: 10px; color: #888; font-size: 12px;">
        <p>© ${new Date().getFullYear()} SlotJack. Tüm hakları saklıdır.</p>
      </div>
    </div>
  `;
  
  return sendEmail({ to, subject, text, html });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
}; 