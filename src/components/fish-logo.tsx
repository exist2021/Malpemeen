import { cn } from "@/lib/utils"

export function FishLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 60"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
    >
      <defs>
        <path
          id="curve"
          d="M 10,45 C 30,55 90,55 110,45"
          fill="transparent"
        />
      </defs>
      <path
        d="M1.5 26.25C1.5 26.25 18.06 10.31 37.5 13.5C56.94 16.69 57.75 33.75 76.5 33.75C95.25 33.75 110.25 21.75 118.5 18.75"
        stroke="#00AEEF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M28.5 36.75C28.5 36.75 41.25 30.75 57.75 33.75C74.25 36.75 78.75 45.75 96.75 45C114.75 44.25 118.5 42.75 118.5 42.75"
        stroke="#67D3F2"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M48.75 45.75C48.75 45.75 63.75 42.75 75.75 45C87.75 47.25 93 51.75 107.25 50.25C121.5 48.75 118.5 48.75 118.5 48.75"
        stroke="#67D3F2"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <text fill="#67D3F2" fontSize="11" fontWeight="bold" letterSpacing="0.05em">
        <textPath href="#curve" startOffset="50%" textAnchor="middle">
          MALPE MEEN
        </textPath>
      </text>
    </svg>
  );
}
