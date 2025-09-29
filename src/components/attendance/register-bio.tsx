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
  RotateCcw,
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

interface FingerPrintResponseProps {
  ErrorCode: number;
  ISOTemplateBase64: string;
}

export const RegisterEmployeeBioMetric = ({
  employeeId,
  employeeName,
}: ComponentProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [deviceStatus, setDeviceStatus] = useState<
    "disconnected" | "connected" | "capturing" | "error"
  >("disconnected");
  const [captureProgress, setCaptureProgress] = useState(0);
  const [currentCapture, setCurrentCapture] = useState(0);
  const totalCaptures = 3;

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

  const captureFingerprint = useCallback(async () => {
    try {
      setLoading(true);
      setDeviceStatus("capturing");

      let newThumbData: string[] = [];

      for (let i = currentCapture; i < totalCaptures; i++) {
        const progressInterval = simulateProgress();

        const response = await axios.post<FingerPrintResponseProps>(
          "https://localhost:8443/SGIFPCapture",
          "Timeout=10000&Quality=50&licstr=&templateFormat=ISO",
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
          // Add the new capture to our array
          newThumbData = [...newThumbData, response.data.ISOTemplateBase64];


          // Update current capture count
          const newCaptureCount = i + 1;
          setCurrentCapture(newCaptureCount);

          // Show progress toast
          if (newCaptureCount < totalCaptures) {
            toast.success(
              `Capture ${newCaptureCount} of ${totalCaptures} complete!`,
              {
                description: "Next capture in 3 seconds...",
              },
            );

            // Wait 3 seconds before next capture
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        } else {
          throw new Error(`Scanner error code: ${response.data.ErrorCode}`);
        }
      }

      // All captures completed, send to backend
      setDeviceStatus("connected");
      fingerMutation.mutate({
        employeeId,
        thumb: newThumbData,
        indexFinger: [""],
      });

      toast.success("All captures completed!", {
        description: "Multiple thumb captures have been successfully stored.",
      });
    } catch (error) {
      console.error("Fingerprint capture error:", error);
      setDeviceStatus("error");

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Failed to capture fingerprint", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
      setCaptureProgress(0);
    }
  }, [employeeId, fingerMutation, currentCapture, totalCaptures, simulateProgress]);

  const resetCaptures = useCallback(() => {
    
    setCurrentCapture(0);
    toast.info("Captures reset", {
      description: "You can now start fresh with new fingerprint captures.",
    });
  }, []);

  useEffect(() => {
    if (savedFinger) {
      // Handle both old format (single string) and new format (array)
      if (Array.isArray(savedFinger.thumb)) { 
        setCurrentCapture(savedFinger.thumb.length);
      } else if (savedFinger.thumb) {
        setCurrentCapture(1);
      }
      setDeviceStatus("connected");
    }
  }, [savedFinger]);

  const completionPercentage = (currentCapture / totalCaptures) * 100;
  const isComplete = currentCapture >= totalCaptures;

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
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header Section */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4 text-center">
          <div className="mb-2 flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl font-bold text-gray-900">
              Multi-Capture Biometric Registration
            </CardTitle>
          </div>
          <p className="mx-auto max-w-lg text-muted-foreground">
            For improved accuracy, we&apos;ll capture your thumbprint multiple
            times from different angles.
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
                  {Math.round(completionPercentage)}%
                </span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {currentCapture} of {totalCaptures} captures
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capture Progress */}
      {loading ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="font-medium text-blue-900">
                  Capturing thumbprint ({currentCapture + 1} of {totalCaptures}
                  )...
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
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Thumbprint Capture
              </h3>
              <p className="text-sm text-muted-foreground">
                {isComplete
                  ? "All captures completed successfully!"
                  : `Place your thumb on the scanner (${currentCapture}/${totalCaptures})`}
              </p>
            </div>

            <div className="relative">
              <div
                className={cn(
                  "rounded-full p-8 transition-all duration-500",
                  currentCapture > 0
                    ? "bg-emerald-50 shadow-lg shadow-emerald-500/25"
                    : "bg-gray-50",
                  loading && "animate-pulse bg-blue-50",
                )}
              >
                {loading ? (
                  <Loader2 className="h-20 w-20 animate-spin text-blue-500" />
                ) : (
                  <Fingerprint
                    className={cn(
                      "h-20 w-20 transition-all duration-500",
                      currentCapture > 0 ? "text-emerald-500" : "text-gray-400",
                    )}
                  />
                )}
              </div>

              {currentCapture > 0 && !loading && (
                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white p-1 shadow-lg">
                  <span className="text-xs font-bold text-emerald-500">
                    {currentCapture}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                onClick={captureFingerprint}
                disabled={loading || isComplete}
                size="lg"
                className={cn(
                  "min-w-[160px] transition-all duration-300",
                  isComplete
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-blue-600 hover:bg-blue-700",
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Capturing...
                  </>
                ) : isComplete ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    All Captures Complete
                  </>
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    {currentCapture === 0 ? "Start Capture" : "Next Capture"}
                  </>
                )}
              </Button>

              {currentCapture > 0 && (
                <Button
                  onClick={resetCaptures}
                  disabled={loading}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capture guidance */}
      {currentCapture > 0 && !isComplete && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <AlertDescription className="font-medium text-blue-800">
            For capture {currentCapture + 1}, try placing your thumb at a
            slightly different angle to improve recognition accuracy.
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {isComplete && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <AlertDescription className="font-medium text-emerald-800">
            Multi-capture registration completed successfully! {totalCaptures}{" "}
            thumbprint samples have been captured and securely stored for
            improved recognition accuracy.
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
          <h4 className="mb-3 font-semibold text-blue-900">
            Multi-Capture Instructions:
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-medium text-blue-600">1.</span>
              We&apos;ll capture your thumbprint {totalCaptures} times for
              improved accuracy
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-medium text-blue-600">2.</span>
              For each capture, place your thumb at a slightly different angle
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-medium text-blue-600">3.</span>
              Press firmly and hold steady during each capture process
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-medium text-blue-600">4.</span>
              Multiple captures help the system recognize your fingerprint more
              reliably
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};