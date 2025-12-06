
'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import Image from 'next/image';
import { useSellerProfile } from '@/firebase/provider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { updateDoc, doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { Loader2, User, Building, Anchor } from 'lucide-react';
import type { Seller, FishListing } from '@/app/types';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';


interface SellerAccountFormProps {
    onSave?: () => void;
}

export function SellerAccountForm({ onSave }: SellerAccountFormProps) {
    const { profile, isLoading } = useSellerProfile();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<{
        contactName: string;
        companyName: string;
        email: string;
        phoneNumber: string;
        address: string;
        logoUrl: string;
        portDetails: FishListing['portDetails'] | '';
    }>({
        contactName: '',
        companyName: '',
        email: '',
        phoneNumber: '',
        address: '',
        logoUrl: '',
        portDetails: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                contactName: profile.contactName || '',
                companyName: profile.companyName || '',
                email: profile.email || '',
                phoneNumber: profile.phoneNumber || '',
                address: profile.address || '',
                logoUrl: profile.logoUrl || '',
                portDetails: profile.portDetails || '',
            });
        }
    }, [profile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({...prev, logoUrl: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!profile || !firestore) return;

        const updatedData: Partial<Seller> = {};
        if (formData.contactName !== profile.contactName) updatedData.contactName = formData.contactName;
        if (formData.companyName !== profile.companyName) updatedData.companyName = formData.companyName;
        if (formData.email !== profile.email) updatedData.email = formData.email;
        if (formData.phoneNumber !== profile.phoneNumber) updatedData.phoneNumber = formData.phoneNumber;
        if (formData.address !== profile.address) updatedData.address = formData.address;
        if (formData.logoUrl !== profile.logoUrl) updatedData.logoUrl = formData.logoUrl;
        if (formData.portDetails !== profile.portDetails) updatedData.portDetails = formData.portDetails as Seller['portDetails'];


        if (Object.keys(updatedData).length === 0) {
            toast({ title: 'No changes to save.' });
            onSave?.();
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
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <ScrollArea className="h-[60vh] sm:h-auto sm:max-h-[70vh] pr-6">
             <div className="space-y-6">
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
                        <AvatarImage src={formData.logoUrl} alt={formData.companyName} />
                        <AvatarFallback>
                            <Building className="h-10 w-10" />
                        </AvatarFallback>
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <span className="text-xs text-center">Change Logo</span>
                        </div>
                    </Avatar>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input id="contactName" name="contactName" value={formData.contactName} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} />
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
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Your business address"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="portDetails">Primary Port</Label>
                    <Select value={formData.portDetails} onValueChange={(value) => setFormData(prev => ({...prev, portDetails: value as any}))}>
                        <SelectTrigger id="portDetails">
                            <SelectValue placeholder="Select your main port" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Malpe Port">Malpe Port</SelectItem>
                            <SelectItem value="Mangalore Port">Mangalore Port</SelectItem>
                            <SelectItem value="Kochi Port">Kochi Port</SelectItem>
                            <SelectItem value="Hyderabad Port">Hyderabad Port</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            </ScrollArea>
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
    );
}
