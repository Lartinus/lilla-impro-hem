
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-between text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-satoshi",
  {
    variants: {
      variant: {
        default: "bg-primary-red text-white hover:bg-primary-red-hover whitespace-nowrap",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 whitespace-nowrap",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground whitespace-nowrap",
        secondary:
          "bg-action-blue text-white hover:bg-action-blue-hover whitespace-nowrap",
        ghost: "hover:bg-accent hover:text-accent-foreground whitespace-nowrap",
        link: "text-primary underline-offset-4 hover:underline whitespace-nowrap",
        blue: "bg-action-blue text-white hover:bg-action-blue-hover whitespace-nowrap",
        homepage: "bg-primary-red text-white hover:bg-primary-red-hover text-left leading-[0.8]",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-9 px-3",
        lg: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
        homepage: "min-h-10 px-4 text-base w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
