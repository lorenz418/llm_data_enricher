
import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FileUploadStepProps {
  onFileLoaded: (data: string, fileName: string) => void;
  onNext: () => void;
}

export const FileUploadStep: React.FC<FileUploadStepProps> = ({ onFileLoaded, onNext }) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file) return;

      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file format',
          description: 'Please upload a CSV file only',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          onFileLoaded(content, file.name);
          onNext();
          toast({
            title: 'File uploaded successfully',
            description: `${file.name} is ready for processing`,
          });
        } catch (error) {
          toast({
            title: 'Error parsing file',
            description: 'Please check your file format and try again',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsText(file);
    },
    [onFileLoaded, onNext, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files?.length) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  return (
    <div className="step-container">
      <h2 className="text-center mb-6">Upload your CSV file</h2>
      <div
        className={`border-2 border-dashed rounded-lg p-10 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } transition-colors duration-200 cursor-pointer`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleFileInput}
          disabled={isLoading}
        />

        <div className="flex flex-col items-center justify-center gap-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin">
                <Upload className="h-10 w-10 text-blue-500" />
              </div>
              <p className="text-gray-600">Processing file...</p>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-blue-500" />
              <div>
                <p className="text-lg font-medium">Drag and drop your file here</p>
                <p className="text-gray-500 mt-1">or click to browse your files</p>
              </div>
              <div className="flex gap-3 mt-2">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  <span>.csv</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <Button 
          size="lg" 
          disabled 
          className="opacity-50 cursor-not-allowed"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default FileUploadStep;
