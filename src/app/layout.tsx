import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CRM Gamificado Ultracem | Ventas B2B",
  description: "Plataforma empresarial PWA para fuerza comercial, supervisión y gerencia de Ultracem S.A.S.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/favicon.jpg",
    shortcut: "/images/favicon.jpg",
    apple: "/images/favicon.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#003E78",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${montserrat.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F4F6F9] text-[#003E78] antialiased">
        {children}
      </body>
    </html>
  );
}
