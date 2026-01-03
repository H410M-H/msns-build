"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, FileSpreadsheet } from "lucide-react";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";
import { type StudentCSVSchema } from "~/lib/schemas/student";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Progress } from "~/components/ui/progress";

const formSchema = z.object({
  csvFile: z.custom<File>((val) => {
    return typeof window !== 'undefined' && val instanceof File;
  }, "A CSV file is required"),
});
type FormValues = z.infer<typeof formSchema>;

interface CSVUploadDialogProps {
  onSuccess?: () => void;
}

export const CSVUploadDialog: React.FC<CSVUploadDialogProps> = ({ onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const utils = api.useUtils();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const bulkCreate = api.student.bulkCreate.useMutation({
    onSuccess: (data) => {
      toast({ 
        title: "Import Successful", 
        description: `Successfully imported ${data.count} students.` 
      });
      void utils.student.getStudents.invalidate();
      if (onSuccess) onSuccess();
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error(error);
      toast({ 
        title: "Import Failed", 
        description: error.message || "Failed to import students.", 
        variant: "destructive" 
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const splitCSVLine = (line: string) => {
    const values: string[] = [];
    let current = '';
    let inQuote = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim().replace(/^"|"$/g, ''));
    return values;
  };

  const parseCSV = (text: string): StudentCSVSchema[] => {
    const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
    
    if (lines.length < 1) return [];

    // Helper to normalize strings for comparison (remove spaces, special chars, lowercase)
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Identify the header row
    let headerRowIndex = -1;
    let headers: string[] = [];

    // We scan the first few lines to find a row that looks like a header
   for (let i = 0; i < Math.min(lines.length, 20); i++) {
        const line = lines[i]; // Access the line safely
        if (!line) continue;   // Skip if undefined to satisfy TypeScript

        const potentialHeaders = splitCSVLine(line);
        const normalizedHeaders = potentialHeaders.map(normalize);
        
        // Check for presence of key columns
        const hasStudentName = normalizedHeaders.some(h => h.includes('studentname') || h.includes('nameofstudent'));
        const hasFatherName = normalizedHeaders.some(h => h.includes('father'));
        const hasAdmission = normalizedHeaders.some(h => h.includes('admission'));

        if ((hasStudentName && hasFatherName) || (hasStudentName && hasAdmission)) {
            headerRowIndex = i;
            headers = potentialHeaders.map(h => h.toLowerCase().trim().replace(/^"|"$/g, ''));
            break;
        }
    }
    // --- FIX ENDS HERE ---

    if (headerRowIndex === -1) {
        console.error("Could not find a valid header row.");
        return [];
    }
    
    const mapHeader = (h: string): keyof StudentCSVSchema | null => {
      const normalizedH = normalize(h);

      if (normalizedH.includes('studentname') || normalizedH.includes('nameofstudent')) return 'studentName';
      if (normalizedH === 'fathersname' || normalizedH === 'fathername') return 'fatherName';
      if (normalizedH === 'dateofbirth' || normalizedH === 'dob') return 'dateOfBirth';
      if (normalizedH.includes('dateofadmission') || normalizedH.includes('admissiondate')) return 'dateOfAdmission';
      if (normalizedH === 'address' || normalizedH === 'residence') return 'address';
      if (normalizedH.includes('contact') || normalizedH.includes('mobile')) return 'contactNumber';
      if (normalizedH.includes('occupation') || normalizedH.includes('0ccupation')) return 'fatherOccupation';
      if (normalizedH.includes('caste') || normalizedH.includes('tribe')) return 'caste';
      if (normalizedH.includes('reg') || normalizedH === 'registrationnumber') return 'registrationNumber';
      
      return null;
    };

    const schemaKeys = headers.map(mapHeader);
    const result: StudentCSVSchema[] = [];

    // Start iterating from the line AFTER the header
    for (const line of lines.slice(headerRowIndex + 1)) {
      if (!line) continue;

      const values = splitCSVLine(line);
      const obj: Record<string, string> = {};
      let hasData = false;

      schemaKeys.forEach((key, index) => {
        const rawVal = values[index]; // Capture value safely
        if (key && rawVal) {
          let val = rawVal.trim();
          
          if ((key === 'dateOfBirth' || key === 'dateOfAdmission')) {
             if (val.includes(',')) {
               val = val.replace(/^[A-Za-z]+,\s*/, '');
             }
          }

          if (val.length > 0) {
              obj[key] = val;
              hasData = true;
          }
        }
      });

      if (hasData && obj.studentName) {
         result.push(obj as unknown as StudentCSVSchema);
      }
    }
    return result;
  };

  const onSubmit = async (data: FormValues) => {
    setIsUploading(true);
    try {
      if (!data.csvFile || !(data.csvFile instanceof File)) {
        throw new Error("Invalid file selected.");
      }

      const text = await data.csvFile.text();
      const parsedData = parseCSV(text);

      if (parsedData.length === 0) {
        throw new Error("No valid student data found. Please check your CSV headers.");
      }

      await bulkCreate.mutateAsync(parsedData);
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to parse CSV file", 
        variant: "destructive" 
      });
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-emerald-500/20 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
          <FileSpreadsheet className="h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 bg-slate-900 border-emerald-500/20 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-emerald-400">Upload Student CSV</DialogTitle>
          <DialogDescription className="text-slate-400">
            Upload a CSV file.<br/>
            Supports standard and 2025-2026 admission list formats.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="csvFile"
              render={({ field: { value: _value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Select File</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept=".csv"
                      className="bg-slate-950 border-emerald-500/30 text-slate-200 file:text-emerald-400 file:hover:text-emerald-300"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) onChange(file);
                      }}
                    />
                  </FormControl>
                  <FormDescription className="text-slate-500">
                    Max 5MB. Standard CSV format.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isUploading && (
              <div className="space-y-2">
                <Progress value={undefined} className="h-1 bg-slate-800 w-full" >
                    <div className="h-full bg-emerald-500 animate-indeterminate" />
                </Progress>
                <p className="text-xs text-center text-emerald-500 animate-pulse">Processing...</p>
              </div>
            )}
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isUploading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white w-full sm:w-auto"
              >
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Start Import
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};