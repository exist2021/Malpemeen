
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useUserRole, useSellerProfile, useCustomerProfile } from '@/firebase';
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
import { User as UserIcon, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CustomerAccountForm } from '@/app/customer/dashboard/customer-account-form';
import { SellerAccountForm } from '@/app/seller/dashboard/seller-account-form';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


export function Header() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { role } = useUserRole();
  const { profile: sellerProfile, isLoading: isSellerProfileLoading } = useSellerProfile();
  const { profile: customerProfile, isLoading: isCustomerProfileLoading } = useCustomerProfile();
  const auth = useAuth();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
      router.push('/');
    }
  };

  const renderUserActions = () => {
    if (isUserLoading) {
      return <Skeleton className="h-10 w-24 rounded-md" />;
    }
    
    if (user) {
        let triggerContent;
        const isLoading = isSellerProfileLoading || isCustomerProfileLoading;

        if (isLoading) {
            triggerContent = <Skeleton className="h-9 w-9 rounded-full" />;
        } else if (role === 'seller' && sellerProfile?.logoUrl) {
            triggerContent = (
                <Avatar className="h-9 w-9">
                    <AvatarImage src={sellerProfile.logoUrl} alt={sellerProfile.name} />
                    <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                </Avatar>
            );
        } else if (role === 'customer' && customerProfile?.photoUrl) {
            triggerContent = (
                <Avatar className="h-9 w-9">
                    <AvatarImage src={customerProfile.photoUrl} alt={customerProfile.name} />
                    <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                </Avatar>
            );
        } else {
             triggerContent = (
                <>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                </>
            );
        }


       return (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                {triggerContent}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
               {role === 'customer' && (
                <Dialog>
                    <DialogTrigger asChild>
                       <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Settings className="mr-2 h-4 w-4" />
                            Account Settings
                        </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>My Account</DialogTitle>
                        <DialogDescription>
                            View and update your personal information.
                        </DialogDescription>
                        </DialogHeader>
                        <CustomerAccountForm />
                    </DialogContent>
                </Dialog>
               )}
              {role === 'seller' && (
                <>
                  <DropdownMenuItem onClick={() => router.push('/seller/home')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Seller Home
                  </DropdownMenuItem>
                   <Dialog>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Settings className="mr-2 h-4 w-4" />
                              Account Settings
                          </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                          <DialogTitle>Seller Details</DialogTitle>
                          <DialogDescription>
                              View and update your seller information.
                          </DialogDescription>
                          </DialogHeader>
                          <SellerAccountForm />
                      </DialogContent>
                  </Dialog>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push('/seller/login')}>
                Sell Fish
            </Button>
            <Button onClick={() => router.push('/customer/login')}>
                Customer Login
            </Button>
        </div>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <FishLogo className="h-8 w-8 text-primary" />
              <span className="font-bold hidden sm:inline-block">Malpe Meen</span>
            </Link>
        </div>
        <div className="flex items-center gap-2">
          {renderUserActions()}
        </div>
      </div>
    </header>
  );
}
