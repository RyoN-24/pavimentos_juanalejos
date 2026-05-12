const $ = (id) => document.getElementById(id);

const fields = {
  pavementType: $("pavementType"),
  projectType: $("projectType"),
  urbanClass: $("urbanClass"),
  trafficMode: $("trafficMode"),
  directDesignEsal: $("directDesignEsal"),
  aadt: $("aadt"),
  heavyShare: $("heavyShare"),
  truckFactor: $("truckFactor"),
  growth: $("growth"),
  directionFactor: $("directionFactor"),
  laneFactor: $("laneFactor"),
  asphaltDepth: $("asphaltDepth"),
  baseDepth: $("baseDepth"),
  subbaseDepth: $("subbaseDepth"),
  a1: $("a1"),
  a2: $("a2"),
  a3: $("a3"),
  cbr: $("cbr"),
  coldSurfaceType: $("coldSurfaceType"),
  rigidLoadTransfer: $("rigidLoadTransfer"),
  paverBaseType: $("paverBaseType"),
  edgeRestraint: $("edgeRestraint"),
  m2: $("m2"),
  m3: $("m3"),
  climateSeverity: $("climateSeverity"),
  reliability: $("reliability"),
  initialPsi: $("initialPsi"),
  terminalPsi: $("terminalPsi"),
  designYears: $("designYears"),
  time: $("time"),
};

const outputs = {
  brandTitle: $("brandTitle"),
  heroTitle: $("heroTitle"),
  heroLede: $("heroLede"),
  surfaceDepthLabel: $("surfaceDepthLabel"),
  baseDepthLabel: $("baseDepthLabel"),
  metricEsalLabel: $("metricEsalLabel"),
  metricStructureLabel: $("metricStructureLabel"),
  metricCapacityLabel: $("metricCapacityLabel"),
  heavyShare: $("heavyShareOut"),
  growth: $("growthOut"),
  asphaltDepth: $("asphaltDepthOut"),
  baseDepth: $("baseDepthOut"),
  subbaseDepth: $("subbaseDepthOut"),
  cbr: $("cbrOut"),
  climateSeverity: $("climateSeverityOut"),
  reliability: $("reliabilityOut"),
  designYears: $("designYearsOut"),
  time: $("timeOut"),
  esalNow: $("esalNow"),
  damageNow: $("damageNow"),
  psiNow: $("psiNow"),
  snNow: $("snNow"),
  designEsalNow: $("designEsalNow"),
  urbanRangeNow: $("urbanRangeNow"),
  capacityEsalNow: $("capacityEsalNow"),
  failureYear: $("failureYear"),
  conditionBadge: $("conditionBadge"),
  quickRead: $("quickRead"),
  nextStep: $("nextStep"),
  normName: $("normName"),
  normValues: $("normValues"),
  recommendedUrbanClass: $("recommendedUrbanClass"),
  psiLimitLabel: $("psiLimitLabel"),
  complianceTitle: $("complianceTitle"),
  complianceDetail: $("complianceDetail"),
  capacityCheck: $("capacityCheck"),
  psiCheck: $("psiCheck"),
  normativeCheck: $("normativeCheck"),
  totalDepthLabel: $("totalDepthLabel"),
  asphaltLayerValue: $("asphaltLayerValue"),
  asphaltLayerName: $("asphaltLayerName"),
  baseLayerValue: $("baseLayerValue"),
  baseLayerName: $("baseLayerName"),
  subbaseLayerValue: $("subbaseLayerValue"),
  subbaseLayerName: $("subbaseLayerName"),
  subgradeLayerValue: $("subgradeLayerValue"),
  compareStatus: $("compareStatus"),
  scenarioAResult: $("scenarioAResult"),
  scenarioBResult: $("scenarioBResult"),
  compareSummary: $("compareSummary"),
  caseStudyNote: $("caseStudyNote"),
};

const roadCanvas = $("roadCanvas");
const roadCtx = roadCanvas.getContext("2d");
const chartCanvas = $("chartCanvas");
const chartCtx = chartCanvas.getContext("2d");
const psiCanvas = $("psiCanvas");
const psiCtx = psiCanvas.getContext("2d");
const playPause = $("playPause");
const playIcon = $("playIcon");
const resetButton = $("reset");
const urbanClassWrap = $("urbanClassWrap");
const urbanRecommendation = $("urbanRecommendation");
const directEsalWrap = $("directEsalWrap");
const coldSettings = $("coldSettings");
const rigidSettings = $("rigidSettings");
const paverSettings = $("paverSettings");
const esalSteps = $("esalSteps");
const complianceCard = $("complianceCard");
const asphaltLayer = $("asphaltLayer");
const baseLayer = $("baseLayer");
const subbaseLayer = $("subbaseLayer");
const saveScenarioA = $("saveScenarioA");
const saveScenarioB = $("saveScenarioB");
const exportReport = $("exportReport");
const loadBaseExample = $("loadBaseExample");

let playing = false;
let lastFrame = performance.now();
let applyingNorm = false;
let scenarioA = null;
let scenarioB = null;
let playbackTimer = null;
let lastPavementType = null;
let activeCaseStudy = null;

const baseExample = {
  name: "Ejemplo urbano general",
  source: "Datos referenciales editables",
  station: "Tramo urbano de ejemplo",
  scenario: "Clasificacion por rango de vias y verificacion estructural",
  imda: 15000,
  heavyShare: 12,
  truckFactor: 1.44,
  designEsal: 5_000_000,
  asphaltDepth: 8,
  baseDepth: 50,
  subbaseDepth: 40,
  note: "Ejemplo urbano general: EE de diseno 5.0 M, clasificacion Arteria menor. Ajusta IMDA, pesados, factor vehiculo y estructura para representar cualquier proyecto.",
};

const pavementModes = {
  hotFlexible: {
    title: "Pavimento flexible en caliente",
    hero: "Análisis de mezcla asfáltica en caliente",
    lede: "Explora cómo tránsito, drenaje, estructura y confiabilidad modifican la vida útil de una carpeta asfáltica en caliente.",
    norm: "MTC 2014: catálogo de pavimento flexible con carpeta asfáltica en caliente, período de diseño 20 años.",
    surfaceLabel: "5. Espesor de carpeta asfáltica en caliente, D1",
    baseLabel: "6. Espesor de base granular, D2",
    metricStructure: "Número estructural SN",
    metricCapacity: "EE admisible estructura",
    layerNames: ["Carpeta asfáltica", "Base granular", "Subbase"],
    defaults: { a1: 0.17, a2: 0.052, a3: 0.047, surface: 8, base: 50, subbase: 40, years: 20 },
    capacityFactor: 1,
  },
  coldFlexible: {
    title: "Pavimento flexible en frío",
    hero: "Análisis de mezcla fría y tratamiento superficial",
    lede: "Evalúa soluciones de bajo a mediano tránsito con mezcla asfáltica en frío o tratamiento superficial bicapa.",
    norm: "MTC 2014: tratamiento superficial bicapa y mezcla asfáltica en frío, período de diseño referencial 10 años.",
    surfaceLabel: "5. Espesor de mezcla fría o tratamiento, D1",
    baseLabel: "6. Espesor de base granular, D2",
    metricStructure: "SN equivalente",
    metricCapacity: "EE admisible estructura",
    layerNames: ["Mezcla fría / TSB", "Base granular", "Subbase"],
    defaults: { a1: 0.125, a2: 0.052, a3: 0.047, surface: 5, base: 22, subbase: 18, years: 10 },
    capacityFactor: 0.82,
  },
  rigid: {
    title: "Pavimento rígido de concreto",
    hero: "Análisis de losa de concreto hidráulico",
    lede: "Simula el desempeño de una losa de concreto considerando ejes equivalentes, soporte de subrasante y serviciabilidad.",
    norm: "MTC 2014: pavimento rígido por AASHTO 93 con espesor de losa y factor de transferencia J.",
    surfaceLabel: "5. Espesor de losa de concreto, D",
    baseLabel: "6. Espesor de base o subbase de apoyo",
    metricStructure: "Índice losa equivalente",
    metricCapacity: "EE admisible estructura",
    layerNames: ["Losa de concreto", "Base / subbase de apoyo", "Subbase granular"],
    defaults: { a1: 0.22, a2: 0.045, a3: 0.035, surface: 20, base: 15, subbase: 10, years: 20 },
    capacityFactor: 1.55,
  },
  pavers: {
    title: "Pavimento adoquinado",
    hero: "Análisis de adoquines intertrabados",
    lede: "Revisa una estructura semirrígida con adoquines de concreto, cama de arena, base y confinamiento lateral.",
    norm: "MTC 2014: método ICPI para adoquines de concreto; CE.010: bloques intertrabados sobre cama de arena.",
    surfaceLabel: "5. Espesor de adoquín + cama de arena",
    baseLabel: "6. Espesor de base granular o tratada",
    metricStructure: "Índice de trabazón",
    metricCapacity: "EE admisible estructura",
    layerNames: ["Adoquines + arena", "Base granular/tratada", "Subbase"],
    defaults: { a1: 0.16, a2: 0.052, a3: 0.04, surface: 10, base: 20, subbase: 15, years: 20 },
    capacityFactor: 0.95,
  },
};

