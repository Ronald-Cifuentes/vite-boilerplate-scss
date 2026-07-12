import { useLayoutEffect, useEffect, useCallback, RefObject } from 'react'

const G = 8 // viewport gutter

export interface DropdownPosition {
  flipVertical: boolean
  flipHorizontal: boolean
}

interface CalcInput {
  triggerRect: DOMRect
  panelRect: DOMRect
  viewportWidth: number
  viewportHeight: number
}

export function calculateDropdownPosition(i: CalcInput): DropdownPosition {
  const below = i.viewportHeight - i.triggerRect.bottom - G
  const above = i.triggerRect.top - G
  return {
    flipVertical: below < i.panelRect.height && above > below,
    flipHorizontal: i.triggerRect.left + i.panelRect.width > i.viewportWidth - G,
  }
}

interface Opts {
  isOpen: boolean
  triggerRef: RefObject<HTMLButtonElement | null>
  panelRef: RefObject<HTMLDivElement | null>
  onPositionChange: (pos: DropdownPosition) => void
}

export function useDropdownPosition({
  isOpen,
  triggerRef,
  panelRef,
  onPositionChange,
}: Opts): void {
  const calc = useCallback((): void => {
    const t = triggerRef.current,
      p = panelRef.current
    if (!t || !p) return
    onPositionChange(
      calculateDropdownPosition({
        triggerRect: t.getBoundingClientRect(),
        panelRect: p.getBoundingClientRect(),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      })
    )
  }, [triggerRef, panelRef, onPositionChange])

  // Synchronous position calculation in layout effect - runs before paint
  // so flip classes are applied before the panel is visually displayed
  useLayoutEffect(() => {
    if (!isOpen) return
    calc()
  }, [isOpen, calc])

  // ResizeObserver re-measures if panel dimensions change after open
  // (e.g., content loads asynchronously) + window resize handler
  useEffect(() => {
    if (!isOpen) return undefined
    let ro: ResizeObserver | null = null
    if (panelRef.current) {
      ro = new ResizeObserver(calc)
      ro.observe(panelRef.current)
    }
    let tid: ReturnType<typeof setTimeout> | null = null
    const onResize = (): void => {
      if (tid) clearTimeout(tid)
      tid = setTimeout(calc, 100)
    }
    window.addEventListener('resize', onResize)
    return (): void => {
      ro?.disconnect()
      window.removeEventListener('resize', onResize)
      if (tid) clearTimeout(tid)
    }
  }, [isOpen, calc, panelRef])
}
