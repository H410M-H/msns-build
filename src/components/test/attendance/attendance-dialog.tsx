"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { toast } from "sonner";

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
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await utils.attendance.getAllEmployeeAttendance.refetch();
      setOpen(false);
      setLoading(false);
      setClear();
      setStatus("Attendance Saved.");
      toast.success("Attendance saved.");
    },
    onError: () => {
      setLoading(false);
      setStatus("Attendance not Saved.");
      toast.error("Attendance error.");
    },
  });

  const captureFingerprint = async () => {
    try {
      setLoading(true);
      console.log(savedFinger.data?.thumb);
      const response = await axios.post<FingerPrintResponseProps>(
        "https://localhost:8443/SGIFPCapture",
        "Timeout=10000&Quality=60&licstr=&templateFormat=ISO",
        {
          headers: {
            "Content-Type": "text/plain;charset=UTF-8",
          },
        },
      );

      if (!response.data) {
        setStatus("Error in scaning finger");
        return;
      }

      if (response.data.ErrorCode === 0) {
        const payloadStringMatch = `template2=${response.data.ISOTemplateBase64}&template1=${savedFinger.data?.thumb}&licstr=&templateFormat=ISO`;
        const matchResponse = await axios.post<{
          ErrorCode: number;
          MatchingScore: number;
        }>(`https://localhost:8443/SGIMatchScore`, payloadStringMatch, {
          headers: {
            "Content-Type": "text/plain;charset=UTF-8",
          },
        });

        if (!matchResponse.data) {
          setStatus("Error in matching finger");
          return;
        }

        console.log(JSON.stringify(matchResponse.data, null, 2));
        if (matchResponse.data.ErrorCode === 0) {
          if (matchResponse.data.MatchingScore > 100) {
            addAttendance.mutate({
              employeeId: employee.employeeId,
              timeSlot: attendanceType,
            });
          } else {
            toast.error("Fingerprint not matched.");
          }

          setStatus("Successfully saved attendance");
        } else {
          setStatus("Not Matched!");
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

  const handleClose = useCallback(() => {
    setOpen(false);
    setClear();
  }, [setClear, setOpen]);

  useEffect(() => {
    setClear();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formattedDate = dayjs(date).format("MMMM D, YYYY");
  const dayOfWeek = dayjs(date).format("dddd");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Mark Attendance</DialogTitle>
          <DialogDescription className="sr-only">
            Attendance for {employee.employeeName}
          </DialogDescription>
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
        <Button
          onClick={captureFingerprint}
          disabled={savedFinger.isFetching || addAttendance.isPending}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
};
