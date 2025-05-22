
export interface CSVData {
  headers: string[];
  rows: string[][];
  fileName: string;
}

export type Step = 
  | 'upload'
  | 'preview'
  | 'configure'
  | 'search-terms'
  | 'prompt'
  | 'sites'
  | 'processing'
  | 'results';

export interface SearchConfig {
  columnToEnrich: string;
  selectedColumns: string[];
  customTemplate: string;
}

export interface SearchSite {
  name: string;
  url: string;
  selected: boolean;
  rank?: number;
}
