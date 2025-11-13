import { cn } from "@/lib/utils"

export function FishLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("w-full h-full", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M60.5,21.9c-5.4-2.2-11.3-2.9-17-2.1c-11.4,1.6-21,8-26.6,17.4c-4.4,7.4-5.3,16.2-2.5,24.3" />
      <path d="M22.9,76.5c9.2-2.8,18.8-3.8,28.2-2.9c13.2,1.3,25.2,7.3,34.1,16.5" />
      <path d="M85.1,37.3c0.3-6.4-1.5-12.8-5.3-18.1" />
      <path d="M84.7,37.3c3.8,3.3,6.4,7.9,7.4,12.9c1,5-0.1,10.1-3.2,14.4" />
      <path d="M37.3,34.9c0,1.9-1.5,3.4-3.4,3.4s-3.4-1.5-3.4-3.4s1.5-3.4,3.4-3.4S37.3,33,37.3,34.9z" />
    </svg>
  );
}
