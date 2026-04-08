import "~/styles/globals.css";

import { Geist_Mono, Inter } from "next/font/google";
import { type Metadata } from "next";
import Script from "next/script";
import { Provider } from "~/app/provider";
import { Toaster } from "~/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";
import { GoogleTagManager } from "~/components/GoogleTagManager";
import { SchoolSchema } from "~/schemas/SchoolSchema";

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
  title: "MSNS-LMS | Portal Login",
  description: "M.S. Naz High School Learning Management System.",
  keywords: "LMS, school management, learning platform, MSNS",
  verification: {
    // Replace with your actual verification code if needed
    google: "your-google-site-verification-code",
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "MSNS-LMS | Portal Login",
    description: "M.S. Naz High School Learning Management System.",
    url: "https://msns-lms.vercel.app", // Replace with your actual domain
    siteName: "MSNS-LMS",
    images: [
      {
        url: "https://your-image-url.com/og-image.png", // Replace with actual OG image
        width: 1200,
        height: 630,
        alt: "MSNS-LMS Platform",
      },
    ],
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://msns-lms.vercel.app", // Replace with your actual domain
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmScript = GoogleTagManager(); // returns string of script content
  const schoolSchemaJson = JSON.stringify(SchoolSchema);

  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        {/* Google Tag Manager - inline script */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: gtmScript }}
        />
        {/* JSON-LD Schema for school */}
        <Script
          id="school-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: schoolSchemaJson }}
        />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} h-full font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Provider>
            {children}
            <Toaster />
          </Provider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}