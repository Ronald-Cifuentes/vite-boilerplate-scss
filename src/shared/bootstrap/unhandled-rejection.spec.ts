import { handleUnhandledRejection, registerUnhandledRejectionHandler } from './unhandled-rejection'

describe('Unhandled rejection handler (HIGH-001)', () => {
  let originalError: typeof console.error
  let errorSpy: jest.Mock

  beforeEach(() => {
    originalError = console.error
    errorSpy = jest.fn()
    console.error = errorSpy
  })

  afterEach(() => {
    console.error = originalError
  })

  describe('handleUnhandledRejection', () => {
    it('logs Error rejections with prefix', () => {
      const reason = new Error('Test rejection')
      const event = { reason } as PromiseRejectionEvent

      handleUnhandledRejection(event)

      expect(errorSpy).toHaveBeenCalledWith('[UnhandledRejection]', reason)
    })

    it('logs string rejections with prefix', () => {
      const reason = 'string rejection'
      const event = { reason } as PromiseRejectionEvent

      handleUnhandledRejection(event)

      expect(errorSpy).toHaveBeenCalledWith('[UnhandledRejection]', reason)
    })

    it('logs undefined rejections with prefix', () => {
      const event = { reason: undefined } as PromiseRejectionEvent

      handleUnhandledRejection(event)

      expect(errorSpy).toHaveBeenCalledWith('[UnhandledRejection]', undefined)
    })
  })

  describe('registerUnhandledRejectionHandler', () => {
    it('registers the handler on window', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')

      registerUnhandledRejectionHandler()

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'unhandledrejection',
        handleUnhandledRejection
      )

      addEventListenerSpy.mockRestore()
    })
  })
})
