
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { FishListing } from '@/app/types';
import { getFishListings } from '@/app/lib/data';
import { FishCard } from '@/components/fish-card';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';


function ListingsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-xl" />
      ))}
    </div>
  );
}

function FishListings({ portFilter }: { portFilter: string }) {
  const [allListings, setAllListings] = useState<FishListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<FishListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const listingsData = await getFishListings();
      setAllListings(listingsData);
      setLoading(false);
    }
    fetchListings();
  }, []);

  useEffect(() => {
    if (portFilter === 'all') {
      setFilteredListings(allListings);
    } else {
      setFilteredListings(allListings.filter(listing => listing.portDetails === portFilter));
    }
  }, [portFilter, allListings]);


  if (loading) {
    return <ListingsSkeleton />;
  }

  if (!filteredListings || filteredListings.length === 0) {
    return <p className="mt-8 text-center text-muted-foreground">No fish available for the selected port. Check back later!</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredListings.map((listing) => (
        <FishCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}


export default function BuyerDashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [portFilter, setPortFilter] = useState('all');
  
  return (
    <>
    <Header />
    <main className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Available Listings</h1>
            <div className="flex items-center gap-2">
                <Label htmlFor="port-filter" className="text-sm font-medium">Filter by Port:</Label>
                 <Select value={portFilter} onValueChange={setPortFilter}>
                    <SelectTrigger id="port-filter" className="w-[180px]">
                        <SelectValue placeholder="Select a port" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Ports</SelectItem>
                        <SelectItem value="Malpe Port">Malpe Port</SelectItem>
                        <SelectItem value="Mangalore Port">Mangalore Port</SelectItem>
                        <SelectItem value="Kochi Port">Kochi Port</SelectItem>
                        <SelectItem value="Hyderabad Port">Hyderabad Port</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <FishListings portFilter={portFilter} />
    </main>
    </>
  );
}
