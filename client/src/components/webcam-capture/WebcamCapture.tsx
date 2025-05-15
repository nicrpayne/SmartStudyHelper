import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  active?: boolean;
}

export default function WebcamCapture({ onCapture, active = true }: WebcamCaptureProps) {
  const [isWebcamEnabled, setIsWebcamEnabled] = useState<boolean>(false);
  const [isCaptureMode, setIsCaptureMode] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Function to safely stop all camera streams
  const stopAllMediaTracks = useCallback(() => {
    // Stop tracks from the webcam ref if available
    if (webcamRef.current && webcamRef.current.stream) {
      const stream = webcamRef.current.stream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Also stop any tracks we saved in our ref
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Get all video elements on the page and stop their streams (backup method)
    document.querySelectorAll('video').forEach(video => {
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        video.srcObject = null;
      }
    });
    
    console.log('All camera streams stopped');
  }, []);

  // Monitor active prop changes
  useEffect(() => {
    // If component becomes inactive, stop the camera
    if (!active && isWebcamEnabled) {
      stopAllMediaTracks();
      setIsWebcamEnabled(false);
      setIsCaptureMode(false);
    }
  }, [active, isWebcamEnabled, stopAllMediaTracks]);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      stopAllMediaTracks();
    };
  }, [stopAllMediaTracks]);

  const enableWebcam = () => {
    console.log("Enabling webcam...");
    setIsWebcamEnabled(true);
    setIsCaptureMode(true);
    
    // Access the webcam and save the stream reference
    navigator.mediaDevices.getUserMedia({ 
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "environment"
      },
      audio: false 
    }).then(stream => {
      console.log("Media stream obtained successfully");
      streamRef.current = stream;
      
      // Assign the stream to video elements directly if needed
      if (webcamRef.current && webcamRef.current.video) {
        webcamRef.current.video.srcObject = stream;
      }
    }).catch(err => {
      console.error("Failed to get media stream:", err);
      toast({
        title: "Camera access failed",
        description: "Please check your camera permissions and try again.",
        variant: "destructive",
      });
      setIsWebcamEnabled(false);
    });
  };

  const capture = useCallback(() => {
    if (!webcamRef.current) {
      console.error("Webcam reference is not available");
      toast({
        title: "Capture failed",
        description: "Webcam not initialized properly. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Attempting to capture from webcam...");
      const imageSrc = webcamRef.current.getScreenshot();
      console.log("Screenshot obtained:", imageSrc ? "successfully" : "failed");
      
      if (imageSrc) {
        console.log("Capture successful, notifying parent component");
        onCapture(imageSrc);
        setIsCaptureMode(false);
      } else {
        console.error("Webcam returned empty screenshot");
        toast({
          title: "Capture failed",
          description: "Could not capture image from webcam. Please ensure camera permissions are granted.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Webcam capture error:", error);
      toast({
        title: "Capture failed",
        description: "An error occurred while capturing from webcam. Please try again.",
        variant: "destructive",
      });
    }
  }, [webcamRef, onCapture, toast]);

  const retakePhoto = () => {
    setIsCaptureMode(true);
  };
  
  const disableWebcam = () => {
    stopAllMediaTracks();
    setIsWebcamEnabled(false);
    setIsCaptureMode(false);
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
          <div className="relative">
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
            <Button
              className="absolute top-2 right-2 bg-gray-700 bg-opacity-70 hover:bg-gray-800 text-white p-2 h-auto rounded-full"
              size="sm"
              onClick={disableWebcam}
              title="Disable camera"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m2 2 20 20"></path>
                <path d="M14.5 16a.5.5 0 0 1 0-1 .5.5 0 0 1 0 1M20.8 17.8c.6-.9 1.2-2.2 1.2-4.3 0-5-3.5-9-8-9-2.4 0-4.5 1.1-6 2.7M12.375 12.375a1.633 1.633 0 0 1-2.25-2.25"></path>
                <path d="M15.5 16a.5.5 0 0 1 0-1 .5.5 0 0 1 0 1M17 19.5C10 20.8 4.667 16.667 3 13.5"></path>
                <path d="M7 13.5c.046-.725.793-1.012 1.5-.833 1.146.288 2.542 1.096 4 1.833-.548.577-1 1.203-1 2 0 .5-.17 2.5-2 2.5 0 0-2.5 0-2.5-2.5 0-.833.117-1.834 0-3"></path>
              </svg>
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        {!isWebcamEnabled ? (
          <Button 
            className="w-full bg-secondary hover:bg-orange-500 text-white"
            onClick={enableWebcam}
          >
            <Camera className="mr-2 h-5 w-5" />
            Enable Camera
          </Button>
        ) : isCaptureMode ? (
          <div>
            <Button 
              className="w-full bg-secondary hover:bg-orange-500 text-white mb-2"
              onClick={capture}
            >
              <Camera className="mr-2 h-5 w-5" />
              Capture Photo
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={disableWebcam}
            >
              Turn Off Camera
            </Button>
          </div>
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
