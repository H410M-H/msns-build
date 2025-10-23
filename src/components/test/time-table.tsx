"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Clock, User, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { api } from "~/trpc/react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import React from "react";
import { Button } from "../ui/button";

interface TimetableEntry {
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

interface Grade {
  classId: string;
  grade: string;
  section: string;
}

interface Employee {
  employeeId: string;
  employeeName: string;
  designation: string;
  education: string;
}

interface ClassSubject {
  csId: string;
  classId: string;
  subjectId: string;
  Grades: {
    grade: string;
  };
  Subject: {
    subjectId: string;
    subjectName: string;
  };
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

const timeSlots = [
  { lectureNumber: 1, startTime: "08:00", endTime: "08:45" },
  { lectureNumber: 2, startTime: "08:50", endTime: "09:35" },
  { lectureNumber: 3, startTime: "09:40", endTime: "10:25" },
  { lectureNumber: 4, startTime: "10:30", endTime: "11:15" },
  { lectureNumber: 5, startTime: "11:20", endTime: "12:05" },
  { lectureNumber: 6, startTime: "12:10", endTime: "12:55" },
  { lectureNumber: 7, startTime: "13:00", endTime: "13:45" },
  { lectureNumber: 8, startTime: "14:10", endTime: "14:55" },
  { lectureNumber: 9, startTime: "15:00", endTime: "15:45" },
];

const getTimeSlot = (lectureNumber: number) => {
  return timeSlots.find((slot) => slot.lectureNumber === lectureNumber);
};

const isBreakTime = (lectureNumber: number) => {
  return lectureNumber >= 8;
};

const TeacherItem = React.memo(
  ({
    teacher,
    draggedTeacherId,
    setDraggedTeacherId,
  }: {
    teacher: Employee;
    draggedTeacherId: string | null;
    setDraggedTeacherId: React.Dispatch<React.SetStateAction<string | null>>;
  }) => {
    const handleDragStart = useCallback(
      (e: React.DragEvent) => {
        setDraggedTeacherId(teacher.employeeId);
        e.dataTransfer.setData("type", "TEACHER");
        e.dataTransfer.setData("data", JSON.stringify(teacher));
        e.dataTransfer.effectAllowed = "copy";
      },
      [teacher, setDraggedTeacherId],
    );

    const handleDragEnd = useCallback(() => {
      setDraggedTeacherId(null);
    }, [setDraggedTeacherId]);

    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn(
          "group relative m-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md",
          draggedTeacherId === teacher.employeeId && "opacity-50",
        )}
      >
        <p className="text-sm font-medium text-gray-800">
          {teacher.employeeName}
        </p>
        <p className="text-xs text-gray-600">{teacher.education}</p>
        <Badge variant="secondary" className="mt-1 text-xs">
          {teacher.designation}
        </Badge>
      </div>
    );
  },
);

const SubjectItem = React.memo(
  ({
    classSubject,
    draggedSubjectCsId,
    setDraggedSubjectCsId,
  }: {
    classSubject: ClassSubject;
    draggedSubjectCsId: string | null;
    setDraggedSubjectCsId: React.Dispatch<React.SetStateAction<string | null>>;
  }) => {
    const handleDragStart = useCallback(
      (e: React.DragEvent) => {
        setDraggedSubjectCsId(classSubject.csId);
        e.dataTransfer.setData("type", "SUBJECT");
        e.dataTransfer.setData(
          "data",
          JSON.stringify({
            subjectId: classSubject.Subject.subjectId,
            subjectName: classSubject.Subject.subjectName,
            classId: classSubject.classId,
          }),
        );
        e.dataTransfer.effectAllowed = "copy";
      },
      [classSubject, setDraggedSubjectCsId],
    );

    const handleDragEnd = useCallback(() => {
      setDraggedSubjectCsId(null);
    }, [setDraggedSubjectCsId]);

    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn(
          "group relative m-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md",
          draggedSubjectCsId === classSubject.csId && "opacity-50",
        )}
      >
        <p className="text-xs font-medium text-gray-800">
          Class: {classSubject.Grades.grade}
        </p>
        <p className="text-xs font-medium text-gray-800">
          Subject: {classSubject.Subject.subjectName}
        </p>
      </div>
    );
  },
);

