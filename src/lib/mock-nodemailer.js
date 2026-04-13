// Mock nodemailer for Edge Runtime compatibility
console.info('[Mock Nodemailer] Loading mock nodemailer for Edge Runtime');

module.exports = {
  createTransport: (config) => {
    console.info('[Mock Nodemailer] Creating mock transport');
    
    return {
      sendMail: async (mailOptions) => {
        console.info('[Mock Nodemailer] Simulating email send:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          from: mailOptions.from,
        });
        
        return {
          messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          accepted: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to],
          rejected: [],
          response: '250 Mock email accepted for delivery',
        };
      },
      verify: async () => {
        console.info('[Mock Nodemailer] Simulating transport verification');
        return true;
      },
    };
  },
};