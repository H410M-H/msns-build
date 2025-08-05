"use client"
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import RegistrationCards from "~/components/cards/RegistrationCard";

export default function RegistrationPage() {
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "User Management", current: true },
  ];

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-yellow-50 via-emerald-50 to-cyan-50 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 bg-green-200/20 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.2, 0],
              x: Math.random() * 1000 - 500,
              y: Math.random() * 1000 - 500,
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <PageHeader breadcrumbs={breadcrumbs} />
        <div className="container mx-auto pt-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-full py-8"
          >
            <div className="text-center space-y-6 mb-16">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="inline-block relative"
              >
                <h1 className="relative font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                  <motion.span
                    initial={{ backgroundPosition: "0% 50%" }}
                    animate={{ backgroundPosition: "100% 50%" }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="block bg-gradient-to-r from-green-600 via-emerald-500 to-cyan-600 bg-clip-text text-transparent bg-[length:300%_100%]"
                  >
                    Online Registration Portal
                  </motion.span>
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="absolute -right-6 top-1/2 -translate-y-1/2"
                  >
                    <GraduationCap className="w-16 h-16 md:w-20 md:h-20 text-emerald-500 drop-shadow-lg" />
                  </motion.div>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center items-center gap-3 text-lg font-medium text-emerald-700"
              >
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                <span>Begin Your Academic Journey</span>
                <motion.div
                  animate={{ x: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight className="w-5 h-5 text-cyan-600" />
                </motion.div>
                <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent font-semibold">
                  Register Now
                </span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <RegistrationCards />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
}