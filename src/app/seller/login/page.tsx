
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Phone as PhoneIcon, Loader2, User } from 'lucide-react';
import { FishLogo } from '@/components/fish-logo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SellerLoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const router = useRouter();
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();

  const [loginMethod, setLoginMethod] = useState('email');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
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

  const handleEmailAuthAction = async () => {
    if (!auth || !firestore) {
        toast({ variant: 'destructive', title: 'Firebase not initialized.'});
        return;
    };
    
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            toast({ title: 'Login successful! Redirecting...' });
            router.push('/seller/home');
        })
        .catch(error => {
            let description = error.message;
            if (error.code === 'auth/invalid-credential') {
                description = "Invalid email or password. Please try again.";
            }
            toast({ variant: 'destructive', title: 'Login Failed', description });
        });
  };

  const handleSignUp = async () => {
     if (!auth || !firestore) {
        toast({ variant: 'destructive', title: 'Firebase not initialized.'});
        return;
    };

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const sellerData = {
            id: user.uid,
            name: name,
            phoneNumber: `+91${phone}`,
            email: user.email,
        };
        const docRef = doc(firestore, 'sellers', user.uid);

        await setDoc(docRef, sellerData);
        
        toast({ title: 'Sign up successful! Redirecting...' });
        router.push('/seller/home');

      } catch (error: any) {
          let description = error.message;
          if (error.code === 'auth/email-already-in-use') {
              description = "This email is already in use. Please log in or use a different email.";
          } else if (error.name === 'FirebaseError' && error.message.includes('permission-denied')) {
              const sellerData = { id: auth.currentUser?.uid, name, phoneNumber: phone, email };
              const docRef = doc(firestore, 'sellers', auth.currentUser!.uid);
              const contextualError = new FirestorePermissionError({
                  path: docRef.path,
                  operation: 'create',
                  requestResourceData: sellerData,
              });
              errorEmitter.emit('permission-error', contextualError);
              return; 
          }
          toast({ variant: 'destructive', title: 'Sign Up Failed', description });
      }
  }

  const handlePhoneSignIn = async () => {
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
      if (error.code === 'auth/operation-not-allowed') {
        toast({
            variant: 'destructive',
            title: 'Phone Sign-In Not Enabled',
            description: "Please enable the Phone Number sign-in provider in your Firebase project's Authentication settings.",
            duration: 9000,
        });
      } else if (error.code === 'auth/billing-not-enabled') {
        toast({
            variant: 'destructive',
            title: 'Billing Not Enabled',
            description: "The free quota for phone auth has been exceeded. Please enable billing on your Firebase project to continue.",
            duration: 9000,
        });
      } else {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Failed to send OTP',
          description: error.message || 'Please try again.',
        });
      }
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
        // User does not exist, so sign them out and prompt to register.
        await auth.signOut();
        toast({
            variant: 'destructive',
            title: 'Not Registered',
            description: 'This phone number is not registered. Please sign up first.',
        });
        setConfirmationResult(null);
        setOtp('');
        setIsSignUp(true);
        setLoginMethod('email'); // Default to email for sign up view
      } else {
        // User exists, log them in.
        toast({ title: 'Login Successful!', description: 'Welcome back!' });
         router.push('/seller/home');
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


  const handlePasswordReset = async () => {
    if (!auth) return;
    if (!resetEmail) {
      toast({
        variant: 'destructive',
        title: 'Email is required',
        description: 'Please enter your email address.',
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your inbox for instructions to reset your password.',
      });
      setForgotPasswordOpen(false);
      setResetEmail('');
    } catch (error: any) {
        if (error.code === 'auth/missing-email') {
            toast({
                variant: 'destructive',
                title: 'Email is required',
                description: 'Please enter your email address.',
            });
            return;
        }
      toast({
        variant: 'destructive',
        title: 'Failed to Send Reset Email',
        description: error.message,
      });
    }
  };

  return (
    <>
    <div className="flex min-h-screen">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 mx-auto relative">
         <div ref={recaptchaContainerRef}></div>
         <Button variant="ghost" asChild className="absolute top-4 left-4">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
        </Button>
        <div className="w-full max-w-sm">
         <div className="text-center mb-8">
            <FishLogo className="h-16 w-16 text-primary mx-auto"/>
            <h2 className="text-3xl font-bold tracking-tight mt-4">{isSignUp ? 'Create a Seller Account' : 'Seller Login'}</h2>
            <p className="mt-2 text-muted-foreground">
                {isSignUp ? 'Join our network to reach more buyers and grow your business.' : 'Welcome back! Let\'s get your products to market.'}
            </p>
         </div>
          
          {isSignUp ? (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
                 <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="signup-name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="pl-10"/>
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="signup-email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="signup-phone" type="tel" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required className="pl-10" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+91</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="signup-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                        {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                        </button>
                    </div>
                </div>
                <Button type="submit" className="w-full h-12 text-base">Sign Up</Button>
            </form>
          ) : (
             <Tabs value={loginMethod} onValueChange={setLoginMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="phone">Phone</TabsTrigger>
                </TabsList>
                <TabsContent value="email">
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleEmailAuthAction(); }}>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10"
                        />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button type="button" onClick={() => setForgotPasswordOpen(true)} className="text-sm font-medium text-primary hover:underline">
                            Forgot Password?
                        </button>
                        </div>
                        <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-10 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                        </button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full h-12 text-base">Login</Button>
                    </form>
                </TabsContent>
                <TabsContent value="phone">
                    {!confirmationResult ? (
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handlePhoneSignIn(); }}>
                        <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input id="phone" type="tel" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required className="pl-10" />
                        </div>
                        <p className="text-xs text-muted-foreground">Country code (+91) is automatically added.</p>
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
                        Verify OTP & Login
                        </Button>
                        <Button variant="link" onClick={() => setConfirmationResult(null)}>Back</Button>
                    </form>
                    )}
                </TabsContent>
            </Tabs>
          )}
          
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-primary hover:underline">
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Not a seller?{' '}
            <Link href="/buyer/login" className="font-semibold text-primary hover:underline">
               Buyer Login
            </Link>
          </p>
        </div>
      </div>
      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src="https://images.unsplash.com/photo-1574636904128-97036a439a9c?q=80&w=1974&auto=format&fit=crop"
          alt="Fishing boat at sea"
          fill
          className="object-cover"
          data-ai-hint="fishing boat"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
    </div>
    <Dialog open={isForgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we will send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handlePasswordReset(); }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">
                  Email
                </Label>
                <Input
                  id="reset-email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  type="email"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                Send Reset Link
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
