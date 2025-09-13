"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import dayjs from "dayjs";
import { useAttendance } from "~/hooks/use-attendance";
import { Fingerprint, Loader2 } from "lucide-react";
import axios from "axios";
import { api } from "~/trpc/react";

export const AttendanceModal = () => {
  const date = dayjs();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const { isOpen, employee, setClear, setOpen } = useAttendance();
  const utils = api.useUtils();
  const [attendanceType, setAttendanceType] = useState<"first" | "second">(
    "first",
  );
  const savedFinger = api.finger.getFinger.useQuery(
    {
      employeeId: employee.employeeId,
    },
    { enabled: !!employee.employeeId },
  );

  const addAttendance = api.attendance.addEmployeeAttendance.useMutation({
    onMutate: async () => {
      setLoading(true);
      await utils.attendance.getAllEmployeeAttendance.refetch();
      setOpen(false);
    },
    onSuccess: () => {
      setLoading(false);
      setStatus("Attendance Saved.");
    },
    onError: () => {
      setLoading(false);
      setStatus("Attendance not Saved.");
    },
  });

  const captureFingerprint = async () => {
    try {
      setLoading(true);

      const response = await axios.post<FingerPrintResponseProps>(
        `https://localhost:8443/SGIFPCapture`,
        "Timeout=10000&Quality=50&licstr=&templateFormat=ISO&imageWSQRate=0.75",
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );

      if (!response.data) {
        setStatus("Error in scaning finger");
        return;
      }

      if (response.data.ErrorCode === 0) {
        const payloadStringMatch = `template1=${savedFinger.data?.thumb}&template2=${response.data.ISOTemplateBase64}&licstr=&templateFormat=ISO`;
        const matchResponse = await axios.post<{
          ErrorCode: number;
          MatchingScore: number;
        }>(`https://localhost:8443/SGIMatchScore`, payloadStringMatch, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        if (!matchResponse.data) {
          setStatus("Error in matching finger");
          return;
        }

        if (matchResponse.data.ErrorCode === 106) {
          setStatus("Not Matched successful!");
        } else {
          setStatus("Successfully saved attendance");
        }
      } else {
        throw new Error(`Scanner error code: ${response.data.ErrorCode}`);
      }
    } catch (error) {
      console.error("Fingerprint capture error:", error);
      setStatus("Error in saving attendance");
    } finally {
      setLoading(false);
    }
  };

  const saveAttendance = async () => {
    addAttendance.mutate({
      employeeId: employee.employeeId,
      timeSlot: attendanceType,
    });
  };

  const handleClose = useCallback(() => {
    setOpen(false);
    setClear();
  }, [setClear]);

  useEffect(() => {
    if (date) {
      const currentHour = dayjs().hour();
      if (currentHour >= 7 && currentHour < 12) {
        setAttendanceType("first");
      } else if (currentHour >= 12 && currentHour < 14) {
        setAttendanceType("second");
      } else {
        setAttendanceType("first");
      }
    }
    return () => {
      setStatus("");
    };
  }, [date]);

  const formattedDate = dayjs(date).format("MMMM D, YYYY");
  const dayOfWeek = dayjs(date).format("dddd");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Mark Attendance</DialogTitle>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {employee?.employeeName}
              </Badge>
              <Badge
                variant={attendanceType === "first" ? "default" : "secondary"}
              >
                {attendanceType === "first"
                  ? "Morning Attendance"
                  : "Afternoon Attendance"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {dayOfWeek}, {formattedDate}
            </p>
            {status ? (
              <p className="text-sm text-muted-foreground">{status}</p>
            ) : null}
            <div className="flex justify-center rounded-full bg-gray-50 p-8 transition-all duration-500">
              {isLoading ? (
                <Loader2 className="h-20 w-20 animate-spin text-blue-500" />
              ) : (
                <Fingerprint className="h-20 w-20 text-emerald-500 transition-all duration-500" />
              )}
            </div>
          </div>
        </DialogHeader>

        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={saveAttendance}>Save</Button>
      </DialogContent>
    </Dialog>
  );
};
