import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
}

export default function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const [isWebcamEnabled, setIsWebcamEnabled] = useState<boolean>(false);
  const [isCaptureMode, setIsCaptureMode] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const { toast } = useToast();

  const enableWebcam = () => {
    setIsWebcamEnabled(true);
    setIsCaptureMode(true);
  };

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
        setIsCaptureMode(false);
      } else {
        toast({
          title: "Capture failed",
          description: "Could not capture image from webcam",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Webcam capture error:", error);
      toast({
        title: "Capture failed",
        description: "An error occurred while capturing from webcam",
        variant: "destructive",
      });
    }
  }, [webcamRef, onCapture, toast]);

  const retakePhoto = () => {
    setIsCaptureMode(true);
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment"
  };

  return (
    <Card className="p-6 border-2 border-transparent hover:border-primary transition hover:shadow-lg">
      <div className="flex items-center mb-4">
        <div className="bg-orange-100 p-3 rounded-custom mr-4">
          <Camera className="h-8 w-8 text-secondary" />
        </div>
        <h2 className="text-xl font-bold font-heading">Use Webcam</h2>
      </div>
      
      <p className="text-gray-600 mb-6">Take a photo of your homework using your device's camera.</p>
      
      <div className="relative overflow-hidden rounded-custom" style={{ aspectRatio: "4/3" }}>
        {!isWebcamEnabled ? (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center rounded-custom text-center p-6">
            <div>
              <Camera className="h-12 w-12 mx-auto mb-2 text-gray-500" />
              <p className="text-gray-400">Click below to enable camera</p>
            </div>
          </div>
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover rounded-custom"
            onUserMediaError={(error) => {
              console.error("Webcam error:", error);
              toast({
                title: "Camera access error",
                description: "Could not access your camera. Please check permissions.",
                variant: "destructive",
              });
              setIsWebcamEnabled(false);
            }}
          />
        )}
      </div>
      
      <div className="mt-4">
        {!isWebcamEnabled ? (
          <Button 
            className="w-full bg-secondary hover:bg-orange-500 text-white"
            onClick={enableWebcam}
          >
            <Camera className="mr-2 h-5 w-5" />
            Enable Camera
          </Button>
        ) : isCaptureMode ? (
          <Button 
            className="w-full bg-secondary hover:bg-orange-500 text-white"
            onClick={capture}
          >
            <Camera className="mr-2 h-5 w-5" />
            Capture Photo
          </Button>
        ) : (
          <Button 
            className="w-full"
            variant="outline"
            onClick={retakePhoto}
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Take Another Photo
          </Button>
        )}
      </div>
    </Card>
  );
}
