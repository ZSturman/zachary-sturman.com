import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic"
import { INITIAL_THEME_SCRIPT } from "@/lib/theme"

const Banner = dynamic(() => import("@/components/banner").then((m) => m.Banner))

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
  // Parallel slot for modals. When an intercepted route mounts into the
  // `@modal` slot, Next will pass it here as the `modal` prop. The framework
  // expects this prop to exist on the layout type, so we declare it as
  // required here to match the generated `LayoutProps`.
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INITIAL_THEME_SCRIPT }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Banner />
        {children}
        {/* Modal parallel slot — when an intercepted modal route is active it will
            render into this slot. The default slot component returns null so the
            modal is closed on hard refresh. */}
        {modal}
      </body>
    </html>
  );
}
