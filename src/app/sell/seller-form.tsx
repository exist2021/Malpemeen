
'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { addFishListing, updateFishListing } from '@/app/lib/data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import placeholderImagesData from '@/lib/placeholder-images.json';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import type { FishListing } from '@/app/types';

interface SellerFormProps {
    listing?: FishListing | null;
}

export function SellerForm({ listing }: SellerFormProps) {
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ description?: string[]; photoUrls?: string[] }>({});
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!listing;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/seller/login');
    }
    
    if (isEditMode && listing) {
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

    const newErrors: { description?: string[]; photoUrls?: string[] } = {};
    if (description.length < 10) {
        newErrors.description = ['Description must be at least 10 characters.'];
    }
    if (imageUrls.length === 0) {
        newErrors.photoUrls = ['Please add at least one photo.'];
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
            await updateFishListing(listing.id, {
                description,
                photoUrls: imageUrls,
            });
            toast({
              title: 'Success!',
              description: 'Your fish listing has been updated.',
            });
        } else {
             await addFishListing({
              description,
              photoUrls: imageUrls,
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
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the fish, its size, price, etc." required aria-describedby="description-error" />
        <div id="description-error" aria-live="polite" aria-atomic="true">
          {errors?.description && <p className="text-sm font-medium text-destructive">{errors.description}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Fish Photos</Label>
        
        <div className="grid grid-cols-3 gap-4">
            {(imageUrls || []).map((url, index) => (
                <div key={`${url}-${index}`} className="relative aspect-square">
                    <Image src={url} alt="Fish photo" layout="fill" className="rounded-md object-cover" />
                    <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(url)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Input id="photoUrl" name="photoUrl" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="Add image URL" aria-describedby="photoUrl-error" />
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
        <div id="photoUrl-error" aria-live="polite" aria-atomic="true">
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
