"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Answer = {
  value: string | number | null | undefined;
  question: {
    id: string;
    type: string;
    text: string;
  };
};

type Response = {
  answers: Answer[];
};

type Survey = {
  id: string;
  title: string;
  description: string | null;
  _count: {
    responses: number;
  };
  responses: Response[];
  questions: {
    id: string;
    type: string;
    text: string;
  }[];
};
type Question = {
  id: string;
  type: string;
  text: string;
};

export function SurveyResults({ survey }: { survey: Survey }) {
  const processResponses = (question:Question) => {
    const answers = survey.responses
      .map((response) =>
        response.answers.find((a) => a.question.id === question.id)
      )
      .filter(Boolean); // Removes undefined/null values
  
    if (["RADIO", "CHECKBOX", "COMBO"].includes(question.type)) {
      const counts: { [key: string]: number } = {};
      answers.forEach((answer) => {
        if (answer && answer.value !== undefined && answer.value !== null) {
          const value = String(answer.value); // Convert value to string for object keys
          counts[value] = (counts[value] || 0) + 1;
        }
      });
  
      return Object.entries(counts).map(([name, value]) => ({
        name,
        value,
      }));
    }
  
    return [];
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{survey.title}</CardTitle>
        <CardDescription>
          {survey._count.responses} responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {survey.questions.map((question) => (
            <div key={question.id} className="space-y-4">
              <h3 className="font-medium">{question.text}</h3>
              
              {["RADIO", "CHECKBOX", "COMBO"].includes(question.type) ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processResponses(question)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="space-y-2">
                  {survey.responses.map((response, idx) => {
                    const answer = response.answers.find(
                      (a) => a.question.id === question.id
                    );
                    return (
                      answer && (
                        <div
                          key={idx}
                          className="p-2 bg-muted rounded-md"
                        >
                          {answer.value}
                        </div>
                      )
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}