
export type Seller = {
    id: string;
    phoneNumber: string;
    name: string;
    email: string;
    address?: string;
    totalViews?: number;
    totalCalls?: number;
};

export type Customer = {
    id: string;
    phoneNumber: string;
    name: string;
    email: string;
    place?: string;
    address?: string;
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
    pricePerBox: number;
    portDetails: string;
    caughtBy: string;
    howCaught: string;
    boatDetails: 'Ashok Leyland' | 'Persian Boat';
    owner: string;
    brandName: string;
    viewCount?: number;
    callClickCount?: number;
};



