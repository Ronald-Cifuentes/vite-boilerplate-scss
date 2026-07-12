import { cleanup, render, screen } from '@testing-library/react'
import { TemplateName } from './TemplateName'

describe('<TemplateName />', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  test('#1. Exist - Render default', () => {
    render(<TemplateName />)

    const templateName = screen.getByTestId('template-name')

    expect(templateName).toBeInTheDocument()
  })
})