const normativeData = {
  mtcTrafficClasses: [
    { id: "TP0", minEsal: 75001, maxEsal: 150000, reliability: 65, pi: 3.8, pt: 2.0 },
    { id: "TP1", minEsal: 150001, maxEsal: 300000, reliability: 70, pi: 3.8, pt: 2.0 },
    { id: "TP2", minEsal: 300001, maxEsal: 500000, reliability: 75, pi: 3.8, pt: 2.0 },
    { id: "TP3", minEsal: 500001, maxEsal: 750000, reliability: 80, pi: 3.8, pt: 2.0 },
    { id: "TP4", minEsal: 750001, maxEsal: 1000000, reliability: 80, pi: 3.8, pt: 2.0 },
    { id: "TP5", minEsal: 1000001, maxEsal: 1500000, reliability: 85, pi: 4.0, pt: 2.5 },
    { id: "TP6", minEsal: 1500001, maxEsal: 3000000, reliability: 85, pi: 4.0, pt: 2.5 },
    { id: "TP7", minEsal: 3000001, maxEsal: 5000000, reliability: 85, pi: 4.0, pt: 2.5 },
    { id: "TP8", minEsal: 5000001, maxEsal: 7500000, reliability: 90, pi: 4.0, pt: 2.5 },
    { id: "TP9", minEsal: 7500001, maxEsal: 10000000, reliability: 90, pi: 4.0, pt: 2.5 },
    { id: "TP10", minEsal: 10000001, maxEsal: 12500000, reliability: 90, pi: 4.0, pt: 2.5 },
    { id: "TP11", minEsal: 12500001, maxEsal: 15000000, reliability: 90, pi: 4.0, pt: 2.5 },
    { id: "TP12", minEsal: 15000001, maxEsal: 20000000, reliability: 95, pi: 4.2, pt: 3.0 },
    { id: "TP13", minEsal: 20000001, maxEsal: 25000000, reliability: 95, pi: 4.2, pt: 3.0 },
    { id: "TP14", minEsal: 25000001, maxEsal: 30000000, reliability: 95, pi: 4.2, pt: 3.0 },
    { id: "TP15", minEsal: 30000001, maxEsal: Infinity, reliability: 95, pi: 4.2, pt: 3.0 },
  ],
  ce010PaverDesignEals: {
    express: { label: "Via expresa", designEal: 28_400_000, reliability: 90 },
    arterialMajor: { label: "Via arterial mayor", designEal: 8_300_000, reliability: 85 },
    arterialMinor: { label: "Via arterial menor", designEal: 8_300_000, reliability: 85 },
    collector: { label: "Via colectora", designEal: 3_000_000, reliability: 80 },
    local: { label: "Via local / estacionamiento", designEal: 840_000, reliability: 75 },
    urbanDevelopment: { label: "Habilitacion urbana", designEal: 300_000, reliability: 75 },
  },
  urbanReferenceDefaults: {
    express: { label: "Via expresa", reliability: 90, pi: 4.2, pt: 3.0, asphaltMin: 8 },
    arterialMajor: { label: "Via arterial mayor", reliability: 85, pi: 4.0, pt: 2.5, asphaltMin: 8 },
    arterialMinor: { label: "Via arterial menor", reliability: 85, pi: 4.0, pt: 2.5, asphaltMin: 7 },
    collector: { label: "Via colectora", reliability: 80, pi: 4.0, pt: 2.5, asphaltMin: 6 },
    local: { label: "Via local", reliability: 75, pi: 3.8, pt: 2.0, asphaltMin: 5 },
    urbanDevelopment: { label: "Habilitacion urbana", reliability: 75, pi: 3.8, pt: 2.0, asphaltMin: 5 },
  },
  urbanRoadEsalRanges: [
    { id: "urbanDevelopment", label: "Habilitacion urbana", minEsal: 0, maxEsal: 300_000 },
    { id: "local", label: "Local", minEsal: 300_001, maxEsal: 840_000 },
    { id: "collector", label: "Colectora", minEsal: 840_001, maxEsal: 3_000_000 },
    { id: "arterialMinor", label: "Arteria menor", minEsal: 3_000_001, maxEsal: 8_300_000 },
    { id: "arterialMajor", label: "Arteria mayor", minEsal: 8_300_001, maxEsal: 28_400_000 },
    { id: "express", label: "Expresa", minEsal: 28_400_001, maxEsal: Infinity },
  ],
  limits: {
    mtcCatalogMaxEsal: 30_000_000,
    mtcPavedMinEsal: 75_001,
    coldMixMaxEsal: 1_000_000,
    surfaceTreatmentMaxEsal: 500_000,
    rigidJ40MaxEsal: 1_000_000,
  },
};

const coldSurfaceFactors = {
  coldMix: {
    label: "Mezcla asfáltica en frío",
    factor: 1,
    note: "MTC 2014: mezcla asfáltica en frío con emulsión, período referencial de 10 años.",
  },
  surfaceTreatment: {
    label: "Tratamiento superficial bicapa",
    factor: 0.72,
    note: "MTC 2014: alternativa de tratamiento superficial bicapa para bajo volumen de tránsito.",
  },
};

const rigidTransferFactors = {
  "2.8": { label: "J = 2.8, pasadores y berma de concreto", factor: 1.15 },
  "3.2": { label: "J = 3.2, pasadores", factor: 1.05 },
  "3.8": { label: "J = 3.8, transferencia media", factor: 0.95 },
  "4.0": { label: "J = 4.0, sin pasadores", factor: 0.78 },
};

const paverBaseFactors = {
  granular: { label: "Base granular", factor: 0.95 },
  asphaltTreated: { label: "Base tratada con asfalto", factor: 1.08 },
  cementTreated: { label: "Base tratada con cemento", factor: 1.15 },
};

const edgeRestraintFactors = {
  adequate: { label: "Confinamiento lateral adecuado", factor: 1 },
  weak: { label: "Confinamiento lateral deficiente", factor: 0.78 },
};

function value(id) {
  return Number(fields[id].value);
}

function pavementMode() {
  return pavementModes[fields.pavementType.value] || pavementModes.hotFlexible;
}

function updateModeControls() {
  coldSettings.classList.toggle("hidden", fields.pavementType.value !== "coldFlexible");
  rigidSettings.classList.toggle("hidden", fields.pavementType.value !== "rigid");
  paverSettings.classList.toggle("hidden", fields.pavementType.value !== "pavers");
  urbanRecommendation.classList.toggle("hidden", fields.projectType.value !== "urban");
}

function applyPavementModeDefaults(force = false) {
  const type = fields.pavementType.value;
  const mode = pavementMode();
  if (!force && type === lastPavementType) return;
  lastPavementType = type;

  fields.a1.value = mode.defaults.a1.toFixed(3);
  fields.a2.value = mode.defaults.a2.toFixed(3);
  fields.a3.value = mode.defaults.a3.toFixed(3);
  fields.asphaltDepth.value = String(mode.defaults.surface);
  fields.baseDepth.value = String(mode.defaults.base);
  fields.subbaseDepth.value = String(mode.defaults.subbase);
  fields.designYears.value = String(mode.defaults.years);
  fields.time.value = "0";
  if (type === "coldFlexible") fields.coldSurfaceType.value = "coldMix";
  if (type === "rigid") fields.rigidLoadTransfer.value = "2.8";
  if (type === "pavers") {
    fields.paverBaseType.value = "granular";
    fields.edgeRestraint.value = "adequate";
  }
  updateModeControls();
}

function reliabilityZR(reliability) {
  const table = [
    [50, 0],
    [60, -0.253],
    [70, -0.524],
    [75, -0.674],
    [80, -0.841],
    [85, -1.037],
    [90, -1.282],
    [95, -1.645],
    [99, -2.327],
  ];

  for (let i = 0; i < table.length - 1; i += 1) {
    const [r0, z0] = table[i];
    const [r1, z1] = table[i + 1];
    if (reliability >= r0 && reliability <= r1) {
      const t = (reliability - r0) / (r1 - r0);
      return z0 + (z1 - z0) * t;
    }
  }

  return reliability < 50 ? 0 : -2.327;
}

function growthFactor(rate, years) {
  const g = rate / 100;
  if (g === 0) return years;
  return ((1 + g) ** years - 1) / g;
}

function trafficEsalAtYears(years) {
  const dailyHeavy = value("aadt") * (value("heavyShare") / 100);
  return (
    dailyHeavy *
    value("truckFactor") *
    365 *
    value("directionFactor") *
    value("laneFactor") *
    growthFactor(value("growth"), years)
  );
}

