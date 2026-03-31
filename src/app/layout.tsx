import "~/styles/globals.css";

import { Geist_Mono, Inter } from "next/font/google";
import { type Metadata } from "next";
import { Provider } from "~/app/provider";
import { Toaster } from "~/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";

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
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      {/* Added h-full to body to ensure full screen rendering */}
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
