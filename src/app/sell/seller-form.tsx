'use client';

import { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { addFishListing } from '@/app/lib/data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import placeholderImagesData from '@/lib/placeholder-images.json';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export function SellerForm() {
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ description?: string[]; photoUrls?: string[] }>({});
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/seller/login');
    }
  }, [user, isUserLoading, router]);

  const addRandomPhoto = () => {
    const { placeholderImages } = placeholderImagesData;
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    if (randomImage.imageUrl && !imageUrls.includes(randomImage.imageUrl)) {
        setImageUrls(prev => [...prev, randomImage.imageUrl]);
    }
  };
  
  useEffect(() => {
    if(imageUrls.length === 0) {
        addRandomPhoto();
    }
  }, []);

  const addImageFromUrl = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      setImageUrls(prev => [...prev, newImageUrl]);
      setNewImageUrl('');
    }
  }

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
            title: 'Failed to create listing.',
            description: 'Please check the fields.',
        });
        return;
    }
    
    setErrors({});

    startTransition(async () => {
      try {
        await addFishListing({
          description,
          photoUrls: imageUrls,
          sellerId: user.uid,
        });

        toast({
          title: 'Success!',
          description: 'Your fish listing has been created.',
        });
        
        // Redirect after successful submission
        router.push('/listings');
        router.refresh(); // revalidate cache
        
      } catch (error) {
        // Errors from addFishListing will be caught by the global error handler
        // but we can show a generic toast here.
        toast({
          variant: 'destructive',
          title: 'Error Creating Listing',
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
            {imageUrls.map(url => (
                <div key={url} className="relative aspect-square">
                    <Image src={url} alt="Fish photo" layout="fill" className="rounded-md object-cover" />
                    <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(url)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Input id="photoUrl" name="photoUrl" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="Add image URL" aria-describedby="photoUrl-error" />
          <Button type="button" variant="outline" onClick={addImageFromUrl}>
            Add URL
          </Button>
          <Button type="button" variant="outline" onClick={addRandomPhoto}>
            <Camera className="mr-2 h-4 w-4" />
            Random
          </Button>
        </div>
        <div id="photoUrl-error" aria-live="polite" aria-atomic="true">
          {errors?.photoUrls && <p className="text-sm font-medium text-destructive">{errors.photoUrls}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        List My Catch
      </Button>
    </form>
  );
}
