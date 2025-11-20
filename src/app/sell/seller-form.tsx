
'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { addFishListing, updateFishListing } from '@/app/lib/data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X, Upload, Video, CameraIcon, Circle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
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
        portDetails: string;
        totalQuantityInTons: string;
        boatDetails: 'Ashok Leyland' | 'Persian Boat' | '370-Boat' | '';
        brandName: string;
        description: string;
        mediaUrls: string[];
    };
    setFormState: {
        setProductName: (value: string) => void;
        setPricePerKg: (value: string) => void;
        setPortDetails: (value: string) => void;
        setTotalQuantityInTons: (value: string) => void;
        setBoatDetails: (value: 'Ashok Leyland' | 'Persian Boat' | '370-Boat' | '') => void;
        setBrandName: (value: string) => void;
        setDescription: (value: string) => void;
        setMediaUrls: (value: string[] | ((prev: string[]) => string[])) => void;
    };
}

function CameraCaptureDialog({ open, onOpenChange, onMediaCaptured }: { open: boolean, onOpenChange: (open: boolean) => void, onMediaCaptured: (url: string) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const getCameraPermission = async () => {
            if (!open) {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                return;
            }
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(mediaStream);
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings.',
                });
            }
        };

        getCameraPermission();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [open, stream, toast]);

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

    const handleStartRecording = () => {
        if (stream) {
            const chunks: Blob[] = [];
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
            mediaRecorderRef.current.ondataavailable = (event) => {
                chunks.push(event.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                 const reader = new FileReader();
                 reader.onloadend = () => {
                     onMediaCaptured(reader.result as string);
                 };
                 reader.readAsDataURL(blob);
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            onOpenChange(false);
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Live Capture</DialogTitle>
                    <DialogDescription>
                        Capture a photo or record a short video of your product.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
                       <video ref={videoRef} className="w-full h-full" autoPlay muted playsInline />
                       {isRecording && <Circle className="h-4 w-4 text-red-500 absolute top-2 right-2 animate-pulse" fill="red" />}
                    </div>
                    {!hasCameraPermission && (
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
                    <Button type="button" onClick={handleCapturePhoto} disabled={!hasCameraPermission || isRecording}>
                        <CameraIcon className="mr-2 h-4 w-4" /> Capture Photo
                    </Button>
                    {!isRecording ? (
                        <Button type="button" onClick={handleStartRecording} disabled={!hasCameraPermission}>
                            <Video className="mr-2 h-4 w-4" /> Start Recording
                        </Button>
                    ) : (
                         <Button type="button" variant="destructive" onClick={handleStopRecording}>
                            <Check className="mr-2 h-4 w-4" /> Finish Recording
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export function SellerForm({ listing, formState, setFormState }: SellerFormProps) {
  const { toast } = useToast();
  const {
    productName, pricePerKg, portDetails, totalQuantityInTons, boatDetails, brandName, description, mediaUrls
  } = formState;
  const {
    setProductName, setPricePerKg, setPortDetails, setTotalQuantityInTons, setBoatDetails, setBrandName, setDescription, setMediaUrls
  } = setFormState;

  const [errors, setErrors] = useState<Partial<Record<keyof Omit<FishListing, 'id' | 'sellerId' | 'listedDate'>, string[]>>>({});
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!listing;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/seller/login');
    }
    
    if (!isEditMode) {
        setProductName('');
        setPricePerKg('');
        setPortDetails('');
        setTotalQuantityInTons('');
        setBoatDetails('');
        setBrandName('Malpe Meen');
        setDescription('');
        setMediaUrls([]);
    }

  }, [user, isUserLoading, router, isEditMode, setProductName, setPricePerKg, setPortDetails, setTotalQuantityInTons, setBoatDetails, setBrandName, setDescription, setMediaUrls]);


  const removeMedia = (urlToRemove: string) => {
    setMediaUrls(prev => prev.filter(url => url !== urlToRemove));
  }


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to create a listing.' });
      return;
    }

    const newErrors: any = {};
    if (!productName) newErrors.productName = ['Product Name is required.'];
    if (pricePerKg && (isNaN(Number(pricePerKg)) || Number(pricePerKg) <= 0)) newErrors.pricePerKg = ['Please enter a valid price.'];
    if (totalQuantityInTons && (isNaN(Number(totalQuantityInTons)) || Number(totalQuantityInTons) <= 0)) newErrors.totalQuantityInTons = ['Please enter a valid quantity.'];
    if (!portDetails) newErrors.portDetails = ['Port Details are required.'];
    if (!boatDetails) newErrors.boatDetails = ['Please select a boat.'];
    if (description.length < 10) newErrors.description = ['Description must be at least 10 characters.'];
    if (mediaUrls.length === 0) newErrors.mediaUrls = ['Please add at least one photo or video.'];


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
        const listingData = {
          productName,
          pricePerKg: pricePerKg ? Number(pricePerKg) : undefined,
          portDetails,
          totalQuantityInTons: totalQuantityInTons ? Number(totalQuantityInTons) : undefined,
          boatDetails: boatDetails as 'Ashok Leyland' | 'Persian Boat' | '370-Boat',
          brandName,
          description,
          mediaUrls: mediaUrls,
        };

        if (isEditMode && listing) {
            await updateFishListing(listing.id, listingData);
            toast({
              title: 'Success!',
              description: 'Your fish listing has been updated.',
            });
            router.push(`/listings/${listing.id}`);
        } else {
             const newListingRef = await addFishListing({
              ...listingData,
              sellerId: user.uid,
            });
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
  
  if (isUserLoading || !user) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Sardine" required aria-describedby="productName-error" />
            <div id="productName-error" aria-live="polite" aria-atomic="true">
              {errors?.productName && <p className="text-sm font-medium text-destructive">{errors.productName}</p>}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="portDetails">Port Details</Label>
            <Input id="portDetails" value={portDetails} onChange={(e) => setPortDetails(e.target.value)} placeholder="e.g., Malpe Port" required aria-describedby="portDetails-error" />
            <div id="portDetails-error" aria-live="polite" aria-atomic="true">
              {errors?.portDetails && <p className="text-sm font-medium text-destructive">{errors.portDetails}</p>}
            </div>
        </div>
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
            <Label htmlFor="brandName">Brand Name</Label>
            <Input id="brandName" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g., Malpe Meen" required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="totalQuantityInTons">Total Quantity Available (Tons)</Label>
            <Input id="totalQuantityInTons" type="number" value={totalQuantityInTons} onChange={(e) => setTotalQuantityInTons(e.target.value)} placeholder="e.g., 10 (Optional)" aria-describedby="totalQuantityInTons-error" />
             <div id="totalQuantityInTons-error" aria-live="polite" aria-atomic="true">
              {errors?.totalQuantityInTons && <p className="text-sm font-medium text-destructive">{errors.totalQuantityInTons}</p>}
            </div>
        </div>
      </div>


      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="description">Description</Label>
        </div>
        <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the fish, its quality, size, and any other relevant details." required aria-describedby="description-error" />
        <div id="description-error" aria-live="polite" aria-atomic="true">
          {errors?.description && <p className="text-sm font-medium text-destructive">{errors.description}</p>}
        </div>
      </div>
      
       <div className="space-y-2">
            <Label htmlFor="pricePerKg">Price Per Kg (₹)</Label>
            <Input id="pricePerKg" type="number" value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)} placeholder="e.g., 250 (Optional)" aria-describedby="pricePerKg-error" />
            <div id="pricePerKg-error" aria-live="polite" aria-atomic="true">
              {errors?.pricePerKg && <p className="text-sm font-medium text-destructive">{errors.pricePerKg}</p>}
            </div>
        </div>

      <div className="space-y-4">
        <Label>Product Media (Photos & Videos)</Label>
        
        <div className="grid grid-cols-3 gap-4">
            {mediaUrls.map((url, index) => (
                <div key={`${url}-${index}`} className="relative aspect-square">
                    {url.startsWith('data:video') ? (
                       <video src={url} className="rounded-md object-cover w-full h-full" controls />
                    ) : (
                       <Image src={url} alt="Product media" fill className="rounded-md object-cover" data-ai-hint="fish"/>
                    )}

                    <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeMedia(url)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
             {mediaUrls.length === 0 && (
                <div className="relative aspect-square">
                    <Image src="https://images.unsplash.com/photo-1559106037-5435fac0c497?q=80&w=2070&auto=format&fit=crop" alt="Placeholder fish" fill className="rounded-md object-cover" data-ai-hint="fish market"/>
                </div>
            )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setCameraOpen(true)}>
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
