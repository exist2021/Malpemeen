export type Seller = {
    id: string;
    phoneNumber: string;
    name: string;
    email: string;
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
    photoUrls: string[];
    description: string;
    listedDate: string;
    sellerName?: string;
    sellerPhone?: string;
};
