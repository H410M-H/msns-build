import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          '*',
          'Googlebot',
          'Bingbot',
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
          'Applebot',
        ],
        allow: [
          '/',
          '/sign-in',
          '/privacy-policy',
          '/llms.txt',
          '/llms-full.txt',
          '/manifest.json',
        ],
        disallow: [
          '/admin/',
          '/teacher/',
          '/clerk/',
          '/student/',
          '/principal/',
          '/head/',
          '/parent/',
          '/api/',
          '/_next/',
        ],
        crawlDelay: 0,
      },
    ],
    sitemap: [
      'https://lms.msns.edu.pk/sitemap.xml',
    ],
  };
}
