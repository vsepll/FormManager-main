import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn("animate-spin rounded-full border-4 border-current border-t-transparent h-8 w-8", className)}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}