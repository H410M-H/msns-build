import { type PropsWithChildren } from "react";

export const SchoolSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "M. S. NAZ HIGH SCHOOL®",
    url: "https://msns.edu.pk",
    logo: "https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png",
    description: "M.S. Naz High School Learning Management System. Since - 2004 | Developed by MSNS-DEV™",
    address: {
      "@type": "PostalAddress",
      streetAddress: "G.T. Road, Ghakhar Opposite to Model Police station",
      addressLocality: "Ghakhar",
      postalCode: "52200",
      addressCountry: "PK",
    },
    telephone: "+923001234567",
    email: "info@msns.edu.pk",
    sameAs: [
      "https://www.facebook.com/msnaz",
      "https://twitter.com/msnaz",
      "https://www.instagram.com/msnaz",
      "https://www.linkedin.com/company/msnaz",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
