'use client';

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToExcel } from "@/app/actions";
import { useState } from "react";

interface ExportButtonProps {
  userId: string;
}

export function ExportButton({ userId }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Call the server action to generate the Excel file
      const excelBuffer = await exportToExcel(userId);
      
      if (!excelBuffer) {
        throw new Error('Failed to generate Excel file');
      }
      
      // Convert the buffer to a Blob
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `money-flow-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-1"
    >
      <Download className="h-4 w-4 mr-1" />
      {isExporting ? 'Collecting data...' : 'Download Excel'}
    </Button>
  );
} 