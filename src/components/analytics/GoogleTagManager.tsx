'use client';

import Script from 'next/script';

/**
 * Google Tag Manager initialization component
 * Add your GTM ID: GTM-XXXXXX
 * 
 * To set up GTM:
 * 1. Create account at https://tagmanager.google.com/
 * 2. Create a Web container
 * 3. Replace GTM_ID with your container ID
 * 4. Deploy and verify container loads
 */

interface GoogleTagManagerProps {
  containerID: string;
}

export const GoogleTagManager = ({ containerID }: GoogleTagManagerProps) => {
  return (
    <>
      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${containerID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      {/* End Google Tag Manager (noscript) */}

      {/* Google Tag Manager (gtm.js) */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${containerID}');
          `,
        }}
      />
      {/* End Google Tag Manager (gtm.js) */}
    </>
  );
};

export default GoogleTagManager;
