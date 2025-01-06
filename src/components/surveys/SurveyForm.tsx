/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { SurveyPreview } from "./SurveyPreview";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["TEXT", "RADIO", "CHECKBOX", "DATE", "TIME", "COMBO"]),
  required: z.boolean().default(true),
  options: z.array(z.string()).default([]),
  order: z.number(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  dateRange: z.object({
    min: z.string().default(""),
    max: z.string().default(""),
  }).default({}),
  timeRange: z.object({
    min: z.string().default(""),
    max: z.string().default(""),
  }).default({}),
});

const surveySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  isAnonymous: z.boolean().default(false),
  startDate: z.string(),
  endDate: z.string(),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
});

type SurveyFormData = z.infer<typeof surveySchema>;

function QuestionOptionsField({ 
  control, 
  index, 
  questionType 
}: { 
  control: any; 
  index: number; 
  questionType: string; 
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  });

  if (!["RADIO", "CHECKBOX", "COMBO"].includes(questionType)) {
    return null;
  }

  return (
    <div className="space-y-2">
      <FormLabel>Answer Options</FormLabel>
      {fields.map((field, optionIndex) => (
        <div key={field.id} className="flex items-center gap-2">
          <FormField
            control={control}
            name={`questions.${index}.options.${optionIndex}`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input {...field} placeholder={`Option ${optionIndex + 1}`} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => remove(optionIndex)}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append("")}
      >
        Add Option
      </Button>
    </div>
  );
}

function TextQuestionSettings({ 
  control, 
  index 
}: { 
  control: any; 
  index: number; 
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name={`questions.${index}.minLength`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Length</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                value={field.value || ''}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`questions.${index}.maxLength`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Length</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                value={field.value || ''}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

function DateQuestionSettings({ 
  control, 
  index 
}: { 
  control: any; 
  index: number; 
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name={`questions.${index}.dateRange.min`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} value={field.value || ''} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`questions.${index}.dateRange.max`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} value={field.value || ''} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

function TimeQuestionSettings({ 
  control, 
  index 
}: { 
  control: any; 
  index: number; 
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name={`questions.${index}.timeRange.min`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Time</FormLabel>
            <FormControl>
              <Input type="time" {...field} value={field.value || ''} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`questions.${index}.timeRange.max`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Time</FormLabel>
            <FormControl>
              <Input type="time" {...field} value={field.value || ''} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

export function SurveyForm() {
  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: "",
      description: "",
      isAnonymous: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      questions: [
        { 
          type: "TEXT", 
          text: "", 
          required: true, 
          order: 0,
          options: [],
          minLength: undefined,
          maxLength: undefined,
          dateRange: {
            min: "",
            max: ""
          },
          timeRange: {
            min: "",
            max: ""
          }
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const onSubmit = async (data: SurveyFormData) => {
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create survey');
      }
  
      toast({
        title: "Success",
        description: "Survey created successfully",
      });
  
      // Redirect to surveys list
      window.location.href = '/surveys';
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create survey",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Survey Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isAnonymous"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Anonymous Survey</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Questions</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  type: "TEXT",
                  text: "",
                  required: true,
                  order: fields.length,
                  options: [],
                  minLength: undefined,
                  maxLength: undefined,
                  dateRange: {
                    min: "",
                    max: ""
                  },
                  timeRange: {
                    min: "",
                    max: ""
                  }
                })
              }
            >
              Add Question
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="border p-4 rounded-lg space-y-4">
              <FormField
                control={form.control}
                name={`questions.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEXT">Text</SelectItem>
                        <SelectItem value="RADIO">Single Choice (Radio)</SelectItem>
                        <SelectItem value="CHECKBOX">Multiple Choice (Checkbox)</SelectItem>
                        <SelectItem value="DATE">Date</SelectItem>
                        <SelectItem value="TIME">Time</SelectItem>
                        <SelectItem value="COMBO">Dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`questions.${index}.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`questions.${index}.required`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Required Question</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch(`questions.${index}.type`) === "TEXT" && (
                <TextQuestionSettings control={form.control} index={index} />
              )}
              
              {form.watch(`questions.${index}.type`) === "DATE" && (
                <DateQuestionSettings control={form.control} index={index} />
              )}
              
              {form.watch(`questions.${index}.type`) === "TIME" && (
                <TimeQuestionSettings control={form.control} index={index} />
              )}

              <QuestionOptionsField 
                control={form.control} 
                index={index} 
                questionType={form.watch(`questions.${index}.type`)} 
              />

              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
              >
                Remove Question
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <SurveyPreview 
            title={form.watch('title')}
            description={form.watch('description')}
            questions={form.watch('questions')}
          />
          <Button type="submit">Create Survey</Button>
        </div>
      </form>
    </Form>
  );
}