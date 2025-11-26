import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic"
import { INITIAL_THEME_SCRIPT } from "@/lib/theme"

const Banner = dynamic(() => import("@/components/global-ui/banner").then((m) => m.Banner))

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INITIAL_THEME_SCRIPT }} />
        <meta name="apple-mobile-web-app-title" content="Zachary Sturman" />

      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Banner />
        {children}
      </body>
    </html>
  );
}
