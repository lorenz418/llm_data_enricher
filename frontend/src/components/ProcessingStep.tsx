
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CSVData, SearchConfig, SearchSite } from '@/types';
import { enrichData } from '@/utils/csvUtils';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface ProcessingStepProps {
  data: CSVData;
  config: SearchConfig;
  sites: SearchSite[];
  onComplete: (enrichedData: CSVData) => void;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  data,
  config,
  sites,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [processedCompanies, setProcessedCompanies] = useState<{ name: string; status: 'success' | 'loading' | 'pending' }[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Generate realistic company names for display during processing
  const companyNames = [
    "Acme Corp",
    "TechGiant Industries",
    "Innovative Systems LLC",
    "Future Technologies Inc",
    "Digital Solutions Group",
    "NextGen Software",
    "Global Tech Partners",
    "Smart Systems International",
    "Cloud Solutions Pro",
    "Data Analytics Partners",
    "Quantum Computing Inc",
    "Blockchain Ventures",
    "AI Solutions Group",
    "Sustainable Energy Corp",
    "Advanced Technologies"
  ];

  // Memoize the processing function to avoid unnecessary re-renders
  const simulateProcessing = useCallback(() => {
    const selectedSites = sites.filter(site => site.selected).length;
    if (selectedSites === 0) return;

    let currentProgress = 0;
    let processed: { name: string; status: 'success' | 'loading' | 'pending' }[] = [];
    let currentIndex = -1;
    
    // Pre-calculate some values to improve performance
    const progressStepSize = 100 / (companyNames.length * 1.2);
    const progressInterval = Math.max(50, 2000 / companyNames.length);

    const updateProgress = () => {
      if (currentProgress >= 100) {
        setProgress(100);
        setIsComplete(true);

        // Update all remaining pending companies to success
        setProcessedCompanies(prev => 
          prev.map(company => ({ ...company, status: 'success' as const }))
        );

        // Enrich data once processing is complete
        const enrichedData = enrichData(data, config);
        onComplete(enrichedData);
        return;
      }

      // Update progress with a fixed increment for smoother animation
      currentProgress += progressStepSize;
      setProgress(Math.min(currentProgress, 100));

      // Add new company to process
      currentIndex = (currentIndex + 1) % companyNames.length;
      const company = companyNames[currentIndex];
      
      processed.push({ name: company, status: 'loading' });
      setProcessedCompanies([...processed]);
      
      // Mark previous company as complete after a delay
      setTimeout(() => {
        setProcessedCompanies(prev => {
          const updated = [...prev];
          const loadingIndex = updated.findIndex(c => c.status === 'loading');
          if (loadingIndex !== -1) {
            updated[loadingIndex].status = 'success';
          }
          return updated;
        });
      }, progressInterval * 0.8);

      // Continue processing
      if (currentProgress < 100) {
        setTimeout(updateProgress, progressInterval);
      }
    };

    // Start the processing
    updateProgress();
  }, [companyNames, sites, data, config, onComplete]);

  useEffect(() => {
    const selectedSites = sites.filter(site => site.selected).length;
    if (selectedSites === 0) return;
    
    // Small delay to allow the component to render first
    const timer = setTimeout(() => {
      simulateProcessing();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [simulateProcessing, sites]);

  return (
    <div className="step-container">
      <h2 className="text-center mb-6">Processing Data</h2>
      
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex justify-between mb-1 text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          <div className="text-center">
            {isComplete ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-lg font-medium text-green-600">Processing complete!</p>
              </div>
            ) : (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            )}
          </div>

          <div className="border rounded-md p-4 bg-gray-50 min-h-[200px] max-h-[300px] overflow-y-auto">
            <h3 className="font-medium mb-2">Processed Companies:</h3>
            {processedCompanies.length > 0 ? (
              <ul className="space-y-2">
                {processedCompanies.map((company, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    {company.status === 'loading' ? (
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    ) : company.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-gray-300" />
                    )}
                    <span>{company.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Processing will begin shortly...</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button 
          disabled={!isComplete} 
          onClick={() => onComplete(enrichData(data, config))}
          className="flex items-center rounded"
        >
          {isComplete ? (
            <>
              View Results
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : "Processing..."}
        </Button>
      </div>
    </div>
  );
};

export default ProcessingStep;
