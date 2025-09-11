// 'use client'

import { FingerprintTest } from "~/components/test/finger-print";

// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import Image from 'next/image'
// import { Button } from '~/components/ui/button'
// import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
// import {
//   BookOpen,
//   TrendingUp,
//   Users,
//   Star,
//   Zap,
//   Award,
//   Globe,
// } from 'lucide-react'
// import { motion, useMotionValue, useTransform } from 'framer-motion'
// import { useRef } from 'react'

// const TiltCard = ({
//   children,
//   className = '',
// }: {
//   children: React.ReactNode
//   className?: string
// }) => {
//   const cardRef = useRef<HTMLDivElement>(null)
//   const x = useMotionValue(0)
//   const y = useMotionValue(0)
//   const rotateX = useTransform(y, [-0.5, 0.5], [15, -15])
//   const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15])

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!cardRef.current) return
//     const rect = cardRef.current.getBoundingClientRect()
//     const width = rect.width
//     const height = rect.height
//     const mouseX = e.clientX - rect.left
//     const mouseY = e.clientY - rect.top
//     const xPct = mouseX / width - 0.5
//     const yPct = mouseY / height - 0.5
//     x.set(xPct)
//     y.set(yPct)
//   }

//   const handleMouseLeave = () => {
//     x.set(0)
//     y.set(0)
//   }

//   return (
//     <motion.div
//       ref={cardRef}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={handleMouseLeave}
//       style={{
//         rotateY,
//         rotateX,
//         transformStyle: 'preserve-3d',
//         perspective: '1000px',
//       }}
//       className={`group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${className}`}
//     >
//       {children}
//     </motion.div>
//   )
// }

// export default function Home() {
//   const router = useRouter()

//   return (
//     <div className="min-h-screen relative overflow-hidden">
//       {/* Background Art */}
//       <div className="absolute inset-0 z-0">
//         <div
//           className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
//           style={{
//             backgroundImage: `url('https://res.cloudinary.com/dvvbxrs55/image/upload/v1737389879/rgb_tech_liguqe.png')`,
//           }}
//         />
//         <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/65 via-green-800/50 to-teal-800/65" />
//       </div>

//       {/* Animated Background Elements */}
//       <div className="absolute inset-0 z-10 overflow-hidden">
//         <motion.div
//           className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/25 to-green-400/25 rounded-full blur-3xl"
//           animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
//           transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
//         />
//         <motion.div
//           className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/25 to-cyan-400/25 rounded-full blur-3xl"
//           animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
//           transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
//         />
//         <motion.div
//           className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-lime-400/15 to-emerald-400/15 rounded-full blur-3xl"
//           animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
//           transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', delay: 0.5 }}
//         />
//       </div>

//       {/* Foreground Design */}
//       <div className="absolute bottom-0 right-0 z-20 hidden lg:block">
//         <motion.div
//           initial={{ opacity: 0.3 }}
//           whileHover={{ opacity: 0.5, scale: 1.05 }}
//           transition={{ duration: 0.5 }}
//         >
//           <Image
//             src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1737373454/designJpg/j7enn3yegbeql8xvr5pm.png"
//             alt="Foreground design"
//             width={384}
//             height={256}
//             className="w-96 h-auto"
//           />
//         </motion.div>
//       </div>

//       <div className="relative z-30 container mx-auto px-4 py-8 lg:py-16">
//         {/* Header with Logo */}
//         <div className="flex justify-center mb-8">
//           <motion.div
//             className="relative group"
//             whileHover={{ scale: 1.1 }}
//             transition={{ duration: 0.3 }}
//           >
//             <Image
//               src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267540/Official_LOGO_-Final_js1qrk.png"
//               alt="LMS Logo"
//               width={120}
//               height={80}
//               className="h-16 w-auto md:h-20 object-contain"
//             />
//             <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
//           </motion.div>
//         </div>

//         {/* Hero Section */}
//         <div className="text-center space-y-6 mb-12">
//           <motion.h1
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-emerald-400 to-teal-900 bg-clip-text text-transparent leading-tight drop-shadow-2xl"
//           >
//             M.S. NAZ HIGH SCHOOL®
//             <br />
//             <span className="bg-gradient-to-r from-lime-300 to-emerald-300 bg-clip-text text-transparent">
//               LMS
//             </span>
//           </motion.h1>
//           <motion.p
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed drop-shadow-lg"
//           >
//             Transform your educational experience with our next-generation
//             Learning Management System designed for modern learners and
//             educators.
//           </motion.p>
//         </div>

//         {/* CTA Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-16">
//           <motion.div
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             <Button
//               onClick={() => router.push('/sign-in')}
//               className="h-14 px-8 text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 border-0 backdrop-blur-sm rounded-md text-white font-medium flex items-center gap-2"
//             >
//               <Zap className="h-5 w-5" />
//               Get Started
//             </Button>
//           </motion.div>
//           <motion.div
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             <Button
//               onClick={() => router.push('/about')}
//               className="h-14 px-8 text-lg border-2 border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/20 backdrop-blur-xl shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:border-emerald-300/60 rounded-md bg-transparent font-medium flex items-center gap-2"
//             >
//               <BookOpen className="h-5 w-5" />
//               Learn More
//             </Button>
//           </motion.div>
//         </div>

