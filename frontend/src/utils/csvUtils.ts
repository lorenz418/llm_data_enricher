
import { CSVData } from "@/types";

// Parse CSV string into structured data
export const parseCSV = (csvString: string, fileName: string): CSVData => {
  const rows = csvString.split('\n').map(row => row.split(',').map(cell => cell.trim()));
  const headers = rows[0];
  
  // Remove header row
  const dataRows = rows.slice(1).filter(row => row.length === headers.length && row.some(cell => cell !== ''));
  
  return {
    headers,
    rows: dataRows,
    fileName
  };
};

// Convert CSV data back to string for download
export const convertToCSV = (data: CSVData): string => {
  const headerRow = data.headers.join(',');
  const dataRows = data.rows.map(row => row.join(','));
  return [headerRow, ...dataRows].join('\n');
};

// Generate download link for CSV data
export const downloadCSV = (data: CSVData) => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `enriched_${data.fileName}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Add a new column to the CSV data
export const addColumn = (data: CSVData, columnName: string): CSVData => {
  const newHeaders = [...data.headers, columnName];
  const newRows = data.rows.map(row => [...row, '']);
  
  return {
    ...data,
    headers: newHeaders,
    rows: newRows
  };
};

// Generate a preview of the CSV data (first 5 rows)
export const generatePreview = (data: CSVData): CSVData => {
  return {
    ...data,
    rows: data.rows.slice(0, 5)
  };
};

// Mock function to simulate data enrichment
export const enrichData = (data: CSVData, searchConfig: any): CSVData => {
  const enrichedIndex = data.headers.findIndex(h => h === searchConfig.columnToEnrich);
  
  if (enrichedIndex === -1) return data;
  
  const mockSearchResults = [
    "Acme Corp - Software Solutions",
    "TechGiant Industries",
    "Innovative Systems LLC",
    "Future Technologies Inc",
    "Digital Solutions Group",
    "NextGen Software",
    "Global Tech Partners",
    "Smart Systems International",
    "Cloud Solutions Pro",
    "Data Analytics Partners"
  ];
  
  const enrichedRows = data.rows.map(row => {
    const newRow = [...row];
    newRow[enrichedIndex] = mockSearchResults[Math.floor(Math.random() * mockSearchResults.length)];
    return newRow;
  });
  
  return {
    ...data,
    rows: enrichedRows
  };
};
