
'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { addFishListing, updateFishListing } from '@/app/lib/data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X, Upload, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import placeholderImagesData from '@/lib/placeholder-images.json';
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

interface SellerFormProps {
    listing?: FishListing | null;
}

export function SellerForm({ listing }: SellerFormProps) {
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [description, setDescription] = useState('');
  
  // New fields
  const [productName, setProductName] = useState('');
  const [pricePerBox, setPricePerBox] = useState('');
  const [portDetails, setPortDetails] = useState('');
  const [caughtBy, setCaughtBy] = useState('');
  const [howCaught, setHowCaught] = useState('');
  const [boatDetails, setBoatDetails] = useState<'Ashok Leyland' | 'Persian Boat' | ''>('');
  const [owner, setOwner] = useState('');
  const [brandName, setBrandName] = useState('Malpe Meen');

  const [errors, setErrors] = useState<Partial<Record<keyof Omit<FishListing, 'id' | 'sellerId' | 'photoUrls' | 'listedDate'>, string[]>>>({});
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!listing;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if SpeechRecognition is available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        // Append final transcript to existing description
        if (finalTranscript) {
          setDescription(prev => prev ? `${prev.trim()} ${finalTranscript.trim()}` : finalTranscript.trim());
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast({
          variant: 'destructive',
          title: 'Voice Error',
          description: `An error occurred during speech recognition: ${event.error}`,
        });
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        variant: 'destructive',
        title: 'Not Supported',
        description: 'Your browser does not support voice recognition.',
      });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

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
        setImageUrls(listing.photoUrls || []);
    }

  }, [user, isUserLoading, router, isEditMode, listing]);

  const addRandomPhoto = () => {
    const { placeholderImages } = placeholderImagesData;
    const availableImages = placeholderImages.filter(p => !imageUrls.includes(p.imageUrl));
    
    if (availableImages.length === 0) {
        toast({ variant: 'destructive', title: 'No more unique random photos to add.'});
        return;
    }

    const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
    if (randomImage.imageUrl && !imageUrls.includes(randomImage.imageUrl)) {
        setImageUrls(prev => [...prev, randomImage.imageUrl]);
    }
  };
  
  useEffect(() => {
    if(imageUrls.length === 0 && !isEditMode) {
        addRandomPhoto();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  const addImageFromUrl = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      try {
        // Basic URL validation
        new URL(newImageUrl);
        setImageUrls(prev => [...prev, newImageUrl]);
        setNewImageUrl('');
      } catch (_) {
        toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid image URL.' });
      }
    } else if (imageUrls.includes(newImageUrl)) {
        toast({ variant: 'destructive', title: 'Duplicate Image', description: 'This image URL has already been added.' });
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (!imageUrls.includes(result)) {
            setImageUrls(prev => [...prev, result]);
        } else {
            toast({ variant: 'destructive', title: 'Duplicate Image', description: 'You have already uploaded this image.' });
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset file input to allow uploading the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeImage = (urlToRemove: string) => {
    setImageUrls(prev => prev.filter(url => url !== urlToRemove));
  }


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to create a listing.' });
      return;
    }

    const newErrors: typeof errors = {};
    if (!productName) newErrors.productName = ['Product Name is required.'];
    if (!pricePerBox || isNaN(Number(pricePerBox)) || Number(pricePerBox) <= 0) newErrors.pricePerBox = ['Please enter a valid price.'];
    if (!portDetails) newErrors.portDetails = ['Port Details are required.'];
    if (!caughtBy) newErrors.caughtBy = ['"Who Caught" is required.'];
    if (!howCaught) newErrors.howCaught = ['"How Caught" is required.'];
    if (!boatDetails) newErrors.boatDetails = ['Please select a boat.'];
    if (!owner) newErrors.owner = ['Owner is required.'];
    if (description.length < 10) newErrors.description = ['Description must be at least 10 characters.'];
    if (imageUrls.length === 0) newErrors.photoUrls = ['Please add at least one photo.'];


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
          photoUrls: imageUrls,
        };

        if (isEditMode && listing) {
            await updateFishListing(listing.id, listingData);
            toast({
              title: 'Success!',
              description: 'Your fish listing has been updated.',
            });
        } else {
             await addFishListing({
              ...listingData,
              sellerId: user.uid,
            });
            toast({
              title: 'Success!',
              description: 'Your fish listing has been created.',
            });
        }
        
        router.push('/seller/dashboard');
        router.refresh();
        
      } catch (error) {
        toast({
          variant: 'destructive',
          title: `Error ${isEditMode ? 'Updating' : 'Creating'} Listing`,
          description: 'Something went wrong. Please try again.',
        });
      }
    });
  };
  
  if (isUserLoading || !user) {
    return <p>Loading...</p>
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Fresh Tuna" required aria-describedby="productName-error" />
            <div id="productName-error" aria-live="polite" aria-atomic="true">
              {errors?.productName && <p className="text-sm font-medium text-destructive">{errors.productName}</p>}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="pricePerBox">Price per Box (₹)</Label>
            <Input id="pricePerBox" type="number" value={pricePerBox} onChange={(e) => setPricePerBox(e.target.value)} placeholder="e.g., 5000" required aria-describedby="pricePerBox-error" />
            <div id="pricePerBox-error" aria-live="polite" aria-atomic="true">
              {errors?.pricePerBox && <p className="text-sm font-medium text-destructive">{errors.pricePerBox}</p>}
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
            <Label htmlFor="caughtBy">Who Caught</Label>
            <Input id="caughtBy" value={caughtBy} onChange={(e) => setCaughtBy(e.target.value)} placeholder="e.g., Local Fishermen" required aria-describedby="caughtBy-error" />
            <div id="caughtBy-error" aria-live="polite" aria-atomic="true">
              {errors?.caughtBy && <p className="text-sm font-medium text-destructive">{errors.caughtBy}</p>}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="howCaught">How Caught</Label>
            <Input id="howCaught" value={howCaught} onChange={(e) => setHowCaught(e.target.value)} placeholder="e.g., Net Fishing" required aria-describedby="howCaught-error" />
            <div id="howCaught-error" aria-live="polite" aria-atomic="true">
              {errors?.howCaught && <p className="text-sm font-medium text-destructive">{errors.howCaught}</p>}
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
              </SelectContent>
            </Select>
            <div id="boatDetails-error" aria-live="polite" aria-atomic="true">
              {errors?.boatDetails && <p className="text-sm font-medium text-destructive">{errors.boatDetails}</p>}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Input id="owner" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g., John Doe" required aria-describedby="owner-error" />
            <div id="owner-error" aria-live="polite" aria-atomic="true">
              {errors?.owner && <p className="text-sm font-medium text-destructive">{errors.owner}</p>}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="brandName">Brand Name</Label>
            <Input id="brandName" value={brandName} onChange={(e) => setBrandName(e.target.value)} required />
        </div>
      </div>


      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="description">Description</Label>
            <Button
                type="button"
                size="icon"
                variant={isListening ? "destructive" : "outline"}
                onClick={toggleListening}
                title="Use voice to add description"
            >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                <span className="sr-only">Toggle voice recognition</span>
            </Button>
        </div>
        <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the fish, its size, quality, etc." required aria-describedby="description-error" />
        <div id="description-error" aria-live="polite" aria-atomic="true">
          {errors?.description && <p className="text-sm font-medium text-destructive">{errors.description}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Fish Photos</Label>
        
        <div className="grid grid-cols-3 gap-4">
            {(imageUrls || []).map((url, index) => (
                <div key={`${url}-${index}`} className="relative aspect-square">
                    <Image src={url} alt="Fish photo" fill className="rounded-md object-cover" />
                    <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(url)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-grow">
            <Input id="photoUrl" name="photoUrl" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="Add image URL" aria-describedby="photoUrls-error" />
          </div>
          <Button type="button" variant="outline" onClick={addImageFromUrl}>
            Add URL
          </Button>
          <Button type="button" variant="outline" onClick={addRandomPhoto}>
            <Camera className="mr-2 h-4 w-4" />
            Random
          </Button>
           <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
        <div id="photoUrls-error" aria-live="polite" aria-atomic="true">
          {errors?.photoUrls && <p className="text-sm font-medium text-destructive">{errors.photoUrls}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isEditMode ? 'Update Listing' : 'List My Catch'}
      </Button>
    </form>
  );
}
