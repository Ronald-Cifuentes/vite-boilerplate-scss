/**
 * Translation Validator - TEST-TIME ONLY
 *
 * Validates translation dictionaries against the canonical (en) dictionary.
 * NOT imported in production code (tree-shaken from bundle).
 */

export interface ValidationError {
  type:
    | 'missing_key'
    | 'unexpected_key'
    | 'empty_value'
    | 'invalid_nesting'
    | 'type_mismatch'
    | 'placeholder_mismatch'
    | 'plural_structure'
    | 'unsupported_namespace'
  path: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  locale: string
  errors: ValidationError[]
}

/** Validation context to reduce parameter count */
interface ValidationContext {
  errors: ValidationError[]
  canonicalNamespaces: Set<string>
}

/** CLDR plural keys that indicate pluralization structure */
const PLURAL_KEYS = new Set(['zero', 'one', 'two', 'few', 'many', 'other'])

/**
 * Extract placeholders like {age} from a string using a linear scanner.
 * Regex-free to avoid S5852 (ReDoS) hotspot.
 *
 * Rules:
 * - Placeholder starts at first unconsumed '{' and ends at next '}'
 * - Must have at least one char between '{' and '}' (empty '{}' yields nothing)
 * - Unmatched '{' at end yields nothing
 * - A second '{' before '}' does NOT restart (e.g. '{a{b}' extracts '{a{b}')
 */
function extractPlaceholders(value: string): string[] {
  const found: string[] = []
  let start = -1

  for (let i = 0; i < value.length; i++) {
    const ch = value[i]
    if (ch === '{' && start < 0) {
      start = i
    } else if (ch === '}' && start >= 0) {
      if (i > start + 1) {
        found.push(value.slice(start, i + 1))
      }
      start = -1
    }
  }

  return found.sort((a, b) => a.localeCompare(b))
}

/** Check if value is a plain object (not null, not array) */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Build path string from prefix and key */
function buildPath(prefix: string, key: string): string {
  return prefix ? `${prefix}.${key}` : key
}

/** Add error helper to reduce duplication */
function addError(ctx: ValidationContext, error: ValidationError): void {
  ctx.errors.push(error)
}

/** Check for unsupported namespaces at top level */
function checkUnsupportedNamespaces(target: Record<string, unknown>, ctx: ValidationContext): void {
  for (const key of Object.keys(target)) {
    if (key === '_provenance') continue
    if (!ctx.canonicalNamespaces.has(key)) {
      addError(ctx, {
        type: 'unsupported_namespace',
        path: key,
        message: `Unsupported namespace "${key}" not present in canonical`,
      })
    }
  }
}

/** Leaf validation parameters */
interface LeafParams {
  path: string
  canonicalValue: string
  targetValue: unknown
  ctx: ValidationContext
}

/** Validate a leaf string value */
function validateLeafValue(params: LeafParams): void {
  const { path, canonicalValue, targetValue, ctx } = params

  if (typeof targetValue !== 'string') {
    addError(ctx, {
      type: 'type_mismatch',
      path,
      message: `Type mismatch at "${path}": expected string, got ${typeof targetValue}`,
    })
    return
  }

  if (targetValue.trim() === '') {
    addError(ctx, { type: 'empty_value', path, message: `Empty translation at "${path}"` })
  }

  const canonicalPlaceholders = extractPlaceholders(canonicalValue)
  const targetPlaceholders = extractPlaceholders(targetValue)

  if (JSON.stringify(canonicalPlaceholders) !== JSON.stringify(targetPlaceholders)) {
    addError(ctx, {
      type: 'placeholder_mismatch',
      path,
      message: `Placeholder mismatch at "${path}": canonical has [${canonicalPlaceholders.join(', ')}], target has [${targetPlaceholders.join(', ')}]`,
    })
  }
}

/** Validation parameters packed into single object */
interface RecursiveParams {
  canonical: Record<string, unknown>
  target: Record<string, unknown>
  path: string
  ctx: ValidationContext
}

/** Check for unexpected keys in target */
function checkUnexpectedKeys(params: RecursiveParams): void {
  const { canonical, target, path, ctx } = params
  for (const key of Object.keys(target)) {
    if (key === '_provenance') continue
    if (!(key in canonical)) {
      const currentPath = buildPath(path, key)
      addError(ctx, {
        type: 'unexpected_key',
        path: currentPath,
        message: `Unexpected key "${currentPath}" not present in canonical`,
      })
    }
  }
}

