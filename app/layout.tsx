import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Great_Vibes } from "next/font/google";
import "./globals.css";
import { inviteData } from "@/app/data/invite";

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

// Calligraphy font — used for couple names only
const accentFont = Great_Vibes({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["400"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const { social, couple } = inviteData;

// Update NEXT_PUBLIC_SITE_URL in .env.local once you have a real domain,
// otherwise WhatsApp/social previews will point at localhost.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: social.title,
  description: social.description,
  openGraph: {
    title: social.title,
    description: social.description,
    images: [{ url: social.imagePath }],
    type: "website",
    siteName: `${couple.groomName} & ${couple.brideName}`,
  },
  twitter: {
    card: "summary_large_image",
    title: social.title,
    description: social.description,
    images: [social.imagePath],
  },
};

export const viewport: Viewport = {
  themeColor: social.themeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${accentFont.variable} ${bodyFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
