import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { FishLogo } from '@/components/fish-logo';
import { LayoutDashboard, Fish, ShoppingCart } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';


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
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <FirebaseClientProvider>
          <SidebarProvider>
            <Sidebar variant="floating" collapsible="icon">
              <SidebarContent>
                <div className="p-2">
                  <FishLogo className="size-8 text-primary" />
                </div>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/customer/dashboard" tooltip="Dashboard">
                      <LayoutDashboard />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                     <SidebarMenuButton href="/seller/dashboard" tooltip="My Listings">
                        <Fish />
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/sell" tooltip="Sell Fish">
                      <ShoppingCart />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <AppHeader />
                {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
