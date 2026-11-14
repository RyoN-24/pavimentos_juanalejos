const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const predictor = require("../pci-predictor.js");

const root = path.resolve(__dirname, "..");
const model = JSON.parse(
  fs.readFileSync(path.join(root, "modelos", "pci-xgboost-browser.json"), "utf8"),
);
const parityCases = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures", "pci-model-parity.json"), "utf8"),
);

assert.throws(
  () => predictor.predict(model, { horizonYears: 2 }),
  /pciCurrent/,
  "PCI actual debe ser obligatorio.",
);
assert.throws(
  () => predictor.predict(model, { pciCurrent: 80, horizonYears: 0 }),
  /horizonYears/,
  "El horizonte debe ser positivo.",
);

for (const testCase of parityCases) {
  const result = predictor.predict(model, testCase.input);
  assert.ok(result.pciFuture >= 0 && result.pciFuture <= 100, "La proyeccion debe respetar el dominio PCI.");
  assert.ok(
    Math.abs(result.annualDelta - testCase.expectedAnnualDelta) < 1e-5,
    `La tasa JS debe coincidir con Python para ${testCase.name}.`,
  );
  assert.ok(
    Math.abs(result.pciFuture - testCase.expectedPciFuture) < 1e-5,
    `El PCI JS debe coincidir con Python para ${testCase.name}.`,
  );
  assert.equal(result.isExperimental, true);
  assert.equal(typeof result.condition, "string");
  assert.ok(
    result.yearsToTerminal === null || result.yearsToTerminal >= 0,
    "La vida remanente no puede ser negativa.",
  );
}

const repeatedInput = { pciCurrent: 78, horizonYears: 4, segmentLength: 100 };
assert.deepEqual(
  predictor.predict(model, repeatedInput),
  predictor.predict(model, repeatedInput),
  "La inferencia debe ser determinista.",
);

const limited = predictor.predict(model, { pciCurrent: 120, horizonYears: 30 });
assert.equal(limited.input.pciCurrent, 100, "El PCI de entrada debe limitarse al dominio 0-100.");
assert.ok(limited.warnings.length > 0, "La interfaz debe advertir cuando ajusta entradas fuera de dominio.");

const longHorizon = predictor.predict(model, { pciCurrent: 78, horizonYears: 5, segmentLength: 100 });
assert.ok(
  longHorizon.warnings.some((warning) => /extrapolacion.*cuatro anos/i.test(warning)),
  "Un horizonte mayor que los cuatro anos presentes en los datos debe exponerse como extrapolacion.",
);
assert.ok(
  longHorizon.warnings.some((warning) => /umbral.*no.*vida util.*validada/i.test(warning)),
  "El tiempo al umbral no debe presentarse como vida util empiricamente validada.",
);
assert.equal(
  predictor.predict(model, { pciCurrent: 78, horizonYears: 4, segmentLength: 100 }).warnings
    .some((warning) => /extrapolacion.*cuatro anos/i.test(warning)),
  false,
  "La advertencia de horizonte excedido comienza despues de cuatro anos, no en el limite.",
);

console.log("PCI predictor checks passed.");
