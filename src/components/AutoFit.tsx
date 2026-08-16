import { useEffect, useRef, useState, type ReactNode } from 'react'

interface AutoFitProps {
  children: ReactNode
  className?: string
  minScale?: number
}

/** Scales content down until it fits within the container height. */
export function AutoFit({ children, className = '', minScale = 0.55 }: AutoFitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    const fit = () => {
      content.style.transform = 'scale(1)'
      content.style.width = '100%'

      const available = container.clientHeight
      const needed = content.scrollHeight
      if (needed <= available || available === 0) {
        setScale(1)
        return
      }
      const next = Math.max(minScale, available / needed)
      setScale(next)
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(container)
    ro.observe(content)
    return () => ro.disconnect()
  }, [children, minScale])

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div
        ref={contentRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: scale < 1 ? `${100 / scale}%` : '100%',
        }}
      >
        {children}
      </div>
    </div>
  )
}
