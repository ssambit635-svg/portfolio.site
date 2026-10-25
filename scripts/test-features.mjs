// Checks the logic behind the Ask Emo answers and the technology matching against
// real site data (bundled from src/, not copied).

import assert from 'node:assert/strict'
import { loadModule } from './lib/load-module.mjs'

const ask = await loadModule('src/lib/ask.ts')
const stack = await loadModule('src/lib/stack.ts')

const aws = ask.answer('What did you build with AWS?')
assert.ok(aws.matched, 'AWS question should match')
assert.match(aws.text, /AWS/, 'AWS answer should mention AWS')

const py = ask.answer('Which projects use Python?')
assert.ok(py.matched, 'Python question should match')
assert.match(py.text, /Weather Sense/)
assert.match(py.text, /Password Manager/)
assert.doesNotMatch(py.text, /Kivo/, 'a Python question should not list projects without Python')

const dockerAnswer = ask.answer('Do you know Docker?')
assert.match(dockerAnswer.text, /Annadata Connect/)
assert.match(dockerAnswer.text, /AWS Dashboard/)
assert.match(dockerAnswer.text, /Docker Basics/, 'a technology answer should also name the certificate')

const certs = ask.answer('What certificates do you have?')
assert.match(ask.answer('Which projects use Python and Streamlit?').text, /Weather Sense/)
assert.ok(certs.matched, 'certificate question should match')
assert.match(certs.text, /issued by/)

const wins = ask.answer('Tell me about your hackathon wins')
assert.ok(wins.matched, 'hackathon question should match')
assert.match(wins.text, /Smart India Hackathon|iQOO|Tech Zypher/)

const contact = ask.answer('How can I contact you?')
assert.ok(contact.matched, 'contact question should match')
assert.ok(contact.links.some(l => l.href.startsWith('mailto:')), 'contact answer should link email')

const who = ask.answer('Who are you?')
assert.ok(who.matched, 'intro question should match')
assert.match(who.text, /B\.Tech Computer Science/)

const off = ask.answer('What is the weather on Mars next Tuesday?')
assert.equal(off.matched, false, 'off-topic question should fall back')
assert.equal(ask.answer('').matched, false, 'empty question should fall back')

for (const q of ask.suggestions) {
  assert.ok(ask.answer(q).matched, `every suggested question must be answerable: ${q}`)
}

// Stemming: plurals and -ing forms should meet the same word.
assert.equal(ask.stem('projects'), ask.stem('project'))
assert.equal(ask.stem('certificates'), 'certificate')

// Technology matching
const tools = stack.allTools()
assert.equal(new Set(tools.map(t => t.toLowerCase())).size, tools.length, 'tools should be unique ignoring case')
assert.ok(tools.some(t => t.toLowerCase() === 'docker'), 'Docker should be a tool')

assert.deepEqual(stack.matchStack([]), { exact: [], closest: null })
const docker = stack.matchStack(['Docker'])
assert.ok(docker.exact.length > 0, 'Docker should match at least one project')
assert.ok(docker.exact.every(p => p.stack.some(t => t.toLowerCase() === 'docker')))

const impossible = stack.matchStack(['Docker', 'Rust', 'COBOL'])
assert.equal(impossible.exact.length, 0)
assert.ok(impossible.closest && impossible.closest.count >= 1, 'a partial match should name the closest project')

console.log('Features: Ask Emo and technology matching checks passed.')
