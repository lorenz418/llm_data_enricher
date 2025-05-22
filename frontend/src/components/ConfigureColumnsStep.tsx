
import React, { useState, useEffect } from 'react';
import { CSVData, SearchConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { addColumn } from '@/utils/csvUtils';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConfigureColumnsStepProps {
  data: CSVData;
  onNext: () => void;
  onBack: () => void;
  onDataUpdate: (data: CSVData) => void;
  onConfigUpdate: (config: SearchConfig) => void;
  config: SearchConfig;
}

export const ConfigureColumnsStep: React.FC<ConfigureColumnsStepProps> = ({ 
  data, 
  onNext, 
  onBack, 
  onDataUpdate, 
  onConfigUpdate, 
  config 
}) => {
  const [newColumnName, setNewColumnName] = useState('');
  const [columnsToRescrape, setColumnsToRescrape] = useState<string[]>(config.selectedColumns || []);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  
  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    
    // Add the column to data
    const updatedData = addColumn(data, newColumnName);
    onDataUpdate(updatedData);
    
    // Add to columns to rescrape
    const updatedColumns = [...columnsToRescrape, newColumnName];
    setColumnsToRescrape(updatedColumns);
    onConfigUpdate({
      ...config,
      selectedColumns: updatedColumns
    });
    
    // Clear input
    setNewColumnName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddColumn();
    }
  };

  const handleToggleRescrapeColumn = (columnName: string) => {
    if (!columnName) return;
    
    const isSelected = columnsToRescrape.includes(columnName);
    if (isSelected) return; // Already selected
    
    const updatedColumns = [...columnsToRescrape, columnName];
    setColumnsToRescrape(updatedColumns);
    onConfigUpdate({
      ...config,
      selectedColumns: updatedColumns
    });
    
    setSelectedColumn('');
  };

  const handleRemoveSourceColumn = (columnName: string) => {
    const updatedColumns = columnsToRescrape.filter(col => col !== columnName);
    setColumnsToRescrape(updatedColumns);
    onConfigUpdate({
      ...config,
      selectedColumns: updatedColumns
    });
  };

  return (
    <div className="step-container">
      <h2 className="text-center mb-6">Configure Columns</h2>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="bg-white border rounded-md p-4 flex-1">
            <h3 className="text-lg font-medium mb-4">Select columns to rescrape</h3>
            <p className="text-sm text-gray-500 mb-4">
              Choose existing columns that will be enriched with new data.
            </p>
            <Select 
              value={selectedColumn} 
              onValueChange={handleToggleRescrapeColumn}
            >
              <SelectTrigger className="w-full bg-white rounded">
                <SelectValue placeholder="Select columns to rescrape" />
              </SelectTrigger>
              <SelectContent>
                {data.headers.map((header) => (
                  <SelectItem 
                    key={header} 
                    value={header}
                    disabled={columnsToRescrape.includes(header)}
                  >
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-white border rounded-md p-4 flex-1">
            <h3 className="text-lg font-medium mb-4">Add a new column</h3>
            <p className="text-sm text-gray-500 mb-4">
              Create a new column to store search results.
            </p>
            <div className="flex space-x-2">
              <Input
                placeholder="New column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-white rounded"
              />
              <Button onClick={handleAddColumn} type="button" className="rounded">
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">Columns to be enriched:</h3>
        
        {columnsToRescrape.length > 0 && (
          <Alert className="mb-4 py-2 bg-amber-50 border-amber-200 flex items-center">
            <AlertCircle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
            <AlertDescription>
              Warning: Existing data in the selected columns will be overwritten.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-wrap gap-2">
          {columnsToRescrape.map((column) => (
            <Badge 
              key={column} 
              variant="secondary"
              className="group relative px-3 py-1 rounded"
            >
              {column}
              <button
                onClick={() => handleRemoveSourceColumn(column)}
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1"
                aria-label={`Remove ${column}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {columnsToRescrape.length === 0 && (
            <p className="text-sm text-gray-500">No columns selected for enrichment</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack} className="rounded">
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={columnsToRescrape.length === 0}
          className="rounded"
        >
          Next: Configure Search Terms
        </Button>
      </div>
    </div>
  );
};

export default ConfigureColumnsStep;