//         {/* Feature Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {[
//             {
//               icon: BookOpen,
//               title: 'Interactive Lessons',
//               description:
//                 'Engage with dynamic content, quizzes, and multimedia resources',
//               color: 'from-emerald-500 to-teal-500',
//               bgColor: 'bg-emerald-500/20',
//             },
//             {
//               icon: TrendingUp,
//               title: 'Progress Tracking',
//               description:
//                 'Monitor your learning journey with detailed analytics and insights',
//               color: 'from-teal-500 to-cyan-500',
//               bgColor: 'bg-teal-500/20',
//             },
//             {
//               icon: Users,
//               title: 'Collaboration',
//               description: 'Connect with peers and instructors in real-time discussions',
//               color: 'from-lime-500 to-emerald-500',
//               bgColor: 'bg-lime-500/20',
//             },
//             {
//               icon: Award,
//               title: 'Certifications',
//               description: 'Earn recognized certificates and badges for your achievements',
//               color: 'from-green-500 to-emerald-500',
//               bgColor: 'bg-green-500/20',
//             },
//             {
//               icon: Globe,
//               title: 'Global Access',
//               description: 'Learn from anywhere with our cloud-based platform',
//               color: 'from-emerald-500 to-green-500',
//               bgColor: 'bg-emerald-500/20',
//             },
//             {
//               icon: Star,
//               title: 'Premium Content',
//               description: 'Access curated courses from industry experts and educators',
//               color: 'from-teal-500 to-emerald-500',
//               bgColor: 'bg-teal-500/20',
//             },
//           ].map((feature, _) => (
//             <TiltCard key={feature.title} className={`border border-white/20 shadow-xl ${feature.bgColor} backdrop-blur-xl hover:backdrop-blur-2xl hover:border-emerald-300/30`}>
//               <Card className="h-full bg-transparent border-0">
//                 <CardHeader className="text-center pb-4" style={{ transformStyle: 'preserve-3d' }}>
//                   <motion.div
//                     className="flex justify-center mb-3"
//                     style={{ transformStyle: 'preserve-3d' }}
//                   >
//                     <motion.div
//                       className={`p-3 rounded-full bg-gradient-to-r ${feature.color} shadow-lg group-hover:shadow-2xl group-hover:shadow-emerald-500/30 transition-all duration-300`}
//                       style={{ transformStyle: 'preserve-3d', translateZ: '20px' }}
//                     >
//                       <feature.icon className="h-6 w-6 text-white" />
//                     </motion.div>
//                   </motion.div>
//                   <CardTitle className="text-xl font-bold text-white group-hover:text-emerald-100 transition-colors">
//                     {feature.title}
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent style={{ transformStyle: 'preserve-3d' }}>
//                   <p className="text-gray-200 text-center leading-relaxed group-hover:text-gray-100 transition-colors" style={{ transform: 'translateZ(10px)' }}>
//                     {feature.description}
//                   </p>
//                 </CardContent>
//               </Card>
//             </TiltCard>
//           ))}
//         </div>

//         {/* Stats Section */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
//           {[
//             { number: '10K+', label: 'Students' },
//             { number: '500+', label: 'Courses' },
//             { number: '50+', label: 'Instructors' },
//             { number: '95%', label: 'Success Rate' },
//           ].map((stat) => (
//             <TiltCard key={stat.label} className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:bg-emerald-500/10 border border-white/20 hover:border-emerald-300/30">
//               <div className="text-center h-full flex flex-col justify-center" style={{ transformStyle: 'preserve-3d' }}>
//                 <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent drop-shadow-md" style={{ transform: 'translateZ(20px)' }}>
//                   {stat.number}
//                 </div>
//                 <div className="text-gray-200 font-medium mt-2">{stat.label}</div>
//               </div>
//             </TiltCard>
//           ))}
//         </div>

//         {/* Footer CTA */}
//         <div className="text-center mt-16 p-8 bg-gradient-to-r from-emerald-900/40 to-teal-900/40 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:border-emerald-300/30">
//           <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-md">
//             Ready to transform your learning?
//           </h2>
//           <p className="text-xl text-gray-200 mb-6">
//             Join thousands of learners already advancing their careers
//           </p>
//           <motion.div
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             <Button
//               asChild
//               className="h-14 px-12 text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 backdrop-blur-sm"
//             >
//               <Link href="/sign-in" className="flex items-center gap-2">
//                 <Zap className="h-5 w-5" />
//                 Start Learning Today
//               </Link>
//             </Button>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   )
// }

export default function HomePage() {
  return <FingerprintTest />;
}
