"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Question = {
  type: string;
  text: string;
  required: boolean;
  options?: string[];
  minLength?: number;
  maxLength?: number;
  dateRange?: {
    min?: string;
    max?: string;
  };
  timeRange?: {
    min?: string;
    max?: string;
  };
};

type SurveyPreviewProps = {
  title: string;
  description?: string;
  questions: Question[];
};

function QuestionPreview({ question }: { question: Question }) {
  switch (question.type) {
    case "TEXT":
      return (
        <Textarea 
          placeholder="Your answer"
          disabled={true}
          className="mt-2"
        />
      );

    case "RADIO":
      return (
        <RadioGroup className="mt-2">
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} disabled={true} />
              <Label>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      );

    case "CHECKBOX":
      return (
        <div className="mt-2 space-y-2">
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox disabled={true} />
              <Label>{option}</Label>
            </div>
          ))}
        </div>
      );

    case "DATE":
      return (
        <Input 
          type="date"
          className="mt-2"
          min={question.dateRange?.min}
          max={question.dateRange?.max}
          disabled={true}
        />
      );

    case "TIME":
      return (
        <Input 
          type="time"
          className="mt-2"
          min={question.timeRange?.min}
          max={question.timeRange?.max}
          disabled={true}
        />
      );

    case "COMBO":
      return (
        <Select disabled={true}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {question.options?.map((option, index) => (
              <SelectItem key={index} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    default:
      return null;
  }
}

export function SurveyPreview({ title, description, questions }: SurveyPreviewProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Preview Survey</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {description && (
          <p className="text-muted-foreground mb-6">{description}</p>
        )}

        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="font-medium">{index + 1}.</span>
                <div className="flex-1">
                  <p className="font-medium">
                    {question.text}
                    {question.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </p>
                  <QuestionPreview question={question} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}