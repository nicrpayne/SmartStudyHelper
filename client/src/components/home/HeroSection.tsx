import { Link } from "wouter";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import WebcamCapture from "@/components/webcam-capture/WebcamCapture";
import FileUpload from "@/components/file-upload/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { readFileAsBase64, dataURItoBlob } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function HeroSection() {
  const [file, setFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<'none' | 'file' | 'webcam'>('none');
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const analyzeImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiRequest("POST", "/api/analyze-problem", formData);
      return res.json();
    },
    onSuccess: (data) => {
      console.log("Analysis successful, response data:", data);
      if (data && data.problemId) {
        // Navigate to the problem solving page with the problem ID
        console.log("Navigating to problem with ID:", data.problemId);
        navigate(`/solve?id=${data.problemId}`);
      } else {
        console.error("Missing problemId in API response:", data);
        toast({
          title: "Navigation error",
          description: "Could not load the problem solution. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Problem analysis failed",
        description: error.message || "Could not analyze the problem. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = useCallback((uploadedFile: File) => {
    setFile(uploadedFile);
    setCapturedImage(null);
    setInputMethod('file');
  }, []);

  const handleWebcamCapture = useCallback((imageSrc: string) => {
    setCapturedImage(imageSrc);
    
    // Convert the data URL to a Blob to create a File
    const blob = dataURItoBlob(imageSrc);
    const capturedFile = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
    setFile(capturedFile);
    setInputMethod('webcam');
  }, []);

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

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-textDark mb-4">
          Get Interactive Help With Your Homework
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload or capture your homework problems and receive step-by-step guidance, not just answers. Learn as you solve!
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <FileUpload onUpload={handleFileUpload} />
        <WebcamCapture 
          onCapture={handleWebcamCapture} 
          active={inputMethod !== 'file'} 
        />
      </div>

      {file && (
        <div className="mt-8 text-center">
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
    </section>
  );
}
