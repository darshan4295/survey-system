import nodemailer from "nodemailer";

export async function sendSurveyNotification(
  email: string,
  surveyTitle: string,
  surveyId: string
) {
  console.log("Preparing to send email...");
  try {
    
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // SSL port
      secure: true, // Set to false for TLS port
      auth: {
        user: "sarthakdas56@gmail.com", // Your email address
        pass: "lavw azhe agup srum",   // App password
      },
    });

    // Email options
    const mailOptions = {
      from: '"Your App" <sarthakdas56@gmail.com>', 
      to: email, // Recipient's email
      subject: `New Survey Available: ${surveyTitle}`,
      html: `
        <h1>New Survey: ${surveyTitle}</h1>
        <p>A new survey is available for you to complete.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/surveys/${surveyId}">
          Click here to take the survey
        </a>
      `,
    };
    console.log("Sending email to:", mailOptions.to);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
}
