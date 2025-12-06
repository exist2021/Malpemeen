
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Phone as PhoneIcon, Loader2, User, Building, MapPin, Anchor } from 'lucide-react';
import { FishLogo } from '@/components/fish-logo';
import { Textarea } from '@/components/ui/textarea';
import type { FishListing } from '@/app/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SellerLoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [portDetails, setPortDetails] = useState<FishListing['portDetails'] | ''>('');
  const [phone, setPhone] = useState('');
  const router = useRouter();
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();

  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (auth && recaptchaContainerRef.current && !recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
            'size': 'invisible',
             'callback': () => {
                // reCAPTCHA solved
            }
        });
    }
  }, [auth]);

  const handleSignUp = async () => {
     if (!auth || !auth.currentUser || !firestore) {
        toast({ variant: 'destructive', title: 'You must verify your phone to sign up.'});
        return;
    };
     if (!portDetails) {
        toast({ variant: 'destructive', title: 'Port details are required.'});
        return;
    }

    setIsSigningUp(true);
    try {
        const user = auth.currentUser;
        const sellerData = {
            id: user.uid,
            contactName: contactName,
            companyName: companyName,
            address: address,
            portDetails: portDetails,
            phoneNumber: user.phoneNumber,
        };
        const docRef = doc(firestore, 'sellers', user.uid);

        await setDoc(docRef, sellerData);
        
        toast({ title: 'Sign up successful! Redirecting...' });
        router.push('/seller/dashboard');

      } catch (error: any) {
          if (error.name === 'FirebaseError' && error.message.includes('permission-denied')) {
              const sellerData = { id: auth.currentUser.uid, contactName, companyName, address, portDetails, phoneNumber: `+91${phone}` };
              const docRef = doc(firestore, 'sellers', auth.currentUser!.uid);
              const contextualError = new FirestorePermissionError({
                  path: docRef.path,
                  operation: 'create',
                  requestResourceData: sellerData,
              });
              errorEmitter.emit('permission-error', contextualError);
          } else {
             toast({ variant: 'destructive', title: 'Sign Up Failed', description: error.message });
          }
      } finally {
        setIsSigningUp(false);
      }
  }

  const handlePhoneAuth = async () => {
    if (!auth || !firestore || !recaptchaVerifierRef.current) {
      toast({ variant: 'destructive', title: 'Firebase not initialized or reCAPTCHA not ready.' });
      return;
    }
    if (!phone) {
        toast({ variant: 'destructive', title: 'Phone number is required.' });
        return;
    }

    setIsSendingOtp(true);
    const appVerifier = recaptchaVerifierRef.current;

    try {
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, appVerifier);
      setConfirmationResult(result);
      toast({ title: 'OTP Sent', description: 'Please check your phone for the verification code.' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to send OTP',
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult || !otp || !firestore) return;
    setIsVerifyingOtp(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;

      const userRef = doc(firestore, 'sellers', user.uid);
      const userDoc = await getDoc(userRef);

       if (!userDoc.exists()) {
        setIsSignUp(true);
        setConfirmationResult(null); // Clear result, move to sign up form
      } else {
        toast({ title: 'Login Successful!', description: 'Welcome back!' });
         router.push('/seller/dashboard');
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'OTP Verification Failed',
        description: error.code === 'auth/invalid-verification-code' ? 'Invalid OTP. Please try again.' : error.message,
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 mx-auto relative">
         <div ref={recaptchaContainerRef}></div>
         <Button variant="ghost" asChild className="absolute top-4 left-4">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
        </Button>
        <div className="w-full max-w-sm">
         <div className="text-center mb-8">
            <FishLogo className="h-16 w-16 text-primary mx-auto"/>
            <h2 className="text-3xl font-bold tracking-tight mt-4">{isSignUp ? 'Create a Seller Account' : 'Seller Login or Sign Up'}</h2>
            <p className="mt-2 text-muted-foreground">
                {isSignUp ? 'Join our network to reach more buyers and grow your business.' : 'Welcome! Enter your phone number to begin.'}
            </p>
         </div>
          
          {isSignUp ? (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
                 <div className="space-y-2">
                    <Label htmlFor="signup-contact-name">Contact Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="signup-contact-name" type="text" placeholder="John Doe" value={contactName} onChange={(e) => setContactName(e.target.value)} required className="pl-10"/>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="signup-company-name">Company Name</Label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="signup-company-name" type="text" placeholder="Malpe Meen Pvt Ltd" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="pl-10"/>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="signup-address">Address</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Textarea id="signup-address" placeholder="Your business address" value={address} onChange={(e) => setAddress(e.target.value)} required className="pl-10"/>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="portDetails">Primary Port</Label>
                    <div className="relative">
                         <Anchor className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Select value={portDetails} onValueChange={(value) => setPortDetails(value as any)} required>
                            <SelectTrigger id="portDetails" className="pl-10">
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
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 text-sm">
                    <PhoneIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="pl-2 pr-2 text-muted-foreground">+91</span>
                    <Input value={phone} disabled className="w-full p-0 border-0 bg-transparent"/>
                </div>
                <Button type="submit" className="w-full h-12 text-base" disabled={isSigningUp}>
                  {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Sign Up
                </Button>
            </form>
          ) : (
             <>
                {!confirmationResult ? (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handlePhoneAuth(); }}>
                    <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <PhoneIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="pl-2 pr-2 text-muted-foreground">+91</span>
                        <Input id="phone" type="tel" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"/>
                    </div>
                    <p className="text-xs text-muted-foreground">Country code (+91) is automatically used.</p>
                    </div>
                    <Button type="submit" className="w-full h-12 text-base" disabled={isSendingOtp}>
                    {isSendingOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send OTP
                    </Button>
                </form>
                ) : (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }}>
                    <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input id="otp" type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full h-12 text-base" disabled={isVerifyingOtp}>
                    {isVerifyingOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verify OTP
                    </Button>
                    <Button variant="link" onClick={() => setConfirmationResult(null)}>Back</Button>
                </form>
                )}
            </>
          )}
          
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Not a seller?{' '}
            <Link href="/buyer/login" className="font-semibold text-primary hover:underline">
               Buyer Login
            </Link>
          </p>
        </div>
      </div>
      <div className="relative hidden md:block md:w-1/2">
        <Image
          src="https://cdn.pixabay.com/photo/2018/01/05/02/47/fishing-3062034_1280.jpg"
          alt="Fishing boat at sea"
          fill
          className="object-cover"
          data-ai-hint="fishing boat"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
    </div>
  );
}
