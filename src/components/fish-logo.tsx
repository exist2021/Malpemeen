import { cn } from "@/lib/utils"

export function FishLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 60"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
    >
      <path
        d="M10 30 Q 25 10, 40 30 T 70 30 T 90 30"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <text
        x="50"
        y="52"
        fontFamily="sans-serif"
        fontSize="12"
        fill="currentColor"
        textAnchor="middle"
        fontWeight="bold"
        letterSpacing="0.05em"
      >
        MALPE MEEN
      </text>
    </svg>
  );
}
