
import React from 'react';
import { Step } from '@/types';
import { cn } from '@/lib/utils';

interface StepHeaderProps {
  currentStep: Step;
}

const steps: { id: Step; title: string }[] = [
  { id: 'upload', title: 'Upload File' },
  { id: 'preview', title: 'Preview Data' },
  { id: 'configure', title: 'Configure Columns' },
  { id: 'search-terms', title: 'Search Terms' },
  { id: 'prompt', title: 'Scraping Prompt' },
  { id: 'sites', title: 'Select Sites' },
  { id: 'processing', title: 'Processing' },
  { id: 'results', title: 'Results' }
];

export const StepHeader: React.FC<StepHeaderProps> = ({ currentStep }) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  index <= currentIndex 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 text-gray-500"
                )}
              >
                {index + 1}
              </div>
              <span className={cn(
                "text-xs mt-1 hidden sm:block text-center",
                index <= currentIndex ? "text-blue-500 font-medium" : "text-gray-500"
              )}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 flex items-center justify-center",
              )}>
                <div className={cn(
                  "h-0.5 w-full",
                  index < currentIndex ? "bg-blue-500" : "bg-gray-200"
                )} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
