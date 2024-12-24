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

export default async function TakeSurveyPage({ 
    params 
  }: { 
    params: { id: string } 
  }) {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');
  
    const { id } = await params;
    const survey = await getSurvey(id);
  
    // Check if user has already responded
    const existingResponse = await prisma.response.findFirst({
      where: {
        surveyId: id,
        userId: userId
      }
    });
  
    if (existingResponse) {
      redirect(`/surveys/${id}`);
    }
  
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <SurveyResponse survey={survey} />
      </div>
    );
  }