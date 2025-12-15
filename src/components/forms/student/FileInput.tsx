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

// FIX: We explicitly cast the schema to z.ZodType<File>
// This tells TypeScript "This is a File" while keeping the runtime check safe for the server.
const formSchema = z.object({
  csvFile: (typeof window === 'undefined' 
    ? z.any() 
    : z.instanceof(File, { message: "A CSV file is required" })) as z.ZodType<File>
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
    
    if (lines.length < 2) return [];

    const headerLine = lines[0];
    if (!headerLine) return [];

    const headers = splitCSVLine(headerLine).map(h => h.toLowerCase().trim().replace(/^"|"$/g, ''));
    
    const mapHeader = (h: string): keyof StudentCSVSchema | null => {
      if (h === 'student name') return 'studentName';
      if (h === "father's name" || h === "father name") return 'fatherName';
      if (h === 'date of birth' || h === 'dob') return 'dateOfBirth';
      if (h === 'date of admission' || h === 'admission date') return 'dateOfAdmission';
      if (h === 'address') return 'address';
      if (h === 'contact numbers' || h === 'contact number' || h === 'mobile') return 'contactNumber';
      if (h === 'father occupation' || h === 'occupation') return 'fatherOccupation';
      if (h === 'caste') return 'caste';
      if (h.includes('reg') || h === 'registration number') return 'registrationNumber';
      return null;
    };

    const schemaKeys = headers.map(mapHeader);
    const result: StudentCSVSchema[] = [];

    for (const line of lines.slice(1)) {
      if (!line) continue;

      const values = splitCSVLine(line);
      const obj: Record<string, string> = {};
      let hasData = false;

      schemaKeys.forEach((key, index) => {
        if (key && values[index]) {
          let val = values[index].trim();
          if ((key === 'dateOfBirth' || key === 'dateOfAdmission') && val.includes(',')) {
             val = val.replace(/^[A-Za-z]+,\s*/, '');
          }
          obj[key] = val;
          hasData = true;
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
      // Valid type check to prevent runtime errors and satisfy strict linting
      if (!data.csvFile || !(data.csvFile instanceof File)) {
        throw new Error("Invalid file selected.");
      }

      // Now safe to call .text() because data.csvFile is strictly typed as File
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
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-emerald-500/20 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-emerald-400">Upload Student CSV</DialogTitle>
          <DialogDescription className="text-slate-400">
            Upload a CSV file.<br/>
            Expected Headers: <b>Student Name, Father&apos;s Name, Date of Admission</b>, etc.
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