
'use server';

import { z } from 'zod';
import { addFishListing as dbAddFishListing } from '@/app/lib/data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  photoUrl: z.string().url({ message: 'Please enter a valid image URL.' }),
  sellerId: z.string(),
});

export type State = {
  errors?: {
    description?: string[];
    photoUrl?: string[];
  };
  message?: string | null;
};

export async function createFishListing(prevState: State, formData: FormData) {
  const validatedFields = FormSchema.safeParse({
    description: formData.get('description'),
    photoUrl: formData.get('photoUrl'),
    sellerId: formData.get('sellerId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create listing. Please check the fields.',
    };
  }

  // The error handling will now be managed by the non-blocking data function,
  // which emits a detailed error for the FirebaseErrorListener to catch.
  await dbAddFishListing(validatedFields.data);

  revalidatePath('/listings');
  redirect('/listings');
}
