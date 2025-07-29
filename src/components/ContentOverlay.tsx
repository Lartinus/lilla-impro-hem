import { ReactNode } from 'react'

interface ContentOverlayProps {
  children: ReactNode
  className?: string
}

export default function ContentOverlay({ children, className = "" }: ContentOverlayProps) {
  return (
    <div className={`bg-[hsl(var(--content-overlay))] rounded-t-[20px] rounded-b-[20px] md:rounded-none md:bg-transparent ${className}`}>
      {children}
    </div>
  )
}