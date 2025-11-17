'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useUserRole } from '@/firebase';
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
import { User as UserIcon, Settings, LogOut, LayoutDashboard, Home, Loader2 } from 'lucide-react';
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


export function Header() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { role, isRoleLoading } = useUserRole();
  const auth = useAuth();

  const handleLogout = () => {
    if (auth) {
      const lastRole = role;
      auth.signOut().then(() => {
        if (lastRole === 'seller') {
          router.push('/seller/login');
        } else {
          router.push('/customer/login');
        }
      });
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (role === 'seller') return '/seller/dashboard';
    if (role === 'customer') return '/customer/dashboard';
    // While role is loading, default to the generic home page, but the onClick handler will prevent mis-navigation.
    return '/';
  };

  // This function now robustly checks the role on click.
  const handleHomeClick = () => {
    if (isUserLoading || isRoleLoading) {
      return; // Do nothing if we are still loading user or role.
    }
    const link = getDashboardLink();
    router.push(link);
  };

  const renderUserActions = () => {
    if (isUserLoading) {
      return <Skeleton className="h-10 w-24 rounded-md" />;
    }
    
    if (user) {
       return (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
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
                <DropdownMenuItem onClick={() => router.push('/seller/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Seller Dashboard
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
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
    )
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
            <Button variant="ghost" onClick={handleHomeClick} disabled={isUserLoading || isRoleLoading}>
              {(isUserLoading || (user && isRoleLoading)) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Home className="mr-2 h-4 w-4" />
              )}
              Home
            </Button>
          {renderUserActions()}
        </div>
      </div>
    </header>
  );
}
