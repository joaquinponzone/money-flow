'use client';

import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { importFromExcel } from "@/app/actions";
import { useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { ExpenseCategories } from "@/lib/constants";

// Custom Alert component since it might not exist in the project
interface AlertProps {
  variant?: "default" | "destructive";
  className?: string;
  children: React.ReactNode;
}

function Alert({ variant = "default", className, children }: AlertProps) {
  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4",
        variant === "destructive" 
          ? "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive" 
          : "border-border [&>svg]:text-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm">{children}</div>;
}

interface ImportButtonProps {
  userId: string;
}

export function ImportButton({ userId }: ImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    stats?: { expenses: number; incomes: number };
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportResult(null);
      
      // Validate file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        setImportResult({
          success: false,
          message: 'Invalid file format. Please upload an Excel file (.xlsx or .xls).'
        });
        return;
      }
      
      // Read the file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer();
      
      // Call the server action to process the file
      const result = await importFromExcel(fileBuffer, userId);
      
      // Set the result
      setImportResult(result);
    } catch (error) {
      console.error('Error importing file:', error);
      setImportResult({
        success: false,
        message: 'An error occurred while processing the file. Please check the file format and try again.'
      });
    } finally {
      setIsImporting(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true);
      
      // Create a template with sample data
      const XLSX = await import('xlsx');
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Get current date for sample data
      const today = new Date();
      
      // Sample expenses data
      const expensesData = [
        {
          Title: 'Rent',
          Amount: 1200,
          Category: ExpenseCategories[0], // Housing
          Description: 'Monthly rent payment',
          'Due Date': today,
          'Paid At': today,
          'Is Recurring': 'Yes'
        },
        {
          Title: 'Groceries',
          Amount: 250,
          Category: ExpenseCategories[2], // Food
          Description: 'Weekly grocery shopping',
          'Due Date': today,
          'Paid At': '',
          'Is Recurring': 'No'
        }
      ];
      
      // Sample incomes data
      const incomesData = [
        {
          Source: 'Salary',
          Amount: 3500,
          Date: today
        },
        {
          Source: 'Freelance Work',
          Amount: 500,
          Date: today
        }
      ];
      
      // Create worksheets
      const expensesWorksheet = XLSX.utils.json_to_sheet(expensesData);
      const incomesWorksheet = XLSX.utils.json_to_sheet(incomesData);
      
      // Add data validation for Category column in expenses worksheet
      // First, we need to determine the range of cells for the Category column
      const range = XLSX.utils.decode_range(expensesWorksheet['!ref'] || 'A1:G1');
      const categoryColIndex = 2; // C column (0-indexed: A=0, B=1, C=2)
      
      // Create a dropdown validation for the Category column
      const validation = {
        type: 'list',
        formula1: '"' + ExpenseCategories.join(',') + '"',
        showDropDown: true
      };
      
      // Apply validation to all cells in the Category column
      if (!expensesWorksheet['!dataValidation']) {
        expensesWorksheet['!dataValidation'] = {};
      }
      
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: categoryColIndex });
        expensesWorksheet['!dataValidation'][cellRef] = validation;
      }
      
      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(workbook, expensesWorksheet, 'Expenses');
      XLSX.utils.book_append_sheet(workbook, incomesWorksheet, 'Incomes');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      
      // Convert the buffer to a Blob
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'money-flow-template.xlsx';
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      if (isImporting || isDownloading) return; // Prevent closing dialog while processing
      setIsDialogOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
        >
          <Upload className="h-4 w-4 mr-1" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription className="text-justify">
            Upload an Excel file with your expenses and incomes data.
            The file must have two sheets named <strong>&quot;Expenses&quot;</strong> and <strong>&quot;Incomes&quot;</strong>.
            The <strong>Category</strong> column in the <strong>&quot;Expenses&quot;</strong> sheet should use one of the predefined categories: <span className="text-accent-foreground font-bold italic">{ExpenseCategories.join(', ')}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={isImporting}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90 cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isImporting && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm font-medium">Processing file...</span>
                  </div>
                </div>
              )}
            </div>
            
            {importResult && (
              <Alert variant={importResult.success ? "default" : "destructive"} className="mt-2">
                <div className="flex items-center gap-2">
                  {importResult.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {importResult.message}
                    {importResult.success && importResult.stats && (
                      <div className="mt-1 text-xs">
                        Imported {importResult.stats.expenses} expenses and {importResult.stats.incomes} incomes.
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="secondary" 
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1"
            disabled={isImporting || isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1" />
                Download Template
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isImporting || isDownloading}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 