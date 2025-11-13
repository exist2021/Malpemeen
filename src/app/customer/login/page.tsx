'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useFirebase } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { FishLogo } from '@/components/fish-logo';


export default function CustomerLoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();

  const handleAuthAction = async () => {
    try {
      if (!auth || !firestore) return;
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(firestore, 'customers', user.uid), {
          id: user.uid,
          name: name,
          phoneNumber: phone,
          email: user.email,
        });
        toast({ title: 'Sign up successful!' });
        router.push('/customer/dashboard');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Login successful!' });
        router.push('/customer/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 bg-primary text-primary-foreground p-8 md:p-12 flex flex-col justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to role selection
          </Link>
          <div className="mt-8">
            <h1 className="text-4xl font-bold">Welcome Back, Customer!</h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Find the freshest catch from local sellers.
            </p>
          </div>
        </div>
        <div className="w-40 h-40 mx-auto">
         <FishLogo className="text-primary-foreground" />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold tracking-tight">{isSignUp ? 'Create an Account' : 'Login'}</h2>
          <p className="mt-2 text-muted-foreground">
            {isSignUp ? 'Create an account to start buying.' : 'Welcome back, customer.'}
          </p>
          
          <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); handleAuthAction(); }}>
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
                  <Link href="#" className="text-sm font-medium text-accent hover:underline">
                    Forgot Password?
                  </Link>
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
            
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 h-12 text-base">
              {isSignUp ? 'Sign Up' : 'Login'}
            </Button>
            
            <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
                {/* Placeholder for social logins */}
                <Button variant="outline" disabled><span className="sr-only">Facebook</span>f</Button>
                <Button variant="outline" disabled><span className="sr-only">Google</span>G</Button>
                <Button variant="outline" disabled><span className="sr-only">Apple</span></Button>
            </div>

          </form>
          
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-accent hover:underline">
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
