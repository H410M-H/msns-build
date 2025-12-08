"use client";

import { api } from "~/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { FeeDeletionDialog } from "../forms/fee/FeeDeletion";
import { FeeCreationDialog } from "../forms/fee/FeeCreation";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

export function FeeStructureTable() {
  const utils = api.useUtils();
  const feeQuery = api.fee.getAllFees.useQuery();
  const [selectedFees, setSelectedFees] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedFees(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleRefetch = async () => {
    await utils.fee.invalidate();
    setSelectedFees([]);
  };

  if (feeQuery.isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  const fees = feeQuery.data ?? [];

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fee Structures</CardTitle>
        <div className="flex gap-2">
          {selectedFees.length > 0 && (
            <FeeDeletionDialog feeIds={selectedFees} onDeleteSuccess={handleRefetch}>
              Delete Selected
            </FeeDeletionDialog>
          )}
          <FeeCreationDialog>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Fee
            </Button>
          </FeeCreationDialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Tuition</TableHead>
              <TableHead className="text-right">Admission</TableHead>
              <TableHead className="text-right">Annual Funds</TableHead>
              <TableHead className="text-right">Total Monthly</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.map((fee) => (
              <TableRow key={fee.feeId}>
                <TableCell>
                  <Checkbox 
                    checked={selectedFees.includes(fee.feeId)}
                    onCheckedChange={() => toggleSelect(fee.feeId)}
                  />
                </TableCell>
                <TableCell className="font-medium">{fee.level}</TableCell>
                <TableCell>
                  <Badge variant="outline">{fee.type}</Badge>
                </TableCell>
                <TableCell className="text-right">Rs. {fee.tuitionFee.toLocaleString()}</TableCell>
                <TableCell className="text-right">Rs. {fee.admissionFee.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col text-xs text-muted-foreground">
                    <span>Exam: {fee.examFund}</span>
                    <span>Lab: {fee.computerLabFund ?? 0}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-green-600">
                   Rs. {fee.tuitionFee + fee.infoAndCallsFee + fee.studentIdCardFee}
                </TableCell>
              </TableRow>
            ))}
            {fees.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No fee structures defined. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}