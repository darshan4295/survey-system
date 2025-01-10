import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";


// This is a Server Component
const ResponsePage = async ({ params }: { params: { id: string } }) => {
  const { userId } = await auth();
  const { id } = await params;
  if (!userId) {
    redirect('/sign-in');
  }

  const survey = await prisma.survey.findUnique({
    where: { 
      id: id
    },
    include: {
      questions: {
        orderBy: {
          order: 'asc'
        }
      },
      responses: {
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          answers: {
            include: {
              question: true
            }
          }
        }
      }
    }
  });


  if (!survey) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Survey Responses</h1>
        <Link href={`/surveys/${id}`}>
          <Button variant="outline">Back to Survey</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{survey.title}</CardTitle>
          <CardDescription>
            Total Responses: {survey.responses.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {survey.responses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No responses yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Respondent</TableHead>
                    {survey.questions.map((question) => (
                      <TableHead key={question.id}>{question.text}</TableHead>
                    ))}
                    <TableHead>Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {survey.responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell>
                        {survey.isAnonymous 
                          ? "Anonymous" 
                          : response.user?.name || response.user?.email || "Unknown"}
                      </TableCell>
                      {survey.questions.map((question) => {
                        const answer = response.answers.find(
                          (a) => a.questionId === question.id
                        );
                        return (
                          <TableCell key={question.id}>
                            {answer ? String(answer.value) : "No answer"}
                          </TableCell>
                        );
                      })}
                      <TableCell>
                        {new Date(response.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponsePage;