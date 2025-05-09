import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleHelp, ArrowRight, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HomeworkProblem } from "@shared/schema";

interface StepByStepGuideProps {
  problem: HomeworkProblem;
  loading?: boolean;
}

export default function StepByStepGuide({ problem, loading = false }: StepByStepGuideProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showingHint, setShowingHint] = useState<number[]>([]);

  const toggleHint = (stepIndex: number) => {
    setShowingHint(prev => 
      prev.includes(stepIndex) 
        ? prev.filter(i => i !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  const nextStep = () => {
    if (currentStepIndex < problem.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(prev => !prev);
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <Tabs defaultValue="steps">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="steps">Step-by-Step</TabsTrigger>
            <TabsTrigger value="explanation">Explanation</TabsTrigger>
            <TabsTrigger value="solution">Solution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="steps" className="mt-4">
            <CardTitle>Solving Step by Step</CardTitle>
          </TabsContent>
          
          <TabsContent value="explanation" className="mt-4">
            <CardTitle>Understanding the Approach</CardTitle>
          </TabsContent>
          
          <TabsContent value="solution" className="mt-4">
            <CardTitle>Complete Solution</CardTitle>
          </TabsContent>
        </Tabs>
      </CardHeader>
      
      <CardContent className="py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-gray-500">Analyzing the problem...</p>
          </div>
        ) : (
          <Tabs defaultValue="steps">
            <TabsContent value="steps">
              <div className="mb-4">
                <h3 className="font-heading font-bold text-lg mb-2">
                  {problem.problemType}
                </h3>
                <p className="text-gray-700 mb-4">{problem.overview}</p>
              </div>
              
              <div className="space-y-6">
                {problem.steps.map((step, index) => {
                  const isCurrentStep = index === currentStepIndex;
                  const isCompletedStep = index < currentStepIndex;
                  const isUpcomingStep = index > currentStepIndex;
                  
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "transition-all duration-300",
                        isUpcomingStep && "opacity-50",
                        isCompletedStep && "opacity-80"
                      )}
                    >
                      <div className="flex">
                        <div className="step-number mr-3 w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-heading font-bold">{step.title}</h4>
                          <p className="text-gray-700 mt-1">{step.description}</p>
                          
                          {step.hint && (
                            <div className="mt-3 bg-gray-50 p-3 rounded-custom">
                              <p className="text-gray-700">{step.hintQuestion}</p>
                              <div className="mt-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-primary font-medium hover:underline"
                                  onClick={() => toggleHint(index)}
                                >
                                  {showingHint.includes(index) ? "Hide Hint" : "Show Hint"}
                                </Button>
                                
                                {showingHint.includes(index) && (
                                  <div className="mt-2 p-2 bg-white rounded border text-gray-700">
                                    {step.hint}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="explanation">
              <div className="prose max-w-none">
                <p className="text-gray-700">{problem.detailedExplanation}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="solution">
              {showAnswer ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">The solution is:</p>
                  <div className="bg-blue-50 p-4 rounded-custom font-medium">
                    {problem.solution}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CircleHelp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-heading font-bold mb-2">Solution Hidden</h3>
                  <p className="text-gray-600 mb-4">
                    We recommend trying to solve the problem step-by-step first.
                  </p>
                  <Button onClick={toggleAnswer}>
                    <Eye className="mr-2 h-4 w-4" />
                    Show Solution
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Tabs defaultValue="steps">
          <TabsContent value="steps">
            <div className="flex w-full justify-between">
              <Button 
                variant="outline" 
                onClick={previousStep} 
                disabled={currentStepIndex === 0}
              >
                Previous Step
              </Button>
              
              {currentStepIndex < problem.steps.length - 1 ? (
                <Button onClick={nextStep}>
                  Continue to Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={toggleAnswer}
                >
                  {showAnswer ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Hide Solution
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Show Solution
                    </>
                  )}
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="explanation">
            <Button variant="outline" className="w-full" onClick={() => document.querySelector('[data-value="steps"]')?.click()}>
              Go to Step-by-Step Guide
            </Button>
          </TabsContent>
          
          <TabsContent value="solution">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={toggleAnswer}
            >
              {showAnswer ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide Solution
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Show Solution
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardFooter>
    </Card>
  );
}
