
import React from 'react';
import { CSVData } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DataPreviewStepProps {
  data: CSVData;
  onNext: () => void;
  onBack: () => void;
}

export const DataPreviewStep: React.FC<DataPreviewStepProps> = ({ data, onNext, onBack }) => {
  const preview = data.rows.slice(0, 5);
  const hasLargeDataset = data.rows.length > 250;

  return (
    <div className="step-container">
      <h2 className="text-center mb-6">Preview Your Data</h2>
      
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">File:</span>
          <span className="text-gray-600">{data.fileName}</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-medium">Total Records:</span>
          <span className="text-gray-600">{data.rows.length}</span>
        </div>
        
        {hasLargeDataset && (
          <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription>
              Warning: Your CSV contains more than 250 rows. Processing large datasets may take longer.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <ScrollArea className="border rounded-md h-64 mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50">
                {data.headers.map((header, index) => (
                  <th key={index} className="px-4 py-2 text-left border-b text-blue-700 font-medium text-sm">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2 border-b text-sm">
                      {cell || <span className="text-gray-400">empty</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Next: Configure Columns
        </Button>
      </div>
    </div>
  );
};

export default DataPreviewStep;
