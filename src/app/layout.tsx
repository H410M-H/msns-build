// src/app/layout.tsx
import "~/styles/globals.css";

import { Geist_Mono, Inter } from "next/font/google";
import { type Metadata } from "next";
import Script from "next/script";
import { Provider } from "./provider";

// SEO component – uncomment and fix path if needed
// import { SchoolSchema } from "~/components/SEOSchema";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "M. S. NAZ HIGH SCHOOL® | Portal",
  description: "M.S. Naz High School Learning Management System. Since - 2004 | Developed by MSNS-DEV™",
  verification: {
    google: "UEssQjRtMsHt_ioT8H5RUA2Rnl0_9QEl0d8tL6JBi1E",
  },
  keywords: [
    "msns", "m s naz", "m s naz high school", "msnaz", "lms", "portal",
    "ghakkhar", "wazirabad", "gujranwala", "msns-dev"
  ].join(", "),
  openGraph: {
    title: "M.S. Naz High School®",
    description: "Explore the premier educational experience at M.S. Naz High School® focused on excellence and student development.",
    url: "https://msns.edu.pk/",
    siteName: "M.S. Naz High School®",
    images: [
      {
        url: "https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png",
        width: 1200,
        height: 630,
        alt: "M.S. Naz High School® Logo"
      }
    ],
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://msns.edu.pk",
  },
  manifest: "/manifest.json",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        {/* Google Tag (gtag.js) - G-K3FXJTBQKM */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K3FXJTBQKM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-K3FXJTBQKM');
          `}
        </Script>
        {/* Uncomment after fixing the import path */}
        {/* <SchoolSchema /> */}
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} h-full font-sans antialiased`}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}