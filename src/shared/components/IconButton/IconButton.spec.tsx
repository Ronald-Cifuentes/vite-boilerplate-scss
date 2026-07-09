import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { MdClose } from 'react-icons/md'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  describe('Given an IconButton is rendered', () => {
    it('Then it renders the icon', () => {
      render(<IconButton icon={MdClose} aria-label='Close' dataTestId='icon-btn' />)
      const button = screen.getByTestId('icon-btn')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('Then it has the required aria-label', () => {
      render(<IconButton icon={MdClose} aria-label='Close' />)
      expect(screen.getByRole('button')).toHaveAccessibleName('Close')
    })

    it('Then icon has aria-hidden', () => {
      render(<IconButton icon={MdClose} aria-label='Close' dataTestId='icon-btn' />)
      const svg = screen.getByTestId('icon-btn').querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })

    it('Then it has a title tooltip matching aria-label', () => {
      render(<IconButton icon={MdClose} aria-label='Close' />)
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Close')
    })

    it('Then it has type="button" by default', () => {
      render(<IconButton icon={MdClose} aria-label='Close' />)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })
  })

  describe('Given variant prop is provided', () => {
    it('When variant is primary, Then element renders correctly', () => {
      render(<IconButton icon={MdClose} aria-label='Close' variant='primary' dataTestId='btn' />)
      expect(screen.getByTestId('btn')).toBeInTheDocument()
      expect(screen.getByTestId('btn')).toHaveAttribute('class')
    })

    it('When variant is secondary, Then element renders correctly', () => {
      render(<IconButton icon={MdClose} aria-label='Close' variant='secondary' dataTestId='btn' />)
      expect(screen.getByTestId('btn')).toBeInTheDocument()
      expect(screen.getByTestId('btn')).toHaveAttribute('class')
    })

    it('When variant is ghost (default), Then element renders correctly', () => {
      render(<IconButton icon={MdClose} aria-label='Close' dataTestId='btn' />)
      expect(screen.getByTestId('btn')).toBeInTheDocument()
      expect(screen.getByTestId('btn')).toHaveAttribute('class')
    })
  })

  describe('Given size prop is provided', () => {
    it('When size is sm, Then element renders correctly', () => {
      render(<IconButton icon={MdClose} aria-label='Close' size='sm' dataTestId='btn' />)
      expect(screen.getByTestId('btn')).toBeInTheDocument()
      expect(screen.getByTestId('btn')).toHaveAttribute('class')
    })

    it('When size is lg, Then element renders correctly', () => {
      render(<IconButton icon={MdClose} aria-label='Close' size='lg' dataTestId='btn' />)
      expect(screen.getByTestId('btn')).toBeInTheDocument()
      expect(screen.getByTestId('btn')).toHaveAttribute('class')
    })
  })

  describe('Given onClick handler is provided', () => {
    it('When button is clicked, Then handler is called', () => {
      const handleClick = jest.fn()
      render(<IconButton icon={MdClose} aria-label='Close' onClick={handleClick} />)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Given button is disabled', () => {
    it('Then button has disabled attribute', () => {
      render(<IconButton icon={MdClose} aria-label='Close' disabled />)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('Given className is provided', () => {
    it('Then custom className is applied', () => {
      render(
        <IconButton icon={MdClose} aria-label='Close' className='custom-class' dataTestId='btn' />
      )
      expect(screen.getByTestId('btn').className).toContain('custom-class')
    })
  })

  describe('Given a ref is provided', () => {
    it('Then ref is forwarded to button element', () => {
      const ref = createRef<HTMLButtonElement>()
      render(<IconButton icon={MdClose} aria-label='Close' ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })
})
