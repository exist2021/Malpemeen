'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSellerProfile } from '@/firebase/provider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { updateDoc, doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import type { Seller } from '@/app/types';

export function SellerAccountForm() {
    const { profile, isLoading } = useSellerProfile();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                phoneNumber: profile.phoneNumber || '',
            });
        }
    }, [profile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!profile || !firestore) return;

        const updatedData: Partial<Seller> = {};
        if (formData.name !== profile.name) updatedData.name = formData.name;
        if (formData.phoneNumber !== profile.phoneNumber) updatedData.phoneNumber = formData.phoneNumber;

        if (Object.keys(updatedData).length === 0) {
            toast({ title: 'No changes to save.' });
            return;
        }
        
        startTransition(async () => {
            try {
                const docRef = doc(firestore, 'sellers', profile.id);
                await updateDoc(docRef, updatedData);
                toast({
                    title: 'Profile Updated',
                    description: 'Your account information has been successfully updated.',
                });
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Update Failed',
                    description: 'Could not update your profile. Please try again.',
                });
            }
        });
    };


    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} disabled />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phoneNumber">Contact Number</Label>
                <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
    );
}
