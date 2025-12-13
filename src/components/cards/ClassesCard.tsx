"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge"; 
import { Skeleton } from "~/components/ui/skeleton"; 
import { 
  BookOpen, 
  Settings, 
  UserPlus, 
  Banknote 
} from "lucide-react";

type ClassProps = {
  classId: string;
  grade: string;
  section?: string;
  category: string;
  fee: number;
};

// Helper for consistent currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const ClassesCard = () => {
  const { data: classes, isLoading, isError } = api.class.getClasses.useQuery();

  if (isLoading) {
    return <ClassesGridSkeleton />;
  }

  if (isError || !classes) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed p-8 text-muted-foreground">
        <p>Failed to load classes. Please try again later.</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="flex h-40 w-full flex-col items-center justify-center space-y-3 rounded-lg border border-dashed bg-muted/50 p-8 text-center">
        <BookOpen className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-muted-foreground">No classes found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {classes.map((classItem: ClassProps) => (
        <Card
          key={classItem.classId}
          className="group relative flex flex-col justify-between overflow-hidden transition-all hover:shadow-lg hover:border-primary/50"
        >
          <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-70 group-hover:opacity-100" />
          
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                  {classItem.grade}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Section: <span className="font-medium text-foreground">{classItem.section ?? "N/A"}</span>
                </p>
              </div>
              <Badge variant="secondary" className="uppercase tracking-wider">
                {classItem.category}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pb-4">
            <div className="mt-2 flex items-center gap-2 rounded-md bg-muted/50 p-3">
              <Banknote className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Monthly Fee</p>
                <p className="font-bold text-foreground">{formatCurrency(classItem.fee)}</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="grid grid-cols-2 gap-3 pt-0">
            {/* Using asChild to properly nest Link inside Button */}
            <Button variant="outline" className="w-full gap-2 group-hover:bg-accent" asChild>
              <Link href={`/admin/academics/classwiseDetail/${classItem.classId}`}>
                <Settings className="h-4 w-4" />
                Manage
              </Link>
            </Button>
            
            <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700" asChild>
              <Link href={`/admin/academics/classwiseDetail/${classItem.category}`}>
                <UserPlus className="h-4 w-4" />
                Enroll
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------
// Sub-component: Skeleton Loader for better UX during loading states
// ------------------------------------------------------------------
const ClassesGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <Skeleton className="h-16 w-full rounded-md" />
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
