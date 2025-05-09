import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { RefreshCw, Edit, Check } from "lucide-react";
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
          <div className="bg-blue-50 rounded-custom p-4">
            <h3 className="font-heading font-bold text-primary mb-2">Problem Detection</h3>
            
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
