import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const robotoHeading = Roboto({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

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
    default: "Nova Chat",
    template: "%s | Nova Chat",
  },
  description:
    "Nova Chat is a polished AI workspace for fast, focused conversations with selectable language models, persistent threads, and a premium chat experience.",
  applicationName: "Nova Chat",
  keywords: [
    "Nova Chat",
    "AI chat",
    "T3 chat clone",
    "OpenRouter",
    "Claude",
    "workspace chat",
  ],
  authors: [{ name: "Nova Chat" }],
  creator: "Nova Chat",
  publisher: "Nova Chat",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: "Nova Chat",
    description:
      "A premium AI chat workspace with persistent threads, model selection, and refined dark-mode ergonomics.",
    siteName: "Nova Chat",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Nova Chat",
    description:
      "A premium AI chat workspace with persistent threads and selectable models.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, robotoHeading.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
