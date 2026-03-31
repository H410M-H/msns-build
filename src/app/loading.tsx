"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 3;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      style={{
        background: `
          radial-gradient(circle at 20% 80%, #120a8f 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, #1e293b 0%, transparent 50%),
          linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)
        `,
      }}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }, (_, i: number) => (
          <div
            key={i}
            className="animate-float absolute h-1 w-1 rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="z-10 flex flex-col items-center space-y-12">
        {/* 3D Logo Container */}
        <div
          className="group relative cursor-pointer"
          style={{
            transform: `perspective(1000px) rotateX(${mousePos.y * 10}deg) rotateY(${mousePos.x * 10}deg)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          {/* 3D Logo Base */}
          <div className="relative h-48 w-48 md:h-64 md:w-64">
            {/* Background glow */}
            <div className="absolute inset-0 scale-150 animate-pulse rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-30 blur-xl"></div>

            {/* Main logo container with 3D effect */}
            <div className="preserve-3d relative h-full w-full transform-gpu">
              {/* Front face */}
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-1 shadow-2xl"
                style={{ transform: "translateZ(20px)" }}
              >
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-muted backdrop-blur-sm">
                  {/* Your original logo */}
                  <Image
                    src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png"
                    alt="Pursuit of Excellence Logo"
                    className="relative z-10 h-3/4 w-3/4 object-contain drop-shadow-2xl"
                    width={200}
                    height={200}
                  />

                  {/* Animated overlay effects */}
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-tr from-cyan-500/20 via-transparent to-purple-500/20"></div>
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"
                    style={{
                      background: `conic-gradient(from ${(Date.now() / 10) % 360}deg, transparent, rgba(255,255,255,0.1), transparent)`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Side faces for 3D depth */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 opacity-20"
                  style={{
                    transform: `translateZ(${-i * 3}px) scale(${1 - i * 0.02})`,
                  }}
                />
              ))}
            </div>

            {/* Floating elements around logo */}
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="animate-orbit absolute h-3 w-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"
                style={{
                  transformOrigin: "var(--orbit-radius)",
                  animation: `orbit var(--orbit-duration) linear infinite`,
                  animationDelay: `var(--orbit-delay)`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Loading Section */}
        <div className="mx-auto max-w-md space-y-6 px-4 text-center">
          {/* Loading Text with 3D effect */}
          <div className="relative">
            <h2
              className="animate-pulse bg-gradient-to-r from-cyan-400 via-purple-400 to-green-800 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
              style={{
                textShadow: "0 0 30px rgba(139, 92, 246, 0.5)",
                transform: `perspective(500px) rotateX(${mousePos.y * 2}deg)`,
              }}
            >
              Loading
            </h2>
            <div className="absolute inset-0 text-4xl font-bold text-foreground/10 blur-sm md:text-5xl">
              Loading
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mx-auto w-full max-w-xs">
            <div className="h-2 overflow-hidden rounded-full bg-slate-700/50 backdrop-blur-sm">
              <div
                className="relative h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="animate-shimmer absolute inset-0 bg-white/30"></div>
              </div>
            </div>
            <div className="mt-2 text-center text-sm font-medium text-cyan-300">
              {Math.round(progress)}%
            </div>
          </div>

          {/* Enhanced Animated Dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative">
                <div
                  className="h-3 w-3 animate-bounce rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-lg"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
                <div
                  className="absolute inset-0 h-3 w-3 animate-bounce rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 opacity-50 blur-sm"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              </div>
            ))}
          </div>

          {/* Status Text */}
          <p className="animate-pulse text-sm text-foreground">
            Initializing your experience...
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(var(--orbit-radius))
              rotate(-360deg);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-orbit {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
        }

        .animate-shimmer::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
