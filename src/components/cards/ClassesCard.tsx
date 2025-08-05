"use client";

import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "~/components/ui/card";
import Link from "next/link";
import { api } from "~/trpc/react";

type ClassProps = {
  classId: string;
  grade: string;
  section?: string; // Updated to optional
  category: string;
  fee: number;
};

export const ClassesCard = () => {
  const { data: classes, isLoading, isError } = api.class.getClasses.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !classes) {
    return <div>Error loading classes...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {classes.map((classItem: ClassProps) => (
        <Card
          key={classItem.classId}
          className="shadow-lg transition-shadow hover:shadow-xl"
        >
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{classItem.grade}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Section: {classItem.section ?? "Not Available"}</p> {/* Fallback value */}
            <p>Category: {classItem.category}</p>
            <p>Fee: ${classItem.fee.toFixed(2)}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600">
              <Link href={`/admin/academics/classwiseDetail/${classItem.classId}`}>Manage</Link>
            </Button>
            <Button
              variant="outline"
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <Link href={`/admin/academics/classwiseDetail/${classItem.category}`}>Enroll Students</Link>
              </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
