"use client";
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { api } from "~/trpc/react";
import { Fingerprint, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type ComponentProps = {
  employeeId: string;
};

export const RegisterEmployeeBioMetric = ({ employeeId }: ComponentProps) => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [thumbStatus, setThumbStatus] = useState<string>("");
  const [thumbData, setThumbData] = useState<string>("");
  const [indexFingerData, setIndexFingerData] = useState<string>("");
  const finger = api.finger.addFinger.useMutation();
  const utils = api.useUtils()
  const [savedFinger] = api.finger.getFinger.useSuspenseQuery({ employeeId });
  const [deviceStatus, setDeviceStatus] = useState("disconnected");

  const thumbCapture = useCallback(async () => {
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
        setThumbStatus("Error in capturing the thumb print.");
      }

      if (response.data.ErrorCode === 0) {
        setThumbData("Success in capturing the thumb print.");
        setDeviceStatus("connected");
        finger.mutate({
          employeeId: employeeId,
          thumb: response.data.ISOTemplateBase64,
          indexFinger: indexFingerData,
        });
      } else {
        setDeviceStatus("Device error found.");
      }
    } catch (error) {
      console.error(error);
      setDeviceStatus("Device error found.");
    } finally {
      setLoading(false);
      await utils.finger.getFinger.refetch({employeeId})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, finger, indexFingerData]);

  const indexFingerCapture = useCallback(async () => {
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
        setThumbStatus("Error in capturing the thumb print.");
      }

      if (response.data.ErrorCode === 0) {
        setThumbData("Success in capturing the thumb print.");
        setDeviceStatus("connected");
        finger.mutate({
          employeeId: employeeId,
          thumb: thumbData,
          indexFinger: response.data.ISOTemplateBase64,
        });
      } else {
        setDeviceStatus("Device error found.");
      }
    } catch (error) {
      console.error(error);
      setDeviceStatus("Device error found.");
    } finally {
      setLoading(false);
      await utils.finger.getFinger.refetch({employeeId})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, finger, thumbData]);

  useEffect(() => {
    if (savedFinger) {
      setThumbData(savedFinger.thumb);
      setIndexFingerData(savedFinger.indexFinger);
    }
  }, [savedFinger]);

  const hasThumbData = thumbData !== "";
  const hasIndexFingerData = indexFingerData !== "";

  return (
    <div className="flex items-center justify-center">
      <div className="grid w-full max-w-4xl grid-cols-2 gap-4 overflow-hidden rounded-2xl bg-green-600 p-2 shadow-2xl">
        {/* Thumb Section */}
        <div className="grid place-content-center gap-4 bg-white p-3">
          <div className="relative">
            <Fingerprint
              className={cn(
                "h-28 w-28 transition-colors duration-300",
                hasThumbData ? "text-green-500" : "text-gray-400",
              )}
            />
            {hasThumbData ? (
              <CheckCircle className="absolute -right-2 -top-2 h-6 w-6 text-green-500" />
            ) : null}
            {thumbStatus ? <p className="text-lg">{thumbStatus} </p> : null}
          </div>
          <Button onClick={thumbCapture} disabled={isLoading}>
            {isLoading ? "Adding thumb" : "Add thumb"}
          </Button>
        </div>

        {/* Index Finger Section */}
        <div className="grid place-content-center gap-4 bg-white p-3">
          <div className="relative">
            <Fingerprint
              className={cn(
                "h-28 w-28 transition-colors duration-300",
                hasIndexFingerData ? "text-green-500" : "text-gray-400",
              )}
            />
            {hasIndexFingerData && (
              <CheckCircle className="absolute -right-2 -top-2 h-6 w-6 text-green-500" />
            )}
          </div>
          <Button onClick={indexFingerCapture} disabled={isLoading}>
            {isLoading ? "Adding finger" : "Add finger"}
          </Button>
        </div>
      </div>
    </div>
  );
};
