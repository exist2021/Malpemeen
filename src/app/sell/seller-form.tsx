'use client';

import { useEffect, useState, useTransition } from 'react';
import { addFishListing } from '@/app/lib/data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import placeholderImagesData from '@/lib/placeholder-images.json';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export function SellerForm() {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ description?: string[]; photoUrl?: string[] }>({});
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/seller/login');
    }
  }, [user, isUserLoading, router]);

  const capturePhoto = () => {
    const { placeholderImages } = placeholderImagesData;
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    setImageUrl(randomImage.imageUrl);
  };
  
  useEffect(() => {
    // Set an initial photo on component mount
    capturePhoto();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to create a listing.' });
      return;
    }

    const newErrors: { description?: string[]; photoUrl?: string[] } = {};
    if (description.length < 10) {
        newErrors.description = ['Description must be at least 10 characters.'];
    }
    if (!imageUrl) {
        newErrors.photoUrl = ['Please enter a valid image URL.'];
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
          photoUrl: imageUrl,
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
    <form onSubmit={handleSubmit} className="mt-2 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the fish, its size, price, etc." required aria-describedby="description-error" />
        <div id="description-error" aria-live="polite" aria-atomic="true">
          {errors?.description && <p className="text-sm font-medium text-destructive">{errors.description}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photoUrl">Fish Photo</Label>
        <div className="flex items-center gap-2">
          <Input id="photoUrl" name="photoUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" required aria-describedby="photoUrl-error" />
          <Button type="button" variant="outline" onClick={capturePhoto}>
            <Camera className="mr-2 h-4 w-4" />
            New Photo
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Click "New Photo" to simulate capturing a new photo.</p>
        <div id="photoUrl-error" aria-live="polite" aria-atomic="true">
          {errors?.photoUrl && <p className="text-sm font-medium text-destructive">{errors.photoUrl}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        List My Catch
      </Button>
    </form>
  );
}
