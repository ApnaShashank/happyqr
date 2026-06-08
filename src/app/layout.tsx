import type { Metadata } from "next";
import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "HappyQR — Free QR Code Generator with Logo, Custom Design & SVG",
    template: "%s | HappyQR — QR Code Generator",
  },
  description:
    "HappyQR is a free online QR code generator. Create custom QR codes with logo, colors, shapes, WiFi, vCard, PDF & audio. Download PNG (up to 2048px) or vector SVG. Bulk generate 100 QR codes at once. No signup required.",
  keywords: [
    "qr code generator",
    "free qr code generator",
    "custom qr code",
    "qr code with logo",
    "qr code maker",
    "create qr code",
    "qr code design",
    "qr code online",
    "bulk qr code generator",
    "qr code svg",
    "qr code png",
    "wifi qr code",
    "vcard qr code",
    "qr code for url",
    "qr code for website",
    "qr code art",
    "qr code color",
    "qr code frame",
    "qr code download",
    "qr generator free",
    "dynamic qr code",
    "qr code creator",
    "scan qr code",
    "qr code no watermark",
    "best qr code generator",
    "happyqr",
    "qr code for business",
    "qr code for restaurant menu",
    "qr code for marketing",
    "printable qr code",
  ],
  authors: [{ name: "HappyQR" }],
  creator: "HappyQR",
  publisher: "HappyQR",
  category: "technology",
  applicationName: "HappyQR",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://happyqr.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://happyqr.vercel.app",
    siteName: "HappyQR",
    title: "HappyQR — Free QR Code Generator with Logo & Custom Design",
    description:
      "Create stunning, custom QR codes with logo, colors, and shapes. Free online tool — no signup needed. Download in PNG or SVG. Bulk generate 100 QR codes instantly.",
    images: [
      {
        url: "/logo.png",
        alt: "HappyQR — Free Custom QR Code Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@happyqr",
    creator: "@happyqr",
    title: "HappyQR — Free QR Code Generator with Logo & Custom Design",
    description:
      "Create stunning custom QR codes with logo, colors & shapes. Bulk generate 100 QR codes. Download PNG or SVG free.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://happyqr.vercel.app",
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://happyqr.vercel.app/#website",
      url: "https://happyqr.vercel.app",
      name: "HappyQR",
      description:
        "Free online QR code generator with logo, custom colors, shapes, bulk generation and SVG export.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://happyqr.vercel.app/?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://happyqr.vercel.app/#app",
      name: "HappyQR",
      url: "https://happyqr.vercel.app",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free to use with premium features available",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "1247",
        bestRating: "5",
        worstRating: "1",
      },
      featureList: [
        "Custom QR Code Design",
        "Logo Embedding",
        "Bulk QR Code Generation",
        "SVG and PNG Export",
        "WiFi QR Codes",
        "vCard QR Codes",
        "PDF and Audio Hosting",
        "QR Code Frames",
        "Color Gradients",
        "No Watermark",
        "No Signup Required",
      ],
      screenshot: "https://happyqr.vercel.app/logo.png",
      author: {
        "@type": "Organization",
        name: "HappyQR",
        url: "https://happyqr.vercel.app",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://happyqr.vercel.app/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is HappyQR completely free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! HappyQR is free to use with generous daily limits. You can generate custom QR codes with logo, colors, and shapes without any signup. Create a free account for extended limits or upgrade to Pro for unlimited generation.",
          },
        },
        {
          "@type": "Question",
          name: "Do QR codes generated with HappyQR expire?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "QR codes generated by HappyQR are static — they encode data directly into the pattern and never expire. They will work as long as a QR scanner is used to read them.",
          },
        },
        {
          "@type": "Question",
          name: "Can I add a logo or image to my QR code?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! HappyQR lets you embed any custom logo or branding image at the center of your QR code with adjustable size, padding, and corner radius. The Error Correction Level is automatically set to High (H) to ensure the QR code remains scannable.",
          },
        },
        {
          "@type": "Question",
          name: "What formats can I download my QR code in?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can download your QR code as a high-resolution PNG (up to 2048×2048px) or as a scalable vector SVG that is perfect for professional printing. Both formats are free.",
          },
        },
        {
          "@type": "Question",
          name: "Can I generate QR codes in bulk?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! Use the Bulk Generate feature to upload a list of URLs or data and generate up to 100 QR codes simultaneously. All files can be downloaded at once in a zip archive.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="color-scheme" content="dark light" />
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('happyqr_theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        <div className="app-wrapper">
          {children}
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
