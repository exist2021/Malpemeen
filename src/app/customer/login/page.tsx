'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
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

export default function CustomerLoginPage() {
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

  const handleAuthAction = async () => {
    if (!auth || !firestore) {
        toast({ variant: 'destructive', title: 'Firebase not initialized.'});
        return;
    };
    if (isSignUp) {
        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                const user = userCredential.user;
                const customerData = {
                    id: user.uid,
                    name: name,
                    phoneNumber: phone,
                    email: user.email,
                };
                const docRef = doc(firestore, 'customers', user.uid);
                
                setDoc(docRef, customerData)
                .catch(error => {
                     const contextualError = new FirestorePermissionError({
                        path: docRef.path,
                        operation: 'create',
                        requestResourceData: customerData,
                    });
                    errorEmitter.emit('permission-error', contextualError);
                });

                toast({ title: 'Sign up successful! Redirecting...' });
                router.push('/customer/dashboard');
            })
            .catch(error => {
                 let description = error.message;
                 if (error.code === 'auth/email-already-in-use') {
                     description = "This email is already in use. Please log in or use a different email.";
                 }
                 toast({ variant: 'destructive', title: 'Sign Up Failed', description });
            });
    } else {
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                toast({ title: 'Login successful! Redirecting...' });
                router.push('/customer/dashboard');
            })
            .catch(error => {
                let description = error.message;
                if (error.code === 'auth/invalid-credential') {
                    description = "Invalid email or password. Please try again.";
                }
                toast({ variant: 'destructive', title: 'Login Failed', description });
            });
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
       <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src="https://images.unsplash.com/photo-1599056024921-b3d551c89b88?q=80&w=1974&auto=format&fit=crop"
          alt="Fresh fish at a market"
          fill
          className="object-cover"
          data-ai-hint="fish market"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 mx-auto relative">
         <Button variant="ghost" asChild className="absolute top-4 left-4">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
        </Button>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <FishLogo className="h-16 w-16 text-primary mx-auto"/>
            <h2 className="text-3xl font-bold tracking-tight mt-4">{isSignUp ? 'Create a Customer Account' : 'Customer Login'}</h2>
            <p className="mt-2 text-muted-foreground">
                {isSignUp ? 'Join our community to find and purchase the freshest catch directly from local sellers.' : 'Welcome back! Ready to find the freshest catch from Malpe?'}
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleAuthAction(); }}>
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="123-456-7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
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
                {!isSignUp && (
                  <button type="button" onClick={() => setForgotPasswordOpen(true)} className="text-sm font-medium text-primary hover:underline">
                    Forgot Password?
                  </button>
                )}
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
            
            <Button type="submit" className="w-full h-12 text-base">
              {isSignUp ? 'Sign Up' : 'Login'}
            </Button>
            
          </form>
          
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-primary hover:underline">
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>
           <p className="mt-4 text-center text-sm text-muted-foreground">
            Not a customer?{' '}
            <Link href="/seller/login" className="font-semibold text-primary hover:underline">
               Seller Login
            </Link>
          </p>
        </div>
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
