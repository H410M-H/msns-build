"use client";
import { PageHeader } from "@/components/blocks/nav/PageHeader";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import React from "react";

const Page = () => {
  return (
    <div className="h-full w-full">
      <PageHeader
        title="Grades"
        description="View your grades and performance."
      >
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </PageHeader>
    </div>
  );
};

export default Page;
