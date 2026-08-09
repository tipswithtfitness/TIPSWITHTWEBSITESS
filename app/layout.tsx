import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Tips With T",
    template: "%s | Tips With T",
  },
  description:
    "Tips With T offers sprinting, athletic training, fitness coaching, nutrition guidance, and personalized training plans.",
  applicationName: "Tips With T",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Tips With T",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Tips With T",
    description:
      "Sprinting, athletic training, fitness coaching, nutrition guidance, and personalized training plans.",
    siteName: "Tips With T",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tips With T",
    description:
      "Sprinting, athletic training, fitness coaching, nutrition guidance, and personalized training plans.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#020713",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
