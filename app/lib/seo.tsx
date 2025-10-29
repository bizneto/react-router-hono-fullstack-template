export type SEOData = {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
};

export function generateMetaTags(data: SEOData, url: string) {
  const siteName = "AquaTrans - Beczkowozy na wodę";
  const defaultImage = `${url}/og-image.jpg`;

  return [
    // Basic meta tags
    { title: `${data.title} | ${siteName}` },
    { name: "description", content: data.description },
    ...(data.keywords ? [{ name: "keywords", content: data.keywords }] : []),

    // Open Graph
    { property: "og:title", content: data.title },
    { property: "og:description", content: data.description },
    { property: "og:type", content: data.ogType || "website" },
    { property: "og:url", content: data.canonicalUrl || url },
    { property: "og:image", content: data.ogImage || defaultImage },
    { property: "og:site_name", content: siteName },
    { property: "og:locale", content: "pl_PL" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: data.title },
    { name: "twitter:description", content: data.description },
    { name: "twitter:image", content: data.ogImage || defaultImage },

    // Additional
    { name: "robots", content: "index, follow" },
    { name: "language", content: "Polish" },
    { name: "author", content: "AquaTrans" },
  ];
}

export function generateProductSchema(product: any, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "PLN",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: url,
    },
    brand: {
      "@type": "Brand",
      name: "AquaTrans",
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AquaTrans",
    description: "Profesjonalne beczkowozy do wody pitnej",
    url: "https://aquatrans.pl",
    logo: "https://aquatrans.pl/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+48-123-456-789",
      contactType: "customer service",
      areaServed: "PL",
      availableLanguage: "Polish",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "ul. Wodna 123",
      addressLocality: "Warszawa",
      postalCode: "00-001",
      addressCountry: "PL",
    },
  };
}
