"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  type: string;
  text: string;
  required: boolean;
  options?: string[];
  minLength?: number;
  maxLength?: number;
  dateRange?: {
    min: string;
    max: string;
  };
  timeRange?: {
    min: string;
    max: string;
  };
};

type Survey = {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
};

export function SurveyResponse({ survey }: { survey: Survey }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Create dynamic validation schema based on questions
  const answerSchema = survey.questions.reduce((acc: any, question) => {
    if (question.required) {
      switch (question.type) {
        case 'TEXT':
          acc[question.id] = z.string().min(1, "This field is required");
          break;
        case 'RADIO':
          acc[question.id] = z.string().min(1, "Please select an option");
          break;
        case 'CHECKBOX':
          acc[question.id] = z.array(z.string()).min(1, "Please select at least one option");
          break;
        case 'DATE':
          acc[question.id] = z.string().min(1, "Please select a date");
          break;
        case 'TIME':
          acc[question.id] = z.string().min(1, "Please select a time");
          break;
        default:
          acc[question.id] = z.string().optional();
      }
    } else {
      acc[question.id] = z.any().optional();
    }
    return acc;
  }, {});

  const formSchema = z.object(answerSchema);

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/surveys/${survey.id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: data }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit response');
      }

      toast({
        title: "Success",
        description: "Your response has been submitted successfully.",
      });

      router.push('/surveys');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'TEXT':
        return (
          <Textarea
            {...form.register(question.id)}
            placeholder="Your answer"
            className="w-full"
          />
        );

      case 'RADIO':
        return (
          <RadioGroup
            onValueChange={(value) => form.setValue(question.id, value)}
            className="space-y-2"
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'CHECKBOX':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  onCheckedChange={(checked) => {
                    const currentValue = form.getValues(question.id) || [];
                    if (checked) {
                      form.setValue(question.id, [...currentValue, option]);
                    } else {
                      form.setValue(
                        question.id,
                        currentValue.filter((v: string) => v !== option)
                      );
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'DATE':
        return (
          <Input
            type="date"
            {...form.register(question.id)}
            min={question.dateRange?.min}
            max={question.dateRange?.max}
          />
        );

      case 'TIME':
        return (
          <Input
            type="time"
            {...form.register(question.id)}
            min={question.timeRange?.min}
            max={question.timeRange?.max}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
      {survey.description && (
        <p className="text-muted-foreground mb-8">{survey.description}</p>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {survey.questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <Label>
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderQuestion(question)}
            {form.formState.errors[question.id] && (
              <p className="text-sm text-red-500">
                {form.formState.errors[question.id]?.message as string}
              </p>
            )}
          </div>
        ))}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Response"}
        </Button>
      </form>
    </div>
  );
}