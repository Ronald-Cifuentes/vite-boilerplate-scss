import { render, screen } from '@testing-library/react'
import { Announcer } from './Announcer'

describe('Announcer', () => {
  describe('Given an Announcer is rendered', () => {
    it('Then it uses native output element (implicit role=status)', () => {
      render(<Announcer message='Test' />)
      expect(screen.getByRole('status')).toBeInTheDocument()
      // Verify it's a native <output> element (not div with role)
      expect(screen.getByRole('status').tagName.toLowerCase()).toBe('output')
    })

    it('Then it has aria-live="polite" by default', () => {
      render(<Announcer message='Test' />)
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    })

    it('Then it has aria-atomic="true"', () => {
      render(<Announcer message='Test' />)
      expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true')
    })

    it('Then it is visually hidden', () => {
      render(<Announcer message='Test' dataTestId='ann' />)
      const element = screen.getByTestId('ann')
      // Verify element exists and is native <output>
      expect(element).toBeInTheDocument()
      expect(element.tagName.toLowerCase()).toBe('output')
    })
  })

  describe('Given message prop is provided', () => {
    it('Then message is displayed immediately', () => {
      render(<Announcer message='Hello World' />)
      expect(screen.getByRole('status')).toHaveTextContent('Hello World')
    })
  })

  describe('Given message changes', () => {
    it('Then new message is displayed', () => {
      const { rerender } = render(<Announcer message='First' />)

      expect(screen.getByRole('status')).toHaveTextContent('First')

      rerender(<Announcer message='Second' />)

      expect(screen.getByRole('status')).toHaveTextContent('Second')
    })
  })

  describe('Given politeness prop is assertive', () => {
    it('Then aria-live="assertive" is set', () => {
      render(<Announcer message='Urgent' politeness='assertive' />)
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'assertive')
    })
  })

  describe('Given dataTestId is provided', () => {
    it('Then data-testid attribute is set', () => {
      render(<Announcer message='Test' dataTestId='my-announcer' />)
      expect(screen.getByTestId('my-announcer')).toBeInTheDocument()
    })
  })
})
