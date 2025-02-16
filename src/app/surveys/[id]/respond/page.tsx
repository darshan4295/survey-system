/* eslint-disable @typescript-eslint/no-explicit-any */
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

export default async function SurveyResponsePage({ 
  params 
}: any) {
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
    redirect(`/surveys/${params.id}`);
  }

  return <SurveyResponse survey={survey} />;
}