import \{ React, FC, ReactNode \} from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider } from 'styled-components';
import { TRPCReactProvider } from 'trpc-react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import Analytics from '~/components/Analytics';
import Toaster from '~/components/Toaster';
import \{ SchoolSchema \} from '~/schemas/SchoolSchema';
import \{ GoogleTagManager \} from '~/components/GoogleTagManager';
import \{ GeistProvider \} from '@geist-ui/react';

const metadata = {  
  title: 'Your App Title',  
  description: 'Your app description',  
  verification: 'site-verification-code',  
  keywords: 'keyword1, keyword2',  
  openGraph: {  
    title: 'Your Open Graph Title',  
    description: 'Your Open Graph Description',  
    url: 'https://your-app-url.com',  
    images: [  
      { url: 'https://your-image-url.com/image.png' },  
    ],  
  },  
  robots: \{  
    index: true,  
    follow: true,  
  \},  
  alternates: {  
    canonical: 'https://your-app-url.com',  
  },  
  manifest: '/manifest.json',  
  icons: ['/favicon.ico'],  
};

const RootLayout: FC<Readonly<{ children: ReactNode }>> = \{ children \} => (  
  <html lang="en" suppressHydrationWarning>  
    <head>  
      <link href="https://fonts.googleapis.com/css?family=Geist" rel="stylesheet" />  
      <title>{metadata.title}</title>  
      <meta name="description" content={metadata.description} />  
      <meta name="keywords" content={metadata.keywords} />  
      <meta name="robots" content={metadata.robots.index ? 'index' : 'noindex'}, {metadata.robots.follow ? 'follow' : 'nofollow'} />  
      <script>{GoogleTagManager()}</script>
      <script>{SchoolSchema}</script>
    </head>  
    <body className="font-variables flex">  
      <ThemeProvider>  
        <TRPCReactProvider>  
          <Header />  
          <main className="flex-1">  
            {children}  
            <Analytics />  
          </main>  
          <Footer />  
          <Toaster />  
        </TRPCReactProvider>  
      </ThemeProvider>  
    </body>  
  </html>  
);

export default RootLayout;