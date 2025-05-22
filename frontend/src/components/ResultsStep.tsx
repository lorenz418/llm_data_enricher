
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CSVData } from '@/types';
import { downloadCSV } from '@/utils/csvUtils';
import { Download } from 'lucide-react';

interface ResultsStepProps {
  data: CSVData;
  onReset: () => void;
}

export const ResultsStep: React.FC<ResultsStepProps> = ({ data, onReset }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      downloadCSV(data);
      setDownloading(false);
    }, 500);
  };

  return (
    <div className="step-container">
      <h2 className="text-center mb-6">Enriched Results</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">File name:</p>
            <p className="text-gray-600">enriched_{data.fileName}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total records:</p>
            <p className="text-gray-600">{data.rows.length}</p>
          </div>
          <div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <span>Downloading...</span>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download CSV</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        <ScrollArea className="border rounded-md h-80 mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50">
                {data.headers.map((header, index) => (
                  <th key={index} className="px-4 py-2 text-left border-b text-blue-700 font-medium text-sm whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, rowIndex) => (
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
        </ScrollArea>
      </div>
      
      <div className="flex justify-center mt-8">
        <Button onClick={onReset}>
          Start New Process
        </Button>
      </div>
    </div>
  );
};

export default ResultsStep;
