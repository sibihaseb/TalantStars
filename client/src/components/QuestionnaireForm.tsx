import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { CategoryWithQuestions, FormattedQuestion, QuestionnaireResponse } from '@shared/schema';
import { CheckCircle, Circle, ChevronLeft, ChevronRight, Save } from 'lucide-react';

interface QuestionnaireFormProps {
  userRole?: string;
  onComplete?: () => void;
  showProgress?: boolean;
}

export function QuestionnaireForm({ userRole = 'talent', onComplete, showProgress = true }: QuestionnaireFormProps) {
  const [currentCategoryIndex, setCategoryIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [completedCategories, setCompletedCategories] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories and questions
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/questionnaire/categories', userRole],
    queryFn: () => apiRequest('GET', `/api/questionnaire/categories?role=${userRole}`),
  });

  // Fetch existing responses
  const { data: existingProfile = {} } = useQuery({
    queryKey: ['/api/questionnaire/responses/my'],
    queryFn: () => apiRequest('GET', '/api/questionnaire/responses/my'),
  });

  // Pre-populate responses with existing data
  useEffect(() => {
    if (existingProfile && categories.length > 0) {
      const initialResponses: Record<number, any> = {};
      categories.forEach((category: CategoryWithQuestions) => {
        category.questions.forEach((question: FormattedQuestion) => {
          if (existingProfile[question.slug]) {
            initialResponses[question.id] = existingProfile[question.slug];
          }
        });
      });
      setResponses(initialResponses);
    }
  }, [existingProfile, categories]);

  // Save responses mutation
  const saveResponsesMutation = useMutation({
    mutationFn: (responseData: { responses: Array<{ questionId: number; response: any }> }) =>
      apiRequest('POST', '/api/questionnaire/responses/batch', responseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questionnaire/responses/my'] });
      toast({
        title: "Progress Saved",
        description: "Your responses have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save responses. Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentCategory = categories[currentCategoryIndex];
  const totalCategories = categories.length;
  const progress = totalCategories > 0 ? ((currentCategoryIndex + 1) / totalCategories) * 100 : 0;

  const handleResponseChange = (questionId: number, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSaveProgress = async () => {
    const responsesToSave = Object.entries(responses).map(([questionId, response]) => ({
      questionId: parseInt(questionId),
      response
    }));

    if (responsesToSave.length > 0) {
      saveResponsesMutation.mutate({ responses: responsesToSave });
    }
  };

  const handleNextCategory = () => {
    // Mark current category as completed if all required questions are answered
    if (currentCategory) {
      const requiredQuestions = currentCategory.questions.filter(q => q.isRequired);
      const answeredRequired = requiredQuestions.every(q => responses[q.id] !== undefined);
      
      if (answeredRequired) {
        setCompletedCategories(prev => new Set([...prev, currentCategory.id]));
      }
    }

    if (currentCategoryIndex < totalCategories - 1) {
      setCategoryIndex(prev => prev + 1);
    } else {
      // All categories completed
      handleSaveProgress();
      onComplete?.();
    }
  };

  const handlePreviousCategory = () => {
    if (currentCategoryIndex > 0) {
      setCategoryIndex(prev => prev - 1);
    }
  };

  const renderQuestion = (question: FormattedQuestion) => {
    const value = responses[question.id];

    switch (question.questionType) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            className="w-full"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            className="w-full min-h-[100px]"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value) || 0)}
            placeholder="Enter a number"
            className="w-full"
          />
        );

      case 'select':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={(newValue) => handleResponseChange(question.id, newValue)}
            className="space-y-2"
          >
            {question.formattedOptions?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                <Label htmlFor={`${question.id}-${option.value}`} className="flex-1 cursor-pointer">
                  {option.label}
                  {option.description && (
                    <span className="block text-sm text-gray-500 mt-1">{option.description}</span>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {question.formattedOptions?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleResponseChange(question.id, [...selectedValues, option.value]);
                    } else {
                      handleResponseChange(question.id, selectedValues.filter(v => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${option.value}`} className="flex-1 cursor-pointer">
                  {option.label}
                  {option.description && (
                    <span className="block text-sm text-gray-500 mt-1">{option.description}</span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <RadioGroup
            value={value?.toString() || ''}
            onValueChange={(newValue) => handleResponseChange(question.id, newValue === 'true')}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${question.id}-true`} />
              <Label htmlFor={`${question.id}-true`}>Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${question.id}-false`} />
              <Label htmlFor={`${question.id}-false`}>No</Label>
            </div>
          </RadioGroup>
        );

      case 'scale':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
            <Input
              type="range"
              min="1"
              max="10"
              value={value || 5}
              onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-sm font-medium">
              Current: {value || 5}
            </div>
          </div>
        );

      default:
        return <div>Unknown question type: {question.questionType}</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Questionnaires Available</CardTitle>
          <CardDescription>
            There are no questionnaires configured for your role at this time.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!currentCategory) {
    return null;
  }

  const requiredQuestions = currentCategory.questions.filter(q => q.isRequired);
  const answeredRequired = requiredQuestions.every(q => responses[q.id] !== undefined);
  const canProceed = answeredRequired;

  return (
    <div className="space-y-6">
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{currentCategoryIndex + 1} of {totalCategories}</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {completedCategories.has(currentCategory.id) ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
            <span>{currentCategory.name}</span>
          </CardTitle>
          {currentCategory.description && (
            <CardDescription>{currentCategory.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {currentCategory.questions.map((question) => (
            <div key={question.id} className="space-y-3">
              <Label className="text-base font-medium">
                {question.question}
                {question.isRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {question.helpText && (
                <p className="text-sm text-gray-600">{question.helpText}</p>
              )}
              {renderQuestion(question)}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePreviousCategory}
          disabled={currentCategoryIndex === 0}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleSaveProgress}
          disabled={saveResponsesMutation.isPending}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Save Progress</span>
        </Button>

        <Button
          onClick={handleNextCategory}
          disabled={!canProceed}
          className="flex items-center space-x-2"
        >
          <span>{currentCategoryIndex === totalCategories - 1 ? 'Complete' : 'Next'}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {!canProceed && requiredQuestions.length > 0 && (
        <p className="text-sm text-red-600 text-center">
          Please answer all required questions before proceeding.
        </p>
      )}
    </div>
  );
}