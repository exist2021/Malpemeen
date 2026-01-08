
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUser, useAuth, useUserRole, useSellerProfile, useBuyerProfile } from '@/firebase';
import { Button } from '@/components/ui/button';
import { FishLogo } from '../fish-logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, Settings, LogOut, LayoutDashboard, HelpCircle, Mail, Phone, Info, Building, Languages } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BuyerAccountForm } from '@/app/buyer/dashboard/buyer-account-form';
import { SellerAccountForm } from '@/app/seller/dashboard/seller-account-form';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useI18n } from '@/i18n/context';


export function Header() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { role } = useUserRole();
  const { profile: sellerProfile, isLoading: isSellerProfileLoading } = useSellerProfile();
  const { profile: buyerProfile, isLoading: isBuyerProfileLoading } = useBuyerProfile();
  const auth = useAuth();
  const [isBuyerDialogOpen, setBuyerDialogOpen] = useState(false);
  const [isSellerDialogOpen, setSellerDialogOpen] = useState(false);
  const { t, language, setLanguage } = useI18n();


  const handleLogout = () => {
    if (auth) {
      auth.signOut();
      router.push('/');
    }
  };

  const getHomeLink = () => {
    if (!user) return "/";
    if (role === 'buyer') return "/buyer/dashboard";
    // Admins are treated as sellers for navigation
    if (role === 'seller' || role === 'admin') return "/seller/dashboard";
    return "/";
  }

  const renderUserActions = () => {
    if (isUserLoading) {
      return <Skeleton className="h-10 w-24 rounded-md" />;
    }
    
    if (user) {
        let triggerContent;
        const isLoading = isSellerProfileLoading || isBuyerProfileLoading;
        const isSellerLike = role === 'seller' || role === 'admin';
        const profileName = isSellerLike ? (sellerProfile?.contactName || sellerProfile?.companyName) : (role === 'buyer' ? buyerProfile?.name : (buyerProfile?.name || 'User'));

        if (isLoading) {
            triggerContent = <Skeleton className="h-9 w-9 rounded-full" />;
        } else if (isSellerLike && sellerProfile?.logoUrl) {
            triggerContent = (
                <Avatar className="h-9 w-9">
                    <AvatarImage src={sellerProfile.logoUrl} alt={sellerProfile.companyName} />
                    <AvatarFallback><Building className="h-4 w-4" /></AvatarFallback>
                </Avatar>
            );
        } else {
             triggerContent = (
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-muted">
                   {isSellerLike ? <Building className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
                </div>
            );
        }


       return (
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
                className="hidden sm:flex items-center gap-2"
              >
                <Languages className="h-4 w-4" />
                {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
              </Button>
              {isSellerLike && (
                <Button variant="ghost" onClick={() => router.push('/seller/dashboard')} className="hidden sm:inline-flex">
                  {t('header.dashboard')}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-1 sm:p-2">
                    {triggerContent}
                    <span className="font-medium hidden sm:inline-block max-w-[100px] truncate">{profileName || t('header.account')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('header.my_account')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="sm:hidden" onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}>
                        <Languages className="mr-2 h-4 w-4" />
                        {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
                    </DropdownMenuItem>
                   {isSellerLike && (
                    <DropdownMenuItem onClick={() => router.push('/seller/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {t('header.dashboard')}
                    </DropdownMenuItem>
                    )}
                  
                    {/* Always allow account settings access if a buyer profile exists or if role is buyer or admin */}
                    <Dialog open={isBuyerDialogOpen} onOpenChange={setBuyerDialogOpen}>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Settings className="mr-2 h-4 w-4" />
                                {t('header.account_settings')}
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                            <DialogTitle>{t('header.my_account')}</DialogTitle>
                            <DialogDescription>
                                {t('account.description')}
                            </DialogDescription>
                            </DialogHeader>
                            <BuyerAccountForm onSave={() => setBuyerDialogOpen(false)} />
                        </DialogContent>
                    </Dialog>
                  
                  {isSellerLike && (
                    <Dialog open={isSellerDialogOpen} onOpenChange={setSellerDialogOpen}>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Settings className="mr-2 h-4 w-4" />
                                {t('header.seller_settings')}
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                            <DialogTitle>{t('seller.details')}</DialogTitle>
                            <DialogDescription>
                                {t('seller.description')}
                            </DialogDescription>
                            </DialogHeader>
                            <SellerAccountForm onSave={() => setSellerDialogOpen(false)}/>
                        </DialogContent>
                    </Dialog>
                  )}
                  <Dialog>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <HelpCircle className="mr-2 h-4 w-4" />
                              {t('header.help_support')}
                          </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                          <DialogTitle>{t('header.help_support')}</DialogTitle>
                          <DialogDescription>
                              {t('support.description')}
                          </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">{t('contact.email')}</span>
                                    <a href="mailto:operationsupport@malpemeen.com" className="font-semibold hover:underline">operationsupport@malpemeen.com</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">{t('contact.phone')}</span>
                                    <a href="tel:9945932828" className="font-semibold hover:underline">9945932828</a>
                                </div>
                            </div>
                          </div>
                      </DialogContent>
                  </Dialog>
                  <DropdownMenuItem asChild>
                    <a href="https://www.malpemeen.com/" target="_blank" rel="noopener noreferrer">
                      <Info className="mr-2 h-4 w-4" />
                      {t('header.about')}
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('header.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              className="flex items-center gap-2"
            >
              <Languages className="h-4 w-4" />
              {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </Button>
            <Button variant="ghost" onClick={() => router.push('/seller/login')}>
                {t('header.sell_fish')}
            </Button>
            <Button onClick={() => router.push('/buyer/login')}>
                {t('header.buyer_login')}
            </Button>
        </div>
    );
  }

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
            <Link href={getHomeLink()} className="flex items-center space-x-2">
              <FishLogo className="h-8 w-8 text-primary" />
              <span className="font-bold">Malpe Meen</span>
            </Link>
        </div>
        <div className="flex items-center gap-2">
          {renderUserActions()}
        </div>
      </div>
    </header>
  );
}
