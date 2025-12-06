
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
import { ArrowLeft, Phone as PhoneIcon, Loader2, User } from 'lucide-react';
import { FishLogo } from '@/components/fish-logo';

export default function BuyerLoginPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();

  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (auth && recaptchaContainerRef.current && !recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
            'size': 'invisible',
            'callback': () => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        });
    }
  }, [auth]);

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
      // Handle specific Firebase errors
      toast({
          variant: 'destructive',
          title: 'Failed to send OTP',
          description: error.message || 'Please try again.',
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtpAndLogin = async () => {
    if (!confirmationResult || !otp || !firestore) return;
    setIsVerifyingOtp(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;

      const userRef = doc(firestore, 'buyers', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // This is a new user
        setIsNewUser(true);
        // Clear confirmation result to prevent re-use, keep OTP for potential auto-fill
        setConfirmationResult(null); 
      } else {
        toast({ title: 'Login Successful!', description: 'Welcome back!' });
        router.push('/buyer/dashboard');
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
  
  const handleFinalizeSignUp = async () => {
     if (!name || !auth?.currentUser) {
        toast({ variant: 'destructive', title: 'Name is required to complete sign up.' });
        return;
     }

    setIsSigningUp(true);
    const user = auth.currentUser;

    try {
        const buyerData = {
          id: user.uid,
          name: name,
          phoneNumber: user.phoneNumber,
        };
        const docRef = doc(firestore, 'buyers', user.uid);
        
        await setDoc(docRef, buyerData);

        toast({ title: 'Sign up successful! Redirecting...' });
        router.push('/buyer/dashboard');

    } catch (error: any) {
         if (error.name === 'FirebaseError' && error.message.includes('permission-denied')) {
            const contextualError = new FirestorePermissionError({
                path: doc(firestore, 'buyers', user.uid).path,
                operation: 'create',
                requestResourceData: { id: user.uid, name, phoneNumber: user.phoneNumber },
            });
            errorEmitter.emit('permission-error', contextualError);
        } else {
            toast({ variant: 'destructive', title: 'Sign Up Failed', description: error.message });
        }
    } finally {
        setIsSigningUp(false);
    }
  }


  return (
    <>
    <div className="flex min-h-screen flex-col">
       <div className="md:hidden relative w-full h-48">
        <Image
          src="https://cdn.pixabay.com/photo/2018/01/05/02/47/fishing-3062034_1280.jpg"
          alt="Fishing boat at sunset"
          fill
          className="object-cover"
          data-ai-hint="fishing boat sunset"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="flex flex-1 md:flex-row">
        <div className="relative hidden md:block md:w-1/2">
            <Image
            src="https://cdn.pixabay.com/photo/2018/01/05/02/47/fishing-3062034_1280.jpg"
            alt="Fishing boat at sunset"
            fill
            className="object-cover"
            data-ai-hint="fishing boat sunset"
            />
            <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 mx-auto relative">
            <div ref={recaptchaContainerRef}></div>
            <Button variant="ghost" asChild className="absolute top-4 left-4">
                <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
            </Button>
            <div className="w-full max-w-sm">
            <div className="text-center mb-8">
                <FishLogo className="h-16 w-16 text-primary mx-auto"/>
                <h2 className="text-3xl font-bold tracking-tight mt-4">Buyer Login or Sign Up</h2>
                <p className="mt-2 text-muted-foreground">
                    Ready to find the freshest catch from Malpe? Enter your phone number to get started.
                </p>
            </div>

            {!confirmationResult && !isNewUser && (
                <>
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
                </>
            )}

            {confirmationResult && !isNewUser && (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleVerifyOtpAndLogin(); }}>
                    <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input id="otp" type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full h-12 text-base" disabled={isVerifyingOtp}>
                        {isVerifyingOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Verify & Login
                    </Button>
                    <Button variant="link" onClick={() => { setConfirmationResult(null); setOtp(''); }}>Back to phone number</Button>
                </form>
            )}

            {isNewUser && (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleFinalizeSignUp(); }}>
                    <div className="text-center">
                        <p className="text-muted-foreground">Welcome! Let's finish creating your account.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="signup-name">Your Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input id="signup-name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="pl-10"/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="signup-phone">Phone Number</Label>
                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm ring-offset-background">
                            <PhoneIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="pl-2 pr-2 text-muted-foreground">+91</span>
                            <Input id="signup-phone" type="tel" value={phone} disabled className="w-full p-0 border-0 bg-transparent"/>
                        </div>
                    </div>
                    <Button type="submit" className="w-full h-12 text-base" disabled={isSigningUp}>
                        {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Complete Sign Up
                    </Button>
                </form>
            )}
            
            <p className="mt-8 text-center text-sm text-muted-foreground">
                Not a buyer?{' '}
                <Link href="/seller/login" className="font-semibold text-primary hover:underline">
                Seller Login
                </Link>
            </p>
            </div>
        </div>
      </div>
    </div>
    </>
  );
}

    