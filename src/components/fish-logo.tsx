import Image from 'next/image';
import { cn } from "@/lib/utils"

export function FishLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Image 
        src="/logo.png" 
        alt="Malpe Meen Logo"
        width={64}
        height={64}
        className="object-contain"
      />
    </div>
  );
}
