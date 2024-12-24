import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { SurveyResponse } from "@/components/surveys/SurveyResponse";

async function getSurvey(id: string) {
  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  });

  if (!survey) notFound();
  return survey;
}

export default async function SurveyPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const survey = await getSurvey(params.id);

  // Check if user has already responded
  const existingResponse = await prisma.response.findFirst({
    where: {
      surveyId: params.id,
      userId: userId
    }
  });

  if (existingResponse) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Survey Already Completed</h1>
        <p>You have already submitted your response for this survey.</p>
      </div>
    );
  }

  return <SurveyResponse survey={survey} />;
}