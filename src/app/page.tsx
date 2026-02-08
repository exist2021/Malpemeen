
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FishLogo } from '@/components/fish-logo';
import { ArrowRight, Languages } from 'lucide-react';
import { useUser, useUserRole } from '@/firebase';
import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/context';

export default function WelcomePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { role, isRoleLoading } = useUserRole();
  const { t, language, setLanguage } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !isRoleLoading && user) {
        if (role === 'buyer') {
            router.replace('/buyer/dashboard');
        } else if (role === 'seller') {
            router.replace('/seller/dashboard');
        } else if (role === 'admin') {
            // Check if user is also registered as a seller or buyer.
            // But for now, if they are admin, we let them choose or they manually go to /admin.
            // If they are on root, and they are admin, we don't force redirect to /admin.
            // This allows the user to see the welcome page and choose a login path if they are testing.
            // HOWEVER, the user wants to login as a SELLER. 
            // So if they have a seller profile, they should be redirected there.
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

  if (isUserLoading || isRoleLoading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-white">
               <FishLogo className="h-20 w-20 sm:h-24 sm:w-24 text-primary animate-pulse"/>
               <p className="mt-4 text-muted-foreground animate-pulse">
                {t('loading')}
               </p>
          </div>
      )
  }

  // If role is admin, we show the welcome page instead of redirecting to /admin automatically.
  // This allows the admin to access /buyer/login or /seller/login if they want to.
  if (user && role && role !== 'admin') {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-white">
               <FishLogo className="h-20 w-20 sm:h-24 sm:w-24 text-primary animate-pulse"/>
               <p className="mt-4 text-muted-foreground animate-pulse">
                {t('redirecting')}
               </p>
          </div>
      )
  }

  // Prevent hydration mismatch by only rendering the toggle after mount
  const renderLanguageToggle = () => {
    if (!mounted) return null;
    return (
        <div className="absolute top-6 right-4 z-50">
            <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
                console.log("Language toggle clicked");
                setLanguage(language === 'en' ? 'kn' : 'en');
            }}
            className="flex items-center gap-2 shadow-sm active:scale-95 transition-transform"
            >
            <Languages className="h-4 w-4" />
            {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </Button>
        </div>
    );
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-white overflow-x-hidden">
      {renderLanguageToggle()}

      <div className="text-center mb-8 sm:mb-10 relative z-10 pt-12">
        <FishLogo className="h-20 w-20 sm:h-24 sm:w-24 text-primary mx-auto"/>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 text-foreground">
          {t('welcome.title')}
        </h1>
        <p className="mt-2 text-base text-muted-foreground max-w-md mx-auto px-4">
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
      {role === 'admin' && (
          <div className="mt-8">
              <Button variant="link" onClick={() => router.push('/admin')}>
                  Go to Admin Dashboard
              </Button>
          </div>
      )}
    </main>
  );
}
