"use client";
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { api } from "~/trpc/react";
import {
  Fingerprint,
  CheckCircle,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
  Shield,
  User,
  Clock,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

type ComponentProps = {
  employeeId: string;
  employeeName: string;
};

type CaptureType = "thumb" | "indexFinger";

interface FingerPrintResponseProps {
  ErrorCode: number;
  ISOTemplateBase64: string;
}

export const RegisterEmployeeBioMetric = ({
  employeeId,
  employeeName,
}: ComponentProps) => {
  const [loadingType, setLoadingType] = useState<CaptureType | null>(null);
  const [thumbData, setThumbData] = useState<string>("");
  const [indexFingerData, setIndexFingerData] = useState<string>("");
  const [deviceStatus, setDeviceStatus] = useState<
    "disconnected" | "connected" | "capturing" | "error"
  >("disconnected");
  const [captureProgress, setCaptureProgress] = useState(0);

  const utils = api.useUtils();
  const { data: savedFinger, isLoading: isFetching } =
    api.finger.getFinger.useQuery({ employeeId }, { enabled: !!employeeId });

  const fingerMutation = api.finger.addFinger.useMutation({
    onSuccess: () => {
      toast.success("Fingerprint saved successfully", {
        description: "The biometric data has been securely stored.",
      });
      void utils.finger.getFinger.invalidate({ employeeId });
    },
    onError: (error) => {
      toast.error("Failed to save fingerprint", {
        description: error.message,
      });
    },
  });

  const simulateProgress = useCallback(() => {
    setCaptureProgress(0);
    const interval = setInterval(() => {
      setCaptureProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  }, []);

  const captureFingerprint = useCallback(
    async (type: CaptureType) => {
      try {
        setLoadingType(type);
        setDeviceStatus("capturing");

        const progressInterval = simulateProgress();

        const response = await axios.post<FingerPrintResponseProps>(
          "https://localhost:8443/SGIFPCapture",
          "Timeout=10000&Quality=60&licstr=&templateFormat=ISO",
          {
            headers: {
              "Content-Type": "text/plain;charset=UTF-8",
            },
          },
        );

        clearInterval(progressInterval);
        setCaptureProgress(100);

        if (!response.data) {
          throw new Error("No response data received from scanner");
        }

        if (response.data.ErrorCode === 0) {
          if (type === "thumb") {
            setThumbData(response.data.ISOTemplateBase64);
          } else {
            setIndexFingerData(response.data.ISOTemplateBase64);
          }

          setDeviceStatus("connected");

          // Save to database
          fingerMutation.mutate({
            employeeId,
            thumb:
              type === "thumb" ? response.data.ISOTemplateBase64 : thumbData,
            indexFinger:
              type === "indexFinger"
                ? response.data.ISOTemplateBase64
                : indexFingerData,
          });

          toast.success(
            `${type === "thumb" ? "Thumb" : "Index finger"} captured!`,
            {
              description:
                "Biometric data captured and processed successfully.",
            },
          );
        } else {
          throw new Error(`Scanner error code: ${response.data.ErrorCode}`);
        }
      } catch (error) {
        console.error("Fingerprint capture error:", error);
        setDeviceStatus("error");

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        toast.error(`Failed to capture ${type}`, {
          description: errorMessage,
        });
      } finally {
        setLoadingType(null);
        setCaptureProgress(0);
      }
    },
    [employeeId, fingerMutation, thumbData, indexFingerData, simulateProgress],
  );

  useEffect(() => {
    if (savedFinger) {
      setThumbData(savedFinger.thumb ?? "");
      setIndexFingerData(savedFinger.indexFinger ?? "");
      setDeviceStatus("connected");
    }
  }, [savedFinger]);

  const hasThumbData = thumbData !== "";
  const hasIndexFingerData = indexFingerData !== "";
  const completionPercentage =
    ((hasThumbData ? 1 : 0) + (hasIndexFingerData ? 1 : 0)) * 50;

  const isCapturing = loadingType !== null;
  const isThumbLoading = loadingType === "thumb";
  const isIndexFingerLoading = loadingType === "indexFinger";

  const getStatusIcon = () => {
    switch (deviceStatus) {
      case "connected":
        return <Wifi className="h-4 w-4" />;
      case "error":
        return <WifiOff className="h-4 w-4" />;
      case "capturing":
        return <Clock className="h-4 w-4" />;
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (deviceStatus) {
      case "connected":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
      case "error":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "capturing":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      default:
        return "bg-slate-500/10 text-slate-700 border-slate-200";
    }
  };

  if (isFetching) {
    return (
      <Card className="mx-auto w-full max-w-4xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="text-lg text-muted-foreground">
              Loading biometric data...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header Section */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4 text-center">
          <div className="mb-2 flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl font-bold text-gray-900">
              Biometric Registration
            </CardTitle>
          </div>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Secure your account with fingerprint authentication. Please scan
            both thumbprint and index finger.
          </p>
        </CardHeader>
      </Card>

      {/* Status and Progress Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="text-sm font-medium">Scanner Status</p>
                <Badge
                  variant="outline"
                  className={cn("mt-1", getStatusColor())}
                >
                  {deviceStatus.charAt(0).toUpperCase() + deviceStatus.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Employee Name</p>
                <p className="mt-1 font-mono text-sm text-muted-foreground">
                  {employeeName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Completion</p>
                <span className="text-sm font-medium">
                  {completionPercentage}%
                </span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capture Progress */}
      {isCapturing ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="font-medium text-blue-900">
                  Capturing{" "}
                  {loadingType === "thumb" ? "thumbprint" : "index finger"}...
                </span>
              </div>
              <Progress value={captureProgress} className="h-2" />
              <p className="text-sm text-blue-700">
                Please keep your finger steady on the scanner
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Main Capture Interface */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            {/* Thumb Section */}
            <div className="space-y-6 p-8">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Thumbprint
                </h3>
                <p className="text-sm text-muted-foreground">
                  Place your thumb on the scanner device
                </p>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div
                    className={cn(
                      "rounded-full p-8 transition-all duration-500",
                      hasThumbData
                        ? "bg-emerald-50 shadow-lg shadow-emerald-500/25"
                        : "bg-gray-50",
                      isThumbLoading && "animate-pulse bg-blue-50",
                    )}
                  >
                    {isThumbLoading ? (
                      <Loader2 className="h-20 w-20 animate-spin text-blue-500" />
                    ) : (
                      <Fingerprint
                        className={cn(
                          "h-20 w-20 transition-all duration-500",
                          hasThumbData ? "text-emerald-500" : "text-gray-400",
                        )}
                      />
                    )}
                  </div>

                  {hasThumbData && !isThumbLoading && (
                    <div className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow-lg">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => captureFingerprint("thumb")}
                  disabled={isCapturing}
                  size="lg"
                  className={cn(
                    "min-w-[160px] transition-all duration-300",
                    hasThumbData
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-blue-600 hover:bg-blue-700",
                  )}
                >
                  {isThumbLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Capturing...
                    </>
                  ) : hasThumbData ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Recapture Thumb
                    </>
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Capture Thumb
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Index Finger Section */}
            <div className="space-y-6 p-8">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Index Finger
                </h3>
                <p className="text-sm text-muted-foreground">
                  Place your index finger on the scanner device
                </p>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div
                    className={cn(
                      "rounded-full p-8 transition-all duration-500",
                      hasIndexFingerData
                        ? "bg-emerald-50 shadow-lg shadow-emerald-500/25"
                        : "bg-gray-50",
                      isIndexFingerLoading && "animate-pulse bg-blue-50",
                    )}
                  >
                    {isIndexFingerLoading ? (
                      <Loader2 className="h-20 w-20 animate-spin text-blue-500" />
                    ) : (
                      <Fingerprint
                        className={cn(
                          "h-20 w-20 transition-all duration-500",
                          hasIndexFingerData
                            ? "text-emerald-500"
                            : "text-gray-400",
                        )}
                      />
                    )}
                  </div>

                  {hasIndexFingerData && !isIndexFingerLoading && (
                    <div className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow-lg">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => captureFingerprint("indexFinger")}
                  disabled={isCapturing}
                  size="lg"
                  className={cn(
                    "min-w-[160px] transition-all duration-300",
                    hasIndexFingerData
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-blue-600 hover:bg-blue-700",
                  )}
                >
                  {isIndexFingerLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Capturing...
                    </>
                  ) : hasIndexFingerData ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Recapture Finger
                    </>
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Capture Finger
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {hasThumbData && hasIndexFingerData && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <AlertDescription className="font-medium text-emerald-800">
            Biometric registration completed successfully! Both fingerprints
            have been captured and securely stored.
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {deviceStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Scanner connection failed. Please check your device connection and
            try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h4 className="mb-3 font-semibold text-blue-900">Instructions:</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-medium text-blue-600">1.</span>
              Ensure your fingerprint scanner is connected and powered on
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-medium text-blue-600">2.</span>
              Clean your fingers and the scanner surface for best results
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-medium text-blue-600">3.</span>
              Press firmly and hold steady during the capture process
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-medium text-blue-600">4.</span>
              Complete both thumbprint and index finger scans for full access
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
