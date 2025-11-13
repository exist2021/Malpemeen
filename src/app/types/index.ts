export type Seller = {
    id: string;
    phoneNumber: string;
    name: string;
};

export type Customer = {
    id: string;
    phoneNumber: string;
    name: string;
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
