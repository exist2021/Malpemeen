import { cn } from "@/lib/utils"

export function FishLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-full h-full", className)}
    >
        <path d="M16.5 22a2.5 2.5 0 0 0-4.4-2.1" />
        <path d="M16.5 22a2.5 2.5 0 0 1-4.4-2.1" />
        <path d="M7 10.1A2.5 2.5 0 0 1 9.1 5.7" />
        <path d="m3.3 12.8 1.8-1.9" />
        <path d="M2 10.9s3.8 2.3 6.5 0" />
        <path d="M12.5 5.3a2.5 2.5 0 0 1 5-2.6" />
        <path d="M12.5 5.3a2.5 2.5 0 0 0 5-2.6" />
        <path d="M17.8 12.8s-3.5 2.9-7.2.2" />
        <path d="M20.7 7.2s.9 3.5-1.3 6.3" />
        <path d="M10.1 18.5s-2.4.5-4.2-1.3" />
        <path d="M10.1 18.5s-2.4.5-4.2-1.3" />
        <path d="M12.2 13.7a2.5 2.5 0 0 1 3.6-3.6" />
    </svg>
  );
}
