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
      <path d="M2 16.1A5 5 0 0 1 5.9 11a5 5 0 0 1 6.22 8.35" />
      <path d="M22 16.1a5 5 0 0 0-3.9-5.1 5 5 0 0 0-6.22 8.35" />
      <path d="M10.83 15.39a2.25 2.25 0 0 1-2.05-2.25c0-1.24 1.01-2.25 2.25-2.25" />
      <path d="M13.43 17.58a2.25 2.25 0 0 0 2.05 2.25c1.24 0 2.25-1.01 2.25-2.25" />
      <path d="m2.5 12.5 5-2.5L12 12.5l5-2.5 4.5 2.5" />
      <path d="m2.5 17.5 5-2.5L12 17.5l5-2.5 4.5 2.5" />
      <path d="M12 2v4" />
      <path d="M12 12.5v5" />
    </svg>
  );
}
