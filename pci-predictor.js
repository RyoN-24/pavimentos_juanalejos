(function attachPciPredictor(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.PciPredictor = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createPciPredictor() {
  "use strict";

  const INPUT_KEYS = {
    pci_current: "pciCurrent",
    pci_previous: "pciPrevious",
    previous_annual_delta: "previousAnnualDelta",
    years_since_previous: "yearsSincePrevious",
    segment_length: "segmentLength",
  };

  function finiteNumber(value) {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function conditionFromPci(pci) {
    if (pci >= 85) return "Excelente";
    if (pci >= 70) return "Bueno";
    if (pci >= 55) return "Regular";
    if (pci >= 40) return "Malo";
    if (pci >= 25) return "Muy malo";
    return "Fallado";
  }

  function transform(model, rawInput) {
    const missing = [];
    const transformed = model.features.map((feature, index) => {
      const rawValue = finiteNumber(rawInput[INPUT_KEYS[feature]]);
      if (rawValue === null) {
        missing.push(index);
        return model.imputer.statistics[index];
      }
      return rawValue;
    });

    for (const featureIndex of model.imputer.indicatorFeatures) {
      transformed.push(missing.includes(featureIndex) ? 1 : 0);
    }
    return transformed;
  }

  function treeValue(tree, features) {
    let node = tree;
    while (node && !Object.prototype.hasOwnProperty.call(node, "leaf")) {
      const featureIndex = Number(String(node.split).replace("f", ""));
      const value = features[featureIndex];
      const nextId = Number.isFinite(value)
        ? value < node.split_condition
          ? node.yes
          : node.no
        : node.missing;
      node = node.children.find((child) => child.nodeid === nextId);
    }
    if (!node) throw new Error("El arbol exportado contiene una rama invalida.");
    return Number(node.leaf);
  }

  function annualDelta(model, input) {
    const features = transform(model, input);
    return model.booster.trees.reduce(
      (sum, tree) => sum + treeValue(tree, features),
      Number(model.booster.baseScore),
    );
  }

  function predict(model, rawInput) {
    if (!model || model.schemaVersion !== 1) {
      throw new Error("El modelo PCI no tiene un formato compatible.");
    }
    const suppliedPci = finiteNumber(rawInput && rawInput.pciCurrent);
    if (suppliedPci === null) throw new TypeError("pciCurrent debe ser un numero entre 0 y 100.");
    const suppliedHorizon = finiteNumber(rawInput && rawInput.horizonYears);
    if (suppliedHorizon === null || suppliedHorizon <= 0) {
      throw new TypeError("horizonYears debe ser un numero mayor que cero.");
    }

    const warnings = [];
    const pciCurrent = clamp(suppliedPci, 0, 100);
    const horizonYears = clamp(suppliedHorizon, 0.25, 20);
    if (pciCurrent !== suppliedPci) warnings.push("El PCI actual se ajusto al intervalo valido de 0 a 100.");
    if (horizonYears !== suppliedHorizon) warnings.push("El horizonte se ajusto al intervalo experimental de 0.25 a 20 anos.");
    if (horizonYears > 4) {
      warnings.push("Extrapolacion temporal: el horizonte supera los cuatro anos presentes en los datos de entrenamiento; su precision no ha sido validada.");
    }
    warnings.push("El tiempo al umbral PCI 40 es una simulacion con tasa anual constante, no una vida util observada y validada.");

    const normalizedInput = { ...rawInput, pciCurrent, horizonYears };
    const delta = annualDelta(model, normalizedInput);
    const pciFuture = clamp(pciCurrent + delta * horizonYears, 0, 100);
    const terminalPci = 40;
    const yearsToTerminal = delta < 0 && pciCurrent > terminalPci
      ? (terminalPci - pciCurrent) / delta
      : pciCurrent <= terminalPci
        ? 0
        : null;
    const historyComplete = ["pciPrevious", "previousAnnualDelta", "yearsSincePrevious"].every(
      (key) => finiteNumber(normalizedInput[key]) !== null,
    );
    if (!historyComplete) {
      warnings.push("Falta historial del tramo; el modelo uso medianas aprendidas durante el entrenamiento.");
    }

    return {
      pciFuture,
      annualDelta: delta,
      horizonYears,
      condition: conditionFromPci(pciFuture),
      terminalPci,
      yearsToTerminal,
      modelName: model.modelName,
      modelVersion: model.modelVersion,
      isExperimental: true,
      input: normalizedInput,
      warnings,
    };
  }

  return { predict, annualDelta, conditionFromPci };
});
