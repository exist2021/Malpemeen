
'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { addFishListing, updateFishListing } from '@/app/lib/data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X, Upload, Video, CameraIcon, Circle, Check, Anchor, Copyright } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useSellerProfile } from '@/firebase';
import { useRouter } from 'next/navigation';
import type { FishListing } from '@/app/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


interface SellerFormProps {
    listing?: FishListing | null;
    formState: {
        productName: string;
        pricePerKg: string;
        totalQuantityInTons: string;
        boatDetails: FishListing['boatDetails'] | '';
        mediaUrls: string[];
    };
    setFormState: {
        setProductName: (value: string) => void;
        setPricePerKg: (value: string) => void;
        setTotalQuantityInTons: (value: string) => void;
        setBoatDetails: (value: FishListing['boatDetails'] | '') => void;
        setMediaUrls: (value: string[] | ((prev: string[]) => string[])) => void;
    };
}

function CameraCaptureDialog({ open, onOpenChange, onMediaCaptured }: { open: boolean, onOpenChange: (open: boolean) => void, onMediaCaptured: (url: string) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        let stream: MediaStream | null = null;
        
        const getCameraPermission = async () => {
            if (!open || !navigator.mediaDevices) return;
            try {
                // Request the rear-facing camera first
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing rear camera, trying default:', error);
                // Fallback to default camera if environment is not available
                 try {
                     stream = await navigator.mediaDevices.getUserMedia({ video: true });
                     setHasCameraPermission(true);
                     if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                     }
                 } catch (finalError) {
                    console.error('Error accessing any camera:', finalError);
                    setHasCameraPermission(false);
                    toast({
                        variant: 'destructive',
                        title: 'Camera Access Denied',
                        description: 'Please enable camera permissions in your browser settings.',
                    });
                 }
            }
        };

        getCameraPermission();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [open, toast]);

    const handleCapturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                onMediaCaptured(canvas.toDataURL('image/jpeg'));
                onOpenChange(false);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Live Capture</DialogTitle>
                    <DialogDescription>
                        Capture a photo of your product.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                     <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                         {!hasCameraPermission && (
                             <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/80 text-white p-4">
                                 <CameraIcon className="h-10 w-10 mb-4" />
                                 <p className="text-center">Waiting for camera permission...</p>
                                 <p className="text-xs text-muted-foreground mt-2 text-center">Please allow camera access when prompted by your browser.</p>
                             </div>
                        )}
                    </div>
                    {!hasCameraPermission && open && (
                        <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access in your browser to use this feature.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
                <DialogFooter>
                     <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="button" onClick={handleCapturePhoto} disabled={!hasCameraPermission}>
                        <CameraIcon className="mr-2 h-4 w-4" /> Capture Photo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export function SellerForm({ listing, formState, setFormState }: SellerFormProps) {
  const { toast } = useToast();
  const {
    productName, pricePerKg, totalQuantityInTons, boatDetails, mediaUrls
  } = formState;
  const {
    setProductName, setPricePerKg, setTotalQuantityInTons, setBoatDetails, setMediaUrls
  } = setFormState;

  const [errors, setErrors] = useState<Partial<Record<keyof Omit<FishListing, 'id' | 'sellerId' | 'listedDate'>, string[]>>>({});
  const { user, isUserLoading } = useUser();
  const { profile: sellerProfile, isLoading: isSellerProfileLoading } = useSellerProfile();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!listing;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/seller/login');
    }

    if (isEditMode && listing) {
        setProductName(listing.productName || '');
        setPricePerKg(listing.pricePerKg ? String(listing.pricePerKg) : '');
        setTotalQuantityInTons(listing.totalQuantityInTons ? String(listing.totalQuantityInTons) : '');
        setBoatDetails(listing.boatDetails || '');
        setMediaUrls(listing.mediaUrls || []);
    } else if (!isEditMode) {
        // Reset form for new listing
        setProductName('');
        setPricePerKg('');
        setTotalQuantityInTons('');
        setBoatDetails('');
        setMediaUrls([]);
    }

  }, [user, isUserLoading, router, isEditMode, listing, setProductName, setPricePerKg, setTotalQuantityInTons, setBoatDetails, setMediaUrls]);


  const removeMedia = (urlToRemove: string) => {
    setMediaUrls(prev => prev.filter(url => url !== urlToRemove));
  }


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !sellerProfile) {
      toast({ variant: 'destructive', title: 'You must be logged in and have a complete profile.' });
      return;
    }

    const newErrors: any = {};
    if (!productName) newErrors.productName = ['Product Name is required.'];
    if (pricePerKg && (isNaN(Number(pricePerKg)) || Number(pricePerKg) < 0)) newErrors.pricePerKg = ['Please enter a valid price.'];
    if (totalQuantityInTons && (isNaN(Number(totalQuantityInTons)) || Number(totalQuantityInTons) <= 0)) newErrors.totalQuantityInTons = ['Please enter a valid quantity.'];
    if (!boatDetails) newErrors.boatDetails = ['Please select a boat.'];
    if (mediaUrls.length === 0) newErrors.mediaUrls = ['Please add at least one photo.'];

    // For new listings, check profile has required fields
    if (!isEditMode && (!sellerProfile.portDetails || !sellerProfile.brandName)) {
        toast({ variant: 'destructive', title: 'Profile Incomplete', description: 'Please set your Port and Brand Name in your Account Settings before listing.'});
        return;
    }


    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast({
            variant: 'destructive',
            title: `Failed to ${isEditMode ? 'update' : 'create'} listing.`,
            description: 'Please check the fields.',
        });
        return;
    }
    
    setErrors({});

    startTransition(async () => {
      try {
        if (isEditMode && listing) {
            const listingUpdateData: Partial<Omit<FishListing, 'id'>> = {
              productName,
              boatDetails: boatDetails as FishListing['boatDetails'],
              mediaUrls: mediaUrls,
              pricePerKg: pricePerKg === '' ? 0 : Number(pricePerKg),
              // Port and Brand are locked, but might be part of an update payload if they were editable
              portDetails: listing.portDetails,
              brandName: listing.brandName,
            };
             if (totalQuantityInTons !== '') {
              listingUpdateData.totalQuantityInTons = Number(totalQuantityInTons);
            }

            await updateFishListing(listing.id, listingUpdateData);
            toast({
              title: 'Success!',
              description: 'Your fish listing has been updated.',
            });
            router.push(`/listings/${listing.id}`);
        } else {
             const newListingData = {
              productName,
              boatDetails: boatDetails as FishListing['boatDetails'],
              mediaUrls: mediaUrls,
              sellerId: user.uid,
              pricePerKg: pricePerKg === '' ? 0 : Number(pricePerKg),
              totalQuantityInTons: totalQuantityInTons === '' ? 0 : Number(totalQuantityInTons),
            };
            const newListingRef = await addFishListing(newListingData);
            toast({
              title: 'Success!',
              description: 'Your fish listing has been created.',
            });
            router.push(`/listings/${newListingRef.id}`);
        }
        
        router.refresh();
        
      } catch (error: any) {
        let errorMessage = 'Something went wrong. Please try again.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        // The global error handler for FirestorePermissionError will catch permission issues
        // so we only need to toast other generic errors.
        if (!error.message.includes('permission-denied')) {
            toast({
              variant: 'destructive',
              title: `Error ${isEditMode ? 'Updating' : 'Creating'} Listing`,
              description: errorMessage,
            });
        }
      }
    });
  };
  
  if (isUserLoading || isSellerProfileLoading || !user) {
    return <p>Loading...</p>
  }

  const handleMediaCaptured = (url: string) => {
    if (url && !mediaUrls.includes(url)) {
        setMediaUrls(prev => [...prev, url]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-8">
       <CameraCaptureDialog open={isCameraOpen} onOpenChange={setCameraOpen} onMediaCaptured={handleMediaCaptured} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        <div className="space-y-2 md:col-span-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Sardine" required aria-describedby="productName-error" />
            <div id="productName-error" aria-live="polite" aria-atomic="true">
              {errors?.productName && <p className="text-sm font-medium text-destructive">{errors.productName}</p>}
            </div>
        </div>

        {sellerProfile?.brandName && !isEditMode && (
          <div className="space-y-2 p-3 bg-muted rounded-md border">
              <Label>Brand Name</Label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Copyright className="h-4 w-4" />
                  <p className="font-semibold">{sellerProfile.brandName}</p>
              </div>
          </div>
        )}
        
        {sellerProfile?.portDetails && !isEditMode && (
          <div className="space-y-2 p-3 bg-muted rounded-md border">
              <Label>Port</Label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <Anchor className="h-4 w-4" />
                  <p className="font-semibold">{sellerProfile.portDetails}</p>
              </div>
          </div>
        )}

        <div className="space-y-2">
            <Label htmlFor="boatDetails">Boat Details</Label>
            <Select value={boatDetails} onValueChange={(value) => setBoatDetails(value as any)} required>
              <SelectTrigger id="boatDetails" aria-describedby="boatDetails-error">
                <SelectValue placeholder="Select a boat type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ashok Leyland">Ashok Leyland</SelectItem>
                <SelectItem value="Persian Boat">Persian Boat</SelectItem>
                <SelectItem value="370-Boat">370-Boat</SelectItem>
              </SelectContent>
            </Select>
            <div id="boatDetails-error" aria-live="polite" aria-atomic="true">
              {errors?.boatDetails && <p className="text-sm font-medium text-destructive">{errors.boatDetails}</p>}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="totalQuantityInTons">Total Quantity Available (Tons, Optional)</Label>
            <Input id="totalQuantityInTons" type="number" value={totalQuantityInTons} onChange={(e) => setTotalQuantityInTons(e.target.value)} placeholder="e.g., 10" aria-describedby="totalQuantityInTons-error" />
             <div id="totalQuantityInTons-error" aria-live="polite" aria-atomic="true">
              {errors?.totalQuantityInTons && <p className="text-sm font-medium text-destructive">{errors.totalQuantityInTons}</p>}
            </div>
        </div>
        <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pricePerKg">Price Per Kg (₹, Optional)</Label>
            <Input id="pricePerKg" type="number" value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)} placeholder="Leave blank if price is negotiable" aria-describedby="pricePerKg-error" />
            <div id="pricePerKg-error" aria-live="polite" aria-atomic="true">
              {errors?.pricePerKg && <p className="text-sm font-medium text-destructive">{errors.pricePerKg}</p>}
            </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <Label>Product Media (Photos)</Label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {mediaUrls.map((url, index) => (
                <div key={`${url}-${index}`} className="relative aspect-square">
                   <Image src={url} alt="Product media" fill className="rounded-md object-cover" data-ai-hint="fish"/>

                    <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeMedia(url)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
             {(mediaUrls.length === 0) && (
                <div className="relative aspect-square col-span-2 sm:col-span-3">
                    <Image src="https://images.unsplash.com/photo-1559106037-5435fac0c497?q=80&w=2070&auto=format&fit=crop" alt="Placeholder fish" fill className="rounded-md object-cover" data-ai-hint="fish market"/>
                </div>
            )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setCameraOpen(true)} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Use Camera
          </Button>
        </div>
        <div id="mediaUrls-error" aria-live="polite" aria-atomic="true">
          {errors?.mediaUrls && <p className="text-sm font-medium text-destructive">{errors.mediaUrls}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isEditMode ? 'Update Listing' : 'List My Catch'}
      </Button>
    </form>
  );
}
