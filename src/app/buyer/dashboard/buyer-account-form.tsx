
'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { useBuyerProfile } from '@/firebase/provider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { updateDoc, doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { Loader2, User } from 'lucide-react';
import type { Buyer } from '@/app/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface BuyerAccountFormProps {
    onSave?: () => void;
}

export function BuyerAccountForm({ onSave }: BuyerAccountFormProps) {
    const { profile, isLoading } = useBuyerProfile();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        place: '',
        address: '',
        photoUrl: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                phoneNumber: profile.phoneNumber || '',
                place: profile.place || '',
                address: profile.address || '',
                photoUrl: profile.photoUrl || '',
            });
        }
    }, [profile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({...prev, photoUrl: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!profile || !firestore) return;

        const updatedData: Partial<Buyer> = {};
        if (formData.name !== profile.name) updatedData.name = formData.name;
        if (formData.email !== profile.email) updatedData.email = formData.email;
        if (formData.phoneNumber !== profile.phoneNumber) updatedData.phoneNumber = formData.phoneNumber;
        if (formData.place !== profile.place) updatedData.place = formData.place;
        if (formData.address !== profile.address) updatedData.address = formData.address;
        if (formData.photoUrl !== profile.photoUrl) updatedData.photoUrl = formData.photoUrl;

        if (Object.keys(updatedData).length === 0) {
            toast({ title: 'No changes to save.' });
            return;
        }
        
        startTransition(async () => {
            try {
                const docRef = doc(firestore, 'buyers', profile.id);
                await updateDoc(docRef, updatedData);
                toast({
                    title: 'Profile Updated',
                    description: 'Your account information has been successfully updated.',
                });
                onSave?.();
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
                <div className="flex justify-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                </div>
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
            <div className="flex flex-col items-center space-y-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                <Avatar 
                    className="h-24 w-24 cursor-pointer relative group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <AvatarImage src={formData.photoUrl} alt={formData.name} />
                    <AvatarFallback>
                        <User className="h-10 w-10" />
                    </AvatarFallback>
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <span className="text-xs text-center">Change Photo</span>
                    </div>
                </Avatar>
            </div>
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phoneNumber">Contact Number</Label>
                <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="place">Place</Label>
                <Input id="place" name="place" placeholder="e.g., City, State" value={formData.place} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" placeholder="e.g., 123 Main St" value={formData.address} onChange={handleInputChange} />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
    );
}
