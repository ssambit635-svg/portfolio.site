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
assert.match(
  dockerAnswer.text,
  /Docker Basics/,
  'a technology answer should also name the certificate',
)

const certs = ask.answer('What certificates do you have?')
assert.match(ask.answer('Which projects use Python and Streamlit?').text, /Weather Sense/)
assert.ok(certs.matched, 'certificate question should match')
assert.match(certs.text, /issued by/)

const wins = ask.answer('Tell me about your hackathon wins')
assert.ok(wins.matched, 'hackathon question should match')
assert.match(wins.text, /Smart India Hackathon|iQOO|Tech Zypher/)

const contact = ask.answer('How can I contact you?')
assert.ok(contact.matched, 'contact question should match')
assert.ok(
  contact.links.some((l) => l.href.startsWith('mailto:')),
  'contact answer should link email',
)

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
assert.equal(
  new Set(tools.map((t) => t.toLowerCase())).size,
  tools.length,
  'tools should be unique ignoring case',
)
assert.ok(
  tools.some((t) => t.toLowerCase() === 'docker'),
  'Docker should be a tool',
)

assert.deepEqual(stack.matchStack([]), { exact: [], closest: null })
const docker = stack.matchStack(['Docker'])
assert.ok(docker.exact.length > 0, 'Docker should match at least one project')
assert.ok(docker.exact.every((p) => p.stack.some((t) => t.toLowerCase() === 'docker')))

const impossible = stack.matchStack(['Docker', 'Rust', 'COBOL'])
assert.equal(impossible.exact.length, 0)
assert.ok(
  impossible.closest && impossible.closest.count >= 1,
  'a partial match should name the closest project',
)

// Skill City: every tower has a block, no two towers overlap, and a level
// always maps to a real building height. The 3D scene is built from these.
const city = await loadModule('src/lib/skillCity.ts')
assert.equal(city.skills.length, 35, 'the city should keep all 35 technologies')
assert.equal(
  new Set(city.skills.map((s) => s.id)).size,
  city.skills.length,
  'skill ids should be unique',
)
for (const skill of city.skills) {
  assert.ok(skill.level >= 1 && skill.level <= 5, `${skill.name} needs a level from 1 to 5`)
  assert.ok(skill.note.length > 20, `${skill.name} needs a dossier sentence`)
}
for (const district of city.districts) {
  assert.ok(city.skillsInDistrict(district.id).length >= 4, `${district.name} needs a skyline`)
  assert.match(district.color, /^#[0-9a-f]{6}$/i, `${district.name} needs a hex rooftop colour`)
}
assert.equal(
  new Set(city.districts.map((d) => d.color)).size,
  city.districts.length,
  'each district needs its own colour',
)
for (const skill of city.skills) {
  assert.match(skill.short, /^[A-Z0-9+]{1,3}$/, `${skill.name} needs a rooftop code`)
}
assert.equal(
  new Set(city.skills.map((s) => s.short)).size,
  city.skills.length,
  'rooftop codes should be unique',
)
assert.equal(city.cityBuildings.length, city.skills.length, 'every skill should get a tower')
for (const tower of city.cityBuildings) {
  const plot = city.plotRect(tower.district)
  const half = city.PLOT / 2
  assert.ok(tower.h > 1, `${tower.skill.name} is too short to see`)
  assert.ok(
    tower.x - tower.w / 2 > plot.x - half - 0.001 &&
      tower.x + tower.w / 2 < plot.x + half + 0.001 &&
      tower.z - tower.d / 2 > plot.z - half - 0.001 &&
      tower.z + tower.d / 2 < plot.z + half + 0.001,
    `${tower.skill.name} should stand inside its own block`,
  )
}
for (let i = 0; i < city.cityBuildings.length; i += 1) {
  for (let j = i + 1; j < city.cityBuildings.length; j += 1) {
    const a = city.cityBuildings[i]
    const b = city.cityBuildings[j]
    assert.ok(
      !(
        Math.abs(a.x - b.x) < (a.w + b.w) / 2 - 0.02 && Math.abs(a.z - b.z) < (a.d + b.d) / 2 - 0.02
      ),
      `${a.skill.name} and ${b.skill.name} overlap`,
    )
  }
}
assert.ok(
  city.cityBuildings.some((tower) => tower.shape === 'construction'),
  'learning skills should be cranes',
)
assert.ok(city.buildingParts(city.cityBuildings[0]).length > 0, 'towers should have geometry')
assert.ok(
  city.projectsFor(city.skillById.get('docker')).length >= 2,
  'Docker should show its projects',
)
assert.equal(
  city.certificateFor(city.skillById.get('python'))?.id,
  'python-essentials',
  'Python should show its certificate',
)

console.log('Features: Ask Emo, technology matching and Skill City layout checks passed.')
