
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FishLogo } from '@/components/fish-logo';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WelcomePage() {
  const router = useRouter();

  const userRoles = [
    {
      title: "I'm a Buyer",
      description: "Browse and buy the freshest catch directly from the source.",
      buttonText: "Find Fish",
      href: "/buyer/login",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      title: "I'm a Seller",
      description: "List your products and reach a wider market of buyers.",
      buttonText: "Sell Fish",
      href: "/seller/login",
      gradient: "from-pink-500 to-red-500",
    },
  ];

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-200 via-purple-300 to-pink-300 -z-10" />

      <div className="text-center mb-12 relative z-10">
        <FishLogo className="h-28 w-28 text-primary mx-auto"/>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-6 font-headline text-slate-800">
          Welcome to Malpe Meen
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          The digital marketplace connecting local fisheries with buyers. Choose your role to get started.
        </p>
      </div>
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {userRoles.map((role) => (
          <Card key={role.title} className="text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-card/80 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{role.title}</CardTitle>
              <CardDescription className="pt-2 min-h-[40px]">{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push(role.href)} 
                className={cn("w-full text-lg h-12 text-white shadow-lg transition-shadow hover:shadow-xl", role.gradient)}
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
