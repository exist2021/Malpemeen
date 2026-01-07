
'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { addFishListing, updateFishListing } from '@/app/lib/data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useSellerProfile, useStorage } from '@/firebase';
import { useRouter } from 'next/navigation';
import type { FishListing } from '@/app/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';


interface SellerFormProps {
    listing?: FishListing | null;
    formState: {
        productName: string;
        pricePerKg: string;
        countPerKg: string;
        totalQuantityInTons: string;
        boatDetails: FishListing['boatDetails'] | '';
        portDetails: FishListing['portDetails'];
        mediaUrls: string[];
        videoUrl: string;
    };
    setFormState: {
        setProductName: (value: string) => void;
        setPricePerKg: (value: string) => void;
        setCountPerKg: (value: string) => void;
        setTotalQuantityInTons: (value: string) => void;
        setBoatDetails: (value: FishListing['boatDetails'] | '') => void;
        setPortDetails: (value: FishListing['portDetails']) => void;
        setMediaUrls: (value: string[] | ((prev: string[]) => string[])) => void;
        setVideoUrl: (value: string) => void;
    };
}

const FISH_NAMES = [
  "Bangude (mackerel)",
  "Buthai ( sardine )",
  "Anjal(king fish)",
  "Kedar( tuna )",
  "Yedi (crab)",
  "Manji(pomfret)",
  "Nang(sole fish )",
  "Koddai ( Crocker)",
  "Melu ( butter fish )"
];

