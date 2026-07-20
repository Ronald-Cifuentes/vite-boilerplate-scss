import { validateLocale, getPlaceholderInventory } from './translation-validator'
import en from '../data/en.json'
import es from '../data/es.json'
import ja from '../data/ja.json'
import zh from '../data/zh.json'

describe('validateLocale - missing key detection', () => {
  it('detects missing keys', () => {
    const canonical = { greeting: { hello: 'Hello', goodbye: 'Goodbye' } }
    const target = { greeting: { hello: 'Hola' } }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      type: 'missing_key',
      path: 'greeting.goodbye',
      message: 'Missing key "greeting.goodbye"',
    })
  })

  it('detects missing nested namespace', () => {
    const canonical = { common: { appName: 'App' }, greeting: { hello: 'Hello' } }
    const target = { common: { appName: 'App' } }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.type === 'missing_key' && e.path === 'greeting')).toBe(true)
  })
})

describe('validateLocale - unexpected key detection', () => {
  it('detects unexpected keys', () => {
    const canonical = { greeting: { hello: 'Hello' } }
    const target = { greeting: { hello: 'Hola', extra: 'Extra' } }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      type: 'unexpected_key',
      path: 'greeting.extra',
      message: 'Unexpected key "greeting.extra" not present in canonical',
    })
  })

  it('ignores _provenance metadata key', () => {
    const canonical = { greeting: { hello: 'Hello' } }
    const target = { _provenance: 'Machine translation', greeting: { hello: 'Hola' } }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

describe('validateLocale - empty string detection', () => {
  it('detects empty translations', () => {
    const canonical = { greeting: { hello: 'Hello' } }
    const target = { greeting: { hello: '' } }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      type: 'empty_value',
      path: 'greeting.hello',
      message: 'Empty translation at "greeting.hello"',
    })
  })

  it('detects whitespace-only translations', () => {
    const canonical = { greeting: { hello: 'Hello' } }
    const target = { greeting: { hello: '   ' } }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.type === 'empty_value')).toBe(true)
  })
})

describe('validateLocale - nesting mismatch detection', () => {
  it('detects object where string expected', () => {
    const canonical = { greeting: { hello: 'Hello' } }
    const target = { greeting: { hello: { nested: 'wrong' } } }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      type: 'invalid_nesting',
      path: 'greeting.hello',
      message: 'Nesting mismatch at "greeting.hello": expected string, got object',
    })
  })

  it('detects string where object expected', () => {
    const canonical = { greeting: { hello: 'Hello' } }
    const target = { greeting: 'wrong' }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      type: 'invalid_nesting',
      path: 'greeting',
      message: 'Nesting mismatch at "greeting": expected object, got string',
    })
  })
})

describe('validateLocale - type mismatch detection', () => {
  it('detects number where string expected', () => {
    const canonical = { greeting: { hello: 'Hello' } }
    const target = { greeting: { hello: 123 } }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      type: 'type_mismatch',
      path: 'greeting.hello',
      message: 'Type mismatch at "greeting.hello": expected string, got number',
    })
  })
})

describe('validateLocale - placeholder mismatch detection', () => {
  it('detects missing placeholder', () => {
    const canonical = { rates: { stale: 'Rates from {age} ago' } }
    const target = { rates: { stale: 'Old rates' } }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      type: 'placeholder_mismatch',
      path: 'rates.stale',
      message: 'Placeholder mismatch at "rates.stale": canonical has [{age}], target has []',
    })
  })

  it('detects extra placeholder', () => {
    const canonical = { rates: { stale: 'Old rates' } }
    const target = { rates: { stale: 'Rates from {age} ago' } }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      type: 'placeholder_mismatch',
      path: 'rates.stale',
      message: 'Placeholder mismatch at "rates.stale": canonical has [], target has [{age}]',
    })
  })

  it('allows matching placeholders', () => {
    const canonical = { rates: { stale: 'Rates from {age} ago' } }
    const target = { rates: { stale: 'Tasas de hace {age}' } }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(true)
  })
})

describe('validateLocale - plural structure detection', () => {
  it('detects CLDR plural keys', () => {
    const canonical = { count: { items: 'Items' } }
    const target = { count: { items: { one: 'Item', other: 'Items' } } }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.type === 'plural_structure')).toBe(true)
  })

  it('detects all CLDR plural keys (zero, one, two, few, many, other)', () => {
    const canonical = { common: { appName: 'App' } }
    const target = {
      common: { appName: 'App' },
      plurals: { zero: 'none', one: 'one', two: 'two', few: 'few', many: 'many', other: 'x' },
    }
    const result = validateLocale(canonical, target, 'test')
    const pluralErrors = result.errors.filter(e => e.type === 'plural_structure')
    expect(pluralErrors.length).toBeGreaterThanOrEqual(6)
  })
})

describe('validateLocale - unsupported namespace detection', () => {
  it('detects unsupported top-level namespace', () => {
    const canonical = { common: { appName: 'App' } }
    const target = { common: { appName: 'App' }, custom: { key: 'value' } }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      type: 'unsupported_namespace',
      path: 'custom',
      message: 'Unsupported namespace "custom" not present in canonical',
    })
  })
})

