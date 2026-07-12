import { getBanxicoToken, setMockBanxicoToken, resetMockBanxicoToken } from './env'

describe('env', () => {
  beforeEach(() => {
    resetMockBanxicoToken()
  })

  describe('getBanxicoToken', () => {
    it('should return undefined when no mock is set', () => {
      expect(getBanxicoToken()).toBeUndefined()
    })

    it('should return the mock value when set', () => {
      setMockBanxicoToken('test-token')
      expect(getBanxicoToken()).toBe('test-token')
    })

    it('should return undefined after reset', () => {
      setMockBanxicoToken('test-token')
      resetMockBanxicoToken()
      expect(getBanxicoToken()).toBeUndefined()
    })
  })

  describe('setMockBanxicoToken', () => {
    it('should set the token', () => {
      setMockBanxicoToken('my-token')
      expect(getBanxicoToken()).toBe('my-token')
    })

    it('should override previous value', () => {
      setMockBanxicoToken('token-1')
      setMockBanxicoToken('token-2')
      expect(getBanxicoToken()).toBe('token-2')
    })

    it('should allow setting to undefined', () => {
      setMockBanxicoToken('token')
      setMockBanxicoToken(undefined)
      expect(getBanxicoToken()).toBeUndefined()
    })
  })

  describe('resetMockBanxicoToken', () => {
    it('should clear the mock token', () => {
      setMockBanxicoToken('token')
      resetMockBanxicoToken()
      expect(getBanxicoToken()).toBeUndefined()
    })
  })

  describe('process.env fallback', () => {
    // Type assertion for process in Node/Jest environment
    const nodeProcess = globalThis as unknown as {
      process: { env: Record<string, string | undefined> }
    }

    it('should return process.env.VITE_BANXICO_TOKEN when mock is not set', () => {
      resetMockBanxicoToken()
      const originalEnv = nodeProcess.process.env.VITE_BANXICO_TOKEN
      // Use a test placeholder that doesn't look like a real token
      nodeProcess.process.env.VITE_BANXICO_TOKEN = 'test'

      expect(getBanxicoToken()).toBe('test')

      // Cleanup
      if (originalEnv !== undefined) {
        nodeProcess.process.env.VITE_BANXICO_TOKEN = originalEnv
      } else {
        delete nodeProcess.process.env.VITE_BANXICO_TOKEN
      }
    })
  })
})
