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
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      _count: {
        select: { responses: true }
      }
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
          <p className="text-muted-foreground">No surveys found.</p>
          <Link href="/surveys/create">
            <Button className="mt-4">Create Your First Survey</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <Card key={survey.id}>
              <CardHeader>
                <CardTitle>{survey.title}</CardTitle>
                <CardDescription>{survey.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {survey._count.responses} responses
                  </div>
                  <Link href={`/surveys/${survey.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}