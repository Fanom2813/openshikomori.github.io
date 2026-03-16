import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  pathname?: string;
  lang?: string;
}

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
];

export function SEO({
  title,
  description,
  keywords,
  pathname = "",
  lang = "en",
}: SEOProps) {
  const siteTitle = "OpenShikomori";
  const defaultDescription =
    "Open-source AI models and speech dataset for the Shikomori language. Preserving Comorian heritage through fine-tuned LLMs and Whisper speech recognition.";
  const baseUrl = "https://open-shikomori.github.io";
  const fullUrl = pathname ? `${baseUrl}/#/${pathname}` : baseUrl;

  const pageTitle = title
    ? `${title} | ${siteTitle}`
    : `${siteTitle} - Shikomori Language AI Models & Dataset`;
  const pageDescription = description || defaultDescription;

  const localeMap: Record<string, string> = {
    en: "en_US",
    fr: "fr_FR",
    ar: "ar_AR",
  };

  return (
    <Helmet>
      <html lang={lang} />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullUrl} />

      {/* Hreflang tags for multilingual SEO */}
      {languages.map((lng) => (
        <link
          key={lng.code}
          rel="alternate"
          hrefLang={lng.code}
          href={pathname ? `${baseUrl}/#/${lng.code}/${pathname}` : `${baseUrl}/#/${lng.code}/`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:locale" content={localeMap[lang] || "en_US"} />
      {languages
        .filter((l) => l.code !== lang)
        .map((lng) => (
          <meta
            key={lng.code}
            property="og:locale:alternate"
            content={localeMap[lng.code]}
          />
        ))}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={pageDescription} />
    </Helmet>
  );
}
