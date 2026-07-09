/* eslint-disable react-hooks/immutability -- useSignal returns a mutable signal; mutations are intentional */
import { FC, useRef, useLayoutEffect, useCallback, KeyboardEvent, useMemo } from 'react'
import { useSignal, useSignals } from '@preact/signals-react/runtime'
import type { DropdownProps, DropdownOption } from './interfaces'
import { DropdownTrigger } from './DropdownTrigger'
import { DropdownPanel } from './DropdownPanel'
import { DropdownOptionItem } from './DropdownOptionItem'
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
}: DropdownProps<T>): ReturnType<FC> {
  useSignals()
  const isOpen = useSignal(false)
  const focusedIndex = useSignal(-1)
  const justOpenedRef = useRef(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useMemo(
    () => options.map(() => ({ current: null as HTMLDivElement | null })),
    [options]
  )
  const selectedIndex = options.findIndex(opt => opt.value === value)

  useLayoutEffect(() => {
    if (!isOpen.value) return undefined
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node
      const dropdown = triggerRef.current?.parentElement
      if (dropdown && !dropdown.contains(target)) {
        isOpen.value = false
        focusedIndex.value = -1
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen.value, isOpen, focusedIndex])

  useLayoutEffect(() => {
    if (isOpen.value && focusedIndex.value >= 0 && justOpenedRef.current) {
      justOpenedRef.current = false
      const t = setTimeout(() => optionRefs[focusedIndex.value]?.current?.focus(), 0)
      return (): void => {
        clearTimeout(t)
      }
    }
    return undefined
  }, [isOpen.value, focusedIndex.value, optionRefs])

  const openDropdown = useCallback((): void => {
    justOpenedRef.current = true
    isOpen.value = true
    focusedIndex.value = selectedIndex >= 0 ? selectedIndex : 0
  }, [selectedIndex, isOpen, focusedIndex])

  const closeDropdown = useCallback(
    (returnFocus?: boolean): void => {
      isOpen.value = false
      focusedIndex.value = -1
      justOpenedRef.current = false
      if (returnFocus !== false) {
        triggerRef.current?.focus()
      }
    },
    [isOpen, focusedIndex]
  )

  const selectOption = useCallback(
    (option: DropdownOption<T>): void => {
      onChange(option.value)
      closeDropdown(true)
    },
    [onChange, closeDropdown]
  )

  const handleTriggerClick = useCallback((): void => {
    if (isOpen.value) {
      closeDropdown(false)
    } else {
      openDropdown()
    }
  }, [isOpen.value, openDropdown, closeDropdown])

  const handleTriggerKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      switch (e.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
        case 'ArrowUp':
          e.preventDefault()
          if (!isOpen.value) {
            openDropdown()
          }
          break
      }
    },
    [isOpen.value, openDropdown]
  )

  const moveFocus = useCallback(
    (newIndex: number): void => {
      focusedIndex.value = newIndex
      optionRefs[newIndex]?.current?.focus()
    },
    [focusedIndex, optionRefs]
  )

  const handleOptionKeyDown = useCallback(
    (e: KeyboardEvent, index: number): void => {
      const len = options.length
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault()
          selectOption(options[index] as DropdownOption<T>)
          break
        case 'ArrowDown':
          e.preventDefault()
          moveFocus((index + 1) % len)
          break
        case 'ArrowUp':
          e.preventDefault()
          moveFocus((index - 1 + len) % len)
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
          closeDropdown(true)
          break
        case 'Tab':
          closeDropdown(false)
          break
      }
    },
    [options, selectOption, closeDropdown, moveFocus]
  )

  const handleOptionClick = useCallback(
    (option: DropdownOption<T>): void => {
      selectOption(option)
    },
    [selectOption]
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
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        buttonRef={triggerRef}
        dataTestId={`${dataTestId}-trigger`}
      />
      <DropdownPanel
        id={`${id}-panel`}
        aria-labelledby={`${id}-trigger`}
        isOpen={isOpen.value}
        dataTestId={`${dataTestId}-panel`}
      >
        {options.map((option, index) => (
          <DropdownOptionItem
            key={option.value}
            option={option}
            isSelected={option.value === value}
            isFocused={index === focusedIndex.value}
            onClick={(): void => handleOptionClick(option as DropdownOption<T>)}
            onKeyDown={(e): void => handleOptionKeyDown(e, index)}
            id={`${id}-option-${option.value}`}
            tabIndex={index === focusedIndex.value ? 0 : -1}
            setRef={(el: HTMLDivElement | null): void => {
              optionRefs[index].current = el
            }}
            dataTestId={`${dataTestId}-option-${option.value}`}
          />
        ))}
      </DropdownPanel>
    </div>
  )
}

export default Dropdown
