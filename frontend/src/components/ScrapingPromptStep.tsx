
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SearchConfig } from '@/types';
import { HelpCircle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface ScrapingPromptStepProps {
  config: SearchConfig;
  onConfigUpdate: (config: SearchConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

const ScrapingPromptStep: React.FC<ScrapingPromptStepProps> = ({
  config,
  onConfigUpdate,
  onNext,
  onBack,
}) => {
  // Default prompt template
  const defaultPrompt = `Given the website, extract all the relevant data from the website, needed to fill the schema.
Don't include any other text than the data. Do not infer or fabricate any information.
Only include real, verifiable data that is explicitly visible on the website.

For the website identification:
- only add the website to the data if it can be clearly associated with the company
- the second-level domain should clearly be related to the company name in some way
- the second-level domain should not be a business directory, marketplace or general websites for company information
- must be a real website with www included and not just a business name

If you are not able to find a data field, leave the field empty, simply an empty string.`;

  const [prompt, setPrompt] = useState(config.customTemplate || defaultPrompt);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSave = () => {
    onConfigUpdate({
      ...config,
      customTemplate: prompt,
    });
    onNext();
  };

  return (
    <div className="step-container">
      <h2 className="text-center mb-6">Configure Scraping Prompt</h2>
      
      <div className="space-y-4">
        <div className="flex items-center mb-2">
          <p className="text-gray-600">
            This prompt will instruct the AI how to extract data from the websites found by your search query.
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2 h-7 w-7 p-0">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  After finding relevant websites, this prompt guides the AI scraper in
                  extracting specific data points from each site.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <Textarea
            value={prompt}
            onChange={handlePromptChange}
            className="w-full min-h-[300px] font-mono text-sm bg-white rounded"
            placeholder="Enter your scraping prompt here..."
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack} className="rounded">
          Back
        </Button>
        <Button onClick={handleSave} className="rounded">
          Next: Select Search Sites
        </Button>
      </div>
    </div>
  );
};

export default ScrapingPromptStep;
