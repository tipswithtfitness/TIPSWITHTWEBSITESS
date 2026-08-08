import type { Metadata } from "next";
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
