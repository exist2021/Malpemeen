
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'Malpe Meen Pvt Ltd',
  description: 'Connecting fish sellers and customers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased relative",
          fontSans.variable
        )}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-200 via-purple-300 to-pink-300 -z-10" />
        <FirebaseClientProvider>
            {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
