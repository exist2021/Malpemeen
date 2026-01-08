
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FishLogo } from '@/components/fish-logo';
import { ArrowRight, Languages } from 'lucide-react';
import { useUser, useUserRole } from '@/firebase';
import { useEffect } from 'react';
import { useI18n } from '@/i18n/context';

export default function WelcomePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { role, isRoleLoading } = useUserRole();
  const { t, language, setLanguage } = useI18n();

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
      title: t('role.buyer.title'),
      description: t('role.buyer.description'),
      buttonText: t('role.buyer.button'),
      href: "/buyer/login",
    },
    {
      title: t('role.seller.title'),
      description: t('role.seller.description'),
      buttonText: t('role.seller.button'),
      href: "/seller/login",
    },
  ];

  if (isUserLoading || isRoleLoading || user) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-white">
               <FishLogo className="h-20 w-20 sm:h-24 sm:w-24 text-primary animate-pulse"/>
               <p className="mt-4 text-muted-foreground animate-pulse">
                {user ? t('redirecting') : t('loading')}
               </p>
          </div>
      )
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-white overflow-x-hidden">
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
          className="flex items-center gap-2"
        >
          <Languages className="h-4 w-4" />
          {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
        </Button>
      </div>

      <div className="text-center mb-8 sm:mb-10 relative z-10">
        <FishLogo className="h-20 w-20 sm:h-24 sm:w-24 text-primary mx-auto"/>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 text-foreground">
          {t('welcome.title')}
        </h1>
        <p className="mt-2 text-base text-muted-foreground max-w-md mx-auto">
          {t('welcome.subtitle')}
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
