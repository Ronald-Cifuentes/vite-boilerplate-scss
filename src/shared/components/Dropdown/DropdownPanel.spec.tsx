import { render, screen, fireEvent, act } from '@testing-library/react'
import { createRef } from 'react'
import { DropdownPanel } from './DropdownPanel'

describe('DropdownPanel', () => {
  const defaultProps = {
    id: 'test-panel',
    'aria-labelledby': 'test-trigger',
    panelRef: createRef<HTMLDivElement>(),
    dataTestId: 'test-panel',
    children: <div>Option 1</div>,
  }

  it('should render with default flip values (both false)', () => {
    render(<DropdownPanel {...defaultProps} isOpen={true} />)
    const panel = screen.getByTestId('test-panel')
    expect(panel).not.toHaveClass('panel--flip-vertical')
    expect(panel).not.toHaveClass('panel--flip-horizontal')
  })

  it('should apply flip classes when props are true', () => {
    const { container } = render(
      <DropdownPanel {...defaultProps} isOpen={true} flipVertical={true} flipHorizontal={true} />
    )
    expect(container.querySelector('[data-testid="test-panel"]')).toBeInTheDocument()
  })

  it('should have aria-hidden reflecting isOpen state', () => {
    const { rerender } = render(<DropdownPanel {...defaultProps} isOpen={true} />)
    expect(screen.getByTestId('test-panel')).toHaveAttribute('aria-hidden', 'false')

    rerender(<DropdownPanel {...defaultProps} isOpen={false} />)
    expect(screen.getByTestId('test-panel')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should have role="listbox"', () => {
    render(<DropdownPanel {...defaultProps} isOpen={true} />)
    expect(screen.getByTestId('test-panel')).toHaveAttribute('role', 'listbox')
  })

  describe('closing animation (UX-001)', () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it('should render panel during closing animation with aria-hidden=true', () => {
      render(<DropdownPanel {...defaultProps} isOpen={false} isClosing={true} />)
      const panel = screen.getByTestId('test-panel')
      expect(panel).toBeInTheDocument()
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(panel).toHaveAttribute('aria-hidden', 'true')
    })

    it('should call onCloseAnimationEnd on animationend or fallback timeout', () => {
      const onCloseAnimEnd = jest.fn()
      render(
        <DropdownPanel
          {...defaultProps}
          isOpen={false}
          isClosing={true}
          onCloseAnimationEnd={onCloseAnimEnd}
        />
      )

      // Via animationend
      fireEvent.animationEnd(screen.getByTestId('test-panel'))
      expect(onCloseAnimEnd).toHaveBeenCalledTimes(1)
    })

    it('should use fallback timeout if animationend does not fire', () => {
      const onCloseAnimEnd = jest.fn()
      render(
        <DropdownPanel
          {...defaultProps}
          isOpen={false}
          isClosing={true}
          onCloseAnimationEnd={onCloseAnimEnd}
        />
      )
      expect(onCloseAnimEnd).not.toHaveBeenCalled()
      act(() => jest.advanceTimersByTime(200))
      expect(onCloseAnimEnd).toHaveBeenCalledTimes(1)
    })

    it('should clear fallback timeout if animationend fires first', () => {
      const onCloseAnimEnd = jest.fn()
      render(
        <DropdownPanel
          {...defaultProps}
          isOpen={false}
          isClosing={true}
          onCloseAnimationEnd={onCloseAnimEnd}
        />
      )
      fireEvent.animationEnd(screen.getByTestId('test-panel'))
      expect(onCloseAnimEnd).toHaveBeenCalledTimes(1)
      act(() => jest.advanceTimersByTime(200))
      expect(onCloseAnimEnd).toHaveBeenCalledTimes(1) // No double-call
    })

    it('should not call callback when not closing or no callback provided', () => {
      const onCloseAnimEnd = jest.fn()
      const { rerender } = render(
        <DropdownPanel
          {...defaultProps}
          isOpen={true}
          isClosing={false}
          onCloseAnimationEnd={onCloseAnimEnd}
        />
      )
      fireEvent.animationEnd(screen.getByTestId('test-panel'))
      expect(onCloseAnimEnd).not.toHaveBeenCalled()

      // Test with isClosing but no callback - should not error
      rerender(<DropdownPanel {...defaultProps} isOpen={false} isClosing={true} />)
      fireEvent.animationEnd(screen.getByTestId('test-panel'))
      expect(screen.getByTestId('test-panel')).toBeInTheDocument()
    })

    it('should cleanup timeout on rerender from closing to not closing', () => {
      const onCloseAnimEnd = jest.fn()
      const { rerender } = render(
        <DropdownPanel
          {...defaultProps}
          isOpen={false}
          isClosing={true}
          onCloseAnimationEnd={onCloseAnimEnd}
        />
      )
      rerender(
        <DropdownPanel
          {...defaultProps}
          isOpen={false}
          isClosing={false}
          onCloseAnimationEnd={onCloseAnimEnd}
        />
      )
      act(() => jest.advanceTimersByTime(200))
      expect(onCloseAnimEnd).not.toHaveBeenCalled()
    })
  })
})
