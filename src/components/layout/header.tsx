
'use client';
import Link from 'next/link';
import { MainNav } from '@/components/layout/main-nav';
import { Button } from '@/components/ui/button';
import { useUser, useAuth, useUserRole } from '@/firebase';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User as UserIcon } from 'lucide-react';
import { FishLogo } from '../fish-logo';
import { Skeleton } from '../ui/skeleton';


export function Header() {
  const { user, isUserLoading } = useUser();
  const { role, isRoleLoading } = useUserRole();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
      // We don't know if they were a customer or seller, so redirect to the generic role selection page.
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <FishLogo className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold">Malpe Meen Pvt Ltd</span>
          </Link>
          <MainNav />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            {isUserLoading ? (
              <Skeleton className="h-10 w-24 rounded-md" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <UserIcon className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isRoleLoading ? (
                     <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                  ): (
                    <>
                      {role === 'customer' && <DropdownMenuItem onClick={() => router.push('/customer/dashboard')}>Customer Dashboard</DropdownMenuItem>}
                      {role === 'seller' && <DropdownMenuItem onClick={() => router.push('/seller/dashboard')}>Seller Dashboard</DropdownMenuItem>}
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>Login</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push('/customer/login')}>
                    Customer Login
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/seller/login')}>
                    Seller Login
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
