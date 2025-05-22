
import React, { useState, useEffect } from 'react';
import { CSVData, SearchConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, HelpCircle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface SearchTermsStepProps {
  data: CSVData;
  config: SearchConfig;
  onNext: () => void;
  onBack: () => void;
  onConfigUpdate: (config: SearchConfig) => void;
}

export const SearchTermsStep: React.FC<SearchTermsStepProps> = ({ 
  data, 
  config, 
  onNext, 
  onBack, 
  onConfigUpdate 
}) => {
  const [template, setTemplate] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [searchColumns, setSearchColumns] = useState<string[]>([]);

  useEffect(() => {
    if (data.rows.length > 0 && template) {
      generatePreview(template);
    }
  }, [template, data.rows, searchColumns]);

  const generatePreview = (templateText: string) => {
    if (!templateText) {
      setPreviewText('');
      return;
    }

    let preview = templateText;
    const sampleRow = data.rows[0];

    searchColumns.forEach(column => {
      const columnIndex = data.headers.indexOf(column);
      if (columnIndex !== -1) {
        const value = sampleRow[columnIndex] || '[empty]';
        const placeholder = `{${column}}`;
        preview = preview.replace(new RegExp(placeholder, 'g'), value);
      }
    });

    setPreviewText(preview);
    onConfigUpdate({
      ...config,
      customTemplate: templateText,
      selectedColumns: searchColumns
    });
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplate(e.target.value);
  };

  const insertColumn = (column: string) => {
    const textArea = document.getElementById('searchTemplate') as HTMLTextAreaElement;
    if (!textArea) return;

    const startPos = textArea.selectionStart;
    const endPos = textArea.selectionEnd;
    const placeholder = `{${column}}`;
    const newValue = template.substring(0, startPos) + placeholder + template.substring(endPos);
    
    setTemplate(newValue);
    
    // Reset cursor position after state update
    setTimeout(() => {
      textArea.focus();
      textArea.selectionStart = startPos + placeholder.length;
      textArea.selectionEnd = startPos + placeholder.length;
    }, 0);
  };

  const handleAddColumn = () => {
    if (!selectedColumn || searchColumns.includes(selectedColumn)) return;
    
    const updatedColumns = [...searchColumns, selectedColumn];
    setSearchColumns(updatedColumns);
    setSelectedColumn('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedColumn && !searchColumns.includes(selectedColumn)) {
      e.preventDefault();
      handleAddColumn();
    }
  };

  const removeSearchColumn = (column: string) => {
    const updatedColumns = searchColumns.filter(c => c !== column);
    setSearchColumns(updatedColumns);
  };

  return (
    <div className="step-container">
      <h2 className="text-center mb-6">Configure Search Terms</h2>
      
      <div className="space-y-6">
        <div className="bg-white border rounded-md p-4">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-medium">Create your search query</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2 h-7 w-7 p-0">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    This query will be sent to search engines to find relevant websites.
                    Select columns from your data and add them to your search query using the placeholder format {"{columnName}"}.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="mb-4">
            <div className="flex space-x-2">
              <Select 
                value={selectedColumn} 
                onValueChange={setSelectedColumn}
              >
                <SelectTrigger className="w-full bg-white rounded">
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                  {data.headers.map((header) => (
                    <SelectItem 
                      key={header} 
                      value={header}
                      disabled={searchColumns.includes(header)}
                    >
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddColumn} 
                type="button" 
                disabled={!selectedColumn} 
                className="rounded"
                onKeyDown={handleKeyDown}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {searchColumns.map((column) => (
              <Badge 
                key={column} 
                variant="secondary"
                className="group relative px-3 py-1 rounded"
              >
                {column}
                <button
                  onClick={() => removeSearchColumn(column)}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1"
                  aria-label={`Remove ${column}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {searchColumns.length === 0 && (
              <p className="text-sm text-gray-500">No columns selected</p>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            Write your search query and add column data using the buttons below.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {searchColumns.map((column) => (
              <Button 
                key={column}
                variant="outline"
                size="sm"
                onClick={() => insertColumn(column)}
                className="text-xs rounded"
              >
                Insert {"{"+column+"}"}
              </Button>
            ))}
          </div>
          
          <Textarea
            id="searchTemplate"
            value={template}
            onChange={handleTemplateChange}
            placeholder="Example: Find information about {Company} in {City}"
            className="min-h-[200px] mb-4 bg-white rounded"
          />
        </div>
        
        <div className="bg-white border rounded-md p-4">
          <Label className="text-lg font-medium mb-4 block">Preview</Label>
          <Card className="p-4 bg-gray-50 min-h-[80px] rounded">
            {previewText ? (
              <p className="whitespace-pre-wrap">{previewText}</p>
            ) : (
              <p className="text-gray-400 italic">Add template text with column placeholders to see a preview</p>
            )}
          </Card>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack} className="rounded">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!template.trim()}
          className="rounded"
        >
          Next: Configure Scraping Prompt
        </Button>
      </div>
    </div>
  );
};

export default SearchTermsStep;
