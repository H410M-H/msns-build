"use client";

import { ReloadIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  grade: z.string({ required_error: "Field is required" }),
  section: z.enum(["ROSE", "TULIP"], {
    required_error: "Section is required",
  }),
  category: z.enum(["Montessori", "Primary", "Middle", "SSC_I", "SSC_II"], {
    required_error: "Category is required",
  }),
  fee: z.number().min(0, "Fee must be a positive number"),
});

export const ClassCreationDialog = () => {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fee: 2800,
    },
  });

  const createClass = api.class.createClass.useMutation({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

  const formSubmitted = (values: z.infer<typeof formSchema>) => {
    createClass.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="h-11 px-4 rounded-xl gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          Create Class
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create class</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(formSubmitted)}
            className="flex flex-col gap-4 p-4"
          >
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Montessori">MONTESSORI (Nursery and Prep)</SelectItem>
                      <SelectItem value="Primary">PRIMARY (One to Five)</SelectItem>
                      <SelectItem value="Middle">MIDDLE (Six and Seven)</SelectItem>
                      <SelectItem value="SSC_I">SSC-I</SelectItem>
                      <SelectItem value="SSC_II">SSC-II</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Grade</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Write Class/Grade"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a section" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ROSE">ROSE</SelectItem>
                      <SelectItem value="TULIP">TULIP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter fee amount"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={createClass.isPending}
              className="w-full"
            >
              {createClass.isPending ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Create class"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
