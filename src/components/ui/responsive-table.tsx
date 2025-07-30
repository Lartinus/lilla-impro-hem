import * as React from "react"
import { cn } from "@/lib/utils"

const ResponsiveTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full overflow-auto",
      className
    )}
    {...props}
  />
))
ResponsiveTable.displayName = "ResponsiveTable"

const ResponsiveTableContent = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn(
      "w-full caption-bottom text-sm min-w-full",
      className
    )}
    {...props}
  />
))
ResponsiveTableContent.displayName = "ResponsiveTableContent"

export { ResponsiveTable, ResponsiveTableContent }