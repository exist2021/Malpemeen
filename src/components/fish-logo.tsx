
import Image from 'next/image';
import { cn } from "@/lib/utils"

export function FishLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Image
        src="https://tse2.mm.bing.net/th/id/OIP.Z9Udy9KlJcw4DbHwtLGTowHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
        alt="Malpe Meen Logo"
        fill
        className="object-contain"
      />
    </div>
  );
}