interface SlotProps {
  day: string;
  lectureNumber: number;
  classId: string;
  grade: Grade;
  classSubjects: ClassSubject[];
  timetable: Record<string, TimetableEntry[]>;
  setTimetable: React.Dispatch<
    React.SetStateAction<Record<string, TimetableEntry[]>>
  >;
  getEntryForSlot: (
    day: string,
    lectureNumber: number,
    classId: string,
  ) => TimetableEntry | undefined;
  draggedSlot: { day: string; lectureNumber: number; classId: string } | null;
  setDraggedSlot: React.Dispatch<
    React.SetStateAction<{
      day: string;
      lectureNumber: number;
      classId: string;
    } | null>
  >;
}

interface DragTeacher {
  employeeId: string;
  employeeName: string;
  designation: string;
  education: string;
}

interface DragSubject {
  subjectId: string;
  subjectName: string;
  classId: string;
}

interface DragEntry {
  day: string;
  lectureNumber: number;
  classId: string;
  entry: TimetableEntry;
}

const Slot = React.memo(
  ({
    day,
    lectureNumber,
    classId,
    grade,
    classSubjects,
    timetable,
    setTimetable,
    getEntryForSlot,
    draggedSlot,
    setDraggedSlot,
  }: SlotProps) => {
    const [isOver, setIsOver] = useState(false);
    const entry = getEntryForSlot(day, lectureNumber, classId);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsOver(true);
    }, []);

    const handleDragLeave = useCallback((_e: React.DragEvent) => {
      setIsOver(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
    }, []);

    const isTeacherAssignedElsewhere = useCallback((
      targetDay: string,
      targetLecture: number,
      employeeId: string,
      excludeClassId?: string,
    ) => {
      const dayEntries = timetable[targetDay] ?? [];
      return dayEntries.some(
        (e) =>
          e.lectureNumber === targetLecture &&
          e.Employees.employeeId === employeeId &&
          e.Grades.classId !== excludeClassId,
      );
    }, [timetable]);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        setIsOver(false);
        const type = e.dataTransfer.getData("type");
        const dataStr = e.dataTransfer.getData("data");
        if (!type || !dataStr) return;

        let data: DragTeacher | DragSubject | DragEntry;
        try {
          data = JSON.parse(dataStr) as DragTeacher | DragSubject | DragEntry;
        } catch {
          return;
        }

        setTimetable((prev) => {
          const dayEntries = prev[day] ?? [];
          const existing = dayEntries.find(
            (e) =>
              e.lectureNumber === lectureNumber && e.Grades.classId === classId,
          );
          const newEntry: TimetableEntry = existing
            ? { ...existing }
            : {
                timetableId: Math.random().toString(36).substring(2, 9),
                dayOfWeek: day,
                lectureNumber,
                startTime: getTimeSlot(lectureNumber)?.startTime ?? "--:--",
                endTime: getTimeSlot(lectureNumber)?.endTime ?? "--:--",
                Subject: { subjectId: "", subjectName: "" },
                Employees: {
                  employeeId: "",
                  employeeName: "",
                  designation: "",
                },
                Grades: grade,
                Sessions: { sessionId: "default", sessionName: "Default" },
              };

          if (type === "TEACHER") {
            const teacherData = data as DragTeacher;
            if (
              isTeacherAssignedElsewhere(
                day,
                lectureNumber,
                teacherData.employeeId,
                classId,
              )
            ) {
              return prev;
            }
            newEntry.Employees = {
              employeeId: teacherData.employeeId,
              employeeName: teacherData.employeeName,
              designation: teacherData.designation,
            };
          } else if (type === "SUBJECT") {
            const subjectData = data as DragSubject;
            if (subjectData.classId !== classId) return prev;
            newEntry.Subject = {
              subjectId: subjectData.subjectId,
              subjectName: subjectData.subjectName,
            };
          } else if (type === "ENTRY") {
            const entryData = data as DragEntry;
            const fromDay = entryData.day;
            const fromLecture = entryData.lectureNumber;
            const fromClassId = entryData.classId;
            const movedEntry: TimetableEntry = entryData.entry;
            if (
              fromDay === day &&
              fromLecture === lectureNumber &&
              fromClassId === classId
            )
              return prev;

            const subjectId = movedEntry.Subject.subjectId;
            if (
              subjectId &&
              !classSubjects.some(
                (cs) =>
                  cs.classId === classId &&
                  cs.Subject.subjectId === subjectId,
              )
            )
              return prev;

            if (
              movedEntry.Employees.employeeId &&
              isTeacherAssignedElsewhere(
                day,
                lectureNumber,
                movedEntry.Employees.employeeId,
                classId,
              )
            ) {
              return prev;
            }

            const fromDayEntries = prev[fromDay] ?? [];
            const updatedFrom = fromDayEntries.filter(
              (e) => e.timetableId !== movedEntry.timetableId,
            );

            const newEntryTo = {
              ...movedEntry,
              dayOfWeek: day,
              lectureNumber,
              startTime: getTimeSlot(lectureNumber)?.startTime ?? "--:--",
              endTime: getTimeSlot(lectureNumber)?.endTime ?? "--:--",
              Grades: grade,
            };

            let updatedTo = dayEntries;
            if (existing) {
              if (
                existing.Employees.employeeId &&
                isTeacherAssignedElsewhere(
                  fromDay,
                  fromLecture,
                  existing.Employees.employeeId,
                  fromClassId,
                )
              ) {
                return prev;
              }

              const newEntryFrom = {
                ...existing,
                dayOfWeek: fromDay,
                lectureNumber: fromLecture,
                startTime: getTimeSlot(fromLecture)?.startTime ?? "--:--",
                endTime: getTimeSlot(fromLecture)?.endTime ?? "--:--",
                Grades: movedEntry.Grades,
              };
              updatedTo = updatedTo.map((e) =>
                e.timetableId === existing.timetableId ? newEntryTo : e,
              );
              updatedFrom.push(newEntryFrom);
            } else {
              updatedTo = [...updatedTo, newEntryTo];
            }

            return { ...prev, [fromDay]: updatedFrom, [day]: updatedTo };
          } else {
            return prev;
          }

          let updatedDayEntries;
          if (existing) {
            updatedDayEntries = dayEntries.map((e) =>
              e.timetableId === newEntry.timetableId ? newEntry : e,
            );
          } else {
            updatedDayEntries = [...dayEntries, newEntry];
          }

          return { ...prev, [day]: updatedDayEntries };
        });
      },
      [
        day,
        lectureNumber,
        classId,
        grade,
        classSubjects,
        setTimetable,
        isTeacherAssignedElsewhere,
      ],
    );

    const handleDragStart = useCallback(
      (e: React.DragEvent) => {
        if (!entry) return;
        setDraggedSlot({ day, lectureNumber, classId });
        e.dataTransfer.setData("type", "ENTRY");
        e.dataTransfer.setData(
          "data",
          JSON.stringify({ day, lectureNumber, classId, entry }),
        );
        e.dataTransfer.effectAllowed = "move";
      },
      [day, lectureNumber, classId, entry, setDraggedSlot],
    );

    const handleDragEnd = useCallback(() => {
      setDraggedSlot(null);
    }, [setDraggedSlot]);

    const handleRemove = useCallback(() => {
      if (!entry) return;
      setTimetable((prev) => {
        const dayEntries = prev[day] ?? [];
        const updated = dayEntries.filter(
          (e) => e.timetableId !== entry.timetableId,
        );
        return { ...prev, [day]: updated };
      });
    }, [day, entry, setTimetable]);

    return (
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "group relative min-h-[120px] rounded-lg border p-3 shadow-sm transition-shadow",
          entry
            ? "bg-white hover:shadow-md"
            : "bg-gray-50 hover:bg-gray-100",
          isOver && "bg-blue-100",
          draggedSlot?.day === day &&
            draggedSlot.lectureNumber === lectureNumber &&
            draggedSlot.classId === classId &&
            "opacity-50",
        )}
      >
        {entry ? (
          <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="space-y-1"
          >
            <div className="text-sm font-medium text-gray-800">
              {entry.Subject.subjectName || "No Subject"}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <User className="h-3 w-3" />
              {entry.Employees.employeeName || "No Teacher"}
            </div>
            <Badge variant="outline" className="text-xs">
              {entry.Employees.designation || ""}
            </Badge>
            <Button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity duration-200 hover:bg-red-600 group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Free Period
          </div>
        )}
      </div>
    );
  },
);

