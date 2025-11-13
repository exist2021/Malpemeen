
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { FishListing } from '@/app/types';
import { cn } from '@/lib/utils';

interface FishCardProps {
  listing: FishListing;
}

const cardColors = [
    'from-blue-500 to-blue-700',
    'from-sky-500 to-sky-700',
    'from-cyan-500 to-cyan-700',
    'from-teal-500 to-teal-700',
];

export function FishCard({ listing }: FishCardProps) {
  const hasPhotos = listing.photoUrls && Array.isArray(listing.photoUrls) && listing.photoUrls.length > 0;
  const cardColor = cardColors[Math.floor(Math.random() * cardColors.length)];

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <div className={cn(
          "relative h-64 w-full rounded-xl overflow-hidden text-white transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl",
          !hasPhotos && cardColor
        )}>
        {hasPhotos ? (
          <Image
            src={listing.photoUrls[0]}
            alt={listing.description}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint="fish"
          />
        ) : null}

        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 flex flex-col justify-end",
           hasPhotos ? "" : `bg-gradient-to-br ${cardColor}`
        )}>
          <div className="space-y-1">
            <h3 className="font-bold text-xl uppercase tracking-wide font-headline">{listing.sellerName || 'Fresh Fish'}</h3>
            <p className="text-base line-clamp-2 font-normal font-body">{listing.description}</p>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-6 w-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </div>
    </Link>
  );
}
