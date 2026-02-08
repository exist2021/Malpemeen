
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { I18nProvider } from '@/i18n/context';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'Malpe Meen Pvt Ltd',
  description: 'Connecting fish sellers and buyers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <link rel="icon" href="https://tse2.mm.bing.net/th/id/OIP.Z9Udy9KlCjCj4DbHwtLGTowHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased relative",
          fontSans.variable
        )}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalScrollIntoView = Element.prototype.scrollIntoView;
                Element.prototype.scrollIntoView = function(options) {
                  if (options && typeof options === 'object' && options.behavior === 'smooth') {
                    originalScrollIntoView.call(this, { ...options, behavior: 'instant' });
                  } else {
                    originalScrollIntoView.apply(this, arguments);
                  }
                };
              })();
            `,
          }}
        />
        <I18nProvider>
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
        </I18nProvider>
        <Toaster />
      </body>
    </html>
  );
}
