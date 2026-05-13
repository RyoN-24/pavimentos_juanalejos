const fs = require("node:fs");
const assert = require("node:assert/strict");
const vm = require("node:vm");

const script = fs.readFileSync("script.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const constantsMatrix = fs.readFileSync("manuales/matriz-constantes-simulador.md", "utf8");

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
expectPattern(/express:\s*\{\s*label:\s*"Via expresa",\s*designEal:\s*28_400_000,\s*reliability:\s*90\s*\}/, "CE.010 Anexo F debe usar 28.4 M EAL y 90% para expresas.");
expectPattern(/arterialMajor:\s*\{\s*label:\s*"Via arterial mayor",\s*designEal:\s*8_300_000,\s*reliability:\s*85\s*\}/, "CE.010 Anexo F debe usar 8.3 M EAL y 85% para arteriales.");
expectPattern(/collector:\s*\{\s*label:\s*"Via colectora",\s*designEal:\s*3_000_000,\s*reliability:\s*80\s*\}/, "CE.010 Anexo F debe usar 3.0 M EAL y 80% para colectoras.");
expectPattern(/local:\s*\{\s*label:\s*"Via local \/ estacionamiento",\s*designEal:\s*840_000,\s*reliability:\s*75\s*\}/, "CE.010 Anexo F debe usar 0.84 M EAL y 75% para locales.");
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
assert.match(html, /Los rangos de vias clasifican la demanda/, "La interfaz debe explicar diferencia entre rango de vias y EE admisible estructura.");
assert.ok(html.indexOf('aria-label="Normativa peruana aplicada"') < html.indexOf('aria-label="Grupos de parametros"'), "La normativa debe aparecer antes de las pestanas de parametros.");
assert.match(constantsMatrix, /Normativo/, "La matriz debe separar valores normativos.");
assert.match(constantsMatrix, /Default editable/, "La matriz debe separar valores iniciales editables.");
assert.match(constantsMatrix, /Supuesto interno/, "La matriz debe separar supuestos internos.");
assert.match(constantsMatrix, /Visualizacion/, "La matriz debe separar constantes visuales.");
assert.match(constantsMatrix, /paverBaseFactors/, "La matriz debe auditar factores de adoquinado.");
assert.match(constantsMatrix, /rigidSupportKValue/, "La matriz debe auditar la correlacion k de rigidos.");
assert.match(html, /id="trafficCalculationFields"/, "La interfaz debe separar EE directo del calculo desde IMDA.");
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
expectPattern(/Rangos de vias/, "El reporte debe incluir la tabla de rangos de vias.");
expectPattern(/Diagnostico/, "El reporte debe incluir diagnostico de clasificacion, capacidad y serviciabilidad.");
expectPattern(/Capacidad estructural: cumple/, "El reporte debe explicar cumplimiento estructural en lenguaje directo.");
expectPattern(/Los deterioros visuales se derivan del consumo de vida/, "El reporte debe aclarar que deterioros son visuales y referenciales.");
expectPattern(/Daño estructural usado: EE acumulado \//, "El reporte debe documentar formula de dano estructural.");
expectPattern(/El PSI se reduce con el daño acumulado/, "El reporte debe documentar criterio de PSI.");
const legacyCasePattern = new RegExp(["profe" + "sor", "Santa " + "Rosa", "Caso " + "aplicado", "caso " + "real"].join("|"), "i");
assert.doesNotMatch(`${html}\n${script}`, legacyCasePattern, "La interfaz y la logica visible deben quedar generales.");

const testableScript = `${script.split('document.querySelectorAll(".tab")')[0]}
globalThis.__normativeTest = { urbanClassByEsal, formatRange };
`;
const fakeElement = {
  value: "0",
  classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
  dataset: {},
  style: {},
  textContent: "",
  innerHTML: "",
  setAttribute() {},
  addEventListener() {},
  getContext() { return {}; },
};
const context = {
  document: { getElementById() { return fakeElement; } },
  performance: { now() { return 0; } },
};
vm.runInNewContext(testableScript, context);

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

console.log("Normative consistency checks passed.");
