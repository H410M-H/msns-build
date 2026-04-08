import { Analytics } from '@vercel/analytics/react';
import { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Your Site Title',
  description: 'Your Site Description',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Analytics />
        {children}
      </body>
    </html>
  );
}