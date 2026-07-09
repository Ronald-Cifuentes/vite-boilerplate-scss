/* eslint-disable max-lines-per-function -- comprehensive test suite requires many cases */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MdLanguage, MdLightMode, MdDarkMode } from 'react-icons/md'
import { Dropdown } from './Dropdown'
import type { DropdownOption } from './interfaces'

const mockOptions: DropdownOption<string>[] = [
  { value: 'en', label: 'English', icon: MdLanguage },
  { value: 'es', label: 'Spanish', icon: MdLanguage },
]

const themeOptions: DropdownOption<string>[] = [
  { value: 'light', label: 'Light Mode', icon: MdLightMode },
  { value: 'dark', label: 'Dark Mode', icon: MdDarkMode },
]

describe('Dropdown', () => {
  const defaultProps = {
    options: mockOptions,
    value: 'en',
    onChange: jest.fn(),
    triggerIcon: MdLanguage,
    triggerLabel: 'Select language',
    id: 'test-dropdown',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render trigger button', () => {
      render(<Dropdown {...defaultProps} />)
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument()
    })

    it('should render with custom dataTestId', () => {
      render(<Dropdown {...defaultProps} dataTestId='custom-dropdown' />)
      expect(screen.getByTestId('custom-dropdown')).toBeInTheDocument()
    })

    it('should render panel as hidden initially', () => {
      render(<Dropdown {...defaultProps} />)
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'false')
    })

    it('should apply custom className', () => {
      render(<Dropdown {...defaultProps} className='custom-class' />)
      expect(screen.getByTestId('dropdown')).toHaveClass('custom-class')
    })
  })

  describe('ARIA Attributes', () => {
    it('trigger should have aria-haspopup="listbox"', () => {
      render(<Dropdown {...defaultProps} />)
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-haspopup', 'listbox')
    })

    it('trigger should have aria-expanded="false" when closed', () => {
      render(<Dropdown {...defaultProps} />)
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'false')
    })

    it('trigger should have aria-expanded="true" when open', async () => {
      render(<Dropdown {...defaultProps} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'true')
    })

    it('trigger should have aria-controls pointing to panel', () => {
      render(<Dropdown {...defaultProps} />)
      const trigger = screen.getByTestId('dropdown-trigger')
      const panelId = trigger.getAttribute('aria-controls')
      expect(screen.getByTestId('dropdown-panel')).toHaveAttribute('id', panelId)
    })

    it('trigger should have aria-label', () => {
      render(<Dropdown {...defaultProps} />)
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute(
        'aria-label',
        'Select language'
      )
    })

    it('panel should have role="listbox"', () => {
      render(<Dropdown {...defaultProps} />)
      expect(screen.getByTestId('dropdown-panel')).toHaveAttribute('role', 'listbox')
    })

    it('panel should have aria-labelledby pointing to trigger', () => {
      render(<Dropdown {...defaultProps} />)
      const panel = screen.getByTestId('dropdown-panel')
      const triggerId = panel.getAttribute('aria-labelledby')
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('id', triggerId)
    })

    it('panel should have aria-hidden="true" when closed (DEF-A11Y-1)', () => {
      render(<Dropdown {...defaultProps} />)
      const panel = screen.getByTestId('dropdown-panel')
      expect(panel).toHaveAttribute('aria-hidden', 'true')
    })

    it('panel should have aria-hidden="false" when open (DEF-A11Y-1)', async () => {
      render(<Dropdown {...defaultProps} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      const panel = screen.getByTestId('dropdown-panel')
      expect(panel).toHaveAttribute('aria-hidden', 'false')
    })

    it('options should have role="option"', async () => {
      render(<Dropdown {...defaultProps} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(2)
    })

    it('selected option should have aria-selected="true"', async () => {
      render(<Dropdown {...defaultProps} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      expect(screen.getByTestId('dropdown-option-en')).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByTestId('dropdown-option-es')).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('Mouse Interaction', () => {
    it('should open on trigger click', () => {
      render(<Dropdown {...defaultProps} />)
      act(() => {
        fireEvent.click(screen.getByTestId('dropdown-trigger'))
      })
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'true')
    })

    it('should close on second trigger click', async () => {
      render(<Dropdown {...defaultProps} />)
      const trigger = screen.getByTestId('dropdown-trigger')
      await userEvent.click(trigger)
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'true')
      await userEvent.click(trigger)
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'false')
    })

    it('should select option on click', async () => {
      const onChange = jest.fn()
      render(<Dropdown {...defaultProps} onChange={onChange} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      await userEvent.click(screen.getByTestId('dropdown-option-es'))
      expect(onChange).toHaveBeenCalledWith('es')
    })

    it('should close after selecting option', async () => {
      render(<Dropdown {...defaultProps} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      await userEvent.click(screen.getByTestId('dropdown-option-es'))
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'false')
    })

    it('should close on click outside', async () => {
      render(
        <div>
          <Dropdown {...defaultProps} />
          <button data-testid='outside'>Outside</button>
        </div>
      )
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'true')

      fireEvent.mouseDown(screen.getByTestId('outside'))
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should open on Enter key', async () => {
      render(<Dropdown {...defaultProps} />)
      const trigger = screen.getByTestId('dropdown-trigger')
      fireEvent.keyDown(trigger, { key: 'Enter' })
      await waitFor(() => {
        expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('should open on Space key', async () => {
      render(<Dropdown {...defaultProps} />)
      const trigger = screen.getByTestId('dropdown-trigger')
      fireEvent.keyDown(trigger, { key: ' ' })
      await waitFor(() => {
        expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('should open on ArrowDown key', async () => {
      render(<Dropdown {...defaultProps} />)
      const trigger = screen.getByTestId('dropdown-trigger')
      fireEvent.keyDown(trigger, { key: 'ArrowDown' })
      await waitFor(() => {
        expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('should open on ArrowUp key', async () => {
      render(<Dropdown {...defaultProps} />)
      const trigger = screen.getByTestId('dropdown-trigger')
      fireEvent.keyDown(trigger, { key: 'ArrowUp' })
      await waitFor(() => {
        expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('should navigate down with ArrowDown', async () => {
      render(<Dropdown {...defaultProps} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))

      // First option should be focused (selected one)
      expect(screen.getByTestId('dropdown-option-en')).toHaveFocus()

      await userEvent.keyboard('{ArrowDown}')
      expect(screen.getByTestId('dropdown-option-es')).toHaveFocus()
    })

    it('should wrap around when navigating down past last option', async () => {
      render(<Dropdown {...defaultProps} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))

      await userEvent.keyboard('{ArrowDown}') // Move to es
      await userEvent.keyboard('{ArrowDown}') // Wrap to en
      expect(screen.getByTestId('dropdown-option-en')).toHaveFocus()
    })

    it('should navigate up with ArrowUp', async () => {
      render(<Dropdown {...defaultProps} value='es' />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))

      expect(screen.getByTestId('dropdown-option-es')).toHaveFocus()

      await userEvent.keyboard('{ArrowUp}')
      expect(screen.getByTestId('dropdown-option-en')).toHaveFocus()
    })

    it('should wrap around when navigating up past first option', async () => {
      render(<Dropdown {...defaultProps} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))

      await userEvent.keyboard('{ArrowUp}') // Wrap to es
      expect(screen.getByTestId('dropdown-option-es')).toHaveFocus()
    })

    it('should jump to first option with Home', async () => {
      render(<Dropdown {...defaultProps} value='es' />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))

      await userEvent.keyboard('{Home}')
      expect(screen.getByTestId('dropdown-option-en')).toHaveFocus()
    })

    it('should jump to last option with End', async () => {
      render(<Dropdown {...defaultProps} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))

      await userEvent.keyboard('{End}')
      expect(screen.getByTestId('dropdown-option-es')).toHaveFocus()
    })

    it('should select and close with Enter on focused option', async () => {
      const onChange = jest.fn()
      render(<Dropdown {...defaultProps} onChange={onChange} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      await userEvent.keyboard('{ArrowDown}')
      await userEvent.keyboard('{Enter}')

      expect(onChange).toHaveBeenCalledWith('es')
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'false')
    })

    it('should select and close with Space on focused option', async () => {
      const onChange = jest.fn()
      render(<Dropdown {...defaultProps} onChange={onChange} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      await userEvent.keyboard('{ArrowDown}')
      await userEvent.keyboard(' ')

      expect(onChange).toHaveBeenCalledWith('es')
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'false')
    })

    it('should close and return focus to trigger on Escape', async () => {
      render(<Dropdown {...defaultProps} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      await userEvent.keyboard('{Escape}')

      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'false')
      expect(screen.getByTestId('dropdown-trigger')).toHaveFocus()
    })

    it('should close on Tab without changing selection', async () => {
      const onChange = jest.fn()
      render(<Dropdown {...defaultProps} onChange={onChange} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      await userEvent.keyboard('{ArrowDown}') // Focus es
      await userEvent.keyboard('{Tab}')

      expect(onChange).not.toHaveBeenCalled()
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'false')
    })

    it('should close on Tab from option without returning focus to trigger (natural Tab navigation)', () => {
      // This test verifies the closeDropdown(false) branch
      render(
        <div>
          <Dropdown {...defaultProps} />
          <button data-testid='next-element'>Next</button>
        </div>
      )

      // Open the dropdown
      fireEvent.click(screen.getByTestId('dropdown-trigger'))
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'true')

      // Focus on an option
      const option = screen.getByTestId('dropdown-option-en')
      option.focus()

      // Fire Tab key - this should trigger handleOptionKeyDown which calls closeDropdown(false)
      fireEvent.keyDown(option, { key: 'Tab', code: 'Tab' })

      // Dropdown should be closed
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'false')

      // Verify trigger does NOT have focus (because returnFocus was false)
      expect(screen.getByTestId('dropdown-trigger')).not.toHaveFocus()
    })
  })

  describe('Focus Management', () => {
    it('should focus selected option when opening', async () => {
      render(<Dropdown {...defaultProps} value='es' />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      expect(screen.getByTestId('dropdown-option-es')).toHaveFocus()
    })

    it('should focus first option when no option is selected', async () => {
      render(<Dropdown {...defaultProps} value='nonexistent' />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      expect(screen.getByTestId('dropdown-option-en')).toHaveFocus()
    })

    it('should return focus to trigger when closing with Escape', async () => {
      render(<Dropdown {...defaultProps} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      await userEvent.keyboard('{Escape}')
      expect(screen.getByTestId('dropdown-trigger')).toHaveFocus()
    })

    it('should return focus to trigger after selection', async () => {
      render(<Dropdown {...defaultProps} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      await userEvent.click(screen.getByTestId('dropdown-option-es'))
      expect(screen.getByTestId('dropdown-trigger')).toHaveFocus()
    })
  })

  describe('Roving Tabindex', () => {
    it('focused option should have tabindex=0, others tabindex=-1', async () => {
      render(<Dropdown {...defaultProps} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))

      // Initially focused option (selected = en) has tabindex 0
      expect(screen.getByTestId('dropdown-option-en')).toHaveAttribute('tabindex', '0')
      expect(screen.getByTestId('dropdown-option-es')).toHaveAttribute('tabindex', '-1')

      await userEvent.keyboard('{ArrowDown}')

      expect(screen.getByTestId('dropdown-option-en')).toHaveAttribute('tabindex', '-1')
      expect(screen.getByTestId('dropdown-option-es')).toHaveAttribute('tabindex', '0')
    })
  })

  describe('Option Display', () => {
    it('should display option labels', async () => {
      render(<Dropdown {...defaultProps} />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('Spanish')).toBeInTheDocument()
    })

    it('should display different icons for different options', async () => {
      render(<Dropdown {...defaultProps} options={themeOptions} value='light' />)
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      expect(screen.getByText('Light Mode')).toBeInTheDocument()
      expect(screen.getByText('Dark Mode')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should not open again if already open and key pressed', async () => {
      render(<Dropdown {...defaultProps} />)
      // Open with click
      await userEvent.click(screen.getByTestId('dropdown-trigger'))
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'true')

      // Press Enter when already open - should not cause issues
      const option = screen.getByTestId('dropdown-option-en')
      option.focus()
      fireEvent.keyDown(screen.getByTestId('dropdown-trigger'), { key: 'Enter' })

      // Should still be open (Enter on trigger while open doesn't reopen)
      expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('aria-expanded', 'true')
    })

    it('should handle rapid open/close without errors when refs are not yet set', () => {
      // This test covers the branch where optionRefs[focusedIndex]?.current may be null
      // during rapid state changes before refs are populated
      render(<Dropdown {...defaultProps} value='nonexistent' />)

      // Rapidly toggle open/close state
      const trigger = screen.getByTestId('dropdown-trigger')
      fireEvent.click(trigger) // open
      fireEvent.click(trigger) // close
      fireEvent.click(trigger) // open again

      // Should not throw and should be open
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('should handle focus gracefully when option ref is null', async () => {
      // This test covers the branch where optionRefs[focusedIndex]?.current is undefined
      // We achieve this by rendering with empty options, so optionRefs is an empty array
      const emptyOptions: DropdownOption<string>[] = []

      render(<Dropdown {...defaultProps} options={emptyOptions} value='missing' />)

      // Open dropdown (focusedIndex will be 0, but optionRefs is empty)
      const trigger = screen.getByTestId('dropdown-trigger')
      await userEvent.click(trigger)

      // The setTimeout(0) for focus will run and try optionRefs[0]?.current which is undefined
      // This should not throw an error
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
  })
})
