// src/components/SEOSchema.tsx

export function LMSApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    '@id': 'https://lms.msns.edu.pk/#app',
    name: 'MSNS-LMS Portal',
    url: 'https://lms.msns.edu.pk',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web, Android, iOS, PWA',
    description: 'Enterprise Learning Management System and Parent Portal for M. S. Naz High School. Facilitates student attendance tracking, digital homework diary, marks card publishing, and online fee reconciliation.',
    provider: {
      '@type': ['School', 'EducationalOrganization'],
      '@id': 'https://www.msns.edu.pk/#school',
      name: 'M. S. Naz High School®',
      url: 'https://www.msns.edu.pk',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'G.T. Road, Opposite Model Police Station',
        addressLocality: 'Ghakhar Mandi',
        addressRegion: 'Punjab',
        postalCode: '52200',
        addressCountry: 'PK',
      },
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PKR',
      description: 'Institutional access for enrolled students, parents, and faculty of M. S. Naz High School.',
    },
    featureList: [
      'Real-time student attendance notifications',
      'Daily digital homework & school diary',
      'Term examination report cards and BISE prep evaluation',
      'Digital fee challan download and payment verification',
      'Role-based dashboards for Admin, Teachers, Clerks, and Students',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
