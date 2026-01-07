
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
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
import { Switch } from '@/components/ui/switch';


function ListingsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-80 w-full rounded-xl" />
      ))}
    </div>
  );
}

function FishListings({ portFilter, sellerFilter, fishTypeFilter, showWithCountOnly }: { portFilter: string, sellerFilter: string, fishTypeFilter: string, showWithCountOnly: boolean }) {
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
    let listings = allListings;

    if (portFilter !== 'all') {
      listings = listings.filter(listing => listing.portDetails === portFilter);
    }

    if (sellerFilter !== 'all') {
      listings = listings.filter(listing => listing.sellerId === sellerFilter);
    }

    if (fishTypeFilter !== 'all') {
      listings = listings.filter(listing => listing.productName === fishTypeFilter);
    }

    if (showWithCountOnly) {
      listings = listings.filter(listing => listing.countPerKg !== undefined && listing.countPerKg !== null);
    }

    setFilteredListings(listings);
  }, [portFilter, sellerFilter, fishTypeFilter, showWithCountOnly, allListings]);


  if (loading) {
    return <ListingsSkeleton />;
  }

  if (!filteredListings || filteredListings.length === 0) {
    return <p className="mt-8 text-center text-muted-foreground">No fish available for the selected filters. Check back later!</p>;
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
  const [portFilter, setPortFilter] = useState('Malpe Port');
  const [sellerFilter, setSellerFilter] = useState('all');
  const [fishTypeFilter, setFishTypeFilter] = useState('all');
  const [showWithCountOnly, setShowWithCountOnly] = useState(false);

  // This state will hold all listings to derive sellers and fish types from
  const [allListings, setAllListings] = useState<FishListing[]>([]);
  
  useEffect(() => {
    // We only need to fetch this once for the filter logic
    getFishListings().then(setAllListings);
  }, []);

  // Memoize the calculation of available sellers
  const availableSellers = useMemo(() => {
    let listingsForSellers = allListings;
    if (portFilter !== 'all') {
        listingsForSellers = allListings.filter(l => l.portDetails === portFilter);
    }
    
    const sellersMap = new Map<string, string>();
    listingsForSellers.forEach(listing => {
        if (listing.sellerId && listing.sellerName) {
            sellersMap.set(listing.sellerId, listing.sellerName);
        }
    });

    return Array.from(sellersMap.entries()).map(([id, name]) => ({ id, name }));
  }, [portFilter, allListings]);

  // Memoize the calculation of available fish types
  const availableFishTypes = useMemo(() => {
    let listingsForFish = allListings;
    if (portFilter !== 'all') {
        listingsForFish = allListings.filter(l => l.portDetails === portFilter);
    }
    
    const typesSet = new Set<string>();
    listingsForFish.forEach(listing => {
        if (listing.productName) {
            typesSet.add(listing.productName);
        }
    });

    return Array.from(typesSet).sort();
  }, [portFilter, allListings]);

  // When port filter changes, reset other filters
  const handlePortChange = (value: string) => {
    setPortFilter(value);
    setSellerFilter('all');
    setFishTypeFilter('all');
  }

  return (
    <>
    <Header />
    <main className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Available Listings</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-lg">
                    <Switch 
                        id="count-filter" 
                        checked={showWithCountOnly} 
                        onCheckedChange={setShowWithCountOnly} 
                    />
                    <Label htmlFor="count-filter" className="text-sm font-medium cursor-pointer">Show with Count/Kg only</Label>
                </div>
                <div className="flex w-full items-center gap-2">
                    <Label htmlFor="port-filter" className="text-sm font-medium">Port:</Label>
                    <Select value={portFilter} onValueChange={handlePortChange}>
                        <SelectTrigger id="port-filter" className="w-full">
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
                <div className="flex w-full items-center gap-2">
                    <Label htmlFor="fish-filter" className="text-sm font-medium whitespace-nowrap">Fish Type:</Label>
                    <Select value={fishTypeFilter} onValueChange={setFishTypeFilter} disabled={availableFishTypes.length === 0}>
                        <SelectTrigger id="fish-filter" className="w-full">
                            <SelectValue placeholder="All Fish" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Fish</SelectItem>
                            {availableFishTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="flex w-full items-center gap-2">
                    <Label htmlFor="seller-filter" className="text-sm font-medium">Seller:</Label>
                    <Select value={sellerFilter} onValueChange={setSellerFilter} disabled={availableSellers.length === 0}>
                        <SelectTrigger id="seller-filter" className="w-full">
                            <SelectValue placeholder="Select a seller" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sellers</SelectItem>
                            {availableSellers.map(seller => (
                                <SelectItem key={seller.id} value={seller.id}>{seller.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
        <FishListings 
            portFilter={portFilter} 
            sellerFilter={sellerFilter} 
            fishTypeFilter={fishTypeFilter}
            showWithCountOnly={showWithCountOnly} 
        />
    </main>
    </>
  );
}
