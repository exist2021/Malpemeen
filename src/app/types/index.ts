
export type Seller = {
    id: string;
    phoneNumber: string;
    name: string;
    email: string;
    address?: string;
    totalViews?: number;
    totalCalls?: number;
    logoUrl?: string;
};

export type Buyer = {
    id: string;
    phoneNumber: string;
    name: string;
    email: string;
    place?: string;
    address?: string;
    photoUrl?: string;
};

export type FishListing = {
    id: string;
    sellerId: string;
    mediaUrls: string[];
    description: string;
    listedDate: string;
    sellerName?: string;
    sellerPhone?: string;
    sellerAddress?: string;
    productName: string;
    pricePerKg?: number;
    portDetails: string;
    howCaught: string;
    boatDetails: 'Ashok Leyland' | 'Persian Boat' | '370-Boat';
    brandName: string;
    viewCount?: number;
    callClickCount?: number;
};
