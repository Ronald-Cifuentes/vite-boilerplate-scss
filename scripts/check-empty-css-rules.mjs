#!/usr/bin/env node
/**
 * Empty-ruleset gate (task 18): fails when any SCSS/CSS file contains a
 * ruleset or @-block whose body holds no declarations (whitespace/comments
 * only). Zero dependencies — mirrors the IDE 'emptyRules' diagnostic so the
 * class of problem is CI-enforced, not editor-dependent.
 *
 * Usage: node scripts/check-empty-css-rules.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOTS = ['src', 'e2e']
const EXTENSIONS = new Set(['.scss', '.css'])

function collect(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    // skip dependencies and GENERATED output (coverage reports, test artifacts,
    // build output) — the gate governs authored source, not tool output
    if (['node_modules', 'coverage', 'test-results', 'playwright-report', 'dist'].includes(entry))
      continue
    const path = join(dir, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) collect(path, out)
    else if (EXTENSIONS.has(extname(entry))) out.push(path)
  }
  return out
}

const stripComments = text => text.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')

const violations = []
for (const root of ROOTS) {
  let files = []
  try {
    files = collect(root)
  } catch {
    continue // root may not exist in downstream projects
  }
  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    const rulePattern = /^[^\S\n]*([^{}\n/@][^{}\n]*|@[a-z-]+[^{}\n]*)\{([^{}]*)\}/gm
    let match
    while ((match = rulePattern.exec(source)) !== null) {
      if (!stripComments(match[2]).trim()) {
        const line = source.slice(0, match.index).split('\n').length
        violations.push(`${file}:${line}: empty ruleset '${match[1].trim().slice(0, 60)}'`)
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`✖ ${violations.length} empty ruleset(s) found:`)
  for (const violation of violations) console.error(`  ${violation}`)
  process.exit(1)
}
console.log('✓ no empty rulesets in SCSS/CSS')
