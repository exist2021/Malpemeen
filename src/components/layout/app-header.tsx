
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useUserRole } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, Settings, LogOut, Search } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BuyerAccountForm } from '@/app/buyer/dashboard/buyer-account-form';
import { SidebarTrigger } from '../ui/sidebar';
import { Input } from '../ui/input';


export function AppHeader() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { role } = useUserRole();
  const auth = useAuth();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
      router.push('/');
    }
  };

  const renderUserActions = () => {
    if (isUserLoading) {
      return <Skeleton className="h-10 w-10 rounded-full" />;
    }
    
    if (user) {
       return (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
               {role === 'buyer' && (
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
                        <BuyerAccountForm />
                    </DialogContent>
                </Dialog>
               )}
              {role === 'seller' && <DropdownMenuItem onClick={() => router.push('/seller/dashboard')}>Seller Dashboard</DropdownMenuItem>}
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
        <Button onClick={() => router.push('/buyer/login')}>
            Login
        </Button>
    )
  }


  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-4 items-center">
            <SidebarTrigger className="md:hidden"/>
            <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search..." className="w-full rounded-full bg-card pl-10" />
            </div>
        </div>
        <div className="flex items-center gap-4">
          {renderUserActions()}
        </div>
      </div>
    </header>
  );
}
