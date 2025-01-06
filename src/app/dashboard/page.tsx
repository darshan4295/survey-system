/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SurveyResults } from "@/components/dashboard/SurveyResults";
import { redirect } from "next/navigation";

async function getDashboardData() {
  const { userId } = await auth();
  
  // Redirect to sign-in if no userId is found
  if (!userId) {
    redirect("/sign-in");
  }

  const surveys = await prisma.survey.findMany({
    where: {
      creatorId: userId,
    },
    include: {
      _count: {
        select: { responses: true },
      },
      responses: {
        include: {
          answers: {
            include: {
              question: true,
            },
          },
        },
      },
      questions: true,
    },
  });

  const totalRewards = await prisma.reward.aggregate({
    where: {
      userId,
    },
    _sum: {
      points: true,
    },
  });

  return {
    surveys,
    totalPoints: totalRewards._sum.points || 0,
  };
}

export default async function DashboardPage() {
  const { surveys, totalPoints } = await getDashboardData();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{surveys.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {surveys.reduce((acc:any, survey) => acc + survey._count.responses, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reward Points</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalPoints}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {surveys.map((survey) => (
          <SurveyResults key={survey.id} survey={survey} />
        ))}
      </div>
    </div>
  );
}