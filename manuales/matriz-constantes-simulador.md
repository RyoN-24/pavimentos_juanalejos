# Matriz de constantes del simulador

Fecha de revision: 2026-05-13

## Objetivo

Separar los valores embebidos en el simulador segun su naturaleza tecnica:

- **Normativo**: valor tomado de manual, tabla o criterio reglamentario.
- **Criterio de clasificacion**: regla usada para ordenar o recomendar, sin ser capacidad estructural.
- **Default editable**: valor inicial para arrancar un ejemplo, modificable por el usuario.
- **Supuesto interno**: factor o correlacion adoptada para simplificar el modelo.
- **Visualizacion**: constante grafica que solo afecta la representacion visual.

Esta matriz no cambia el calculo. Sirve para auditar que la app no presente supuestos internos como si fueran norma.

## Resumen ejecutivo

Si hay valores hardcodeados. No todos son un problema:

- Los **rangos MTC**, **rangos urbanos**, **confiabilidades**, **Pi/Pt** y **limites de uso** pueden estar embebidos si tienen fuente y alcance.
- Los **defaults** de ejemplo son aceptables si quedan como plantilla editable.
- Los **factores de capacidad**, **penalizaciones climaticas**, **correlaciones CBR-k/Mr** y **deterioros visuales** deben tratarse como supuestos internos o aproximaciones, no como norma.

## Matriz principal

| Grupo | Valor / regla | Ubicacion actual | Tipo | Fuente / alcance | Riesgo | Accion recomendada |
| --- | --- | --- | --- | --- | --- | --- |
| Ejemplo base | 5,000,000 EE; IMDA 15,000; 12% pesados; Fv 1.44; 8/50/40 cm | `baseExample`, `index.html` | Default editable | Plantilla general editable | Bajo, si no se presenta como caso real | Mantener como ejemplo; no exportar como caso si el usuario edita datos |
| Rangos urbanos | Habilitacion 0-300k; Local 300k-840k; Colectora 840k-3M; Arteria menor 3M-8.3M; Arteria mayor 8.3M-28.4M; Expresa >28.4M | `normativeData.urbanRoadEsalRanges` | Criterio de clasificacion | Criterio academico de rangos de vias | Medio si se confunde con capacidad | Mostrar como rango de demanda, no como EE admisible |
| Rangos MTC TP | TP0 >75k a 150k hasta TP15 >30M | `normativeData.mtcTrafficClasses` | Normativo | MTC 2014, clasificacion por EE de 8.2 t | Bajo si se usa solo en carretera MTC | Mover luego a JSON trazable con fuente/pagina |
| Confiabilidad y PSI MTC | R 65-95%, Pi/Pt por TP | `normativeData.mtcTrafficClasses` | Normativo | MTC 2014, criterios de serviciabilidad/confiabilidad | Bajo | Mantener con trazabilidad |
| EAL CE.010 adoquines | Expresa 28.4M; arterial 8.3M; colectora 3M; local 0.84M | `ce010PaverDesignEals` | Normativo especifico | CE.010 Anexo F, adoquines | Alto si se aplica a todos los pavimentos urbanos | Restringir a adoquinado y documentar alcance |
| Referencias urbanas flexibles/rigidas | R, Pi, Pt, espesor minimo asfaltico por tipo urbano | `urbanReferenceDefaults` | Supuesto interno / referencia tecnica | No es una tabla CE.010 general para flexible | Medio | Rotular como referencia tecnica, no norma directa |
| Coeficientes flexibles | a1 0.170, a2 0.052, a3 0.047 | `pavementModes.hotFlexible.defaults` | Normativo / default editable | MTC 2014, coeficientes estructurales | Bajo | Mantener y permitir editar |
| Mezcla fria | a1 0.125; limite 1,000,000 EE | `coldFlexible.defaults`, `limits.coldMixMaxEsal` | Normativo / validacion | MTC 2014 | Medio si se usa sobre el limite | Mantener advertencia bloqueante |
| Tratamiento superficial | factor 0.72; limite 500,000 EE | `coldSurfaceFactors`, `limits.surfaceTreatmentMaxEsal` | Supuesto interno + limite normativo | MTC 2014 para limite; factor interno de capacidad | Medio | Separar limite normativo del factor interno |
| Rigid J | J 2.8, 3.2, 3.8, 4.0; J=4.0 hasta 1M EE | `rigidTransferFactors`, `limits.rigidJ40MaxEsal` | Normativo + supuesto interno | MTC/AASHTO para J; limite local registrado | Medio | Mantener J visible; documentar factores multiplicadores |
| Factores por J | 1.15, 1.05, 0.95, 0.78 | `rigidTransferFactors.factor` | Supuesto interno | Ajuste simplificado de capacidad | Alto si se lee como norma | Mostrar como aproximacion interna o revisar con fuente |
| MR concreto | 650 psi por defecto, editable 450-900 psi | `concreteModulusRupture` | Default editable | AASHTO rigido usa modulo de rotura; valor inicial academico | Bajo si visible | Mantener visible; documentar valor por defecto |
| k rigido | `k = max(80, 38 + CBR*22 + baseCm*1.6)` | `rigidSupportKValue()` | Supuesto interno | Correlacion aproximada CBR/capas-k | Alto si se presenta como exacto | Mantener como estimacion; marcar en reporte |
| Mr subrasante | `Mr = max(2500, 1500 * CBR)` | `resilientModulusPsi()` | Correlacion aproximada | Relacion comun AASHTO/CE.010 para CBR bajo | Medio | Mostrar como correlacion estimada, no ensayo |
| Capacidad flexible | Ecuacion tipo AASHTO 1993 | `aashtoReferenceCapacityEsal()` | Modelo tecnico aproximado | AASHTO 1993 | Medio | Mantener como modelo de apoyo; no reemplaza expediente |
| Capacidad rigida | Ecuacion aproximada con D, J, MR, k, PSI | `rigidReferenceCapacityEsal()` | Modelo tecnico aproximado | AASHTO 1993 adaptado | Alto para CE.010 urbano rigido | Separar de CE.010/PCA si se implementa version normativa |
| Adoquinado | `capacityFactor 0.95`, base 0.95/1.08/1.15, confinamiento 1/0.78 | `pavementModes.pavers`, `paverBaseFactors`, `edgeRestraintFactors` | Supuesto interno | Aproximacion ICPI/CE.010 simplificada | Alto si se lee como CE.010 Anexo F completo | Mantener nota de modelo simplificado; futura implementacion Anexo F |
| Penalizacion climatica | Flexible `1 - severidad/220`; rigido `1 - severidad/260` | `aashtoReferenceCapacityEsal()`, `rigidReferenceCapacityEsal()` | Supuesto interno | Ajuste propio de la simulacion | Medio | Documentar formula; permitir desactivar o calibrar |
| PSI visual | `psi = Pi - perdida * damage^1.15 - clima` | `simulationState()` | Supuesto interno | Curva funcional simplificada | Medio | Documentar como aproximacion |
| Deterioros visuales | Fisuras, ahuellamiento y baches derivados de daño/PSI | `drawRoad()` | Visualizacion | No es modelo calibrado de deterioro | Medio | Mantener nota visible y en reporte |
| Constantes graficas | Colores, perspectiva, conteo de fisuras, tamanos, animacion | `drawRoad()`, CSS | Visualizacion | Solo interfaz | Bajo | No requieren trazabilidad normativa |

