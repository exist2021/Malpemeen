
import Image from 'next/image';
import { cn } from "@/lib/utils"

export function FishLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Image 
        src="/logo.png" 
        alt="Malpe Meen Logo"
        fill
        className="object-contain"
      />
    </div>
  );
}
