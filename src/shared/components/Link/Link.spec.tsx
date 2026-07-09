import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Link } from './Link'

describe('Link', () => {
  describe('Given a Link is rendered', () => {
    it('Then it displays children content', () => {
      render(<Link href='/test'>Click me</Link>)
      expect(screen.getByRole('link')).toHaveTextContent('Click me')
    })

    it('Then it has the href attribute', () => {
      render(<Link href='/test'>Click</Link>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/test')
    })

    it('Then it has link styles applied', () => {
      render(
        <Link href='/test' dataTestId='link'>
          Click
        </Link>
      )
      // CSS modules transform class names, just verify className exists
      expect(screen.getByTestId('link')).toHaveAttribute('class')
    })
  })

  describe('Given variant prop is provided', () => {
    it('When variant is nav, Then element renders correctly', () => {
      render(
        <Link href='/test' variant='nav' dataTestId='link'>
          Click
        </Link>
      )
      expect(screen.getByTestId('link')).toBeInTheDocument()
      expect(screen.getByTestId('link')).toHaveAttribute('class')
    })

    it('When variant is subtle, Then element renders correctly', () => {
      render(
        <Link href='/test' variant='subtle' dataTestId='link'>
          Click
        </Link>
      )
      expect(screen.getByTestId('link')).toBeInTheDocument()
      expect(screen.getByTestId('link')).toHaveAttribute('class')
    })
  })

  describe('Given external prop is true', () => {
    it('Then target="_blank" is set', () => {
      render(
        <Link href='https://example.com' external>
          External
        </Link>
      )
      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
    })

    it('Then rel="noopener noreferrer" is set', () => {
      render(
        <Link href='https://example.com' external>
          External
        </Link>
      )
      expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Given external prop is false', () => {
    it('Then target is not set', () => {
      render(<Link href='/internal'>Internal</Link>)
      expect(screen.getByRole('link')).not.toHaveAttribute('target')
    })

    it('Then rel is not set', () => {
      render(<Link href='/internal'>Internal</Link>)
      expect(screen.getByRole('link')).not.toHaveAttribute('rel')
    })
  })

  describe('Given className is provided', () => {
    it('Then custom className is applied', () => {
      render(
        <Link href='/test' className='custom-class' dataTestId='link'>
          Click
        </Link>
      )
      expect(screen.getByTestId('link').className).toContain('custom-class')
    })
  })

  describe('Given a ref is provided', () => {
    it('Then ref is forwarded to anchor element', () => {
      const ref = createRef<HTMLAnchorElement>()
      render(
        <Link href='/test' ref={ref}>
          Click
        </Link>
      )
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
    })
  })

  describe('Given dataTestId is provided', () => {
    it('Then data-testid attribute is set', () => {
      render(
        <Link href='/test' dataTestId='my-link'>
          Click
        </Link>
      )
      expect(screen.getByTestId('my-link')).toBeInTheDocument()
    })
  })
})
