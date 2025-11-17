
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
        pricePerBox: string;
        portDetails: string;
        caughtBy: string;
        howCaught: string;
        boatDetails: 'Ashok Leyland' | 'Persian Boat' | '';
        owner: string;
        brandName: string;
        description: string;
        mediaUrls: string[];
    };
    setFormState: {
        setProductName: (value: string) => void;
        setPricePerBox: (value: string) => void;
        setPortDetails: (value: string) => void;
        setCaughtBy: (value: string) => void;
        setHowCaught: (value: string) => void;
        setBoatDetails: (value: 'Ashok Leyland' | 'Persian Boat' | '') => void;
        setOwner: (value: string) => void;
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
    productName, pricePerBox, portDetails, caughtBy, howCaught, boatDetails, owner, brandName, description, mediaUrls
  } = formState;
  const {
    setProductName, setPricePerBox, setPortDetails, setCaughtBy, setHowCaught, setBoatDetails, setOwner, setBrandName, setDescription, setMediaUrls
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
    
    if (isEditMode && listing) {
        setProductName(listing.productName);
        setPricePerBox(String(listing.pricePerBox));
        setPortDetails(listing.portDetails);
        setCaughtBy(listing.caughtBy);
        setHowCaught(listing.howCaught);
        setBoatDetails(listing.boatDetails);
        setOwner(listing.owner);
        setBrandName(listing.brandName);
        setDescription(listing.description);
        setMediaUrls(listing.mediaUrls || []);
    }

  }, [user, isUserLoading, router, isEditMode, listing, setProductName, setPricePerBox, setPortDetails, setCaughtBy, setHowCaught, setBoatDetails, setOwner, setBrandName, setDescription, setMediaUrls]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (!mediaUrls.includes(result)) {
            setMediaUrls(prev => [...prev, result]);
        } else {
            toast({ variant: 'destructive', title: 'Duplicate Media', description: 'You have already uploaded this file.' });
        }
      };
      reader.readAsDataURL(file);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

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
    if (!pricePerBox || isNaN(Number(pricePerBox)) || Number(pricePerBox) <= 0) newErrors.pricePerBox = ['Please enter a valid price.'];
    if (!portDetails) newErrors.portDetails = ['Port Details are required.'];
    if (!caughtBy) newErrors.caughtBy = ['"Who Caught" is required.'];
    if (!howCaught) newErrors.howCaught = ['"How Caught" is required.'];
    if (!boatDetails) newErrors.boatDetails = ['Please select a boat.'];
    if (!owner) newErrors.owner = ['Owner is required.'];
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
          pricePerBox: Number(pricePerBox),
          portDetails,
          caughtBy,
          howCaught,
          boatDetails: boatDetails as 'Ashok Leyland' | 'Persian Boat',
          owner,
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
        toast({
          variant: 'destructive',
          title: `Error Creating Listing`,
          description: error.message || 'Something went wrong. Please try again.',
        });
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
        <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Tuna" required aria-describedby="productName-error" />
            <div id="productName-error" aria-live="polite" aria-atomic="true">
              {errors?.productName && <p className="text-sm font-medium text-destructive">{errors.productName}</p>}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="pricePerBox">Price per Box (₹)</Label>
            <Input id="pricePerBox" type="number" value={pricePerBox} onChange={(e) => setPricePerBox(e.target.value)} placeholder="6250" required aria-describedby="pricePerBox-error" />
            <div id="pricePerBox-error" aria-live="polite" aria-atomic="true">
              {errors?.pricePerBox && <p className="text-sm font-medium text-destructive">{errors.pricePerBox}</p>}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="portDetails">Port Details</Label>
            <Input id="portDetails" value={portDetails} onChange={(e) => setPortDetails(e.target.value)} placeholder="Malpe Port" required aria-describedby="portDetails-error" />
            <div id="portDetails-error" aria-live="polite" aria-atomic="true">
              {errors?.portDetails && <p className="text-sm font-medium text-destructive">{errors.portDetails}</p>}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="caughtBy">Who Caught</Label>
            <Input id="caughtBy" value={caughtBy} onChange={(e) => setCaughtBy(e.target.value)} placeholder="Local Fishermen" required aria-describedby="caughtBy-error" />
            <div id="caughtBy-error" aria-live="polite" aria-atomic="true">
              {errors?.caughtBy && <p className="text-sm font-medium text-destructive">{errors.caughtBy}</p>}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="howCaught">How Caught</Label>
            <Input id="howCaught" value={howCaught} onChange={(e) => setHowCaught(e.target.value)} placeholder="Net Fishing" required aria-describedby="howCaught-error" />
            <div id="howCaught-error" aria-live="polite" aria-atomic="true">
              {errors?.howCaught && <p className="text-sm font-medium text-destructive">{errors.howCaught}</p>}
            </div>
        </div>
         <div className="space-y-2">
            <Label htmlFor="boatDetails">Boat Details</Label>
            <Select value={boatDetails} onValueChange={(value) => setBoatDetails(value as any)} required>
              <SelectTrigger id="boatDetails" aria-describedby="boatDetails-error">
                <SelectValue placeholder="Persian Boat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ashok Leyland">Ashok Leyland</SelectItem>
                <SelectItem value="Persian Boat">Persian Boat</SelectItem>
              </SelectContent>
            </Select>
            <div id="boatDetails-error" aria-live="polite" aria-atomic="true">
              {errors?.boatDetails && <p className="text-sm font-medium text-destructive">{errors.boatDetails}</p>}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Input id="owner" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Prabhakar" required aria-describedby="owner-error" />
            <div id="owner-error" aria-live="polite" aria-atomic="true">
              {errors?.owner && <p className="text-sm font-medium text-destructive">{errors.owner}</p>}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="brandName">Brand Name</Label>
            <Input id="brandName" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Malpe Meen" required />
        </div>
      </div>


      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="description">Description</Label>
        </div>
        <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="FRESH CATCH OF THE MORNING" required aria-describedby="description-error" />
        <div id="description-error" aria-live="polite" aria-atomic="true">
          {errors?.description && <p className="text-sm font-medium text-destructive">{errors.description}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Product Media (Photos & Videos)</Label>
        
        <div className="grid grid-cols-3 gap-4">
            {(mediaUrls.length > 0 ? mediaUrls : ["https://images.unsplash.com/photo-1559106037-5435fac0c497?q=80&w=2070&auto=format&fit=crop"]).map((url, index) => (
                <div key={`${url}-${index}`} className="relative aspect-square">
                    {url.startsWith('data:video') ? (
                       <video src={url} className="rounded-md object-cover w-full h-full" controls />
                    ) : (
                       <Image src={url} alt="Product media" fill className="rounded-md object-cover" data-ai-hint="fish market"/>
                    )}

                    <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeMedia(url)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
           <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*"
          />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload from Device
          </Button>
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
