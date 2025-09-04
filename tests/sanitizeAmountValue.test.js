const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.js'), 'utf8');
const match = code.match(/function sanitizeAmountValue\(value\)[\s\S]*?\n}\n/);
if (!match) throw new Error('sanitizeAmountValue not found');

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(match[0], sandbox);

const fn = sandbox.sanitizeAmountValue;

assert.strictEqual(fn('1.234,56'), '1234.56');
assert.strictEqual(fn('1,234.56'), '1234.56');

console.log('sanitizeAmountValue tests passed');

