import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadCloud, X, Image, FileType } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatFileName } from "@/lib/utils";

interface FileUploadProps {
  onUpload: (file: File) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload an image (JPG, PNG) or PDF file",
        variant: "destructive",
      });
      return;
    }
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreviewFile(file);
    onUpload(file);
    
  }, [onUpload, toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });
  
  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewFile(null);
  };
  
  return (
    <Card className="p-6 border-2 border-transparent hover:border-primary transition hover:shadow-lg">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 p-3 rounded-custom mr-4">
          <UploadCloud className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold font-heading">Upload Photo</h2>
      </div>
      <p className="text-gray-600 mb-6">Upload a photo of your homework problem from your device.</p>
      
      {!previewFile ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-custom p-6 text-center cursor-pointer transition
            ${isDragActive ? 'border-primary bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-primary font-medium">Choose File or Drag & Drop</p>
          <p className="text-sm text-gray-500 mt-2">
            {isDragActive ? "Drop file here..." : "Click to browse files or drag and drop"}
          </p>
        </div>
      ) : (
        <div className="relative border rounded-custom overflow-hidden">
          <Button 
            variant="destructive" 
            size="icon"
            className="absolute top-2 right-2 z-10 rounded-full"
            onClick={clearPreview}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {previewFile.type.startsWith("image/") ? (
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <img 
                src={previewUrl || ""} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 flex items-center justify-center p-4">
              <div className="text-center">
                <FileType className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium">{formatFileName(previewFile.name)}</p>
              </div>
            </div>
          )}
          
          <div className="p-3 bg-gray-50 border-t">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {previewFile.type.startsWith("image/") ? (
                  <Image className="h-5 w-5 mr-2 text-gray-500" />
                ) : (
                  <FileType className="h-5 w-5 mr-2 text-gray-500" />
                )}
                <span className="text-sm text-gray-600 truncate max-w-[180px]">
                  {formatFileName(previewFile.name)}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {(previewFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        Supported formats: JPG, PNG, PDF (max 10MB)
      </div>
    </Card>
  );
}