function designLaneEsal() {
  if (fields.trafficMode.value === "direct") {
    return Math.max(10000, value("directDesignEsal"));
  }
  return trafficEsalAtYears(value("designYears"));
}

function designCapacityEsal() {
  if (fields.pavementType.value === "rigid") {
    return rigidReferenceCapacityEsal();
  }
  return aashtoReferenceCapacityEsal() * pavementMode().capacityFactor * modeSpecificFactor();
}

function modeSpecificFactor() {
  if (fields.pavementType.value === "coldFlexible") {
    return coldSurfaceFactors[fields.coldSurfaceType.value].factor;
  }
  if (fields.pavementType.value === "pavers") {
    return paverBaseFactors[fields.paverBaseType.value].factor * edgeRestraintFactors[fields.edgeRestraint.value].factor;
  }
  return 1;
}

function roadTrafficClass(esal) {
  if (esal < normativeData.limits.mtcPavedMinEsal) {
    return {
      id: "Menor a TP0",
      minEsal: 0,
      maxEsal: normativeData.limits.mtcPavedMinEsal - 1,
      reliability: 65,
      pi: 3.8,
      pt: 2.0,
      outOfCatalog: true,
    };
  }
  return (
    normativeData.mtcTrafficClasses.find((item) => esal >= item.minEsal && esal <= item.maxEsal) ||
    normativeData.mtcTrafficClasses[normativeData.mtcTrafficClasses.length - 1]
  );
}

function urbanClassByEsal(esal) {
  return (
    normativeData.urbanRoadEsalRanges.find((item) => esal >= item.minEsal && esal <= item.maxEsal) ||
    normativeData.urbanRoadEsalRanges[normativeData.urbanRoadEsalRanges.length - 1]
  );
}

function urbanRangeStatus() {
  if (fields.projectType.value !== "urban") {
    return { applies: false, inRange: true, selected: null, recommended: null };
  }
  const selected = normativeData.urbanRoadEsalRanges.find((item) => item.id === fields.urbanClass.value);
  const recommended = urbanClassByEsal(designLaneEsal());
  return {
    applies: true,
    inRange: Boolean(selected && recommended.id === selected.id),
    selected,
    recommended,
  };
}

function formatRange(minEsal, maxEsal) {
  if (maxEsal === Infinity) return `mayor a ${formatLarge(minEsal - 1)}`;
  return `${formatLarge(minEsal)} a ${formatLarge(maxEsal)}`;
}

function urbanNormValues() {
  const urbanClass = fields.urbanClass.value;
  const reference = normativeData.urbanReferenceDefaults[urbanClass];
  const paver = normativeData.ce010PaverDesignEals[urbanClass];
  const roadRange = normativeData.urbanRoadEsalRanges.find((item) => item.id === urbanClass);
  if (fields.pavementType.value === "pavers") {
    return {
      ...reference,
      reliability: paver.reliability,
      pt: 2.0,
      designEal: paver.designEal,
      roadRange,
      source: "CE.010 Anexo F Tabla F2",
      scope: "adoquines",
    };
  }
  return {
    ...reference,
    designEal: null,
    roadRange,
    source: fields.pavementType.value === "rigid" ? "CE.010 Anexo D usa ADTT y tablas PCA" : "Referencia tecnica con rangos de vias y verificacion estructural",
    scope: fields.pavementType.value === "rigid" ? "concreto urbano" : "flexible urbano",
  };
}

function applyPeruvianNorms() {
  if (applyingNorm) return;
  applyingNorm = true;

  urbanClassWrap.classList.toggle("hidden", fields.projectType.value !== "urban");
  directEsalWrap.classList.toggle("hidden", fields.trafficMode.value !== "direct");

  if (fields.projectType.value === "urban") {
    const norm = urbanNormValues();
    fields.reliability.value = String(norm.reliability);
    fields.initialPsi.value = norm.pi.toFixed(2);
    fields.terminalPsi.value = norm.pt.toFixed(2);
    if (fields.pavementType.value === "hotFlexible" && value("asphaltDepth") < norm.asphaltMin) {
      fields.asphaltDepth.value = String(norm.asphaltMin);
    }
  } else {
    const designEsal = designLaneEsal();
    const trafficClass = roadTrafficClass(designEsal);
    fields.reliability.value = String(trafficClass.reliability);
    fields.initialPsi.value = trafficClass.pi.toFixed(2);
    fields.terminalPsi.value = trafficClass.pt.toFixed(2);
    fields.projectType.dataset.trafficClass = trafficClass.id;
  }

  applyingNorm = false;
}

function structuralNumber() {
  const d1 = value("asphaltDepth");
  const d2 = value("baseDepth");
  const d3 = value("subbaseDepth");
  return value("a1") * d1 + value("a2") * d2 * value("m2") + value("a3") * d3 * value("m3");
}

function technicalModeSummary() {
  if (fields.pavementType.value === "coldFlexible") {
    return coldSurfaceFactors[fields.coldSurfaceType.value].note;
  }
  if (fields.pavementType.value === "rigid") {
    const transfer = rigidTransferFactors[fields.rigidLoadTransfer.value];
    const limit = fields.rigidLoadTransfer.value === "4.0" ? " Solo se recomienda para tránsito máximo de 1.00 M EE." : "";
    return `MTC 2014: pavimento rígido AASHTO 93, ${transfer.label}.${limit}`;
  }
  if (fields.pavementType.value === "pavers") {
    const base = paverBaseFactors[fields.paverBaseType.value];
    const edge = edgeRestraintFactors[fields.edgeRestraint.value];
    return `MTC 2014/ICPI: adoquines con ${base.label.toLowerCase()} y ${edge.label.toLowerCase()}.`;
  }
  return pavementMode().norm;
}

function resilientModulusPsi() {
  return Math.max(2500, 1500 * value("cbr"));
}

function aashtoReferenceCapacityEsal() {
  const sn = Math.max(1.1, structuralNumber());
  const mr = resilientModulusPsi();
  const zR = reliabilityZR(value("reliability"));
  const so = 0.45;
  const pi = value("initialPsi");
  const pt = value("terminalPsi");
  const deltaPsi = Math.max(0.5, pi - pt);
  const climatePenalty = 1 - value("climateSeverity") / 220;

  const denominator = 0.4 + 1094 / (sn + 1) ** 5.19;
  const logW18 =
    zR * so +
    9.36 * Math.log10(sn + 1) -
    0.2 +
    Math.log10(deltaPsi / (4.2 - 1.5)) / denominator +
    2.32 * Math.log10(mr) -
    8.07;

  return Math.max(10000, 10 ** logW18 * climatePenalty);
}

function rigidReferenceCapacityEsal() {
  const slabIn = Math.max(4.5, value("asphaltDepth") / 2.54);
  const baseCm = value("baseDepth") + value("subbaseDepth") * 0.55;
  const kValue = Math.max(80, 38 + value("cbr") * 22 + baseCm * 1.6);
  const j = Number(fields.rigidLoadTransfer.value);
  const jFactor = rigidTransferFactors[fields.rigidLoadTransfer.value].factor;
  const zR = reliabilityZR(value("reliability"));
  const so = 0.35;
  const pt = value("terminalPsi");
  const deltaPsi = Math.max(0.5, value("initialPsi") - pt);
  const sc = 650;
  const cd = Math.max(0.72, (value("m2") + value("m3")) / 2);
  const ec = 4_000_000;
  const d075 = slabIn ** 0.75;
  const denominator = 215.63 * j * Math.max(0.4, d075 - 18.42 / ((ec / kValue) ** 0.25));
  const stressRatio = Math.max(0.05, (sc * cd * (d075 - 1.132)) / denominator);
  const serviceTerm = Math.log10(deltaPsi / (4.5 - 1.5)) / (1 + 1.624e7 / (slabIn + 1) ** 8.46);
  const logW18 =
    zR * so +
    7.35 * Math.log10(slabIn + 1) -
    0.06 +
    serviceTerm +
    (4.22 - 0.32 * pt) * Math.log10(stressRatio);
  const climatePenalty = 1 - value("climateSeverity") / 260;
  return Math.max(10000, 10 ** logW18 * climatePenalty * jFactor);
}

function cumulativeEsal(years) {
  if (fields.trafficMode.value === "direct") {
    const totalFactor = Math.max(0.0001, growthFactor(value("growth"), value("designYears")));
    return designLaneEsal() * (growthFactor(value("growth"), years) / totalFactor);
  }
  return trafficEsalAtYears(years);
}

function simulationState(years) {
  const esal = cumulativeEsal(years);
  const capacity = designCapacityEsal();
  const damage = Math.max(0, esal / capacity);
  const climate = value("climateSeverity") / 100;
  const pi = value("initialPsi");
  const pt = value("terminalPsi");
  const serviceLoss = Math.max(0.5, pi - pt);
  const psi = Math.max(1.2, pi - serviceLoss * Math.min(1.35, damage ** 1.15) - 0.18 * climate * years / 10);
  return { esal, capacity, damage, psi, sn: structuralNumber() };
}

