
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FishLogo } from '@/components/fish-logo';
import { ArrowRight } from 'lucide-react';
import { useUser, useUserRole } from '@/firebase';
import { useEffect } from 'react';

export default function WelcomePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { role, isRoleLoading } = useUserRole();

  useEffect(() => {
    if (!isUserLoading && !isRoleLoading && user) {
        if (role === 'buyer') {
            router.replace('/buyer/dashboard');
        } else if (role === 'seller') {
            router.replace('/seller/dashboard');
        } else if (role === 'admin') {
            router.replace('/admin');
        }
    }
  }, [user, role, isUserLoading, isRoleLoading, router]);

  const userRoles = [
    {
      title: "I'm a Buyer",
      description: "Browse and buy the freshest catch directly from the source.",
      buttonText: "Find Fish",
      href: "/buyer/login",
    },
    {
      title: "I'm a Seller",
      description: "List your products and reach a wider market of buyers.",
      buttonText: "Sell Fish",
      href: "/seller/login",
    },
  ];

  if (isUserLoading || isRoleLoading || user) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-white">
               <FishLogo className="h-20 w-20 sm:h-24 sm:w-24 text-primary animate-pulse"/>
               <p className="mt-4 text-muted-foreground animate-pulse">
                {user ? "Redirecting to your dashboard..." : "Loading..."}
               </p>
          </div>
      )
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-white overflow-x-hidden">
      <div className="text-center mb-8 sm:mb-10 relative z-10">
        <FishLogo className="h-20 w-20 sm:h-24 sm:w-24 text-primary mx-auto"/>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 text-foreground">
          Welcome to Malpe Meen
        </h1>
        <p className="mt-2 text-base text-muted-foreground max-w-md mx-auto">
          The digital marketplace connecting local fisheries with buyers. Choose your role to get started.
        </p>
      </div>
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-md md:max-w-2xl">
        {userRoles.map((role) => (
          <Card key={role.title} className="text-center hover:shadow-lg transition-shadow duration-300 bg-card">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-bold">{role.title}</CardTitle>
              <CardDescription className="pt-2 text-sm sm:text-base">{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push(role.href)} 
                className="w-full text-base sm:text-lg h-11"
              >
                {role.buttonText} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
