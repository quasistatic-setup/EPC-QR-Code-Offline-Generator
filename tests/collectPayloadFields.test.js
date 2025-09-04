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

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(extract('ibanClean'), sandbox);
vm.runInContext(extract('parseAmountToNumber'), sandbox);
vm.runInContext(extract('collectPayloadFields'), sandbox);

const { collectPayloadFields, parseAmountToNumber } = sandbox;

// draft: amount is parsed and formatted as EURxx.xx or empty if < 0.01
{
  const v = {
    version: '001', charset: '1', name: 'ACME GmbH', iban: 'DE89370400440532013000', amount: '1.2',
    rem_struct: '', rem_unstruct: 'Invoice 42', purpose: '', bic: 'DEUTDEFF', b2o: ''
  };
  const lines = collectPayloadFields(v, { draft: true });
  assert.strictEqual(lines[0], 'BCD');
  assert.strictEqual(lines[3], 'SCT');
  assert.strictEqual(lines[4], 'DEUTDEFF');
  assert.strictEqual(lines[6], 'DE89370400440532013000');
  assert.ok(lines[7].startsWith('EUR'));
}

// final: amount should be whatever is passed (already normalized by asEUR in buildPayload)
{
  const v = {
    version: '001', charset: '1', name: 'ACME GmbH', iban: 'DE89370400440532013000', amount: 'EUR01.20',
    rem_struct: 'RF18539007547034', rem_unstruct: '', purpose: 'GDDS', bic: '', b2o: ''
  };
  const lines = collectPayloadFields(v, {});
  assert.strictEqual(lines[7], 'EUR01.20');
}

console.log('collectPayloadFields tests passed');