function finalState() {
  return simulationState(value("designYears"));
}

function normativeWarnings() {
  const warnings = [];
  const designEsal = designLaneEsal();
  const limits = normativeData.limits;

  if (fields.projectType.value === "road" && designEsal < limits.mtcPavedMinEsal) {
    warnings.push({
      level: "warn",
      text: "EE menor al rango TP0 MTC para caminos pavimentados.",
    });
  }

  if (fields.projectType.value === "road" && designEsal > limits.mtcCatalogMaxEsal) {
    warnings.push({
      level: "block",
      text: "EE > 30 M: MTC exige estudio especifico fuera de catalogo.",
    });
  }

  if (fields.pavementType.value === "coldFlexible") {
    const maxEsal =
      fields.coldSurfaceType.value === "surfaceTreatment" ? limits.surfaceTreatmentMaxEsal : limits.coldMixMaxEsal;
    const label =
      fields.coldSurfaceType.value === "surfaceTreatment"
        ? "Tratamiento superficial bicapa recomendado hasta 500 mil EE."
        : "Mezcla asfaltica en frio recomendada hasta 1.00 M EE.";
    if (designEsal > maxEsal) {
      warnings.push({ level: "block", text: label });
    }
  }

  if (fields.pavementType.value === "rigid" && fields.rigidLoadTransfer.value === "4.0" && designEsal > limits.rigidJ40MaxEsal) {
    warnings.push({
      level: "block",
      text: "J=4.0 sin pasadores solo hasta 1.00 M EE.",
    });
  }

  if (fields.projectType.value === "urban") {
    const norm = urbanNormValues();
    const rangeStatus = urbanRangeStatus();
    const selectedRange = rangeStatus.selected;
    const recommendedRange = rangeStatus.recommended;
    if (designEsal > limits.mtcCatalogMaxEsal) {
      warnings.push({
        level: "warn",
        text: "EE > 30 M: en urbano queda como expresa por rango de vias; sustentar aparte si se usa catalogo MTC.",
      });
    }
    if (selectedRange && recommendedRange && !rangeStatus.inRange) {
      warnings.push({
        level: "block",
        text: `Por EE corresponde ${recommendedRange.label} (${formatRange(recommendedRange.minEsal, recommendedRange.maxEsal)}), no ${selectedRange.label}.`,
      });
    }
    if (fields.pavementType.value === "pavers" && norm.designEal && designEsal > norm.designEal) {
      warnings.push({
        level: "warn",
        text: `CE.010 Anexo F supera EAL de diseno para ${norm.label.toLowerCase()}: ${formatLarge(norm.designEal)}.`,
      });
    }
    if (fields.pavementType.value === "rigid") {
      warnings.push({
        level: "note",
        text: "CE.010 rigido urbano se verifica con ADTT y tablas PCA, no solo EE.",
      });
    }
    if (fields.pavementType.value === "hotFlexible" || fields.pavementType.value === "coldFlexible") {
      warnings.push({
        level: "note",
        text: "En pavimento flexible urbano, el rango de via clasifica demanda y la capacidad se estima con modelo estructural tipo AASHTO.",
      });
    }
  }

  return warnings;
}

function complianceStatus() {
  const final = finalState();
  const capacityOk = final.capacity >= designLaneEsal();
  const psiOk = final.psi >= value("terminalPsi");
  const damageOk = final.damage <= 1;
  const warnings = normativeWarnings();
  const blockingWarnings = warnings.filter((warning) => warning.level === "block");
  const rigidJLimitOk = !warnings.some((warning) => warning.text.startsWith("J=4.0"));
  const normativeOk = blockingWarnings.length === 0;
  const close = final.damage <= 1.1 && final.psi >= value("terminalPsi") - 0.15 && normativeOk;
  const level =
    capacityOk && psiOk && damageOk && normativeOk
      ? "pass"
      : close
        ? "warn"
        : "fail";
  const title =
    level === "pass"
      ? "Cumple"
      : close
        ? "Al limite"
        : "No cumple";

  return {
    final,
    capacityOk,
    psiOk,
    damageOk,
    rigidJLimitOk,
    normativeOk,
    warnings,
    blockingWarnings,
    level,
    title,
  };
}

