
import React, { useState } from 'react';
import { CSVData, Step, SearchConfig, SearchSite } from '@/types';
import { StepHeader } from '@/components/StepHeader';
import FileUploadStep from '@/components/FileUploadStep';
import DataPreviewStep from '@/components/DataPreviewStep';
import ConfigureColumnsStep from '@/components/ConfigureColumnsStep';
import SearchTermsStep from '@/components/SearchTermsStep';
import ScrapingPromptStep from '@/components/ScrapingPromptStep';
import SearchSitesStep from '@/components/SearchSitesStep';
import ProcessingStep from '@/components/ProcessingStep';
import ResultsStep from '@/components/ResultsStep';
import { parseCSV } from '@/utils/csvUtils';
import { Toaster } from "@/components/ui/toaster";
import { Github } from 'lucide-react';

const Index = () => {
  const [step, setStep] = useState<Step>('upload');
  const [csvData, setCsvData] = useState<CSVData>({ headers: [], rows: [], fileName: '' });
  const [enrichedData, setEnrichedData] = useState<CSVData>({ headers: [], rows: [], fileName: '' });
  const [searchConfig, setSearchConfig] = useState<SearchConfig>({
    columnToEnrich: '',
    selectedColumns: [],
    customTemplate: ''
  });
  const [searchSites, setSearchSites] = useState<SearchSite[]>([]);

  const handleFileLoaded = (content: string, fileName: string) => {
    const data = parseCSV(content, fileName);
    setCsvData(data);
  };

  const resetProcess = () => {
    setStep('upload');
    setCsvData({ headers: [], rows: [], fileName: '' });
    setEnrichedData({ headers: [], rows: [], fileName: '' });
    setSearchConfig({
      columnToEnrich: '',
      selectedColumns: [],
      customTemplate: ''
    });
    setSearchSites([]);
  };

  const renderStepContent = () => {
    switch (step) {
      case 'upload':
        return (
          <FileUploadStep
            onFileLoaded={handleFileLoaded}
            onNext={() => setStep('preview')}
          />
        );
      case 'preview':
        return (
          <DataPreviewStep
            data={csvData}
            onNext={() => setStep('configure')}
            onBack={() => setStep('upload')}
          />
        );
      case 'configure':
        return (
          <ConfigureColumnsStep
            data={csvData}
            config={searchConfig}
            onDataUpdate={setCsvData}
            onConfigUpdate={setSearchConfig}
            onNext={() => setStep('search-terms')}
            onBack={() => setStep('preview')}
          />
        );
      case 'search-terms':
        return (
          <SearchTermsStep
            data={csvData}
            config={searchConfig}
            onConfigUpdate={setSearchConfig}
            onNext={() => setStep('prompt')}
            onBack={() => setStep('configure')}
          />
        );
      case 'prompt':
        return (
          <ScrapingPromptStep
            config={searchConfig}
            onConfigUpdate={setSearchConfig}
            onNext={() => setStep('sites')}
            onBack={() => setStep('search-terms')}
          />
        );
      case 'sites':
        return (
          <SearchSitesStep
            sites={searchSites}
            onSitesUpdate={setSearchSites}
            onNext={() => setStep('processing')}
            onBack={() => setStep('prompt')}
          />
        );
      case 'processing':
        return (
          <ProcessingStep
            data={csvData}
            config={searchConfig}
            sites={searchSites}
            onComplete={(data) => {
              setEnrichedData(data);
              setStep('results');
            }}
          />
        );
      case 'results':
        return (
          <ResultsStep
            data={enrichedData}
            onReset={resetProcess}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">CSV Enrichment Tool</h1>
          <p className="text-gray-600">Upload, configure, and enrich your CSV data</p>
        </header>

        <StepHeader currentStep={step} />
        
        <div className="mb-8">
          {renderStepContent()}
        </div>
      </div>
      
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2">
          <a 
            href="https://github.com/lorenz418/llm_data_enricher" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center hover:text-blue-600 transition-colors"
          >
            <Github className="h-4 w-4 mr-1" />
            <span>GitHub Project</span>
          </a>
        </div>
      </footer>
      <Toaster />
    </div>
  );
};

export default Index;
