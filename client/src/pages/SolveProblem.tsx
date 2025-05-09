import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import ProblemDisplay from "@/components/problem-solving/ProblemDisplay";
import StepByStepGuide from "@/components/problem-solving/StepByStepGuide";
import WebcamCapture from "@/components/webcam-capture/WebcamCapture";
import FileUpload from "@/components/file-upload/FileUpload";
import { readFileAsBase64, dataURItoBlob } from "@/lib/utils";
import { HomeworkProblem } from "@shared/schema";

export default function SolveProblem() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const problemId = params.get("id");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  const [file, setFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCaptureOptions, setShowCaptureOptions] = useState<boolean>(!problemId);

  // Fetch problem data if we have an ID
  const { data: problem, isLoading, error } = useQuery({
    queryKey: ['/api/problems', problemId], 
    enabled: !!problemId,
  });

  // Mutation for updating problem text
  const updateTextMutation = useMutation({
    mutationFn: async ({ id, text }: { id: string, text: string }) => {
      const res = await apiRequest("PATCH", `/api/problems/${id}`, { detectedText: text });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/problems', problemId] });
      toast({
        title: "Text updated",
        description: "The problem text has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update the problem text. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for submitting a new problem
  const analyzeImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiRequest("POST", "/api/analyze-problem", formData);
      return res.json();
    },
    onSuccess: (data) => {
      navigate(`/solve?id=${data.problemId}`);
      setShowCaptureOptions(false);
    },
    onError: (error) => {
      toast({
        title: "Problem analysis failed",
        description: error.message || "Could not analyze the problem. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setCapturedImage(null);
  };

  const handleWebcamCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setFile(null);
    
    // Convert the data URL to a Blob to create a File
    const blob = dataURItoBlob(imageSrc);
    const capturedFile = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
    setFile(capturedFile);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a file or capture a photo first",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('problemImage', file);
      
      // If the file is a captured image, we may want to add a flag
      if (capturedImage) {
        formData.append('source', 'webcam');
      } else {
        formData.append('source', 'upload');
      }

      analyzeImageMutation.mutate(formData);
    } catch (error) {
      console.error("Error submitting problem:", error);
      toast({
        title: "Submission failed",
        description: "Could not submit the problem for analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditText = (newText: string) => {
    if (problemId) {
      updateTextMutation.mutate({ id: problemId, text: newText });
    }
  };

  const handleTryAgain = () => {
    setShowCaptureOptions(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-custom shadow-custom p-6 text-center">
          <div className="flex mb-4 justify-center">
            <div className="bg-red-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Problem Not Found</h2>
          <p className="text-gray-600 mb-4">The problem you're looking for doesn't exist or couldn't be loaded.</p>
          <Link href="/">
            <Button>Go Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Solve Problem | HomeworkHelper</title>
        <meta name="description" content="Get step-by-step guidance for your homework problems with our AI-powered platform." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {showCaptureOptions ? (
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading text-center mb-6">
              Capture Your Homework Problem
            </h1>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
              <FileUpload onUpload={handleFileUpload} />
              <WebcamCapture onCapture={handleWebcamCapture} />
            </div>
            
            {file && (
              <div className="text-center">
                <Button 
                  size="lg" 
                  className="px-8"
                  onClick={handleSubmit}
                  disabled={analyzeImageMutation.isPending}
                >
                  {analyzeImageMutation.isPending ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Homework Problem'
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : problem ? (
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading mb-6">
              Problem Solution
            </h1>
            
            <div className="grid md:grid-cols-2 gap-8">
              <ProblemDisplay 
                problem={problem as HomeworkProblem} 
                imageUrl={`/api/problems/${problemId}/image`}
                onEditText={handleEditText}
                onTryAgain={handleTryAgain}
              />
              
              <StepByStepGuide 
                problem={problem as HomeworkProblem}
                loading={false}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600">No problem selected. Please upload or capture a homework problem to begin.</p>
            <Button 
              className="mt-4"
              onClick={() => setShowCaptureOptions(true)}
            >
              Capture a Problem
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
