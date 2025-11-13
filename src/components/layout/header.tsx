
'use client';
import Link from 'next/link';
import { MainNav } from '@/components/layout/main-nav';
import { FishLogo } from '../fish-logo';

export function Header() {
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
      </div>
    </header>
  );
}
