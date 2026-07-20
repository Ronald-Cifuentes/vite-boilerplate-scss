/* eslint-disable react-hooks/immutability -- useSignal returns a mutable signal; mutations are intentional */
import { FC, useRef, useLayoutEffect, useCallback, KeyboardEvent, useMemo } from 'react'
import { useSignal, useSignals } from '@preact/signals-react/runtime'
import type { DropdownProps, DropdownOption } from './interfaces'
import { DropdownTrigger } from './DropdownTrigger'
import { DropdownPanel } from './DropdownPanel'
import { DropdownOptionItem } from './DropdownOptionItem'
import { useDropdownPosition, type DropdownPosition } from './useDropdownPosition'
import styles from './Dropdown.module.scss'

export function Dropdown<T extends string = string>({
  options,
  value,
  onChange,
  triggerIcon,
  triggerLabel,
  id,
  dataTestId = 'dropdown',
  className,
}: Readonly<DropdownProps<T>>): ReturnType<FC> {
  useSignals()
  const isOpen = useSignal(false)
  const isClosing = useSignal(false)
  const focusIdx = useSignal(-1)
  const justOpened = useRef(false)
  const trigRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const optRefs = useMemo(
    () => options.map(() => ({ current: null as HTMLDivElement | null })),
    [options]
  )
  const selIdx = options.findIndex(o => o.value === value)
  const pos = useSignal<DropdownPosition>({ flipVertical: false, flipHorizontal: false })
  const onPosChange = useCallback(
    (p: DropdownPosition): void => {
      pos.value = p
    },
    [pos]
  )
  useDropdownPosition({
    isOpen: isOpen.value,
    triggerRef: trigRef,
    panelRef,
    onPositionChange: onPosChange,
  })
  const onCloseAnimEnd = useCallback((): void => {
    isClosing.value = false
  }, [isClosing])

  useLayoutEffect(() => {
    if (!isOpen.value) return undefined
    const h = (e: MouseEvent): void => {
      const dd = trigRef.current?.parentElement
      if (dd && !dd.contains(e.target as Node)) {
        isOpen.value = false
        focusIdx.value = -1
      }
    }
    document.addEventListener('mousedown', h)
    return (): void => {
      document.removeEventListener('mousedown', h)
    }
  }, [isOpen.value, isOpen, focusIdx])

  useLayoutEffect(() => {
    if (isOpen.value && focusIdx.value >= 0 && justOpened.current) {
      justOpened.current = false
      const t = setTimeout(() => optRefs[focusIdx.value]?.current?.focus(), 0)
      return (): void => {
        clearTimeout(t)
      }
    }
    return undefined
  }, [isOpen.value, focusIdx.value, optRefs])

  const open = useCallback((): void => {
    justOpened.current = true
    isOpen.value = true
    focusIdx.value = Math.max(selIdx, 0)
  }, [selIdx, isOpen, focusIdx])
  const close = useCallback(
    (rf?: boolean): void => {
      // aria-expanded updates IMMEDIATELY (isOpen=false), but visual close defers
      isOpen.value = false
      isClosing.value = true
      focusIdx.value = -1
      justOpened.current = false
      if (rf !== false) trigRef.current?.focus()
    },
    [isOpen, isClosing, focusIdx]
  )
  const select = useCallback(
    (o: DropdownOption<T>): void => {
      onChange(o.value)
      close(true)
    },
    [onChange, close]
  )
  const onTrigClick = useCallback((): void => {
    if (isOpen.value) {
      close(false)
    } else {
      open()
    }
  }, [isOpen.value, open, close])
  const onTrigKey = useCallback(
    (e: KeyboardEvent): void => {
      // istanbul ignore else - all 4 keys tested
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        if (!isOpen.value) open()
      }
    },
    [isOpen.value, open]
  )
  const moveFocus = useCallback(
    (i: number): void => {
      focusIdx.value = i
      optRefs[i]?.current?.focus()
    },
    [focusIdx, optRefs]
  )
  const onOptKey = useCallback(
    (e: KeyboardEvent, i: number): void => {
      const len = options.length
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault()
          select(options[i])
          break
        case 'ArrowDown':
          e.preventDefault()
          moveFocus((i + 1) % len)
          break
        case 'ArrowUp':
          e.preventDefault()
          moveFocus((i - 1 + len) % len)
          break
        case 'Home':
          e.preventDefault()
          moveFocus(0)
          break
        case 'End':
          e.preventDefault()
          moveFocus(len - 1)
          break
        case 'Escape':
          e.preventDefault()
          close(true)
          break
        case 'Tab':
          close(false)
          break
      }
    },
    [options, select, close, moveFocus]
  )
  const onOptClick = useCallback(
    (o: DropdownOption<T>): void => {
      select(o)
    },
    [select]
  )

  return (
    <div
      className={[styles.dropdown, className].filter(Boolean).join(' ')}
      data-testid={dataTestId}
    >
      <DropdownTrigger
        icon={triggerIcon}
        aria-label={triggerLabel}
        aria-expanded={isOpen.value}
        aria-controls={`${id}-panel`}
        id={`${id}-trigger`}
        onClick={onTrigClick}
        onKeyDown={onTrigKey}
        buttonRef={trigRef}
        dataTestId={`${dataTestId}-trigger`}
      />
      <DropdownPanel
        id={`${id}-panel`}
        aria-labelledby={`${id}-trigger`}
        isOpen={isOpen.value}
        isClosing={isClosing.value}
        onCloseAnimationEnd={onCloseAnimEnd}
        flipVertical={pos.value.flipVertical}
        flipHorizontal={pos.value.flipHorizontal}
        panelRef={panelRef}
        dataTestId={`${dataTestId}-panel`}
      >
        {options.map((o, i) => (
          <DropdownOptionItem
            key={o.value}
            option={o}
            isSelected={o.value === value}
            isFocused={i === focusIdx.value}
            onClick={(): void => onOptClick(o)}
            onKeyDown={(e): void => onOptKey(e, i)}
            id={`${id}-option-${o.value}`}
            tabIndex={i === focusIdx.value ? 0 : -1}
            setRef={(el: HTMLDivElement | null): void => {
              optRefs[i].current = el
            }}
            dataTestId={`${dataTestId}-option-${o.value}`}
          />
        ))}
      </DropdownPanel>
    </div>
  )
}
