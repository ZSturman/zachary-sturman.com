import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic"
import { INITIAL_THEME_SCRIPT } from "@/lib/theme"
import { BreadcrumbProvider } from "@/lib/breadcrumb-context"

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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta
          name="description"
          content="Zachary Sturman. I think a lot about how design influences trust, and how AI can support human judgment instead of replacing it."
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <BreadcrumbProvider>
          <Banner />
          {children}
        </BreadcrumbProvider>
      </body>
    </html>
  );
}
