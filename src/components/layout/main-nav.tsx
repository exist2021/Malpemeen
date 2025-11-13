
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MainNav() {
  const pathname = usePathname();

  // Hide the 'Sell Fish' link on customer-facing pages
  const isCustomerPage = pathname.startsWith('/customer') || pathname.startsWith('/listings');

  const routes = [
    { href: '/', label: 'Home' },
    ...(!isCustomerPage ? [{ href: '/sell', label: 'Sell Fish' }] : [])
  ];

  return (
    <nav className="hidden gap-6 md:flex">
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
    </nav>
  );
}
