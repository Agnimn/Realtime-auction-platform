/**
 * Email Utility
 * Sends emails using Nodemailer
 */

const nodemailer = require("nodemailer");

// Create transporter - using Gmail for now
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password", // Use Gmail app-specific password
  },
});

/**
 * Send auction won email to winner
 */
const sendAuctionWonEmail = async (
  userEmail,
  userName,
  auctionTitle,
  auctionPrice,
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🏆 Congratulations! You Won "${auctionTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h1 style="color: #c040eb; text-align: center;">🏆 Auction Won!</h1>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c040eb;">
            <p style="font-size: 16px; color: #333;">Hi <strong>${userName}</strong>,</p>
            
            <p style="font-size: 16px; color: #666; line-height: 1.6;">
              Congratulations! You have successfully won the auction for:
            </p>
            
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h2 style="margin: 0; color: #333;">${auctionTitle}</h2>
              <p style="margin: 10px 0; font-size: 14px; color: #666;">
                <strong>Winning Bid Amount:</strong> $${auctionPrice.toLocaleString()}
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              You are approved to purchase this item. Please log in to your BidSphere account to complete the purchase and arrange payment.
            </p>
            
            <div style="margin: 20px 0; text-align: center;">
              <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard" 
                 style="background-color: #c040eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Your Bid
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="font-size: 12px; color: #999;">
              If you have any questions, please contact our support team.<br>
              Happy bidding on BidSphere!
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Auction won email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending auction won email:", error);
    return false;
  }
};

/**
 * Send outbid notification email
 */
const sendOutbidEmail = async (
  userEmail,
  userName,
  auctionTitle,
  newBidAmount,
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `⚡ You've Been Outbid on "${auctionTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h1 style="color: #f97316; text-align: center;">⚡ You've Been Outbid!</h1>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
            <p style="font-size: 16px; color: #333;">Hi <strong>${userName}</strong>,</p>
            
            <p style="font-size: 16px; color: #666; line-height: 1.6;">
              Unfortunately, someone has placed a higher bid on the auction you were interested in.
            </p>
            
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h2 style="margin: 0; color: #333;">${auctionTitle}</h2>
              <p style="margin: 10px 0; font-size: 14px; color: #666;">
                <strong>New Highest Bid:</strong> $${newBidAmount.toLocaleString()}
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              You can still place a higher bid to regain the lead. Head to the auction page to continue bidding!
            </p>
            
            <div style="margin: 20px 0; text-align: center;">
              <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard" 
                 style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Place Another Bid
              </a>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Outbid notification email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending outbid email:", error);
    return false;
  }
};

module.exports = {
  sendAuctionWonEmail,
  sendOutbidEmail,
};
