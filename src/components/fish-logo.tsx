import { cn } from "@/lib/utils"

export function FishLogo({ className }: { className?: string }) {
  return (
    <div className={cn("w-full h-full flex items-center justify-center bg-primary rounded-full text-primary-foreground", className)}>
        <span className="font-bold text-lg">MM</span>
    </div>
  );
}
