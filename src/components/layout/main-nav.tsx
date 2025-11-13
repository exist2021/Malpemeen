
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const routes = [
  { href: '/', label: 'Home' },
  { href: '/sell', label: 'Sell Fish' },
];

export function MainNav() {
  const pathname = usePathname();

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
