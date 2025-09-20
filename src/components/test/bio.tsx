"use client";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { api } from "~/trpc/react";
import { Input } from "../ui/input";

interface FingerPrintResponseProps {
  ErrorCode: number;
  ISOTemplateBase64: string;
  BMPBase64: string;
  SerialNumber?: string;
  NFIQ?: number;
}

type FingerprintCaptureProps = {
  employeeId: string;
};

export const FingerprintCapture = ({ employeeId }: FingerprintCaptureProps) => {
  const [status, setStatus] = useState("Idle");
  const [isLoading, setIsLoading] = useState(false);
  const [match, setMatch] = useState<number>(0);
  const [port, setPort] = useState(8443);
  const finger = api.finger.addFinger.useMutation();
  const [savedFinger] = api.finger.getFinger.useSuspenseQuery({ employeeId });
  const [captureData, setCaptureData] =
    useState<FingerPrintResponseProps | null>(null);
  const [deviceStatus, setDeviceStatus] = useState("disconnected");

  // Check device status on component mount

  const checkDeviceStatus = useCallback(async () => {
    try {
      console.log("clicked");
      const response = await axios.get(
        `https://localhost:${port}/SGIFPGetDeviceInfo`,
      );

      console.log(response.data);
      if (response.data) {
        setDeviceStatus("connected");
        setStatus("Device is ready");
      } else {
        setDeviceStatus("disconnected");
        setStatus("Device not found");
      }
    } catch (error) {
      setDeviceStatus("error");
      setStatus(`Error checking device status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [port]);

  const initializeDevice = useCallback(async () => {
    setStatus("Initializing device...");
    setIsLoading(true);
    try {
      const payloadString =
        "Timeout=10000&Quality=50&licstr=&templateFormat=ISO&imageWSQRate=0.75";
      const response = await axios.post<FingerPrintResponseProps>(
        `https://localhost:${port}/SGIFPCapture`,
        payloadString,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );

      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data;

      console.log(data);

      finger.mutate({
        employeeId,
        thumb: [data.ISOTemplateBase64],
        indexFinger: [],
      });

      if (data.ErrorCode === 0) {
        setCaptureData(data);
        setStatus("Capture successful!");
        setDeviceStatus("connected");
      } else {
        setStatus(`Error: ${data.ErrorCode}`);
        setDeviceStatus("error");
      }
    } catch (error) {
      setDeviceStatus("error");
      setStatus(`Error capturing fingerprint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [finger, employeeId, port]);

  const matchFinger = useCallback(async () => {
    setStatus("Matching device...");
    setIsLoading(true);
    try {
      const payloadString =
        "Timeout=10000&Quality=50&licstr=&templateFormat=ISO&imageWSQRate=0.75";
      const response = await axios.post<FingerPrintResponseProps>(
        `https://localhost:${port}/SGIFPCapture`,
        payloadString,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );
      console.log(response)

      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newFinger = response.data;

      console.log(newFinger)

      const payloadStringMatch = `template1=${savedFinger?.thumb[0] ?? ''}&template2=${newFinger.ISOTemplateBase64}&licstr=&templateFormat=ISO`;
      const matchResponse = await axios.post<{
        ErrorCode: number;
        MatchingScore: number;
      }>(`https://localhost:${port}/SGIMatchScore`, payloadStringMatch, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (!matchResponse.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(matchResponse.data)

      if (matchResponse.data.ErrorCode === 106) {
        setStatus(`Error: ${matchResponse.data.ErrorCode} - Not matched`);
        setDeviceStatus("error");
      } else {
        setMatch(matchResponse.data.MatchingScore);
        setDeviceStatus("connected");
      }
    } catch (error) {
      setStatus(`Error matching fingerprint: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDeviceStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, [savedFinger, port]);
  const resetCapture = useCallback(() => {
    setCaptureData(null);
    setStatus("Ready for new capture");
  }, []);

  useEffect(() => {
    checkDeviceStatus()
      .then((res) => res)
      .catch((err) => console.error(err));
  }, [checkDeviceStatus]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gray-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-blue-500 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  SecuGen Fingerprint Capture
                </h1>
                <p className="text-blue-200">Web API Integration</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`h-3 w-3 rounded-full ${deviceStatus === "connected" ? "bg-green-500" : deviceStatus === "error" ? "bg-red-500" : "bg-yellow-500"}`}
              ></div>
              <span className="text-sm font-medium">
                {deviceStatus === "connected"
                  ? "Connected"
                  : deviceStatus === "error"
                    ? "Error"
                    : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-gray-700 px-6 py-3 text-white">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Status:</span>
            <span className="text-blue-300">{status}</span>
            {match != 0 ? (
              <>
                <span className="text-sm font-medium">Match:</span>
                <span className="text-blue-300">{match}</span>
              </>
            ) : null}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Port:</span>
            <Input
              type="number"
              value={port}
              onChange={(e) => {
                const newPort = Number(e.target.value);
                if (newPort >= 1024 && newPort <= 65535) {
                  setPort(newPort);
                }
              }}
              className="w-20 rounded bg-gray-600 px-2 py-1 text-sm text-white"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          {/* Left Panel - Controls */}
          <div className="rounded-lg bg-gray-100 p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Device Controls
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  API Endpoint
                </label>
                <div className="flex items-center rounded-lg bg-gray-200 p-3">
                  <span className="text-gray-600">https://localhost:</span>
                  <Input
                    type="number"
                    value={port}
                    onChange={(e) => {
                      const newPort = Number(e.target.value);
                      if (newPort >= 1024 && newPort <= 65535) {
                        setPort(newPort);
                      }
                    }}
                    className="mx-1 w-16 border-b border-gray-400 bg-transparent text-center"
                  />
                  <span className="text-gray-600">/SGIFPCapture</span>
                </div>
              </div>

              <button
                onClick={initializeDevice}
                disabled={isLoading}
                className={`flex w-full items-center justify-center space-x-2 rounded-lg px-4 py-3 ${
                  isLoading
                    ? "cursor-not-allowed bg-blue-400"
                    : "bg-blue-600 hover:bg-blue-700"
                } font-semibold text-white transition-colors`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Capturing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Capture Fingerprint</span>
                  </>
                )}
              </button>

              <button
                onClick={matchFinger}
                className="w-full rounded-lg bg-gray-600 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700"
              >
                Match
              </button>

              <button
                onClick={checkDeviceStatus}
                className="w-full rounded-lg bg-gray-600 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700"
              >
                Check Device Status
              </button>

              {captureData && (
                <button
                  onClick={resetCapture}
                  className="w-full rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
                >
                  Reset Capture
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="rounded-lg bg-gray-100 p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Capture Results
            </h2>

            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 animate-spin text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="mt-4 text-gray-600">
                    Capturing fingerprint... Please wait.
                  </p>
                </div>
              </div>
            ) : captureData ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">
                    Fingerprint Image
                  </h3>
                  <div className="mt-2 flex items-center justify-center rounded-lg border border-gray-300 bg-white p-4">
                    {captureData.BMPBase64 ? (
                      <Image
                        src={`data:image/bmp;base64,${captureData.BMPBase64}`}
                        alt="Fingerprint scan"
                        className="max-h-48"
                        width={400}
                        height={400}
                      />
                    ) : (
                      <span className="text-gray-500">No image available</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Serial Number</h3>
                    <p className="mt-1 rounded-lg border border-gray-300 bg-white p-2">
                      {captureData.SerialNumber ?? "N/A"}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700">NFIQ Score</h3>
                    <p className="mt-1 rounded-lg border border-gray-300 bg-white p-2">
                      {captureData.NFIQ ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-center">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                    />
                  </svg>
                  <p className="mt-4 text-gray-600">
                    No capture data yet. Click &quot;Capture Fingerprint&quot; to begin.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-4 text-center text-sm text-white">
          <p>SecuGen Web API Service running on port {port}</p>
        </div>
      </div>
    </div>
  );
};