
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useUserRole } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { role, isRoleLoading } = useUserRole();
  const auth = useAuth();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
      router.push('/');
    }
  };

  const isCustomerPage = pathname.startsWith('/customer') || pathname.startsWith('/listings');

  const routes = [
    { href: '/', label: 'Home' },
    ...(!isCustomerPage ? [{ href: '/sell', label: 'Sell Fish' }] : [])
  ];

  return (
    <nav className="flex w-full items-center justify-between">
      <div className="hidden gap-6 md:flex">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm',
              pathname === route.href ? 'text-foreground' : 'text-foreground/60'
            )}
          >
            {route.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
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
      </div>
    </nav>
  );
}
