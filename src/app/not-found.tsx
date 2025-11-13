
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FishLogo } from '@/components/fish-logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex items-center divide-x divide-border">
        <h1 className="pr-4 text-2xl font-bold tracking-tight text-foreground">404</h1>
        <p className="pl-4 text-muted-foreground">This page could not be found.</p>
      </div>
      <Button asChild variant="link" className="mt-8">
        <Link href="/">Return Home</Link>
      </Button>

       <div className="absolute bottom-4 left-4">
          <Link href="/" className="flex items-center space-x-2">
            <FishLogo className="h-8 w-8 text-primary" />
          </Link>
        </div>
    </div>
  );
}
