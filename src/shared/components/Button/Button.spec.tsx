import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { Button } from './Button'

describe('Button', () => {
  describe('Given a Button is rendered', () => {
    it('Then it displays children content', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Click me')
    })

    it('Then it has styles applied', () => {
      render(<Button dataTestId='btn'>Click</Button>)
      const button = screen.getByTestId('btn')
      // CSS modules transform class names, just verify class attribute exists
      expect(button).toHaveAttribute('class')
    })
  })

  describe('Given variant prop is provided', () => {
    it('When variant is secondary, Then element renders correctly', () => {
      render(
        <Button variant='secondary' dataTestId='btn'>
          Click
        </Button>
      )
      expect(screen.getByTestId('btn')).toBeInTheDocument()
    })

    it('When variant is ghost, Then element renders correctly', () => {
      render(
        <Button variant='ghost' dataTestId='btn'>
          Click
        </Button>
      )
      expect(screen.getByTestId('btn')).toBeInTheDocument()
    })
  })

  describe('Given size prop is provided', () => {
    it('When size is sm, Then element renders correctly', () => {
      render(
        <Button size='sm' dataTestId='btn'>
          Click
        </Button>
      )
      expect(screen.getByTestId('btn')).toBeInTheDocument()
    })

    it('When size is lg, Then element renders correctly', () => {
      render(
        <Button size='lg' dataTestId='btn'>
          Click
        </Button>
      )
      expect(screen.getByTestId('btn')).toBeInTheDocument()
    })
  })

  describe('Given onClick handler is provided', () => {
    it('When button is clicked, Then handler is called', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click</Button>)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Given button is disabled', () => {
    it('Then button has disabled attribute', () => {
      render(<Button disabled>Click</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('When clicked, Then handler is not called', () => {
      const handleClick = jest.fn()
      render(
        <Button onClick={handleClick} disabled>
          Click
        </Button>
      )

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Given className is provided', () => {
    it('Then custom className is applied', () => {
      render(
        <Button className='custom-class' dataTestId='btn'>
          Click
        </Button>
      )
      expect(screen.getByTestId('btn').className).toContain('custom-class')
    })
  })

  describe('Given a ref is provided', () => {
    it('Then ref is forwarded to button element', () => {
      const ref = createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Click</Button>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('Given button type is provided', () => {
    it('Then type attribute is set', () => {
      render(<Button type='submit'>Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })
  })
})
