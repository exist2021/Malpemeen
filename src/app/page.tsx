import { getFishListings } from '@/app/lib/data';
import { FishCard } from '@/components/fish-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

async function FishListings() {
  const listings = await getFishListings();

  if (!listings || listings.length === 0) {
    return <p className="mt-8 text-center text-muted-foreground">No fish available right now. Check back later!</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <FishCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

function ListingsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3 rounded-lg border bg-card p-4">
          <Skeleton className="h-[192px] w-full rounded-xl" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="pt-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="container py-8">
      <h1 className="mb-8 text-center font-headline text-3xl font-bold tracking-tight">
        Today's Fresh Catch
      </h1>
      <Suspense fallback={<ListingsSkeleton />}>
        <FishListings />
      </Suspense>
    </div>
  );
}
