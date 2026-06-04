import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/sign-in'],
        disallow: ['/admin/', '/teacher/', '/clerk/', '/student/', '/principal/', '/head/', '/api/', '/_next/'],
        crawlDelay: 0,
      },
    ],
    sitemap: [
      'https://lms.msns.edu.pk/sitemap.xml',
    ],
  };
}