/** Entry validation parameters for a single key */
interface EntryParams {
  canonicalValue: unknown
  targetValue: unknown
  currentPath: string
  ctx: ValidationContext
  keyExistsInTarget: boolean
}

/**
 * Validate a single entry (key-value pair) in the dictionary.
 * Extracted from validateRecursive to reduce cyclomatic complexity (S3776).
 */
function validateEntry(params: EntryParams): void {
  const { canonicalValue, targetValue, currentPath, ctx, keyExistsInTarget } = params

  if (!keyExistsInTarget) {
    addError(ctx, {
      type: 'missing_key',
      path: currentPath,
      message: `Missing key "${currentPath}"`,
    })
    return
  }

  const canonicalIsObject = isPlainObject(canonicalValue)
  const targetIsObject = isPlainObject(targetValue)

  if (canonicalIsObject !== targetIsObject) {
    addError(ctx, {
      type: 'invalid_nesting',
      path: currentPath,
      message: `Nesting mismatch at "${currentPath}": expected ${canonicalIsObject ? 'object' : 'string'}, got ${targetIsObject ? 'object' : typeof targetValue}`,
    })
    return
  }

  if (canonicalIsObject && targetIsObject) {
    // Type guards narrow canonicalValue and targetValue to Record<string, unknown>
    validateRecursive({
      canonical: canonicalValue,
      target: targetValue,
      path: currentPath,
      ctx,
    })
    return
  }

  /* istanbul ignore else -- @preserve Defensive: canonical values are always string or object in valid dictionaries */
  if (typeof canonicalValue === 'string') {
    validateLeafValue({ path: currentPath, canonicalValue, targetValue, ctx })
  }
}

/** Recursively validate a target dictionary against canonical */
function validateRecursive(params: RecursiveParams): void {
  const { canonical, target, path, ctx } = params

  if (path === '') {
    checkUnsupportedNamespaces(target, ctx)
  }

  for (const key of Object.keys(canonical)) {
    const canonicalValue = canonical[key]
    const targetValue = target[key]
    const currentPath = buildPath(path, key)

    validateEntry({
      canonicalValue,
      targetValue,
      currentPath,
      ctx,
      keyExistsInTarget: key in target,
    })
  }

  checkUnexpectedKeys(params)
}

/** Plural check parameters */
interface PluralParams {
  obj: Record<string, unknown>
  path: string
  ctx: ValidationContext
}

/** Check for CLDR plural keys that would indicate pluralization structure */
function checkPluralStructure(params: PluralParams): void {
  const { obj, path, ctx } = params

  for (const key of Object.keys(obj)) {
    const value = obj[key]
    const currentPath = buildPath(path, key)

    if (PLURAL_KEYS.has(key)) {
      addError(ctx, {
        type: 'plural_structure',
        path: currentPath,
        message: `Detected plural key "${key}" at "${currentPath}". Pluralization is not supported.`,
      })
    }

    if (isPlainObject(value)) {
      // Type guard narrows value to Record<string, unknown>
      checkPluralStructure({ obj: value, path: currentPath, ctx })
    }
  }
}

/**
 * Validate a target locale dictionary against the canonical (en) dictionary.
 * Used in test suites; NOT imported in production code.
 */
export function validateLocale(
  canonical: Record<string, unknown>,
  target: Record<string, unknown>,
  localeName: string
): ValidationResult {
  const ctx: ValidationContext = {
    errors: [],
    canonicalNamespaces: new Set(Object.keys(canonical)),
  }

  validateRecursive({ canonical, target, path: '', ctx })
  checkPluralStructure({ obj: target, path: '', ctx })

  return {
    valid: ctx.errors.length === 0,
    locale: localeName,
    errors: ctx.errors,
  }
}

/**
 * Get the inventory of placeholders used in the canonical dictionary.
 * Useful for documentation and validation reference.
 */
export function getPlaceholderInventory(
  obj: Record<string, unknown>,
  path = ''
): Array<{ path: string; placeholders: string[] }> {
  const inventory: Array<{ path: string; placeholders: string[] }> = []

  for (const key of Object.keys(obj)) {
    const value = obj[key]
    const currentPath = buildPath(path, key)

    if (typeof value === 'string') {
      const placeholders = extractPlaceholders(value)
      if (placeholders.length > 0) {
        inventory.push({ path: currentPath, placeholders })
      }
    } else /* istanbul ignore else -- @preserve Defensive: dictionary values are always string or object */ if (
      isPlainObject(value)
    ) {
      // Type guard narrows value to Record<string, unknown>
      inventory.push(...getPlaceholderInventory(value, currentPath))
    }
  }

  return inventory
}
