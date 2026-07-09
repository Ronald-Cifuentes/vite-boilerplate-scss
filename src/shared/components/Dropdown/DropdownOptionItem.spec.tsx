import { render, screen } from '@testing-library/react'
import { MdLanguage } from 'react-icons/md'
import { DropdownOptionItem } from './DropdownOptionItem'
import type { DropdownOption } from './interfaces'

const mockOption: DropdownOption<string> = {
  value: 'en',
  label: 'English',
  icon: MdLanguage,
}

describe('DropdownOptionItem', () => {
  const defaultProps = {
    option: mockOption,
    isSelected: false,
    isFocused: false,
    onClick: jest.fn(),
    onKeyDown: jest.fn(),
    id: 'option-en',
    tabIndex: -1,
    dataTestId: 'test-option',
  }

  it('should render the option with label', () => {
    render(<DropdownOptionItem {...defaultProps} />)
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('should have role="option"', () => {
    render(<DropdownOptionItem {...defaultProps} />)
    expect(screen.getByRole('option')).toBeInTheDocument()
  })

  it('should show aria-selected true when selected', () => {
    render(<DropdownOptionItem {...defaultProps} isSelected={true} />)
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true')
  })

  it('should show aria-selected false when not selected', () => {
    render(<DropdownOptionItem {...defaultProps} isSelected={false} />)
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'false')
  })

  it('should work when setRef is not provided', () => {
    // Render without setRef prop - this covers the if (setRef) branch when false
    render(<DropdownOptionItem {...defaultProps} />)
    expect(screen.getByTestId('test-option')).toBeInTheDocument()
  })

  it('should call setRef when provided and element is created', () => {
    const setRef = jest.fn()
    render(<DropdownOptionItem {...defaultProps} setRef={setRef} />)
    expect(setRef).toHaveBeenCalledWith(expect.any(HTMLDivElement))
  })

  it('should call setRef with null when unmounting', () => {
    const setRef = jest.fn()
    const { unmount } = render(<DropdownOptionItem {...defaultProps} setRef={setRef} />)
    unmount()
    expect(setRef).toHaveBeenCalledWith(null)
  })
})
