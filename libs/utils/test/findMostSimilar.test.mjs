import assert from 'node:assert/strict';
import { Utils } from '../dist/esm/util/util.js';

const cases = [
  {
    name: 'prefers the artist title over a similar-looking word',
    target: 'weeknd',
    candidates: ['The Weeknd', 'The Weekend', 'Weekend'],
    expected: 'The Weeknd',
    threshold: 60,
  },
  {
    name: 'prefers a full title match over a shorter loose variant',
    target: 'sia chandelier',
    candidates: ['Chandelier', 'Sia - Chandelier', 'Sia - Chandelier (Remix)'],
    expected: 'Sia - Chandelier',
    threshold: 60,
  },
];

for (const testCase of cases) {
  const result = Utils.findMostSimilar(testCase.target, testCase.candidates, testCase.threshold);
  assert.ok(result, `${testCase.name}: expected a match`);
  assert.equal(result.match, testCase.expected, `${testCase.name}: unexpected match`);
}

console.log('findMostSimilar regression cases passed');
