import { SurveyForm } from "@/components/surveys/SurveyForm";

export default function CreateSurveyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Create New Survey</h1>
      <SurveyForm />
    </div>
  );
}