describe('validateLocale - valid translations', () => {
  it('passes for identical structure', () => {
    const canonical = { common: { appName: 'App' }, greeting: { hello: 'Hello' } }
    const target = { common: { appName: 'Aplicacion' }, greeting: { hello: 'Hola' } }
    const result = validateLocale(canonical, target, 'test')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

describe('getPlaceholderInventory', () => {
  it('returns empty array for no placeholders', () => {
    const dict = { greeting: { hello: 'Hello' } }
    const inventory = getPlaceholderInventory(dict)
    expect(inventory).toHaveLength(0)
  })

  it('finds single placeholder', () => {
    const dict = { rates: { stale: 'Rates from {age} ago' } }
    const inventory = getPlaceholderInventory(dict)
    expect(inventory).toContainEqual({ path: 'rates.stale', placeholders: ['{age}'] })
  })

  it('finds multiple placeholders in same string', () => {
    const dict = { message: { greeting: 'Hello {name}, you have {count} messages' } }
    const inventory = getPlaceholderInventory(dict)
    expect(inventory).toContainEqual({
      path: 'message.greeting',
      placeholders: ['{count}', '{name}'],
    })
  })
})

describe('extractPlaceholders edge cases (linear scanner parity with regex)', () => {
  // These tests exercise the linear scanner in extractPlaceholders via getPlaceholderInventory

  it('extracts {age} placeholder correctly', () => {
    const dict = { test: { msg: 'Rates from {age} ago' } }
    const inventory = getPlaceholderInventory(dict)
    expect(inventory).toContainEqual({ path: 'test.msg', placeholders: ['{age}'] })
  })

  it('extracts multiple placeholders sorted alphabetically', () => {
    const dict = { test: { msg: 'Hello {name}, you are {age} years old with {count} items' } }
    const inventory = getPlaceholderInventory(dict)
    expect(inventory).toContainEqual({
      path: 'test.msg',
      placeholders: ['{age}', '{count}', '{name}'],
    })
  })

  it('ignores empty placeholder {}', () => {
    const dict = { test: { msg: 'Hello {} world' } }
    const inventory = getPlaceholderInventory(dict)
    expect(inventory).toHaveLength(0)
  })

  it('ignores unmatched { at end of string', () => {
    const dict = { test: { msg: 'Hello {name} and {' } }
    const inventory = getPlaceholderInventory(dict)
    expect(inventory).toContainEqual({ path: 'test.msg', placeholders: ['{name}'] })
  })

  it('does NOT restart on second { before } (extracts {a{b} as one placeholder)', () => {
    const dict = { test: { msg: 'Test {a{b} value' } }
    const inventory = getPlaceholderInventory(dict)
    // The scanner treats first { as start, ignores second {, extracts until }
    expect(inventory).toContainEqual({ path: 'test.msg', placeholders: ['{a{b}'] })
  })

  it('handles multiple edge cases in one string', () => {
    const dict = { test: { msg: '{valid} {} text { incomplete {nested{deep} end' } }
    const inventory = getPlaceholderInventory(dict)
    // {valid} is valid (extracted first)
    // {} is empty (ignored)
    // { incomplete {nested{deep} - scanner starts at first {, includes all until first }
    // So extracts '{ incomplete {nested{deep}' as one placeholder
    expect(inventory).toContainEqual({
      path: 'test.msg',
      placeholders: ['{ incomplete {nested{deep}', '{valid}'],
    })
  })

  it('treats { or } as a valid placeholder (content between braces)', () => {
    // '{ or }' has content ' or ' between the braces, so it's a valid placeholder
    const dict = { test: { msg: 'No braces { or } alone or {}' } }
    const inventory = getPlaceholderInventory(dict)
    expect(inventory).toContainEqual({ path: 'test.msg', placeholders: ['{ or }'] })
  })

  it('returns empty for string with only trailing unmatched brace', () => {
    // Only an unmatched { at end, no }
    const dict = { test: { msg: 'Trailing open brace {' } }
    const inventory = getPlaceholderInventory(dict)
    expect(inventory).toHaveLength(0)
  })

  it('returns empty for string with only leading unmatched close brace', () => {
    // } before any { is ignored
    const dict = { test: { msg: '} leading close then { unclosed' } }
    const inventory = getPlaceholderInventory(dict)
    // The } is ignored (no open), the { has no close
    expect(inventory).toHaveLength(0)
  })

  it('handles consecutive placeholders', () => {
    const dict = { test: { msg: '{a}{b}{c}' } }
    const inventory = getPlaceholderInventory(dict)
    expect(inventory).toContainEqual({ path: 'test.msg', placeholders: ['{a}', '{b}', '{c}'] })
  })
})

describe('real locale validation', () => {
  it('es locale is valid against en canonical', () => {
    const result = validateLocale(en, es, 'es')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('ja locale is valid against en canonical', () => {
    const result = validateLocale(en, ja, 'ja')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('zh locale is valid against en canonical', () => {
    const result = validateLocale(en, zh, 'zh')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('placeholder inventory matches across all locales', () => {
    const enInventory = getPlaceholderInventory(en)
    const esInventory = getPlaceholderInventory(es)
    const jaInventory = getPlaceholderInventory(ja)
    const zhInventory = getPlaceholderInventory(zh)
    expect(enInventory.map(i => i.path).sort()).toEqual(esInventory.map(i => i.path).sort())
    expect(enInventory.map(i => i.path).sort()).toEqual(jaInventory.map(i => i.path).sort())
    expect(enInventory.map(i => i.path).sort()).toEqual(zhInventory.map(i => i.path).sort())
    expect(enInventory).toContainEqual({ path: 'rates.stale', placeholders: ['{age}'] })
  })

  it('no locale has plural structure', () => {
    for (const data of [en, es, ja, zh]) {
      const result = validateLocale(en, data, 'test')
      const pluralErrors = result.errors.filter(e => e.type === 'plural_structure')
      expect(pluralErrors).toHaveLength(0)
    }
  })
})
