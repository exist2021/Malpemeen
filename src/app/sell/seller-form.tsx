'use client';

import { useActionState, useEffect, useState } from 'react';
import { createFishListing, type State } from '@/app/lib/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SubmitButton } from '@/components/submit-button';
import placeholderImagesData from '@/lib/placeholder-images.json';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export function SellerForm() {
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useActionState(createFishListing, initialState);
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState('');
  const { user, isUserLoading } = useUser();
  const router = useRouter();

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

  useEffect(() => {
    if (state.message) {
      toast({
        variant: state.errors ? 'destructive' : 'default',
        title: state.errors ? 'Error Creating Listing' : 'Success!',
        description: state.message,
      });
    }
  }, [state, toast]);
  
  if (isUserLoading || !user) {
    return <p>Loading...</p>
  }

  return (
    <form action={dispatch} className="mt-2 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Describe the fish, its size, price, etc." required aria-describedby="description-error" />
        <div id="description-error" aria-live="polite" aria-atomic="true">
          {state.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Fish Photo</Label>
        <div className="flex items-center gap-2">
          <Input id="imageUrl" name="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" required aria-describedby="imageUrl-error" />
          <Button type="button" variant="outline" onClick={capturePhoto}>
            <Camera className="mr-2 h-4 w-4" />
            New Photo
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Click "New Photo" to simulate capturing a new photo.</p>
        <input type="hidden" name="photoUrl" value={imageUrl} />
        <div id="imageUrl-error" aria-live="polite" aria-atomic="true">
          {state.errors?.imageUrl && <p className="text-sm font-medium text-destructive">{state.errors.imageUrl}</p>}
        </div>
      </div>

      <SubmitButton className="w-full">
        List My Catch
      </SubmitButton>
    </form>
  );
}
