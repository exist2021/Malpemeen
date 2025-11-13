
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MainNav } from '@/components/layout/main-nav';
import { FishLogo } from '../fish-logo';
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
import { User as UserIcon, Settings, LogOut, Home } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CustomerAccountForm } from '@/app/customer/dashboard/customer-account-form';


export function Header() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { role, isRoleLoading } = useUserRole();
  const auth = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
      router.push('/');
    }
  };
  
  const isLoginPage = pathname.includes('/login');
  if (isLoginPage) {
    return null;
  }

  const renderUserActions = () => {
    if (isUserLoading) {
      return <Skeleton className="h-10 w-24 rounded-md" />;
    }
    
    if (user) {
        if (role === 'customer') {
            return (
                <div className="flex items-center gap-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Settings className="mr-2 h-4 w-4" />
                                My Account
                            </Button>
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
                    <Button onClick={handleLogout} variant="outline">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            )
        }
        return (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isRoleLoading ? (
                 <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              ): (
                <>
                  {role === 'seller' && <DropdownMenuItem onClick={() => router.push('/seller/dashboard')}>Seller Dashboard</DropdownMenuItem>}
                </>
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
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Login</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push('/customer/login')}>
            Customer Login
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/seller/login')}>
            Seller Login
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <FishLogo className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold whitespace-nowrap">Malpe Meen Pvt Ltd</span>
          </Link>
          <MainNav />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/"><Home className="mr-2 h-4 w-4" />Home</Link>
          </Button>
          {renderUserActions()}
        </div>
      </div>
    </header>
  );
}
