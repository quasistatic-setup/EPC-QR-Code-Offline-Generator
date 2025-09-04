const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.js'), 'utf8');

function extract(fnName){
  const m = code.match(new RegExp(`function\\s+${fnName}\\([^)]*\\)\\{[\\s\\S]*?\n\\}`));
  if (!m) throw new Error(fnName + ' not found');
  return m[0];
}

const sandbox = { t: () => ({ err_amount_min: 'min' }) };
vm.createContext(sandbox);
vm.runInContext(extract('parseAmountToNumber'), sandbox);
vm.runInContext(extract('asEUR'), sandbox);
vm.runInContext(extract('ibanIsValid'), sandbox);

const { parseAmountToNumber, asEUR, ibanIsValid } = sandbox;

// parseAmountToNumber
assert.strictEqual(parseAmountToNumber('1.234,56'), 1234.56);
assert.strictEqual(parseAmountToNumber('1,234.56'), 1234.56);
assert.ok(Number.isNaN(parseAmountToNumber('abc')));

// asEUR
assert.strictEqual(asEUR('1.2'), 'EUR1.20');
assert.throws(() => asEUR('0.0001'));

// ibanIsValid
assert.strictEqual(ibanIsValid('DE89370400440532013000'), true);
assert.strictEqual(ibanIsValid('DE00370400440532013000'), false);

// BIC regex (uppercase enforced by code, 8 or 11 chars)
const bicRe = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
assert.ok(bicRe.test('DEUTDEFF'));      // 8
assert.ok(bicRe.test('DEUTDEFF500'));   // 11
assert.ok(!bicRe.test('deutdeff'));

console.log('iban/amount tests passed');

