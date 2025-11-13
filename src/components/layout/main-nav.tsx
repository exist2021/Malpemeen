
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/firebase';

export function MainNav() {
  const pathname = usePathname();
  const { role } = useUserRole();

  const isCustomerPage = role === 'customer' || pathname.startsWith('/listings');

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
    </nav>
  );
}