Slot.displayName = "Slot";
TeacherItem.displayName = "TeacherItem";
SubjectItem.displayName = "SubjectItem";

export const TimetableView = () => {
  // Use proper TypeScript inference without unsafe assertions
  const teachersQuery = api.employee.getAllEmployeesForTimeTable.useSuspenseQuery();
  const classSubjectsQuery = api.subject.getAllSubjectsForTimeTable.useSuspenseQuery();
  const classesQuery = api.class.getClasses.useSuspenseQuery();

  const [timetable, setTimetable] = useState<Record<string, TimetableEntry[]>>(
    {},
  );
  const [draggedTeacherId, setDraggedTeacherId] = useState<string | null>(null);
  const [draggedSubjectCsId, setDraggedSubjectCsId] = useState<string | null>(
    null,
  );
  const [draggedSlot, setDraggedSlot] = useState<{
    day: string;
    lectureNumber: number;
    classId: string;
  } | null>(null);

  // Extract data from queries - TypeScript will infer the types properly
  const teachers = teachersQuery[0] as Employee[];
  const classSubjects = classSubjectsQuery[0] as ClassSubject[];
  const classes = classesQuery[0] as Grade[];

  const getEntryForSlot = useCallback(
    (day: string, lectureNumber: number, classId: string) => {
      return timetable[day]?.find(
        (entry) =>
          entry.lectureNumber === lectureNumber &&
          entry.Grades.classId === classId,
      );
    },
    [timetable],
  );

  return (
    <div className="w-full overflow-x-auto">
      <Card className="min-w-[1200px] shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-indigo-800">
            <Clock className="h-5 w-5" />
            Weekly Timetable
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-12 gap-4 p-6">
          <div className="col-span-1 space-y-3">
            <p className="rounded-lg bg-indigo-100 p-3 text-center font-semibold text-indigo-800">
              Teachers
            </p>
            <ScrollArea className="h-[calc(100vh)] rounded-lg border border-indigo-200 bg-white">
              {teachers.map((teacher) => (
                <TeacherItem
                  key={teacher.employeeId}
                  teacher={teacher}
                  draggedTeacherId={draggedTeacherId}
                  setDraggedTeacherId={setDraggedTeacherId}
                />
              ))}
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
          <div className="col-span-10">
            <Tabs defaultValue="Monday">
              <TabsList className="mb-4">
                {DAYS_OF_WEEK.map((day) => (
                  <TabsTrigger key={day} value={day}>
                    {day}
                  </TabsTrigger>
                ))}
              </TabsList>
              {DAYS_OF_WEEK.map((day) => (
                <TabsContent key={day} value={day}>
                  <div className="grid grid-cols-10 gap-2">
                    {/* Header Row */}
                    <div className="rounded-lg bg-indigo-100 p-3 text-center font-semibold text-indigo-800">
                      Class
                    </div>
                    {LECTURE_NUMBERS.map((lectureNumber) => {
                      const timeSlot = getTimeSlot(lectureNumber);
                      return (
                        <div
                          key={lectureNumber}
                          className="rounded-lg bg-indigo-100 p-3 text-center font-semibold text-indigo-800"
                        >
                          Lecture {lectureNumber}
                          {timeSlot && (
                            <div className="text-sm text-indigo-600">
                              {timeSlot.startTime} - {timeSlot.endTime}
                            </div>
                          )}
                          {isBreakTime(lectureNumber) && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              After Break
                            </Badge>
                          )}
                        </div>
                      );
                    })}

                    {/* Class Rows */}
                    {classes.map((cls) => (
                      <div key={cls.classId} className="contents">
                        <p className="rounded-lg bg-indigo-50 p-3 text-center text-xs font-medium text-indigo-800">
                          {cls.grade} - {cls.section}
                        </p>
                        {LECTURE_NUMBERS.map((lectureNumber) => (
                          <Slot
                            key={lectureNumber}
                            day={day.toLowerCase()}
                            lectureNumber={lectureNumber}
                            classId={cls.classId}
                            grade={cls}
                            classSubjects={classSubjects}
                            timetable={timetable}
                            setTimetable={setTimetable}
                            getEntryForSlot={getEntryForSlot}
                            draggedSlot={draggedSlot}
                            setDraggedSlot={setDraggedSlot}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Break Indicator */}
            <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-yellow-800">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Break Schedule:</span>
                <span className="text-sm">
                  25-minute break after 7th lecture, 5-minute breaks between
                  other lectures
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border bg-white shadow-sm"></div>
                <span>Scheduled Class</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border bg-gray-50"></div>
                <span>Free Period</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  After Break
                </Badge>
                <span>Post-break lecture</span>
              </div>
            </div>
          </div>
          <div className="col-span-1 space-y-3">
            <p className="rounded-lg bg-indigo-100 p-3 text-center font-semibold text-indigo-800">
              Subjects
            </p>
            <ScrollArea className="h-[calc(100vh)] rounded-lg border border-indigo-200 bg-white">
              {classSubjects.map((classSubject) => (
                <SubjectItem
                  key={classSubject.csId}
                  classSubject={classSubject}
                  draggedSubjectCsId={draggedSubjectCsId}
                  setDraggedSubjectCsId={setDraggedSubjectCsId}
                />
              ))}
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};