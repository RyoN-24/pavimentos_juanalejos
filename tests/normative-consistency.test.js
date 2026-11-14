const fs = require("node:fs");
const assert = require("node:assert/strict");
const vm = require("node:vm");

const script = fs.readFileSync("script.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const constantsMatrix = fs.readFileSync("manuales/matriz-constantes-simulador.md", "utf8");
const normativeData = JSON.parse(fs.readFileSync("manuales/datos-normativos.json", "utf8"));

assert.doesNotMatch(script, /<<<<<<<|=======|>>>>>>>/, "script.js no debe contener marcadores de conflicto.");

assert.equal(normativeData.schemaVersion, 1, "El catalogo normativo debe declarar su version de esquema.");
assert.ok(normativeData.sources && typeof normativeData.sources === "object", "El catalogo debe declarar fuentes.");
assert.ok(Array.isArray(normativeData.datasets), "El catalogo debe declarar datasets.");

const datasetsById = new Map(normativeData.datasets.map((dataset) => [dataset.id, dataset]));
const knownDatasetStatuses = new Set([
  "normative",
  "suggested_method",
  "internal_classification_criterion",
  "internal_assumption",
]);

function dataSet(id) {
  const dataset = datasetsById.get(id);
  assert.ok(dataset, `Debe existir dataset ${id}.`);
  return dataset;
}

function valueBy(values, key, expected) {
  const found = values.find((value) => value && value[key] === expected);
  assert.ok(found, `Debe existir valor ${key}=${expected}.`);
  return found;
}

normativeData.datasets.forEach((dataset) => {
  assert.ok(dataset.id, "Cada dataset debe tener id.");
  assert.ok(knownDatasetStatuses.has(dataset.status), `${dataset.id} debe tener status reconocido.`);
  assert.ok(dataset.scope, `${dataset.id} debe declarar alcance.`);
  assert.ok(dataset.sourceRef, `${dataset.id} debe declarar sourceRef.`);
  assert.ok(normativeData.sources[dataset.sourceRef], `${dataset.id} debe apuntar a una fuente existente.`);
  assert.ok(Array.isArray(dataset.values) && dataset.values.length > 0, `${dataset.id} debe tener valores.`);

  if (dataset.status === "normative" || dataset.status === "suggested_method") {
    assert.ok(dataset.pdfPage || dataset.pdfPages, `${dataset.id} debe tener pagina PDF trazable.`);
    assert.ok(
      dataset.table || dataset.tables || dataset.section || dataset.annex,
      `${dataset.id} debe tener tabla, seccion o anexo trazable.`,
    );
  }
});

const mtcTraffic = dataSet("mtc_2014_paved_traffic_classes");
assert.equal(valueBy(mtcTraffic.values, "id", "TP0").minExclusive, 75_000, "TP0 debe iniciar sobre 75,000 EE.");
assert.equal(valueBy(mtcTraffic.values, "id", "TP0").maxInclusive, 150_000, "TP0 debe cerrar en 150,000 EE.");
assert.equal(valueBy(mtcTraffic.values, "id", "TP15").minExclusive, 30_000_000, "TP15 debe iniciar sobre 30 M EE.");
assert.equal(valueBy(mtcTraffic.values, "id", "TP15").maxInclusive, null, "TP15 debe quedar abierto y requerir estudio especifico.");

const mtcCoefficients = dataSet("mtc_2014_structural_coefficients");
assert.equal(valueBy(mtcCoefficients.values, "component", "hot_asphalt_surface").value, 0.17, "Carpeta asfaltica caliente debe usar a1 0.170/cm.");
assert.equal(valueBy(mtcCoefficients.values, "component", "cold_asphalt_surface").value, 0.125, "Mezcla fria debe usar a1 0.125/cm.");
assert.equal(valueBy(mtcCoefficients.values, "component", "surface_treatment_bicapa").value, null, "TSB no debe tener aporte estructural.");
assert.equal(valueBy(mtcCoefficients.values, "component", "surface_treatment_bicapa").maxEsal, 500_000, "TSB debe limitarse a 500,000 EE.");
assert.equal(valueBy(mtcCoefficients.values, "component", "granular_base_cbr_80").value, 0.052, "Base granular CBR 80 debe usar a2 0.052/cm.");
assert.equal(valueBy(mtcCoefficients.values, "component", "granular_subbase_cbr_40").value, 0.047, "Subbase granular CBR 40 debe usar a3 0.047/cm.");

const cePavers = dataSet("ce010_urban_paver_design_eals");
assert.equal(valueBy(cePavers.values, "roadClass", "express").designEal, 28_400_000, "CE.010 Anexo F expresa debe usar 28.4 M EAL.");
assert.equal(valueBy(cePavers.values, "roadClass", "express").reliability, 90, "CE.010 Anexo F expresa debe usar 90% confiabilidad.");
assert.equal(valueBy(cePavers.values, "roadClass", "local").designEal, 840_000, "CE.010 Anexo F local debe usar 0.84 M EAL.");
assert.equal(valueBy(cePavers.values, "roadClass", "local").reliability, 75, "CE.010 Anexo F local debe usar 75% confiabilidad.");

assert.equal(dataSet("simulation_urban_road_esal_ranges").status, "internal_classification_criterion", "Los rangos urbanos del simulador deben quedar marcados como criterio interno.");
const internalFactors = dataSet("simulation_internal_factors").values;
assert.ok(valueBy(internalFactors, "id", "rigidSupportKValue").formula, "El modulo k simplificado debe figurar como formula interna.");
assert.ok(valueBy(internalFactors, "id", "psiVisualCurve").formula, "La curva PSI visual debe figurar como formula interna.");

function expectPattern(pattern, message) {
  assert.match(script, pattern, message);
}

expectPattern(/mtcCatalogMaxEsal:\s*30_000_000/, "Debe conservar el limite MTC de 30 M EE.");
expectPattern(/mtcPavedMinEsal:\s*75_001/, "Debe distinguir valores menores al rango TP0 pavimentado.");
expectPattern(/urbanRoadEsalRanges:\s*\[[\s\S]*id:\s*"urbanDevelopment"[\s\S]*maxEsal:\s*300_000/, "Debe conservar rango de vias Habilitacion urbana 0 a 300 mil EE.");
expectPattern(/id:\s*"local"[\s\S]*minEsal:\s*300_001[\s\S]*maxEsal:\s*840_000/, "Debe conservar rango de vias Local 300 mil a 840 mil EE.");
expectPattern(/id:\s*"collector"[\s\S]*minEsal:\s*840_001[\s\S]*maxEsal:\s*3_000_000/, "Debe conservar rango de vias Colectora 840 mil a 3.0 M EE.");
expectPattern(/id:\s*"arterialMinor"[\s\S]*minEsal:\s*3_000_001[\s\S]*maxEsal:\s*8_300_000/, "Debe conservar rango de vias Arteria menor 3.0 M a 8.3 M EE.");
expectPattern(/id:\s*"arterialMajor"[\s\S]*minEsal:\s*8_300_001[\s\S]*maxEsal:\s*28_400_000/, "Debe conservar rango de vias Arteria mayor 8.3 M a 28.4 M EE.");
expectPattern(/id:\s*"express"[\s\S]*minEsal:\s*28_400_001[\s\S]*maxEsal:\s*Infinity/, "Debe conservar rango de vias Expresa mayor a 28.4 M EE.");
expectPattern(/express:\s*\{\s*label:\s*"Via expresa",\s*designEal:\s*28_400_000,\s*reliability:\s*90/, "CE.010 Anexo F debe usar 28.4 M EAL y 90% para expresas.");
expectPattern(/arterial:\s*\{\s*label:\s*"Via arterial",\s*designEal:\s*8_300_000,\s*reliability:\s*85/, "CE.010 Anexo F debe usar 8.3 M EAL y 85% para arteriales.");
expectPattern(/collector:\s*\{\s*label:\s*"Via colectora",\s*designEal:\s*3_000_000,\s*reliability:\s*80/, "CE.010 Anexo F debe usar 3.0 M EAL y 80% para colectoras.");
expectPattern(/local:\s*\{\s*label:\s*"Via local \/ estacionamiento",\s*designEal:\s*840_000,\s*reliability:\s*75/, "CE.010 Anexo F debe usar 0.84 M EAL y 75% para locales.");
expectPattern(/paverDesignClassByUrbanClass:\s*\{[\s\S]*urbanDevelopment:\s*"local"[\s\S]*arterialMinor:\s*"arterial"[\s\S]*arterialMajor:\s*"arterial"/, "La clasificacion urbana interna debe mapearse a clases CE.010 reales para adoquines.");
expectPattern(/hotFlexible:[\s\S]*defaults:\s*\{\s*a1:\s*0\.17,\s*a2:\s*0\.052,\s*a3:\s*0\.047/, "Los defaults flexibles deben reflejar coeficientes granulares MTC.");
expectPattern(/coldMixMaxEsal:\s*1_000_000/, "Debe conservar limite MTC para mezcla fria.");
expectPattern(/surfaceTreatmentMaxEsal:\s*500_000/, "Debe conservar limite MTC para tratamiento superficial bicapa.");
expectPattern(/urbanRangeNow:\s*\$\("urbanRangeNow"\)/, "Debe existir lectura visible para rango EE de via urbana.");
expectPattern(/recommendedUrbanClass:\s*\$\("recommendedUrbanClass"\)/, "Debe existir lectura visible para tipo recomendado por EE.");
expectPattern(/EE admisible estructura/, "La UI debe distinguir EE admisible estructura del rango urbano.");
assert.match(html, /Rangos de vias urbanas/, "La interfaz debe mantener la tabla de rangos de vias.");
assert.match(html, /Cuadro resumen/, "La interfaz debe presentar un cuadro resumen compacto.");
assert.match(html, /Resumen de criterios de ejes equivalentes/, "La interfaz debe tener resumen compacto de criterios.");
assert.match(html, /Tipo recomendado por EE/, "La interfaz debe mostrar el tipo recomendado por EE.");
assert.match(html, /id="normScope"/, "La interfaz debe mostrar el alcance del modelo normativo activo.");
assert.match(html, /Los rangos de vias clasifican la demanda/, "La interfaz debe explicar diferencia entre rango de vias y EE admisible estructura.");
assert.ok(html.indexOf('aria-label="Normativa peruana aplicada"') < html.indexOf('aria-label="Grupos de parametros"'), "La normativa debe aparecer antes de las pestanas de parametros.");
assert.match(constantsMatrix, /Normativo/, "La matriz debe separar valores normativos.");
assert.match(constantsMatrix, /Default editable/, "La matriz debe separar valores iniciales editables.");
assert.match(constantsMatrix, /Supuesto interno/, "La matriz debe separar supuestos internos.");
assert.match(constantsMatrix, /Visualizacion/, "La matriz debe separar constantes visuales.");
assert.match(constantsMatrix, /paverBaseFactors/, "La matriz debe auditar factores de adoquinado.");
assert.match(constantsMatrix, /rigidSupportKValue/, "La matriz debe auditar la correlacion k de rigidos.");
assert.match(html, /id="trafficCalculationFields"/, "La interfaz debe separar EE directo del calculo desde IMDA.");
assert.match(html, /value="urbanClass"/, "La interfaz debe permitir usar el tipo de via urbana como demanda de predimensionamiento.");
assert.match(html, /id="supportLayerMode"/, "La interfaz debe permitir elegir base, subbase o ambas.");
assert.match(html, /id="newDesign"/, "La interfaz debe permitir iniciar un diseno sin contexto de ejemplo.");
assert.match(html, /Representacion visual derivada del consumo de vida/, "La interfaz debe aclarar alcance de deterioros visuales.");
assert.match(html, /Daño = EE acumulado \/ capacidad admisible/, "La interfaz debe mostrar formula base de dano.");
assert.match(html, /severidad climatica penaliza capacidad/, "La interfaz debe explicar efecto ambiental.");
expectPattern(/function usesFlexibleStructuralCoefficients\(\)/, "Solo flexibles deben mostrar coeficientes estructurales editables.");
expectPattern(/structuralCoeffFields\.classList\.toggle\("hidden", !usesFlexibleCoefficients\)/, "Rígido y adoquinado deben ocultar coeficientes flexibles a1, a2 y a3.");
expectPattern(/function activeBaseDepth\(\)/, "El cálculo debe respetar si la base esta activa.");
expectPattern(/function activeSubbaseDepth\(\)/, "El cálculo debe respetar si la subbase esta activa.");
expectPattern(/function startNewDesign\(\)/, "Debe existir flujo para iniciar un diseno limpio.");
expectPattern(/function clearExampleContext\(\)/, "Editar parametros debe limpiar el contexto del ejemplo cargado.");
expectPattern(/function rigidSupportKValue\(\)/, "Rigido debe exponer el modulo k estimado desde CBR y capas de apoyo.");
expectPattern(/Modulo k estimado/, "El reporte debe mostrar modulo k estimado para pavimento rigido.");
assert.match(html, /concreteModulusRupture/, "La interfaz debe permitir ingresar MR del concreto en pavimento rigido.");
expectPattern(/concreteModulusRupture:\s*\$\("concreteModulusRupture"\)/, "El MR del concreto debe estar conectado a la logica.");
expectPattern(/const sc = value\("concreteModulusRupture"\)/, "Rigido debe usar MR visible en vez de resistencia fija interna.");
expectPattern(/metricCapacity:\s*"W18 admisible estimado"/, "La capacidad rigida debe nombrarse como W18 admisible estimado.");
expectPattern(/metricCapacity:\s*"EE admisible adoquinado"/, "La capacidad de adoquinado debe tener etiqueta propia.");
expectPattern(/Coeficientes equivalentes: internos del modelo simplificado de adoquinado/, "El reporte de adoquinado debe evitar a1, a2 y a3 editables.");
expectPattern(/metricStructure:\s*"Índice estructural equivalente"/, "Adoquinado debe usar una metrica estructural propia y comprensible.");
assert.match(html, /adoquin \+ cama de arena se evalua como capa de rodadura equivalente/, "La interfaz debe explicar como se evalua el adoquinado.");
expectPattern(/Adoquinado: el adoquin \+ cama de arena se evalua como capa de rodadura equivalente/, "El reporte debe explicar criterio de evaluacion de adoquinado.");
expectPattern(/Modulo de rotura MR/, "El reporte debe mostrar MR del concreto.");
expectPattern(/function reportHtml\(\)/, "El reporte debe tener version HTML imprimible.");
expectPattern(/toDataURL\("image\/png"\)/, "El reporte HTML debe incluir graficos del diseno actual.");
expectPattern(/reporte-simulador-pavimentos\.html/, "El reporte exportado debe ser HTML.");
expectPattern(/el rango urbano clasifica el tipo de via por demanda; \$\{capacityMetricLabel\(\)\} verifica la capacidad/, "El reporte debe explicar diferencia entre rango urbano y capacidad estructural con etiqueta dinamica.");
expectPattern(/function activeScopeText\(\)/, "La logica debe centralizar el alcance normativo activo.");
expectPattern(/Alcance del modelo: \$\{outputs\.normScope\.textContent\}/, "El reporte de texto debe incluir alcance del modelo.");
expectPattern(/escapeHtml\(outputs\.normScope\.textContent\)/, "El reporte HTML debe incluir alcance del modelo.");
expectPattern(/Rangos de vias/, "El reporte debe incluir la tabla de rangos de vias.");
expectPattern(/Diagnostico/, "El reporte debe incluir diagnostico de clasificacion, capacidad y serviciabilidad.");
expectPattern(/Capacidad estructural: cumple/, "El reporte debe explicar cumplimiento estructural en lenguaje directo.");
expectPattern(/Los deterioros visuales se derivan del consumo de vida/, "El reporte debe aclarar que deterioros son visuales y referenciales.");
expectPattern(/Daño estructural usado: EE acumulado \//, "El reporte debe documentar formula de dano estructural.");
expectPattern(/El PSI se reduce con el daño acumulado/, "El reporte debe documentar criterio de PSI.");
const legacyCasePattern = new RegExp(["profe" + "sor", "Santa " + "Rosa", "Caso " + "aplicado", "caso " + "real"].join("|"), "i");
assert.doesNotMatch(`${html}\n${script}`, legacyCasePattern, "La interfaz y la logica visible deben quedar generales.");

const testableScript = `${script.split('document.querySelectorAll(".tab")')[0]}
globalThis.__normativeTest = { urbanClassByEsal, formatRange, urbanNormValues, urbanRepresentativeEsal, designLaneEsal, applyPeruvianNorms, fields, normativeData, pavementModes };
`;
function makeFakeElement(value = "0") {
  return {
    value,
    classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
    dataset: {},
    style: {},
    textContent: "",
    innerHTML: "",
    setAttribute() {},
    addEventListener() {},
    getContext() { return {}; },
  };
}

const defaultFieldValues = {
  pavementType: "hotFlexible",
  projectType: "urban",
  urbanClass: "urbanDevelopment",
  trafficMode: "direct",
  directDesignEsal: "300000",
  supportLayerMode: "baseSubbase",
  coldSurfaceType: "coldMix",
  rigidLoadTransfer: "2.8",
  paverBaseType: "granular",
  edgeRestraint: "adequate",
};
const elementStore = new Map();
const context = {
  document: {
    getElementById(id) {
      if (!elementStore.has(id)) {
        elementStore.set(id, makeFakeElement(defaultFieldValues[id] || "0"));
      }
      return elementStore.get(id);
    },
  },
  performance: { now() { return 0; } },
};
vm.runInNewContext(testableScript, context);
const scriptNormativeData = context.__normativeTest.normativeData;
const scriptPavementModes = context.__normativeTest.pavementModes;

mtcTraffic.values.forEach((trafficClass) => {
  const scriptClass = valueBy(scriptNormativeData.mtc2014.trafficClasses, "id", trafficClass.id);
  assert.equal(scriptClass.minEsal, trafficClass.minExclusive + 1, `${trafficClass.id} debe iniciar un EE sobre el minimo normativo.`);
  assert.equal(
    scriptClass.maxEsal,
    trafficClass.maxInclusive === null ? Infinity : trafficClass.maxInclusive,
    `${trafficClass.id} debe conservar maximo normativo.`,
  );
});

dataSet("mtc_2014_reliability_single_stage").values.forEach((rule) => {
  rule.trafficClasses.forEach((trafficClassId) => {
    assert.equal(
      valueBy(scriptNormativeData.mtc2014.trafficClasses, "id", trafficClassId).reliability,
      rule.reliability,
      `${trafficClassId} debe usar confiabilidad MTC del catalogo trazable.`,
    );
  });
});

dataSet("mtc_2014_serviceability_pi_pt").values.forEach((rule) => {
  rule.trafficClasses.forEach((trafficClassId) => {
    const scriptClass = valueBy(scriptNormativeData.mtc2014.trafficClasses, "id", trafficClassId);
    assert.equal(scriptClass.pi, rule.pi, `${trafficClassId} debe usar Pi MTC del catalogo trazable.`);
    assert.equal(scriptClass.pt, rule.pt, `${trafficClassId} debe usar Pt MTC del catalogo trazable.`);
  });
});

assert.equal(scriptPavementModes.hotFlexible.defaults.a1, valueBy(mtcCoefficients.values, "component", "hot_asphalt_surface").value, "a1 flexible caliente debe coincidir con el catalogo trazable.");
assert.equal(scriptPavementModes.hotFlexible.defaults.a2, valueBy(mtcCoefficients.values, "component", "granular_base_cbr_80").value, "a2 base granular debe coincidir con el catalogo trazable.");
assert.equal(scriptPavementModes.hotFlexible.defaults.a3, valueBy(mtcCoefficients.values, "component", "granular_subbase_cbr_40").value, "a3 subbase granular debe coincidir con el catalogo trazable.");
assert.equal(scriptPavementModes.coldFlexible.defaults.a1, valueBy(mtcCoefficients.values, "component", "cold_asphalt_surface").value, "a1 mezcla fria debe coincidir con el catalogo trazable.");
assert.equal(scriptNormativeData.mtc2014.limits.coldMixMaxEsal, valueBy(mtcCoefficients.values, "component", "cold_asphalt_surface").maxEsal, "Limite mezcla fria debe coincidir con el catalogo trazable.");
assert.equal(scriptNormativeData.mtc2014.limits.surfaceTreatmentMaxEsal, valueBy(mtcCoefficients.values, "component", "surface_treatment_bicapa").maxEsal, "Limite TSB debe coincidir con el catalogo trazable.");

cePavers.values.forEach((paverRule) => {
  const scriptKey = paverRule.roadClass === "arterial" ? "arterial" : paverRule.roadClass;
  const scriptRule = scriptNormativeData.ce010.paverDesignEals[scriptKey];
  assert.ok(scriptRule, `Debe existir regla CE.010 de adoquinado para ${scriptKey}.`);
  assert.equal(scriptRule.designEal, paverRule.designEal, `${scriptKey} debe conservar EAL CE.010.`);
  assert.equal(scriptRule.reliability, paverRule.reliability, `${scriptKey} debe conservar confiabilidad CE.010.`);
});

dataSet("simulation_urban_road_esal_ranges").values.forEach((rangeRule) => {
  const scriptRange = valueBy(scriptNormativeData.simulation.urbanRoadEsalRanges, "id", rangeRule.id);
  assert.equal(scriptRange.minEsal, rangeRule.minInclusive, `${rangeRule.id} debe conservar inicio de rango interno.`);
  assert.equal(scriptRange.maxEsal, rangeRule.maxInclusive === null ? Infinity : rangeRule.maxInclusive, `${rangeRule.id} debe conservar fin de rango interno.`);
});

[
  [250_000, "urbanDevelopment"],
  [500_000, "local"],
  [2_000_000, "collector"],
  [5_000_000, "arterialMinor"],
  [12_000_000, "arterialMajor"],
  [46_100_000, "express"],
].forEach(([esal, expected]) => {
  assert.equal(context.__normativeTest.urbanClassByEsal(esal).id, expected, `EE ${esal} debe clasificar como ${expected}.`);
});

const testFields = context.__normativeTest.fields;
testFields.pavementType.value = "pavers";
testFields.urbanClass.value = "urbanDevelopment";
const urbanDevelopmentPaver = context.__normativeTest.urbanNormValues();
assert.equal(urbanDevelopmentPaver.designEal, 840_000, "Habilitacion urbana debe usar clase local CE.010 para adoquines.");
assert.equal(urbanDevelopmentPaver.ce010Class, "local", "Habilitacion urbana debe mapear a clase CE.010 local.");
assert.equal(urbanDevelopmentPaver.roadRange.maxEsal, 300_000, "El rango interno 0-300 mil debe conservarse solo para clasificacion.");

testFields.urbanClass.value = "arterialMinor";
assert.equal(context.__normativeTest.urbanNormValues().ce010Class, "arterial", "Arteria menor debe mapear a clase arterial CE.010.");
testFields.urbanClass.value = "arterialMajor";
assert.equal(context.__normativeTest.urbanNormValues().ce010Class, "arterial", "Arteria mayor debe mapear a clase arterial CE.010.");

testFields.projectType.value = "urban";
testFields.pavementType.value = "pavers";
testFields.urbanClass.value = "local";
testFields.trafficMode.value = "urbanClass";
context.__normativeTest.applyPeruvianNorms();
assert.equal(context.__normativeTest.urbanRepresentativeEsal(), 840_000, "U-01 via local adoquinada debe adoptar 840,000 EAL CE.010.");
assert.equal(context.__normativeTest.designLaneEsal(), 840_000, "U-01 debe usar 840,000 EAL como demanda de predimensionamiento.");
assert.equal(Number(testFields.reliability.value), 75, "U-01 debe asignar 75% de confiabilidad.");
assert.equal(context.__normativeTest.urbanNormValues().source, "CE.010 Anexo F Tabla F2", "U-01 debe declarar fuente CE.010 Anexo F Tabla F2.");

console.log("Normative consistency checks passed.");
