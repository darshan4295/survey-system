import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSurveyNotification(
  email: string, 
  surveyTitle: string, 
  surveyId: string
) {
  try {
    await resend.emails.send({
      from: 'dhande43@gmail.com',
      to: "dhande43@gmail.com",
      subject: `New Survey Available: ${surveyTitle}`,
      html: `
        <h1>New Survey: ${surveyTitle}</h1>
        <p>A new survey is available for you to complete.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/surveys/${surveyId}">
          Click here to take the survey
        </a>
      `,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
  }
}