function formatLarge(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)} mil`;
  return n.toFixed(0);
}

function formatPercent(valueToFormat) {
  return Number.isInteger(valueToFormat) ? `${valueToFormat}%` : `${valueToFormat.toFixed(1)}%`;
}

function urbanRangeStepText() {
  const rangeStatus = urbanRangeStatus();
  if (!rangeStatus.applies || !rangeStatus.selected) {
    return "Rango EE de via urbana = no aplica";
  }
  const selectedText = `${rangeStatus.selected.label}: ${formatRange(rangeStatus.selected.minEsal, rangeStatus.selected.maxEsal)}`;
  if (rangeStatus.inRange) {
    return `Rango EE de via urbana = ${selectedText}`;
  }
  return `Rango EE de via urbana = ${selectedText}; recomendado por EE: ${rangeStatus.recommended.label}`;
}

function urbanRangeTableLines() {
  return normativeData.urbanRoadEsalRanges.map((item) => `${item.label}: ${formatRange(item.minEsal, item.maxEsal)}`);
}

function diagnosisLines(status) {
  const rangeStatus = urbanRangeStatus();
  const observations = status.warnings.filter((warning) => warning.level !== "note");
  const lines = [
    status.capacityOk
      ? "Capacidad estructural: cumple, el EE admisible estructura cubre el EE de diseno."
      : "Capacidad estructural: no cumple, el EE admisible estructura es menor que el EE de diseno.",
    status.psiOk
      ? "Serviciabilidad: cumple, el PSI final queda por encima del Pt."
      : "Serviciabilidad: no cumple, el PSI final queda por debajo del Pt.",
  ];

  if (rangeStatus.applies && rangeStatus.selected && rangeStatus.recommended) {
    lines.unshift(
      rangeStatus.inRange
        ? `Clasificacion urbana: cumple, ${rangeStatus.selected.label} corresponde al EE de diseno.`
        : `Clasificacion urbana: no cumple, corresponde ${rangeStatus.recommended.label} y no ${rangeStatus.selected.label}.`,
    );
  }

  if (observations.length) {
    lines.push(`Observaciones: ${observations.map((warning) => warning.text).join(" | ")}`);
  }

  return lines;
}

function technicalNoteLines(status) {
  return status.warnings
    .filter((warning) => warning.level === "note")
    .map((warning) => warning.text);
}

function applyBaseExample() {
  stopPlayback();
  activeCaseStudy = baseExample;
  fields.pavementType.value = "hotFlexible";
  applyPavementModeDefaults(true);
  fields.projectType.value = "urban";
  fields.urbanClass.value = "arterialMinor";
  fields.trafficMode.value = "direct";
  fields.directDesignEsal.value = String(baseExample.designEsal);
  fields.aadt.value = String(baseExample.imda);
  fields.heavyShare.value = String(baseExample.heavyShare);
  fields.truckFactor.value = String(baseExample.truckFactor);
  fields.asphaltDepth.value = String(baseExample.asphaltDepth);
  fields.baseDepth.value = String(baseExample.baseDepth);
  fields.subbaseDepth.value = String(baseExample.subbaseDepth);
  fields.designYears.value = "20";
  fields.time.value = "0";
  scenarioA = null;
  scenarioB = null;
  applyPeruvianNorms();
  render();
}

function conditionFromDamage(damage, psi) {
  if (damage < 0.25 && psi > 3.7) return ["Excelente", "#1f7a5a"];
  if (damage < 0.55 && psi > 3.1) return ["Bueno", "#4b8f3a"];
  if (damage < 0.85 && psi > 2.6) return ["Regular", "#d5962c"];
  if (damage < 1.1 && psi > 2.2) return ["Malo", "#c9692b"];
  return ["Falla", "#b7423a"];
}

function teachingMessage(state) {
  const type = fields.pavementType.value;
  if (state.damage < 0.25) {
    return [
      type === "rigid"
        ? "La losa conserva buena capacidad estructural y serviciabilidad."
        : type === "pavers"
          ? "El adoquinado conserva trabazón y soporte adecuados."
          : "El pavimento conserva buena capacidad estructural.",
      "Avanza el tiempo para mostrar como se acumulan los ESAL.",
    ];
  }
  if (state.damage < 0.55) {
    return [
      type === "rigid"
        ? "Aparecen señales iniciales: pérdida de comodidad y posible fisuración en losas."
        : type === "pavers"
          ? "Empiezan deformaciones leves y pérdida de alineamiento en la superficie."
          : "Empiezan danos iniciales: fisuras pequenas y perdida leve de comodidad.",
      "Sube el factor camion para explicar el efecto de la sobrecarga.",
    ];
  }
  if (state.damage < 0.85) {
    return [
      "El deterioro ya es visible y el PSI baja con mayor rapidez.",
      "Compara aumentando el espesor asfaltico o el CBR de subrasante.",
    ];
  }
  if (state.damage < 1 || state.psi > value("terminalPsi")) {
    return [
      "El pavimento esta cerca de su condicion terminal.",
      `Senala la linea de 100% de vida y el limite Pt = ${value("terminalPsi").toFixed(2)}.`,
    ];
  }
  return [
    "La seccion alcanzo condicion de falla funcional o estructural.",
    "Reinicia y prueba una estructura mas robusta para alargar la vida util.",
  ];
}

function updateOutputs(state) {
  const mode = pavementMode();
  updateModeControls();
  document.body.dataset.pavement = fields.pavementType.value;
  outputs.brandTitle.textContent = "Simulador integral de pavimentos";
  outputs.heroTitle.textContent = mode.hero;
  outputs.heroLede.textContent = mode.lede;
  outputs.surfaceDepthLabel.textContent = mode.surfaceLabel;
  outputs.baseDepthLabel.textContent = mode.baseLabel;
  outputs.metricStructureLabel.textContent = mode.metricStructure;
  outputs.metricCapacityLabel.textContent = mode.metricCapacity;
  outputs.asphaltLayerName.textContent = mode.layerNames[0];
  outputs.baseLayerName.textContent = mode.layerNames[1];
  outputs.subbaseLayerName.textContent = mode.layerNames[2];

  outputs.heavyShare.textContent = formatPercent(value("heavyShare"));
  outputs.growth.textContent = `${value("growth").toFixed(1)}%`;
  outputs.asphaltDepth.textContent = `${value("asphaltDepth").toFixed(1)} cm`;
  outputs.baseDepth.textContent = `${value("baseDepth").toFixed(1)} cm`;
  outputs.subbaseDepth.textContent = `${value("subbaseDepth").toFixed(1)} cm`;
  outputs.cbr.textContent = `${value("cbr").toFixed(1)}%`;
  outputs.climateSeverity.textContent = value("climateSeverity").toFixed(0);
  outputs.reliability.textContent = `${value("reliability").toFixed(0)}%`;
  outputs.designYears.textContent = `${value("designYears").toFixed(0)} anos`;
  outputs.psiLimitLabel.textContent = `Limite Pt: ${value("terminalPsi").toFixed(2)}`;
  outputs.time.textContent = `${value("time").toFixed(1)} anos`;
  outputs.esalNow.textContent = formatLarge(state.esal);
  outputs.designEsalNow.textContent = formatLarge(designLaneEsal());
  const rangeStatus = urbanRangeStatus();
  outputs.urbanRangeNow.textContent =
    rangeStatus.applies && rangeStatus.selected
      ? `${rangeStatus.selected.label}: ${formatRange(rangeStatus.selected.minEsal, rangeStatus.selected.maxEsal)}`
      : "No aplica";
  outputs.recommendedUrbanClass.textContent =
    rangeStatus.applies && rangeStatus.recommended
      ? `${rangeStatus.recommended.label} (${formatRange(rangeStatus.recommended.minEsal, rangeStatus.recommended.maxEsal)})`
      : "No aplica";
  outputs.capacityEsalNow.textContent = formatLarge(state.capacity);
  outputs.damageNow.textContent = `${Math.round(state.damage * 100)}%`;
  outputs.psiNow.textContent = state.psi.toFixed(2);
  outputs.snNow.textContent = state.sn.toFixed(2);

  const [label, color] = conditionFromDamage(state.damage, state.psi);
  outputs.conditionBadge.textContent = label;
  outputs.conditionBadge.style.background = color;
  const [quickRead, nextStep] = teachingMessage(state);
  outputs.quickRead.textContent = quickRead;
  outputs.nextStep.textContent = nextStep;
  if (fields.projectType.value === "urban") {
    const norm = urbanNormValues();
    outputs.normName.textContent = `CE.010 Pavimentos Urbanos - ${norm.label}`;
    const ealText = norm.designEal ? `EAL diseno ${formatLarge(norm.designEal)}, ` : "";
    const rangeText = norm.roadRange
      ? `Rango de via ${formatRange(norm.roadRange.minEsal, norm.roadRange.maxEsal)}. `
      : "";
    outputs.normValues.textContent = `${mode.title}. ${rangeText}${norm.source}. ${ealText}Pi ${norm.pi.toFixed(2)}, Pt ${norm.pt.toFixed(2)}, R ${norm.reliability}%`;
  } else {
    const designEsal = designLaneEsal();
    const trafficClass = roadTrafficClass(designEsal);
    outputs.normName.textContent = `Manual de Carreteras MTC 2014 - ${trafficClass.id}`;
    outputs.normValues.textContent =
      `${technicalModeSummary()} EE ${formatLarge(trafficClass.minEsal)} a ` +
      `${trafficClass.maxEsal === Infinity ? "mas de 30 M" : formatLarge(trafficClass.maxEsal)}, R ${trafficClass.reliability}%`;
  }

  const failure = findFailureYear();
  outputs.failureYear.textContent = failure
    ? `Vida estimada: ${failure.toFixed(1)} anos`
    : "Vida estimada: mayor al periodo";

  outputs.caseStudyNote.classList.toggle("hidden", !activeCaseStudy);
  outputs.caseStudyNote.textContent = activeCaseStudy ? activeCaseStudy.note : "";
}

function updateEsalSteps() {
  const mode = pavementMode();
  if (fields.trafficMode.value === "direct") {
    esalSteps.innerHTML = `
      <p>1) EE de diseno ingresado = ${formatLarge(designLaneEsal())}</p>
      <p>2) EE acumulado al ano ${value("time").toFixed(1)} = ${formatLarge(cumulativeEsal(value("time")))}</p>
      <p>3) Modelo activo = ${mode.title}. ${technicalModeSummary()}</p>
      <p>4) ${urbanRangeStepText()}</p>
      <p>5) EE admisible estructura = ${formatLarge(designCapacityEsal())}</p>
      <p>6) Consumo = EE acumulado / EE admisible estructura = ${(simulationState(value("time")).damage * 100).toFixed(0)}%</p>
    `;
    return;
  }

  const dailyHeavy = value("aadt") * (value("heavyShare") / 100);
  const annualEsal = dailyHeavy * value("truckFactor") * 365 * value("directionFactor") * value("laneFactor");
  esalSteps.innerHTML = `
    <p>1) Vehiculos pesados/dia = IMDA x %pesados = ${formatLarge(dailyHeavy)}</p>
    <p>2) EE anual carril diseno = pesados/dia x Fv x 365 x Fd x Fc = ${formatLarge(annualEsal)}</p>
    <p>3) Factor crecimiento ${value("designYears")} anos = ${growthFactor(value("growth"), value("designYears")).toFixed(2)}</p>
    <p>4) EE diseno = EE anual x factor crecimiento = ${formatLarge(designLaneEsal())}</p>
    <p>5) Modelo activo = ${mode.title}. ${technicalModeSummary()}</p>
    <p>6) ${urbanRangeStepText()}</p>
    <p>7) EE admisible estructura = ${formatLarge(designCapacityEsal())}</p>
  `;
}

function updateCompliance() {
  const status = complianceStatus();
  complianceCard.classList.remove("pass", "warn", "fail");
  complianceCard.classList.add(status.level);

  outputs.complianceTitle.textContent = status.title;
  const rangeStatus = urbanRangeStatus();
  const rangeText =
    rangeStatus.applies && rangeStatus.selected
      ? ` Rango via ${rangeStatus.selected.label}: ${formatRange(rangeStatus.selected.minEsal, rangeStatus.selected.maxEsal)}.`
      : "";
  outputs.complianceDetail.textContent =
    `EE admisible estructura ${formatLarge(status.final.capacity)} vs EE diseno ${formatLarge(designLaneEsal())}.${rangeText} ` +
    `PSI final ${status.final.psi.toFixed(2)} vs Pt ${value("terminalPsi").toFixed(2)}.`;

  outputs.capacityCheck.textContent = status.capacityOk
    ? "OK: EE admisible estructura >= EE diseno"
    : "Revisar: EE admisible estructura < EE diseno";
  outputs.psiCheck.textContent = status.psiOk
      ? "OK: PSI final >= Pt"
      : "Revisar: PSI final < Pt";
  outputs.normativeCheck.textContent = status.blockingWarnings.length
    ? `Fuera de alcance: ${status.blockingWarnings[0].text}`
    : rangeStatus.applies
      ? "OK: rango de via compatible"
      : "OK: alcance normativo verificado";
  outputs.capacityCheck.className = status.capacityOk ? "ok" : "bad";
  outputs.psiCheck.className = status.psiOk ? "ok" : "bad";
  outputs.normativeCheck.className = status.normativeOk ? "ok" : "bad";
}

function updateLayerVisual() {
  const d1 = value("asphaltDepth");
  const d2 = value("baseDepth");
  const d3 = value("subbaseDepth");
  const total = Math.max(1, d1 + d2 + d3);
  const available = 148;

  asphaltLayer.style.height = `${Math.max(28, (d1 / total) * available)}px`;
  baseLayer.style.height = `${Math.max(28, (d2 / total) * available)}px`;
  subbaseLayer.style.height = `${Math.max(24, (d3 / total) * available)}px`;

  outputs.totalDepthLabel.textContent = `${total.toFixed(1)} cm`;
  outputs.asphaltLayerValue.textContent = `${d1.toFixed(1)} cm`;
  outputs.baseLayerValue.textContent = `${d2.toFixed(1)} cm`;
  outputs.subbaseLayerValue.textContent = `${d3.toFixed(1)} cm`;
  outputs.subgradeLayerValue.textContent = `CBR ${value("cbr").toFixed(1)}%`;
}

function snapshotScenario() {
  const status = complianceStatus();
  return {
    pavementType: pavementMode().title,
    result: status.title,
    level: status.level,
    sn: structuralNumber(),
    designEsal: designLaneEsal(),
    capacity: status.final.capacity,
    psi: status.final.psi,
    damage: status.final.damage,
    years: value("designYears"),
    asphalt: value("asphaltDepth"),
    base: value("baseDepth"),
    subbase: value("subbaseDepth"),
  };
}

function scenarioText(snapshot) {
  if (!snapshot) return "Sin guardar";
  return `${snapshot.result} | ${snapshot.pavementType} | ${snapshot.sn.toFixed(2)} | PSI ${snapshot.psi.toFixed(2)} | ${Math.round(snapshot.damage * 100)}%`;
}

function updateComparison() {
  outputs.scenarioAResult.textContent = scenarioText(scenarioA);
  outputs.scenarioBResult.textContent = scenarioText(scenarioB);

  if (!scenarioA || !scenarioB) {
    outputs.compareStatus.textContent = "Guarda dos escenarios";
    outputs.compareSummary.textContent = "Ajusta parametros, guarda A y luego guarda B para comparar vida, SN y cumplimiento.";
    return;
  }

  const capacityDelta = ((scenarioB.capacity - scenarioA.capacity) / Math.max(1, scenarioA.capacity)) * 100;
  const snDelta = scenarioB.sn - scenarioA.sn;
  const psiDelta = scenarioB.psi - scenarioA.psi;
  outputs.compareStatus.textContent = capacityDelta >= 0 ? "B mejora la capacidad" : "B reduce la capacidad";
  outputs.compareSummary.textContent =
    `B cambia el SN en ${snDelta >= 0 ? "+" : ""}${snDelta.toFixed(2)}, ` +
    `la capacidad en ${capacityDelta >= 0 ? "+" : ""}${capacityDelta.toFixed(0)}% ` +
    `y el PSI final en ${psiDelta >= 0 ? "+" : ""}${psiDelta.toFixed(2)}.`;
}

function reportText() {
  const status = complianceStatus();
  const mode = pavementMode();
  const reportWarnings = status.warnings.filter((warning) => warning.level !== "note");
  const technicalNotes = technicalNoteLines(status);
  const caseLines = activeCaseStudy
    ? [
        "Ejemplo aplicado",
        `Nombre: ${activeCaseStudy.name}`,
        `Fuente: ${activeCaseStudy.source}`,
        `Tramo/estacion: ${activeCaseStudy.station}`,
        `Escenario usado: ${activeCaseStudy.scenario}`,
        `IMDA referencia: ${activeCaseStudy.imda.toLocaleString("es-PE")} veh/dia`,
        `Pesados referencia: ${activeCaseStudy.heavyShare.toFixed(1)}%`,
        `Factor camion referencial: ${activeCaseStudy.truckFactor.toFixed(2)}`,
        `ESAL de diseno del caso: ${formatLarge(activeCaseStudy.designEsal)}`,
        `Paquete experimental: carpeta ${activeCaseStudy.asphaltDepth.toFixed(0)} cm, base ${activeCaseStudy.baseDepth.toFixed(0)} cm, subbase ${activeCaseStudy.subbaseDepth.toFixed(0)} cm`,
        "",
      ]
    : [];
  return [
    "REPORTE RESUMEN - SIMULADOR INTEGRAL DE PAVIMENTOS",
    "",
    `Tipo de pavimento: ${mode.title}`,
    `Normativa: ${outputs.normName.textContent}`,
    `Valores normativos: ${outputs.normValues.textContent}`,
    `Criterio tecnico activo: ${technicalModeSummary()}`,
    `Resultado: ${status.title}`,
    reportWarnings.length ? `Advertencias normativas: ${reportWarnings.map((warning) => warning.text).join(" | ")}` : "",
    "",
    ...caseLines,
    "Rangos de vias",
    ...urbanRangeTableLines(),
    "",
    "Transito y EE",
    "Lectura: el rango urbano clasifica el tipo de via por demanda; el EE admisible estructura verifica la capacidad del paquete de pavimento.",
    `EE de diseno: ${formatLarge(designLaneEsal())}`,
    `Rango EE de via urbana: ${urbanRangeStepText().replace("Rango EE de via urbana = ", "")}`,
    `Tipo recomendado por EE: ${urbanRangeStatus().recommended ? urbanRangeStatus().recommended.label : "No aplica"}`,
    `EE admisible estructura: ${formatLarge(status.final.capacity)}`,
    `EE acumulados al periodo: ${formatLarge(status.final.esal)}`,
    "",
    "Diagnostico",
    ...diagnosisLines(status),
    technicalNotes.length ? "" : "",
    technicalNotes.length ? "Notas tecnicas" : "",
    ...technicalNotes,
    "",
    "Estructura",
    `${mode.layerNames[0]}: ${value("asphaltDepth").toFixed(1)} cm`,
    `${mode.layerNames[1]}: ${value("baseDepth").toFixed(1)} cm`,
    `${mode.layerNames[2]}: ${value("subbaseDepth").toFixed(1)} cm`,
    `CBR subrasante: ${value("cbr").toFixed(1)}%`,
    `${mode.metricStructure}: ${status.final.sn.toFixed(2)}`,
    fields.pavementType.value === "rigid" ? `Transferencia de carga: ${rigidTransferFactors[fields.rigidLoadTransfer.value].label}` : "",
    fields.pavementType.value === "coldFlexible" ? `Solucion en frio: ${coldSurfaceFactors[fields.coldSurfaceType.value].label}` : "",
    fields.pavementType.value === "pavers" ? `Base adoquinado: ${paverBaseFactors[fields.paverBaseType.value].label}` : "",
    fields.pavementType.value === "pavers" ? `Confinamiento: ${edgeRestraintFactors[fields.edgeRestraint.value].label}` : "",
    "",
    "Serviciabilidad",
    `Pi: ${value("initialPsi").toFixed(2)}`,
    `Pt: ${value("terminalPsi").toFixed(2)}`,
    `PSI final: ${status.final.psi.toFixed(2)}`,
    `Consumo de vida: ${Math.round(status.final.damage * 100)}%`,
    "",
    "Nota: herramienta de apoyo basada en EE, CBR, serviciabilidad y criterios normativos peruanos seleccionados. No reemplaza un expediente tecnico definitivo.",
  ].join("\n");
}

function downloadReport() {
  const blob = new Blob([reportText()], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "reporte-simulador-pavimentos.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function findFailureYear() {
  const maxYears = value("designYears");
  const terminalPsi = value("terminalPsi");
  for (let year = 0; year <= maxYears; year += 0.1) {
    const state = simulationState(year);
    if (state.damage >= 1 || state.psi <= terminalPsi) return year;
  }
  return null;
}

function resizeCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return rect;
}

function drawRoad(state) {
  const rect = resizeCanvas(roadCanvas);
  const w = rect.width;
  const h = rect.height;
  const ctx = roadCtx;
  const damage = Math.min(1.25, state.damage);
  const visualDamage = Math.min(1, damage < 0.45 ? damage * 0.55 : 0.25 + (damage - 0.45) * 0.94);
  const failureVisual = Math.max(0, (visualDamage - 0.72) / 0.28);
  const roughness = Math.min(0.82, visualDamage * 0.72 + value("climateSeverity") / 360);
  const progress = Number(fields.time.value) / Math.max(1, value("designYears"));
  const pulse = (Math.sin(performance.now() / 650) + 1) / 2;
  const type = fields.pavementType.value;

  ctx.clearRect(0, 0, w, h);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#dff5ff");
  sky.addColorStop(0.46, "#cfe9f2");
  sky.addColorStop(0.7, "#dceadf");
  sky.addColorStop(1, "#a7c8aa");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const horizon = h * 0.32;
  const roadTop = h * 0.34;
  const roadBottom = h * 1.13;
  const leftTop = w * 0.38;
  const rightTop = w * 0.62;
  const leftBottom = w * -0.1;
  const rightBottom = w * 1.1;
  const roadLeft = (t) => leftTop + (leftBottom - leftTop) * t;
  const roadRight = (t) => rightTop + (rightBottom - rightTop) * t;
  const roadY = (t) => roadTop + (roadBottom - roadTop) * t;
  const roadCenter = (t) => (roadLeft(t) + roadRight(t)) / 2;
  const roadWidth = (t) => roadRight(t) - roadLeft(t);

  const ground = ctx.createLinearGradient(0, horizon, 0, h);
  ground.addColorStop(0, "rgba(113, 154, 121, 0.28)");
  ground.addColorStop(0.62, "rgba(170, 188, 143, 0.44)");
  ground.addColorStop(1, "rgba(119, 139, 104, 0.58)");
  ctx.fillStyle = ground;
  ctx.fillRect(0, horizon, w, h - horizon);

  ctx.strokeStyle = "rgba(26, 93, 118, 0.14)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 10; i += 1) {
    const y = horizon + i * h * 0.062;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + i * 2.5);
    ctx.stroke();
  }

  for (let i = 0; i < 14; i += 1) {
    const bw = w * (0.018 + (i % 4) * 0.008);
    const bh = h * (0.055 + (i % 5) * 0.02);
    const x = (i / 11) * w;
    const y = horizon - bh + 5;
    ctx.fillStyle = `rgba(41, 96, 122, ${0.06 + (i % 3) * 0.03})`;
    ctx.fillRect(x - bw / 2, y, bw, bh);
    ctx.fillStyle = `rgba(16, 135, 111, ${0.18 + pulse * 0.06})`;
    ctx.fillRect(x - bw / 2 + bw * 0.18, y + bh * 0.22, bw * 0.12, bh * 0.5);
  }

  ctx.fillStyle = "rgba(31, 49, 58, 0.15)";
  ctx.beginPath();
  ctx.moveTo(leftTop - w * 0.04, roadTop + h * 0.02);
  ctx.lineTo(rightTop + w * 0.04, roadTop + h * 0.02);
  ctx.lineTo(rightBottom + w * 0.04, roadBottom);
  ctx.lineTo(leftBottom - w * 0.04, roadBottom);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(leftTop, roadTop);
  ctx.lineTo(rightTop, roadTop);
  ctx.lineTo(rightBottom, roadBottom);
  ctx.lineTo(leftBottom, roadBottom);
  ctx.closePath();
  const pavementFill = ctx.createLinearGradient(0, roadTop, 0, h);
  if (type === "rigid") {
    pavementFill.addColorStop(0, "#aab2b6");
    pavementFill.addColorStop(0.52, "#7f898e");
    pavementFill.addColorStop(1, "#545f65");
  } else if (type === "pavers") {
    pavementFill.addColorStop(0, "#a98b72");
    pavementFill.addColorStop(0.5, "#806756");
    pavementFill.addColorStop(1, "#514238");
  } else if (type === "coldFlexible") {
    pavementFill.addColorStop(0, "#717b80");
    pavementFill.addColorStop(0.5, "#465259");
    pavementFill.addColorStop(1, "#202d35");
  } else {
    pavementFill.addColorStop(0, "#66727a");
    pavementFill.addColorStop(0.45, "#3b4852");
    pavementFill.addColorStop(1, "#17222c");
  }
  ctx.fillStyle = pavementFill;
  ctx.fill();

  if (type === "rigid") {
    ctx.strokeStyle = "rgba(238, 246, 248, 0.34)";
    ctx.lineWidth = 1.4;
    for (let i = 1; i < 8; i += 1) {
      const t = i / 8;
      ctx.beginPath();
      ctx.moveTo(roadLeft(t), roadY(t));
      ctx.lineTo(roadRight(t), roadY(t));
      ctx.stroke();
    }
  }

  if (type === "pavers") {
    ctx.strokeStyle = "rgba(245, 232, 210, 0.24)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 16; i += 1) {
      const t = i / 16;
      ctx.beginPath();
      ctx.moveTo(roadLeft(t), roadY(t));
      ctx.lineTo(roadRight(t), roadY(t));
      ctx.stroke();
    }
    for (let i = -4; i <= 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(roadCenter(0.02) + i * roadWidth(0.02) * 0.08, roadY(0.02));
      ctx.lineTo(roadCenter(0.96) + i * roadWidth(0.96) * 0.08, roadY(0.96));
      ctx.stroke();
    }
  }

  for (let i = 0; i < 18; i += 1) {
    const t = i / 17;
    const y = roadY(t);
    const left = roadLeft(t);
    const right = roadRight(t);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.035 + roughness * 0.035})`;
    ctx.lineWidth = 1 + t * 1.2;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y + t * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = `rgba(0, 207, 171, ${0.46 + pulse * 0.14})`;
  ctx.lineWidth = 2.2;
  ctx.shadowColor = "rgba(0, 207, 171, 0.28)";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(leftTop, roadTop);
  ctx.lineTo(leftBottom, roadBottom);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rightTop, roadTop);
  ctx.lineTo(rightBottom, roadBottom);
  ctx.stroke();
  ctx.shadowBlur = 0;

  for (let i = 0; i < 90; i += 1) {
    const t = ((i * 37) % 100) / 100;
    const span = roadWidth(t);
    const x = roadLeft(t) + span * (((i * 29) % 100) / 100);
    const y = roadY(t);
    const size = 0.7 + t * 2.5;
    ctx.fillStyle = `rgba(255,255,255,${0.04 + roughness * 0.05})`;
    ctx.fillRect(x, y, size, size);
  }

  ctx.strokeStyle = `rgba(255, 209, 86, ${0.84 + pulse * 0.12})`;
  ctx.shadowColor = "rgba(255, 209, 86, 0.45)";
  ctx.shadowBlur = 10;
  for (let i = 0; i < 10; i += 1) {
    const t0 = i / 10;
    const t1 = t0 + 0.045 + t0 * 0.025;
    const y0 = roadY(t0);
    const y1 = roadY(Math.min(0.98, t1));
    ctx.lineWidth = Math.max(2, 2 + t0 * 7);
    ctx.beginPath();
    ctx.moveTo(roadCenter(t0), y0);
    ctx.lineTo(roadCenter(Math.min(0.98, t1)), y1);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  ctx.fillStyle = `rgba(13, 24, 32, ${0.04 + visualDamage * 0.12 + failureVisual * 0.05})`;
  for (let i = 0; i < 2; i += 1) {
    const laneX = roadCenter(0.72) + (i === 0 ? -1 : 1) * roadWidth(0.72) * 0.09;
    const rutWidth = roadWidth(0.72) * (0.022 + visualDamage * 0.034 + failureVisual * 0.012);
    ctx.beginPath();
    ctx.ellipse(laneX, h * 0.67, rutWidth, h * (0.22 + visualDamage * 0.045), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const crackCount = Math.floor(4 + visualDamage * 32 + failureVisual * 12);
  ctx.lineCap = "round";
  for (let i = 0; i < crackCount; i += 1) {
    const seed = i * 997;
    const t = 0.08 + (((seed * 13) % 84) / 100);
    const y = roadY(t);
    const center = roadCenter(t) + Math.sin(seed) * roadWidth(t) * 0.22;
    const length = roadWidth(t) * (0.03 + visualDamage * 0.075 + failureVisual * 0.025 + ((i % 5) * 0.004));
    ctx.strokeStyle = `rgba(20, 25, 30, ${0.16 + visualDamage * 0.28 + failureVisual * 0.12})`;
    ctx.lineWidth = 0.8 + t * 1.7 + visualDamage * 1.25 + failureVisual * 0.6;
    ctx.beginPath();
    ctx.moveTo(center - length / 2, y);
    for (let k = 0; k < 4; k += 1) {
      ctx.lineTo(center - length / 2 + (length * (k + 1)) / 4, y + Math.sin(seed + k) * (10 * visualDamage + 5 * failureVisual));
    }
    ctx.stroke();

    if (visualDamage > 0.32) {
      ctx.strokeStyle = `rgba(255, 179, 64, ${0.05 + visualDamage * 0.1 + failureVisual * 0.08})`;
      ctx.lineWidth = 0.65 + failureVisual * 0.35;
      ctx.stroke();
    }
  }

  const potholes = Math.floor(Math.max(0, (visualDamage - 0.5) * 10 + failureVisual * 3));
  for (let i = 0; i < potholes; i += 1) {
    const t = 0.34 + ((i * 0.137) % 0.52);
    const x = roadLeft(t) + roadWidth(t) * (0.32 + ((i * 0.211) % 0.36));
    const y = roadY(t);
    const r = 5 + t * 14 + visualDamage * 10 + failureVisual * 5 + (i % 3) * 2.5;
    ctx.fillStyle = `rgba(18, 24, 30, ${0.62 + failureVisual * 0.16})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.35, r * 0.72, Math.sin(i) * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 179, 64, ${0.32 + failureVisual * 0.18})`;
    ctx.lineWidth = 1.8 + failureVisual * 0.7;
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
  ctx.fillRect(0, 0, w, 1);
  ctx.strokeStyle = `rgba(47, 125, 246, ${0.08 + pulse * 0.05})`;
  ctx.lineWidth = 1;
  for (let y = h * 0.08; y < h; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const truckT = 0.16 + Math.min(0.78, progress * 0.78);
  const laneOffset = -roadWidth(truckT) * 0.13;
  const truckX = roadCenter(truckT) + laneOffset;
  const truckY = roadY(truckT) - 8 + Math.sin(performance.now() / 210) * (0.5 + truckT * 1.5);
  const truckScale = Math.max(0.34, Math.min(1.18, 0.24 + truckT * 1.08)) * Math.min(1.08, w / 1000);
  drawTruck(ctx, truckX, truckY, truckScale, truckT);
}

function fillRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawTruck(ctx, x, y, scale, depth = 0.5) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.shadowColor = "rgba(7, 18, 26, 0.36)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "rgba(10, 18, 24, 0.24)";
  ctx.beginPath();
  ctx.ellipse(0, 34, 66, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "rgba(245, 195, 68, 0.24)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#f5b942";
  fillRoundedRect(ctx, -42, -52, 84, 74, 8);
  ctx.fillStyle = "#19586d";
  fillRoundedRect(ctx, -34, -24, 68, 46, 7);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#d9f5ff";
  fillRoundedRect(ctx, -25, -16, 50, 18, 3);
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fillRect(-32, 10, 64, 3);
  ctx.fillStyle = "rgba(0, 207, 171, 0.86)";
  ctx.fillRect(-28, -36, 56, 4);

  ctx.fillStyle = "#101b23";
  [-34, 34].forEach((wheelX) => {
    fillRoundedRect(ctx, wheelX - 9, 8, 18, 24, 6);
  });
  ctx.fillStyle = "#eef9ff";
  ctx.fillRect(-38, -48, 14, 8);
  ctx.fillRect(24, -48, 14, 8);

  ctx.fillStyle = `rgba(255, 209, 86, ${0.28 + depth * 0.25})`;
  ctx.beginPath();
  ctx.moveTo(-30, 23);
  ctx.lineTo(-60, 58);
  ctx.lineTo(4, 58);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(30, 23);
  ctx.lineTo(60, 58);
  ctx.lineTo(-4, 58);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawChart() {
  const rect = resizeCanvas(chartCanvas);
  const w = rect.width;
  const h = rect.height;
  const ctx = chartCtx;
  const years = value("designYears");
  const now = value("time");

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const pad = 28;
  ctx.strokeStyle = "#d8e0e5";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad + ((h - pad * 1.5) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(w - pad, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#1f7a5a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 160; i += 1) {
    const year = (years * i) / 160;
    const damage = Math.min(1.35, simulationState(year).damage);
    const x = pad + ((w - pad * 2) * year) / years;
    const y = h - pad - ((h - pad * 2) * Math.min(1.25, damage)) / 1.25;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const failY = h - pad - ((h - pad * 2) * 1) / 1.25;
  ctx.strokeStyle = "#b7423a";
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(pad, failY);
  ctx.lineTo(w - pad, failY);
  ctx.stroke();
  ctx.setLineDash([]);

  const xNow = pad + ((w - pad * 2) * now) / years;
  ctx.strokeStyle = "#162026";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(xNow, pad);
  ctx.lineTo(xNow, h - pad);
  ctx.stroke();

  ctx.fillStyle = "#64737d";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText("0", pad - 4, h - 8);
  ctx.fillText(`${years} anos`, w - pad - 48, h - 8);
  ctx.fillText("100% falla", pad + 6, failY - 8);
}

function drawPsiChart() {
  const rect = resizeCanvas(psiCanvas);
  const w = rect.width;
  const h = rect.height;
  const ctx = psiCtx;
  const years = value("designYears");
  const now = value("time");
  const pad = 30;
  const minPsi = 1.5;
  const maxPsi = 4.5;
  const terminalPsi = value("terminalPsi");

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "#d8e0e5";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i += 1) {
    const psi = minPsi + ((maxPsi - minPsi) * i) / 3;
    const y = h - pad - ((h - pad * 2) * (psi - minPsi)) / (maxPsi - minPsi);
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(w - pad, y);
    ctx.stroke();
    ctx.fillStyle = "#64737d";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText(psi.toFixed(1), 4, y + 4);
  }

  const limitY = h - pad - ((h - pad * 2) * (terminalPsi - minPsi)) / (maxPsi - minPsi);
  ctx.strokeStyle = "#b7423a";
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(pad, limitY);
  ctx.lineTo(w - pad, limitY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "#2d6773";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 160; i += 1) {
    const year = (years * i) / 160;
    const psi = simulationState(year).psi;
    const x = pad + ((w - pad * 2) * year) / years;
    const y = h - pad - ((h - pad * 2) * (psi - minPsi)) / (maxPsi - minPsi);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const xNow = pad + ((w - pad * 2) * now) / years;
  const psiNow = simulationState(now).psi;
  const yNow = h - pad - ((h - pad * 2) * (psiNow - minPsi)) / (maxPsi - minPsi);
  ctx.fillStyle = "#162026";
  ctx.beginPath();
  ctx.arc(xNow, yNow, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#64737d";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText(`Pt ${terminalPsi.toFixed(2)}`, pad + 6, limitY - 8);
  ctx.fillText("0", pad - 4, h - 8);
  ctx.fillText(`${years} anos`, w - pad - 48, h - 8);
}

function render() {
  const maxYears = value("designYears");
  fields.time.max = String(maxYears);
  if (value("time") > maxYears) fields.time.value = String(maxYears);

  const state = simulationState(value("time"));
  updateOutputs(state);
  updateEsalSteps();
  updateCompliance();
  updateLayerVisual();
  updateComparison();
  drawRoad(state);
  drawChart();
  drawPsiChart();
}

function animate(now) {
  lastFrame = now;
  drawRoad(simulationState(value("time")));
  requestAnimationFrame(animate);
}

function stopPlayback() {
  playing = false;
  playIcon.textContent = ">";
  playPause.classList.remove("is-playing");
  playPause.setAttribute("aria-pressed", "false");
  playPause.setAttribute("aria-label", "Reproducir simulacion");
  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
}

function advancePlayback() {
  const maxYears = value("designYears");
  const next = value("time") + Math.max(0.04, maxYears / 260);
  fields.time.value = next >= maxYears ? String(maxYears) : next.toFixed(2);
  render();
  if (next >= maxYears) stopPlayback();
}

function startPlayback() {
  if (value("time") >= value("designYears")) {
    fields.time.value = "0";
  }
  playing = true;
  playIcon.textContent = "||";
  playPause.classList.add("is-playing");
  playPause.setAttribute("aria-pressed", "true");
  playPause.setAttribute("aria-label", "Pausar simulacion");
  lastFrame = performance.now();
  advancePlayback();
  if (playbackTimer) clearInterval(playbackTimer);
  playbackTimer = setInterval(advancePlayback, 50);
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.setAttribute("role", "tab");
  tab.setAttribute("aria-selected", tab.classList.contains("active") ? "true" : "false");
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    document.querySelectorAll(".panel").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    $(tab.dataset.panel).classList.add("active");
  });
});

Object.values(fields).forEach((input) => input.addEventListener("input", render));

fields.pavementType.addEventListener("change", () => {
  applyPavementModeDefaults();
  applyPeruvianNorms();
  scenarioA = null;
  scenarioB = null;
  render();
});

[fields.projectType, fields.urbanClass, fields.trafficMode, fields.directDesignEsal, fields.aadt, fields.heavyShare, fields.truckFactor, fields.growth, fields.designYears].forEach(
  (input) => {
    input.addEventListener("input", () => {
      applyPeruvianNorms();
      render();
    });
    input.addEventListener("change", () => {
      applyPeruvianNorms();
      render();
    });
  },
);

[fields.coldSurfaceType, fields.rigidLoadTransfer, fields.paverBaseType, fields.edgeRestraint].forEach((input) => {
  input.addEventListener("change", () => {
    applyPeruvianNorms();
    render();
  });
});

saveScenarioA.addEventListener("click", () => {
  scenarioA = snapshotScenario();
  updateComparison();
});

saveScenarioB.addEventListener("click", () => {
  scenarioB = snapshotScenario();
  updateComparison();
});

exportReport.addEventListener("click", downloadReport);
loadBaseExample.addEventListener("click", applyBaseExample);

playPause.addEventListener("click", () => {
  if (playing) stopPlayback();
  else startPlayback();
});

resetButton.addEventListener("click", () => {
  fields.time.value = "0";
  stopPlayback();
  render();
});

window.addEventListener("resize", render);
applyBaseExample();
requestAnimationFrame(animate);

