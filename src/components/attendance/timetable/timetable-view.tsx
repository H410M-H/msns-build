"use client";

import { useState } from "react";
import { Clock, User, Edit, Trash2, Plus } from "lucide-react";
import { api } from "~/trpc/react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import React from "react";

export interface TimetableEntry {
  timetableId: string;
  dayOfWeek: string;
  lectureNumber: number;
  startTime: string;
  endTime: string;
  Subject: { subjectId: string; subjectName: string };
  Employees: { employeeId: string; employeeName: string; designation: string };
  Grades: { classId: string; grade: string; section: string };
  Sessions: { sessionId: string; sessionName: string };
}

export interface TimetableViewProps {
  timetable: Record<string, TimetableEntry[]>;
  defaultTimeSlots: Array<{
    lectureNumber: number;
    startTime: string;
    endTime: string;
  }>;
  onEdit?: (entry: TimetableEntry) => void;
  onDelete?: (timetableId: string) => void;
  onAdd?: (day: string, lectureNumber: number) => void;
  onSelect?: (entry: TimetableEntry) => void;
  editable?: boolean;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const LECTURE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Color palette for days
const DAY_COLORS = [
  "bg-blue-50 hover:bg-blue-100 border-blue-200",
  "bg-green-50 hover:bg-green-100 border-green-200",
  "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
  "bg-purple-50 hover:bg-purple-100 border-purple-200",
  "bg-pink-50 hover:bg-pink-100 border-pink-200",
  "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
];

export function TimetableView({
  timetable,
  defaultTimeSlots,
  onEdit,
  onDelete,
  onAdd,
  onSelect,
  editable = false,
}: TimetableViewProps) {
  const { data: teachers } =
    api.employee.getAllEmployeesForTimeTable.useQuery();
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const getTimeSlot = (lectureNumber: number) => {
    return defaultTimeSlots.find(
      (slot) => slot.lectureNumber === lectureNumber,
    );
  };

  const getEntryForSlot = (day: string, lectureNumber: number) => {
    return timetable[day]?.find(
      (entry) => entry.lectureNumber === lectureNumber,
    );
  };

  const isAfterBreak = (lectureNumber: number) => {
    return lectureNumber >= 8;
  };

  const handleSelectEntry = (entry: TimetableEntry) => {
    const newSelected =
      selectedEntry === entry.timetableId ? null : entry.timetableId;
    setSelectedEntry(newSelected);
    onSelect?.(entry);
  };

  return (
    <div className="w-full space-y-4 overflow-x-auto md:space-y-6">
      <Card className="min-w-[900px] border-primary/20 shadow-lg md:min-w-[1200px]">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2 text-lg text-primary md:text-xl">
            <Clock className="h-5 w-5" />
            Weekly Timetable
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
            <div className="order-last lg:order-first lg:col-span-2">
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 py-3">
                  <CardTitle className="flex items-center gap-2 text-base text-primary">
                    <User className="h-4 w-4" />
                    Teachers List
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ScrollArea className="h-[400px] pr-4 md:h-[800px]">
                    <div className="space-y-3">
                      {teachers?.map((teacher) => (
                        <Tooltip key={teacher.employeeId}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "rounded-lg border p-3 shadow-sm transition-all duration-200",
                                "flex items-start gap-2 hover:bg-accent/50",
                              )}
                            >
                              <User className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {teacher.employeeName}
                                </p>
                                <Badge
                                  variant="secondary"
                                  className="mt-1 text-xs"
                                >
                                  {teacher.designation}
                                </Badge>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {teacher.employeeName} - {teacher.designation}
                          </TooltipContent>
                        </Tooltip>
                      )) ?? (
                        <div className="py-4 text-center text-muted-foreground">
                          Loading teachers...
                        </div>
                      )}
                    </div>
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-10">
              <div className="grid grid-cols-7 gap-2 md:gap-3">
                <div className="rounded-lg bg-primary p-3 text-center font-semibold text-primary-foreground shadow">
                  Time / Day
                </div>
                {DAYS_OF_WEEK.map((day, index) => (
                  <div
                    key={day}
                    className={cn(
                      "rounded-lg p-3 text-center font-semibold text-foreground shadow",
                      DAY_COLORS[index % DAY_COLORS.length],
                    )}
                  >
                    {day}
                  </div>
                ))}

                {LECTURE_NUMBERS.map((lectureNumber) => {
                  const timeSlot = getTimeSlot(lectureNumber);

                  return (
                    <React.Fragment key={lectureNumber}>
                      <div className="rounded-lg bg-muted/50 p-3 text-center shadow">
                        <div className="text-sm font-medium md:text-base">
                          Lecture {lectureNumber}
                        </div>
                        {timeSlot && (
                          <div className="text-xs text-muted-foreground md:text-sm">
                            {timeSlot.startTime} - {timeSlot.endTime}
                          </div>
                        )}
                        {isAfterBreak(lectureNumber) && (
                          <Badge
                            variant="outline"
                            className="mt-1 border-yellow-500 text-xs text-yellow-700"
                          >
                            After Break
                          </Badge>
                        )}
                      </div>

                      {DAYS_OF_WEEK.map((day, dayIndex) => {
                        const entry = getEntryForSlot(day, lectureNumber);

                        return (
                          <Tooltip key={`${day}-${lectureNumber}`}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "group relative min-h-[80px] cursor-pointer rounded-lg border p-3 shadow transition-all duration-200 md:min-h-[100px]",
                                  entry
                                    ? cn(
                                        DAY_COLORS[
                                          dayIndex % DAY_COLORS.length
                                        ],
                                        "hover:shadow-md",
                                      )
                                    : "border-dashed bg-background hover:bg-muted/30",
                                  selectedEntry === entry?.timetableId &&
                                    "scale-105 ring-2 ring-primary",
                                )}
                                onClick={() =>
                                  entry && handleSelectEntry(entry)
                                }
                              >
                                {entry ? (
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium">
                                      {entry.Subject.subjectName}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <User className="h-3 w-3" />
                                      {entry.Employees.employeeName}
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {entry.Employees.designation}
                                    </Badge>

                                    {editable && (
                                      <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit?.(entry);
                                          }}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete?.(entry.timetableId);
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  editable && (
                                    <div className="flex h-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onAdd?.(day, lectureNumber);
                                        }}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {entry
                                ? `${entry.Subject.subjectName} with ${entry.Employees.employeeName}`
                                : "Free Period - Click to add if editable"}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>

              <Card className="mt-4 border-yellow-200 bg-yellow-50 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm text-yellow-800">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Break Schedule:</span>
                    <span>
                      25-minute break after 7th lecture, 5-minute breaks between
                      other lectures
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-blue-200 bg-blue-50"></div>
                  <span>Scheduled Class</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-dashed bg-background"></div>
                  <span>Free Period</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-yellow-500 text-xs text-yellow-700"
                  >
                    After Break
                  </Badge>
                  <span>Post-break lecture</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
