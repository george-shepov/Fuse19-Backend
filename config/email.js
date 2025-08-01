const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  // For development, use a service like Gmail, Mailtrap, or Ethereal
  // For production, use services like SendGrid, Amazon SES, etc.
  
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    if (process.env.SENDGRID_API_KEY) {
      // SendGrid configuration
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    } else if (process.env.SMTP_HOST) {
      // Generic SMTP configuration
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  // Development configuration - Ethereal Email (test account)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
      pass: process.env.EMAIL_PASS || 'ethereal.pass'
    }
  });
};

const transporter = createTransporter();

// Email templates
const emailTemplates = {
  emailVerification: (verificationUrl, userName) => ({
    subject: 'Verify Your Email - Fuse19 Backend',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Fuse19!</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>Thank you for registering with Fuse19 Backend. To complete your account setup, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
            
            <div class="warning">
              <strong>Important:</strong> This verification link will expire in 24 hours for security reasons.
            </div>
            
            <p>If you didn't create an account with us, please ignore this email.</p>
            
            <p>Best regards,<br>The Fuse19 Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2024 Fuse19 Backend. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${userName}!
      
      Welcome to Fuse19 Backend!
      
      Please verify your email address by visiting this link:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with us, please ignore this email.
      
      Best regards,
      The Fuse19 Team
    `
  }),

  passwordReset: (resetUrl, userName) => ({
    subject: 'Password Reset Request - Fuse19 Backend',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
          .button { display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
          .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>We received a request to reset your password for your Fuse19 account. Click the button below to set a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #DC2626;">${resetUrl}</p>
            
            <div class="warning">
              <strong>Security Notice:</strong> This password reset link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
            </div>
            
            <p>For security reasons, we recommend:</p>
            <ul>
              <li>Using a strong, unique password</li>
              <li>Enabling two-factor authentication if available</li>
              <li>Not sharing your login credentials</li>
            </ul>
            
            <p>Best regards,<br>The Fuse19 Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2024 Fuse19 Backend. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${userName}!
      
      Password Reset Request
      
      We received a request to reset your password. Visit this link to set a new password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this reset, please ignore this email.
      
      Best regards,
      The Fuse19 Team
    `
  }),

  welcomeEmail: (userName) => ({
    subject: 'Welcome to Fuse19 Backend!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Fuse19</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
          .feature { background: #f0fdf4; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #10B981; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Fuse19!</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>Congratulations! Your email has been verified and your account is now active. You're all set to start using Fuse19 Backend.</p>
            
            <h3>What's Next?</h3>
            <p>Here are some features you can explore:</p>
            
            <div class="feature">
              <strong>📱 Real-time Chat</strong><br>
              Connect with your team using our real-time messaging system with typing indicators.
            </div>
            
            <div class="feature">
              <strong>📁 File Management</strong><br>
              Upload, organize, and share files with automatic image processing and thumbnails.
            </div>
            
            <div class="feature">
              <strong>✅ Task Management</strong><br>
              Create, assign, and track tasks with your team members.
            </div>
            
            <div class="feature">
              <strong>📝 Notes & Collaboration</strong><br>
              Take notes and collaborate with others in real-time.
            </div>
            
            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
            
            <p>Welcome aboard!<br>The Fuse19 Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2024 Fuse19 Backend. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${userName}!
      
      Welcome to Fuse19 Backend!
      
      Your email has been verified and your account is now active.
      
      Features you can explore:
      - Real-time Chat
      - File Management  
      - Task Management
      - Notes & Collaboration
      
      Welcome aboard!
      The Fuse19 Team
    `
  })
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }

    const { subject, html, text } = emailTemplate(...Object.values(data));

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Fuse19 Backend" <noreply@fuse19.com>',
      to,
      subject,
      html,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    // In development, log the preview URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Verify transporter configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  verifyEmailConfig,
  emailTemplates
};