
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Video, User, Anchor, IndianRupee, Calendar, Package } from 'lucide-react';
import type { FishListing } from '@/app/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface FishCardProps {
  listing: FishListing;
}

const cardColors = [
    'from-blue-500 to-blue-700',
    'from-sky-500 to-sky-700',
    'from-cyan-500 to-cyan-700',
    'from-teal-500 to-teal-700',
];

function CardDetail({ icon: Icon, text }: { icon: React.ElementType, text: React.ReactNode }) {
    if (!text) return null;
    return (
        <div className="flex items-center gap-1.5 text-xs font-medium">
            <Icon className="h-3.5 w-3.5" />
            <span className="truncate">{text}</span>
        </div>
    );
}

export function FishCard({ listing }: FishCardProps) {
  const hasMedia = listing.mediaUrls && Array.isArray(listing.mediaUrls) && listing.mediaUrls.length > 0;
  const firstMedia = hasMedia ? listing.mediaUrls[0] : null;
  const isVideo = firstMedia?.startsWith('data:video');
  const cardColor = cardColors[Math.floor(Math.random() * cardColors.length)];

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <div className={cn(
          "relative h-80 w-full rounded-xl overflow-hidden text-white transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl",
          !firstMedia && cardColor
        )}>
        <div className="relative h-2/3 w-full">
            {firstMedia ? (
                isVideo ? (
                    <video
                        src={firstMedia}
                        muted
                        loop
                        playsInline
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <Image
                        src={firstMedia}
                        alt={listing.productName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        data-ai-hint="fish"
                    />
                )
            ) : null}

            <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent",
            !firstMedia && `bg-gradient-to-br ${cardColor}`
            )}>
                 {isVideo && <Video className="absolute top-2 right-2 h-5 w-5 text-white" />}
            </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/70 backdrop-blur-sm p-3 flex flex-col justify-between">
            <div className="space-y-1.5">
                <h3 className="font-bold text-base uppercase tracking-wide font-headline truncate flex items-center gap-1.5">
                    <User className="h-4 w-4 flex-shrink-0" />
                    {listing.sellerName}
                </h3>
                 <CardDetail icon={Anchor} text={listing.portDetails} />
                 <p className="font-semibold text-sm truncate pt-1">{listing.productName || 'Fresh Fish'}</p>
            </div>
             <div className="flex justify-between items-end text-xs font-medium">
                <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5" />
                    <span>{listing.pricePerKg ? `₹${listing.pricePerKg.toLocaleString()}` : 'Nil'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{listing.listedDate ? format(new Date(listing.listedDate), 'MMM d') : ''}</span>
                </div>
            </div>
          <ArrowRight className="absolute bottom-3 right-3 h-5 w-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </div>
    </Link>
  );
}
