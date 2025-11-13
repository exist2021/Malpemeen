'use server';

import { z } from 'zod';
import { addFishListing as dbAddFishListing } from '@/app/lib/data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]\d{3}[)])?([-]?[\s]?)(\d{3})([-]?[\s]?)(\d{4})$/
);

const FormSchema = z.object({
  sellerName: z.string().min(2, { message: 'Seller name must be at least 2 characters.' }),
  phone: z.string().regex(phoneRegex, 'Invalid phone number.'),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid image URL.' }),
});

export type State = {
  errors?: {
    sellerName?: string[];
    phone?: string[];
    description?: string[];
    imageUrl?: string[];
  };
  message?: string | null;
};

export async function createFishListing(prevState: State, formData: FormData) {
  const validatedFields = FormSchema.safeParse({
    sellerName: formData.get('sellerName'),
    phone: formData.get('phone'),
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
    await dbAddFishListing(validatedFields.data);
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Listing.',
    };
  }

  revalidatePath('/');
  redirect('/');
}
