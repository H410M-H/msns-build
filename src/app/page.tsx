"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import {
  BookOpen,
  TrendingUp,
  Users,
  Star,
  Zap,
  Award,
  Globe,
} from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";

const TiltCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className={`group transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Art */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: `url('https://res.cloudinary.com/dvvbxrs55/image/upload/v1737389879/rgb_tech_liguqe.png')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/65 via-green-800/50 to-teal-800/65" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        <motion.div
          className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-400/25 to-green-400/25 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-teal-400/25 to-cyan-400/25 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-br from-lime-400/15 to-emerald-400/15 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 0.5,
          }}
        />
      </div>

      {/* Foreground Design */}
      <div className="absolute bottom-0 right-0 z-20 hidden lg:block">
        <motion.div
          initial={{ opacity: 0.3 }}
          whileHover={{ opacity: 0.5, scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1737373454/designJpg/j7enn3yegbeql8xvr5pm.png"
            alt="Foreground design"
            width={384}
            height={256}
            className="h-auto w-96"
          />
        </motion.div>
      </div>

      <div className="container relative z-30 mx-auto px-4 py-8 lg:py-16">
        {/* Header with Logo */}
        <div className="mb-8 flex justify-center">
          <motion.div
            className="group relative"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267540/Official_LOGO_-Final_js1qrk.png"
              alt="LMS Logo"
              width={120}
              height={80}
              className="h-16 w-auto object-contain md:h-20"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
          </motion.div>
        </div>

        {/* Hero Section */}
        <div className="mb-12 space-y-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-white via-emerald-400 to-teal-900 bg-clip-text text-4xl font-bold leading-tight text-transparent drop-shadow-2xl md:text-6xl lg:text-7xl"
          >
            M.S. NAZ HIGH SCHOOL®
            <br />
            <span className="bg-gradient-to-r from-lime-300 to-emerald-300 bg-clip-text text-transparent">
              LMS
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-100 drop-shadow-lg md:text-2xl"
          >
            Transform your educational experience with our next-generation
            Learning Management System designed for modern learners and
            educators.
          </motion.p>
        </div>

        {/* CTA Buttons */}
        <div className="mx-auto mb-16 flex max-w-md flex-col justify-center gap-4 sm:flex-row">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="flex h-14 items-center gap-2 rounded-md border-0 bg-gradient-to-r from-emerald-500 to-teal-500 px-8 text-lg font-medium text-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/25"
              asChild
            >
              <Link href="/sign-in">
                <Zap className="h-5 w-5" />
                Get Started
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="flex h-14 items-center gap-2 rounded-md border-2 border-emerald-400/40 bg-transparent px-8 text-lg font-medium text-emerald-100 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-300/60 hover:bg-emerald-500/20 hover:shadow-emerald-500/20"
              asChild
            >
              <Link href="/about">
                <BookOpen className="h-5 w-5" />
                Learn More
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BookOpen,
              title: "Interactive Lessons",
              description:
                "Engage with dynamic content, quizzes, and multimedia resources",
              color: "from-emerald-500 to-teal-500",
              bgColor: "bg-emerald-500/20",
            },
            {
              icon: TrendingUp,
              title: "Progress Tracking",
              description:
                "Monitor your learning journey with detailed analytics and insights",
              color: "from-teal-500 to-cyan-500",
              bgColor: "bg-teal-500/20",
            },
            {
              icon: Users,
              title: "Collaboration",
              description:
                "Connect with peers and instructors in real-time discussions",
              color: "from-lime-500 to-emerald-500",
              bgColor: "bg-lime-500/20",
            },
            {
              icon: Award,
              title: "Certifications",
              description:
                "Earn recognized certificates and badges for your achievements",
              color: "from-green-500 to-emerald-500",
              bgColor: "bg-green-500/20",
            },
            {
              icon: Globe,
              title: "Global Access",
              description: "Learn from anywhere with our cloud-based platform",
              color: "from-emerald-500 to-green-500",
              bgColor: "bg-emerald-500/20",
            },
            {
              icon: Star,
              title: "Premium Content",
              description:
                "Access curated courses from industry experts and educators",
              color: "from-teal-500 to-emerald-500",
              bgColor: "bg-teal-500/20",
            },
          ].map((feature, _) => (
            <TiltCard
              key={feature.title}
              className={`border border-white/20 shadow-xl ${feature.bgColor} backdrop-blur-xl hover:border-emerald-300/30 hover:backdrop-blur-2xl`}
            >
              <Card className="h-full border-0 bg-transparent">
                <CardHeader
                  className="pb-4 text-center"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <motion.div
                    className="mb-3 flex justify-center"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <motion.div
                      className={`rounded-full bg-gradient-to-r p-3 ${feature.color} shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-emerald-500/30`}
                      style={{
                        transformStyle: "preserve-3d",
                        translateZ: "20px",
                      }}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </motion.div>
                  </motion.div>
                  <CardTitle className="text-xl font-bold text-white transition-colors group-hover:text-emerald-100">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ transformStyle: "preserve-3d" }}>
                  <p
                    className="text-center leading-relaxed text-gray-200 transition-colors group-hover:text-gray-100"
                    style={{ transform: "translateZ(10px)" }}
                  >
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </TiltCard>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { number: "10K+", label: "Students" },
            { number: "500+", label: "Courses" },
            { number: "50+", label: "Instructors" },
            { number: "95%", label: "Success Rate" },
          ].map((stat) => (
            <TiltCard
              key={stat.label}
              className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-300/30 hover:bg-emerald-500/10 hover:shadow-emerald-500/20"
            >
              <div
                className="flex h-full flex-col justify-center text-center"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-3xl font-bold text-transparent drop-shadow-md md:text-4xl"
                  style={{ transform: "translateZ(20px)" }}
                >
                  {stat.number}
                </div>
                <div className="mt-2 font-medium text-gray-200">
                  {stat.label}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 rounded-3xl border border-white/20 bg-gradient-to-r from-emerald-900/40 to-teal-900/40 p-8 text-center shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-emerald-300/30 hover:shadow-emerald-500/20">
          <h2 className="mb-4 text-3xl font-bold text-white drop-shadow-md">
            Ready to transform your learning?
          </h2>
          <p className="mb-6 text-xl text-gray-200">
            Join thousands of learners already advancing their careers
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              className="h-14 bg-gradient-to-r from-emerald-500 to-teal-500 px-12 text-lg shadow-2xl backdrop-blur-sm transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/30"
            >
              <Link href="/sign-in" className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Start Learning Today
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
