import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReactQueryProvider } from "@/lib/react-query";
import ProjectHeader from "@/components/ProjectHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Aither — Plataforma de Monitorización Clínica",
    template: "%s | Aither",
  },
  description:
    "Aither — Plataforma para monitorizar pacientes en tiempo real, con visualizaciones clínicas, alertas y gestión de casos.",
  applicationName: "Aither",
  authors: [{ name: "Aither Team", url: "https://example.com" }],
  // themeColor and viewport are exported separately below to satisfy Next.js app router
  icons: {
    icon: [
      { url: "/favicon-medical.svg" },
      { url: "/icons/medical-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/medical-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    shortcut: "/favicon-medical.svg",
    apple: "/icons/apple-touch-icon.svg",
  },
  openGraph: {
    title: "Aither — Plataforma de Monitorización Clínica",
    description:
      "Monitorización clínica en tiempo real con alertas, paneles interactivos y gestión de pacientes.",
    url: "https://example.com",
    siteName: "Aither",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Aither — Monitor de Pacientes",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aither — Plataforma de Monitorización Clínica",
    description:
      "Monitorización clínica en tiempo real con alertas, paneles interactivos y gestión de pacientes.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <AuthProvider>
            <ProjectHeader />
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

// Export viewport and themeColor separately to avoid unsupported metadata warnings from Next.js
export const viewport = { width: "device-width", initialScale: 1 };

// Light mode theme color
export const themeColor = "#f8fafc";