## Valores a parametrizar primero

1. `paverBaseFactors`, `edgeRestraintFactors` y `capacityFactor` de adoquinado.
2. Factores multiplicadores de `rigidTransferFactors`.
3. Correlacion `rigidSupportKValue()`.
4. Penalizaciones climaticas `220` y `260`.
5. Curva de PSI y deterioros visuales.

## Valores que pueden quedarse hardcodeados temporalmente

1. Rangos urbanos, siempre que se muestren como **clasificacion de demanda**.
2. Rangos TP MTC, si se conserva el alcance `Carretera MTC`.
3. Defaults editables de ejemplo.
4. Limites normativos de mezcla fria, tratamiento superficial y catalogo MTC.

## Recomendacion de arquitectura

Crear luego un archivo estructurado:

`manuales/datos-normativos.json`

Con esta forma:

```json
{
  "id": "mtc_2014_tp_classes",
  "scope": "road_mtc",
  "source": "manual-mtc-suelos-pavimentos-2014-oficial.pdf",
  "table": "Clasificacion TP",
  "status": "normative",
  "values": []
}
```

Y otro bloque para supuestos internos:

```json
{
  "id": "simulation_internal_factors",
  "scope": "simulator",
  "status": "internal_assumption",
  "values": [],
  "warning": "No presentar como norma."
}
```

## Checklist para la siguiente auditoria

- [ ] Cada valor normativo tiene fuente, alcance y tabla/pagina.
- [ ] Cada supuesto interno aparece como aproximacion en UI o reporte.
- [ ] CE.010 adoquines no se aplica a flexible o rigido.
- [ ] CE.010 rigido no se presenta como equivalente al flujo AASHTO.
- [ ] Los defaults de ejemplo no aparecen como datos del proyecto final.
- [ ] Los deterioros visuales siguen declarados como referenciales.
