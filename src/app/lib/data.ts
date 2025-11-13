import type { FishListing } from '@/app/types';
import { unstable_noStore as noStore } from 'next/cache';

// Mock database
const listings: FishListing[] = [
  {
    id: '1',
    sellerName: 'Captain Ahab',
    phone: '123-456-7890',
    description: 'Freshly caught salmon, perfect for grilling.',
    imageUrl: 'https://picsum.photos/seed/salmon/600/400',
  },
  {
    id: '2',
    sellerName: 'Blue Water Fisheries',
    phone: '234-567-8901',
    description: 'High-quality tuna, ideal for sushi.',
    imageUrl: 'https://picsum.photos/seed/tuna/600/400',
  },
  {
    id: '3',
    sellerName: 'The Salty Dog',
    phone: '345-678-9012',
    description: 'Morning catch of mackerel.',
    imageUrl: 'https://picsum.photos/seed/mackerel/600/400',
  },
  {
    id: '4',
    sellerName: 'Ocean Fresh Daily',
    phone: '456-789-0123',
    description: 'Beautifully fresh sardines, great for appetizers.',
    imageUrl: 'https://picsum.photos/seed/sardines/600/400',
  },
];

// In a real app, you'd be interacting with a database.
// To prevent caching during development, we use noStore().
export async function getFishListings(): Promise<FishListing[]> {
  noStore();
  // Simulate network delay to show loading skeletons
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return listings;
}

export async function addFishListing(listing: Omit<FishListing, 'id'>) {
  noStore();
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newListing: FishListing = {
    id: (listings.length + 1).toString() + Date.now(),
    ...listing,
  };
  // Prepend to the list to show the new one first
  listings.unshift(newListing);
  return newListing;
}
