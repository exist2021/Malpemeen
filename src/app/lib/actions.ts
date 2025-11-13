'use server';

import { z } from 'zod';
import { addFishListing as dbAddFishListing } from '@/app/lib/data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from 'firebase-admin';
import { getAuth } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';


const FormSchema = z.object({
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid image URL.' }),
});

export type State = {
  errors?: {
    description?: string[];
    imageUrl?: string[];
  };
  message?: string | null;
};

export async function createFishListing(prevState: State, formData: FormData) {
  const { auth } = initializeFirebase();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return {
      message: 'Authentication Error: You must be logged in to create a listing.',
    };
  }

  const validatedFields = FormSchema.safeParse({
    description: formData.get('description'),
    imageUrl: formData.get('imageUrl'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create listing. Please check the fields.',
    };
  }

  try {
    // We need seller name and phone from the seller's profile in firestore
    // But for now, we'll just pass the sellerId
    await dbAddFishListing({
      ...validatedFields.data,
      sellerId: currentUser.uid,
    });
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Listing.',
    };
  }

  revalidatePath('/');
  redirect('/');
}
