import "~/styles/globals.css";

import { Geist_Mono, Inter } from "next/font/google";
import { type Metadata } from "next";
import { Provider } from "~/app/provider";
import { Toaster } from "~/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";

// Configure Google Fonts
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
  title: "MSNS-LMS | M.S. Naz High School Learning Management System",
  description: "Access the M.S. Naz High School (MSNS) Learning Management System. Login to view academic records, assignments, and student resources. Excellence in education in Ghakhar, Pakistan.",
  keywords: ["MSNS", "M.S. Naz High School", "LMS", "Learning Management System", "Ghakhar", "Student Portal", "Education", "Pakistan Schools"],
  authors: [{ name: "M.S. Naz High School IT Team" }],
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
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