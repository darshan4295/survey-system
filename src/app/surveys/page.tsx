import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";

async function getSurveys() {
  const { userId } = await auth();
  
  // If no user, redirect to sign in
  if (!userId) {
    redirect('/sign-in');
  }

  const surveys = await prisma.survey.findMany({
    where: {
      OR: [
        { creatorId: userId }, // Surveys created by user
        { isAnonymous: true }  // Public surveys
      ]
    },
    include: {
      _count: {
        select: { responses: true }
      },
      creator: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return surveys;
}

export default async function SurveysPage() {
  const surveys = await getSurveys();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Surveys</h1>
        <Link href="/surveys/create">
          <Button>Create New Survey</Button>
        </Link>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No surveys available.</p>
          <Link href="/surveys/create">
            <Button>Create Your First Survey</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <Card key={survey.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="mb-2">{survey.title}</CardTitle>
                    <CardDescription>{survey.description}</CardDescription>
                  </div>
                  {survey.isAnonymous && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Anonymous
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Created by: {survey.creator.name}</p>
                    <p>Responses: {survey._count.responses}</p>
                    <p>Valid until: {new Date(survey.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Link href={`/surveys/${survey.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                    {!survey.isAnonymous && (
                      <Link href={`/surveys/${survey.id}/responses`}>
                        <Button variant="outline">View Responses</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}