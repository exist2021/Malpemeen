
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
import { User as UserIcon, Settings, LogOut, LayoutDashboard, HelpCircle, Mail, Phone, Info, Building } from 'lucide-react';
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


export function Header() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { role } = useUserRole();
  const { profile: sellerProfile, isLoading: isSellerProfileLoading } = useSellerProfile();
  const { profile: buyerProfile, isLoading: isBuyerProfileLoading } = useBuyerProfile();
  const auth = useAuth();
  const [isBuyerDialogOpen, setBuyerDialogOpen] = useState(false);
  const [isSellerDialogOpen, setSellerDialogOpen] = useState(false);


  const handleLogout = () => {
    if (auth) {
      auth.signOut();
      router.push('/');
    }
  };

  const getHomeLink = () => {
    if (!user) return "/";
    if (role === 'buyer') return "/buyer/dashboard";
    if (role === 'seller') return "/seller/dashboard";
    return "/";
  }

  const renderUserActions = () => {
    if (isUserLoading) {
      return <Skeleton className="h-10 w-24 rounded-md" />;
    }
    
    if (user) {
        let triggerContent;
        const isLoading = isSellerProfileLoading || isBuyerProfileLoading;
        const profileName = role === 'seller' ? sellerProfile?.companyName : buyerProfile?.name;

        if (isLoading) {
            triggerContent = <Skeleton className="h-9 w-9 rounded-full" />;
        } else if (role === 'seller' && sellerProfile?.logoUrl) {
            triggerContent = (
                <Avatar className="h-9 w-9">
                    <AvatarImage src={sellerProfile.logoUrl} alt={sellerProfile.companyName} />
                    <AvatarFallback><Building className="h-4 w-4" /></AvatarFallback>
                </Avatar>
            );
        } else if (role === 'buyer' && buyerProfile?.photoUrl) {
            triggerContent = (
                <Avatar className="h-9 w-9">
                    <AvatarImage src={buyerProfile.photoUrl} alt={buyerProfile.name} />
                    <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                </Avatar>
            );
        } else {
             triggerContent = (
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-muted">
                   {role === 'seller' ? <Building className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
                </div>
            );
        }


       return (
            <div className="flex items-center gap-2 sm:gap-4">
              {role === 'seller' && (
                <Button variant="ghost" onClick={() => router.push('/seller/dashboard')} className="hidden sm:inline-flex">
                  Dashboard
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-1 sm:p-2">
                    {triggerContent}
                    <span className="font-medium hidden sm:inline-block max-w-[100px] truncate">{profileName || 'Account'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   {role === 'seller' && (
                    <DropdownMenuItem onClick={() => router.push('/seller/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                    </DropdownMenuItem>
                    )}
                  {role === 'buyer' && (
                    <Dialog open={isBuyerDialogOpen} onOpenChange={setBuyerDialogOpen}>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Settings className="mr-2 h-4 w-4" />
                                Account Settings
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                            <DialogTitle>My Account</DialogTitle>
                            <DialogDescription>
                                View and update your personal information.
                            </DialogDescription>
                            </DialogHeader>
                            <BuyerAccountForm onSave={() => setBuyerDialogOpen(false)} />
                        </DialogContent>
                    </Dialog>
                  )}
                  {role === 'seller' && (
                    <Dialog open={isSellerDialogOpen} onOpenChange={setSellerDialogOpen}>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Settings className="mr-2 h-4 w-4" />
                                Account Settings
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                            <DialogTitle>Seller Details</DialogTitle>
                            <DialogDescription>
                                View and update your seller information.
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
                              Help & Support
                          </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                          <DialogTitle>Help & Support</DialogTitle>
                          <DialogDescription>
                              Contact us for any questions or issues.
                          </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">Email</span>
                                    <a href="mailto:operationsupport@malpemeen.com" className="font-semibold hover:underline">operationsupport@malpemeen.com</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">Phone</span>
                                    <a href="tel:9945932828" className="font-semibold hover:underline">9945932828</a>
                                </div>
                            </div>
                          </div>
                      </DialogContent>
                  </Dialog>
                  <DropdownMenuItem asChild>
                    <a href="https://www.malpemeen.com/" target="_blank" rel="noopener noreferrer">
                      <Info className="mr-2 h-4 w-4" />
                      About
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push('/seller/login')}>
                Sell Fish
            </Button>
            <Button onClick={() => router.push('/buyer/login')}>
                Buyer Login
            </Button>
        </div>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
            <Link href={getHomeLink()} className="flex items-center space-x-2">
              <FishLogo className="h-8 w-8 text-primary" />
              <span className="font-bold inline-block">Malpe Meen</span>
            </Link>
        </div>
        <div className="flex items-center gap-2">
          {renderUserActions()}
        </div>
      </div>
    </header>
  );
}
