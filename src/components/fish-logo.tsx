import { cn } from "@/lib/utils"

export function FishLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-full h-full", className)}
    >
        <path d="M16.5 8.5c-1.8-1.3-3.9-2-6-2-3.6 0-7 2.2-7 6s3.4 6 7 6c2.1 0 4.2-.8 6-2"/>
        <path d="M18.5 7.5c0 2.5 2 4.5 2 4.5-2 0-2 2-2 2"/>
        <path d="M16.5 13.5c1.8 1.3 3.9 2 6 2 3.6 0 7-2.2 7-6s-3.4-6-7-6c-2.1 0-4.2.8-6 2"/>
        <path d="M10 18.5s-1-2-1-4 1-4 1-4"/>
        <path d="M11 6.5v-4"/>
    </svg>
  );
}