export function SellerForm({ listing, formState, setFormState }: SellerFormProps) {
  const { toast } = useToast();
  const {
    productName, pricePerKg, countPerKg, totalQuantityInTons, boatDetails, portDetails, mediaUrls, videoUrl
  } = formState;
  const {
    setProductName, setPricePerKg, setCountPerKg, setTotalQuantityInTons, setBoatDetails, setPortDetails, setMediaUrls, setVideoUrl
  } = setFormState;

  const { user, isUserLoading } = useUser();
  const { profile: sellerProfile, isLoading: isSellerProfileLoading } = useSellerProfile();
  const storage = useStorage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!listing;

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/seller/login');
    }
  }, [user, isUserLoading, router]);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          // Store the file object for later upload
          setImageFiles(prev => [...prev, file]);
          
          // Create a local URL for immediate preview
          const previewUrl = URL.createObjectURL(file);
          setMediaUrls(prev => [...prev, previewUrl]);
      }
  };

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          console.log("Video file selected:", file.name, file.size, file.type);
          setVideoFile(file);
          setVideoUrl(URL.createObjectURL(file));
      }
  };

  const removeMedia = (urlToRemove: string, index: number) => {
    // If it's a local object URL, find and remove the corresponding file
    if (urlToRemove.startsWith('blob:')) {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    }
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  }

  const removeVideo = () => {
      setVideoUrl('');
      setVideoFile(null);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted. User:", user?.uid, "SellerProfile:", sellerProfile?.id);
    if (!user || !sellerProfile) {
        console.error("User or seller profile missing");
        return;
    }

    setIsUploading(true);

    startTransition(async () => {
      try {
        let finalVideoUrl = videoUrl;
        let finalMediaUrls = [...mediaUrls];

        if (!storage) throw new Error("Storage service not available");

        // 1. Handle Image Uploads
        const uploadedImageUrls: string[] = [];
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const storagePath = `listings/${user.uid}/images/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, storagePath);
            console.log(`Uploading image ${i+1}/${imageFiles.length}:`, file.name);
            
            const snapshot = await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            uploadedImageUrls.push(downloadUrl);
        }

        // Replace local blob URLs with remote storage URLs
        // Note: This logic assumes new images were appended. 
        // A cleaner way is to separate existing URLs from new files.
        finalMediaUrls = [
            ...mediaUrls.filter(url => !url.startsWith('blob:')),
            ...uploadedImageUrls
        ];

        // 2. Handle Video Upload
        if (videoFile) {
            try {
                console.log("Starting video upload for file:", videoFile.name, "size:", videoFile.size);
                const storagePath = `listings/${user.uid}/videos/${Date.now()}_${videoFile.name}`;
                const storageRef = ref(storage, storagePath);
                
                console.log("Calling uploadBytes for video...");
                const uploadPromise = uploadBytes(storageRef, videoFile);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Video upload timed out (120s)")), 120000)
                );

                const snapshot = await Promise.race([uploadPromise, timeoutPromise]) as any;
                finalVideoUrl = await getDownloadURL(snapshot.ref);
                console.log("Video upload successful. URL:", finalVideoUrl);
            } catch (err: any) {
                console.error("Video upload failed:", err);
                finalVideoUrl = ""; 
                toast({
                    variant: "destructive",
                    title: "Video upload failed",
                    description: err.message || "Listing created without video."
                });
            }
        }

        const listingData = {
          productName,
          boatDetails: boatDetails as any,
          mediaUrls: finalMediaUrls,
          videoUrl: finalVideoUrl,
          pricePerKg: Number(pricePerKg) || 0,
          countPerKg: countPerKg ? Number(countPerKg) : undefined,
          totalQuantityInTons: Number(totalQuantityInTons) || 0,
          portDetails,
        };

        console.log("Saving listing data to Firestore...");

        if (isEditMode && listing) {
            await updateFishListing(listing.id, listingData);
        } else {
            await addFishListing({ ...listingData, sellerId: user.uid });
        }
        
        console.log("Listing saved successfully");
        setIsUploading(false);
        router.push('/seller/dashboard');
        
      } catch (error: any) {
        setIsUploading(false);
        console.error("SUBMISSION ERROR:", error);
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
    });
  };
  
  if (isUserLoading || isSellerProfileLoading || !user) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-8">
      <input type="file" accept="image/*" capture="environment" ref={photoInputRef} className="hidden" onChange={handlePhotoCapture} />
      <input type="file" accept="video/*" capture="environment" ref={videoInputRef} className="hidden" onChange={handleVideoFile} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        <div className="space-y-2 md:col-span-2">
            <Label htmlFor="productName">Product Name</Label>
            <Select value={productName} onValueChange={(value) => setProductName(value)} required>
              <SelectTrigger id="productName">
                <SelectValue placeholder="Select fish name" />
              </SelectTrigger>
              <SelectContent>
                {FISH_NAMES.map(fish => (
                  <SelectItem key={fish} value={fish}>{fish}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="portDetails">Port</Label>
            <Select value={portDetails} onValueChange={(value) => setPortDetails(value as any)} required>
              <SelectTrigger id="portDetails"><SelectValue placeholder="Select a port" /></SelectTrigger>
              <SelectContent>
                {["Malpe Port", "Mangalore Port", "Kochi Port", "Hyderabad Port"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
            <Label htmlFor="boatDetails">Boat Details</Label>
            <Select value={boatDetails} onValueChange={(value) => setBoatDetails(value as any)} required>
              <SelectTrigger id="boatDetails"><SelectValue placeholder="Select a boat type" /></SelectTrigger>
              <SelectContent>
                {["Ashok Leyland", "Persian Boat", "370-Boat"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="totalQuantityInTons">Quantity (Tons)</Label>
            <Input id="totalQuantityInTons" type="number" value={totalQuantityInTons} onChange={(e) => setTotalQuantityInTons(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="pricePerKg">Price Per Kg (₹)</Label>
            <Input id="pricePerKg" type="number" value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="countPerKg">Count Per Kg (Optional)</Label>
            <Input id="countPerKg" type="number" value={countPerKg} onChange={(e) => setCountPerKg(e.target.value)} placeholder="e.g. 10" />
        </div>
      </div>
      
      <div className="space-y-4">
        <Label>Photos & Video</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {mediaUrls.map((url, index) => (
                <div key={index} className="relative aspect-square">
                   <Image src={url} alt="Product" fill className="rounded-md object-cover" />
                   <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeMedia(url, index)}><X className="h-4 w-4" /></Button>
                </div>
            ))}
            {videoUrl && (
                <div className="relative aspect-square">
                    <video key={videoUrl} src={videoUrl} className="w-full h-full object-cover rounded-md" controls playsInline />
                    <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={removeVideo}><X className="h-4 w-4" /></Button>
                </div>
            )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Button type="button" variant="outline" onClick={() => photoInputRef.current?.click()} className="w-full h-12"><Camera className="mr-2 h-4 w-4" /> Photo</Button>
          <Button type="button" variant="outline" onClick={() => videoInputRef.current?.click()} className="w-full h-12"><Video className="mr-2 h-4 w-4" /> Video</Button>
        </div>
      </div>

      <Button type="submit" disabled={isPending || isUploading} className="w-full h-14 text-xl font-bold">
        {isUploading ? <><Loader2 className="animate-spin mr-2" /> Saving Listing...</> : (isEditMode ? 'Update Listing' : 'List My Catch')}
      </Button>
    </form>
  );
}
