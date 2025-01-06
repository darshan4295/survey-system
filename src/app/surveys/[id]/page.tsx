import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteSurvey } from "@/components/surveys/DeleteSurvey";
import Link from "next/link";


async function getSurvey(surveyId: string) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const survey = await prisma.survey.findUnique({
    where: { 
      id: surveyId 
    },
    include: {
      questions: {
        orderBy: {
          order: 'asc'
        }
      },
      _count: {
        select: { 
          responses: true 
        }
      }
    }
  });

  if (!survey) notFound();
  return {survey,userId};
}

export default async function SurveyPage({ params }: any) {
  const { id } = await params;
  const {survey,userId} = await getSurvey(id);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle className="text-2xl mb-2">{survey.title}</CardTitle>
            {survey.description && (
              <CardDescription>{survey.description}</CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/surveys/${id}/fill`}>Take Survey</Link>
            </Button>
            {survey.creatorId === userId && (
              <DeleteSurvey surveyId={id} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Total Responses</h3>
                <p className="text-2xl font-bold">{survey._count.responses}</p>
              </div>
              <div>
                <h3 className="font-medium">Status</h3>
                <p>{new Date() < new Date(survey.endDate) ? 'Active' : 'Closed'}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Questions ({survey.questions.length})</h3>
              <div className="space-y-4">
                {survey.questions.map((question, index) => (
                  <div key={question.id} className="border p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="font-medium">{index + 1}.</span>
                      <div>
                        <p>{question.text}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Type: {question.type}
                          {question.required && ' (Required)'}
                        </p>
                        {question.options && Array.isArray(question.options) && question.options.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">Options:</p>
                            <ul className="list-disc list-inside ml-2">
                              {Array.isArray(question.options) &&
                                question.options
                                  .filter((option): option is string | number => typeof option === "string" || typeof option === "number")
                                  .map((option, i) => (
                                    <li key={i} className="text-sm">
                                      {option}
                                    </li>
                                  ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {survey._count.responses > 0 && (
              <div className="flex justify-end">
                <Button variant="outline" asChild>
                  <Link href={`/surveys/${id}/responses`}>
                    View All Responses
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}