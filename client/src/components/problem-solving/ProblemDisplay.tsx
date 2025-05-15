import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { RefreshCw, Edit, Check, ChevronDown, ChevronRight } from "lucide-react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import type { HomeworkProblem } from "@shared/schema";

interface ProblemDisplayProps {
  problem: HomeworkProblem;
  imageUrl: string;
  onEditText: (newText: string) => void;
  onTryAgain: () => void;
}

export default function ProblemDisplay({ 
  problem, 
  imageUrl, 
  onEditText, 
  onTryAgain 
}: ProblemDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(problem.detectedText);
  const [isDetectionOpen, setIsDetectionOpen] = useState(false);

  const handleSaveEdit = () => {
    onEditText(editedText);
    setIsEditing(false);
  };

  return (
    <div>
      <Card className="overflow-hidden">
        <div className="rounded-custom overflow-hidden border-b">
          <div className="relative">
            <img 
              src={imageUrl} 
              alt="Homework problem" 
              className="w-full h-auto object-contain max-h-[400px]"
            />
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Problem Detection - Collapsible */}
            <Collapsible 
              open={isDetectionOpen} 
              onOpenChange={setIsDetectionOpen}
              className="bg-blue-50 rounded-custom"
            >
              <div className="p-4 pb-2">
                <CollapsibleTrigger className="flex items-center font-heading font-bold text-primary w-full text-left">
                  {isDetectionOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                  Problem Detection
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="px-4 pb-4">              
                {isEditing ? (
                  <Textarea 
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="min-h-[100px] font-mono text-sm"
                    placeholder="Type the corrected problem text here..."
                  />
                ) : (
                  <p className="text-gray-700">
                    We've detected: <span className="font-mono bg-white px-2 py-1 rounded">{problem.detectedText}</span>
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
            
            {/* Problem Type and Grade Level */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
                {problem.problemType}
              </div>
              
              {problem.gradeLevel && (
                <div className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                  </svg>
                  {problem.gradeLevel} level
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-gray-50 px-4 py-3">
          {isEditing ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setEditedText(problem.detectedText);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveEdit}
              >
                <Check className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit if incorrect
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onTryAgain}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Try Another Problem
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
