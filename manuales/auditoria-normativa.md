# Auditoria normativa del simulador de pavimentos

Fecha de revision: 2026-05-11

## Alcance

Esta auditoria compara la data y reglas embebidas en la app con los manuales locales del proyecto:

- `manual-mtc-suelos-pavimentos-2014-oficial.pdf`
- `norma-ce-010-pavimentos-urbanos.pdf`
- `manual-mtc-eg-2013.pdf`
- `base-tecnica-simulador.md`

El objetivo no es validar un expediente tecnico, sino detectar inconsistencias entre la app didactica y las fuentes normativas usadas como sustento.

## Resumen ejecutivo

La app tiene una base razonable para explicar EE, SN, CBR, PSI y comparacion de escenarios, pero mezcla tres niveles distintos de informacion:

1. Valores normativos directos del MTC 2014.
2. Ejemplos o metodologias sugeridas de CE.010.
3. Criterio academico de clase para clasificar vias urbanas por EE.
4. Factores didacticos propios de la simulacion.

Esa mezcla genera el riesgo principal: la interfaz presenta algunos valores como si fueran criterios normativos generales cuando en realidad son aproximaciones, ejemplos de anexos especificos o parametros internos del modelo.

## Criterio academico de clasificacion urbana

Se adopta una tabla de rangos de vias para seleccionar el tipo de via urbana segun ejes equivalentes. En la app se usa como criterio de clasificacion, no como capacidad estructural:

| Tipo de via urbana | Rango EE |
| --- | --- |
| Habilitacion urbana | 0 a 300,000 |
| Local | 300,001 a 840,000 |
| Colectora | 840,001 a 3,000,000 |
| Arteria menor | 3,000,001 a 8,300,000 |
| Arteria mayor | 8,300,001 a 28,400,000 |
| Expresa | Mayor a 28,400,000 |

La app debe comparar tres conceptos separados: `EE de diseno`, `rango EE de via urbana` y `EE admisible estructura`. El rango urbano selecciona o recomienda el tipo de via; el EE admisible sigue dependiendo de la estructura del pavimento, espesores, CBR, coeficientes, drenaje, confiabilidad y serviciabilidad.

## Hallazgos prioritarios

| ID | Severidad | Ubicacion | Problema | Evidencia normativa | Riesgo | Accion recomendada |
| --- | --- | --- | --- | --- | --- | --- |
| A-01 | Alta | `script.js`, `urbanNormValues()` | Los tipos de via urbana se definen con confiabilidad, Pi, Pt y espesor asfaltico minimo, pero no con rangos o EALs de diseno por tipo de via. | CE.010 Anexo F, Tabla F2 da ejemplos de EALs de diseno para adoquines: Expresas 28.4 M, Arteriales 8.3 M, Colectoras 3.0 M, Locales 0.84 M. CE.010 Anexo D para concreto usa ADTT y clasificacion de calles, no esos mismos valores como regla general. | La app puede hacer creer que CE.010 define una capacidad urbana general por tipo de via para cualquier pavimento. | Separar criterios urbanos por tipo de pavimento: adoquines con EAL Tabla F2, concreto con ADTT Tabla D4, flexible como metodologia didactica o fuente pendiente. |
| A-02 | Alta | `script.js`, `urbanNormValues()` | Las confiabilidades urbanas actuales son Expresa 95%, Arterial 90%, Colectora 85%, Local 75%. | CE.010 Anexo F, Tabla F2 para adoquines recomienda: Expresas 90%, Arteriales 85%, Colectoras 80%, Locales 75%. | Sobredimensiona o distorsiona el analisis urbano cuando se declara CE.010, especialmente en expresas, arteriales y colectoras. | Ajustar esos valores solo para modo adoquinado, o cambiar el texto para indicar que son supuestos didacticos no CE.010 general. |
| A-03 | Alta | `script.js`, clasificacion MTC y ejemplos urbanos | Para proyectos urbanos con EE mayores a 30 M, la clasificacion por rango de vias puede indicar Expresa, pero el catalogo MTC de carreteras exige estudio especifico si se usa como sustento catalogado. | MTC 2014, clasificacion TP: TP15 > 30 M EE; nota indica que los tramos con EE mayores a 30 M son materia de Estudio Especifico. | La app podria mezclar una clasificacion urbana valida con una lectura de catalogo MTC que no corresponde. | Mostrar advertencia explicita para >30 M EE cuando se use sustento MTC; mantener la app general y no atada a un ejemplo especifico. |
| A-04 | Media | `script.js`, `roadTrafficClass()` | La funcion devuelve TP0 para cualquier EE menor o igual a 150,000, incluso por debajo de 75,000 EE. | MTC 2014: TP0 es > 75,000 EE y <= 150,000 EE; los rangos de pavimentados empiezan en 75,000 EE. | Un diseno con 10,000 o 50,000 EE queda etiquetado como TP0 aunque esta fuera del rango pavimentado TP0. | Agregar clase "menor a TP0 / fuera de catalogo pavimentado" o limitar la entrada minima a 75,001 para clasificacion MTC. |
| A-05 | Media | `script.js`, defaults de `pavementModes.hotFlexible` | La app usa `a2 = 0.055` y `a3 = 0.043` para base y subbase granular. | MTC 2014, Cuadro 12.14: base granular CBR 80% `a2 = 0.052/cm`, base granular CBR 100% `a2 = 0.054/cm`, subbase granular CBR 40% `a3 = 0.047/cm`. | La capacidad calculada puede desviarse: base levemente alta y subbase baja frente al cuadro MTC. | Cambiar defaults a valores MTC o permitir seleccionar calidad de base/subbase y mostrar la fuente. |
| A-06 | Media | `script.js`, `pavementModes.coldFlexible` y `technicalModeSummary()` | Mezcla fria y tratamiento superficial se modelan mediante `capacityFactor` y factores internos, pero algunos limites normativos solo estan en texto. | MTC 2014, Cuadro 12.14: carpeta fria `a1 = 0.125/cm` recomendada para trafico <= 1,000,000 EE; tratamiento superficial bicapa recomendado para <= 500,000 EE y sin aporte estructural indicado con asterisco. | El usuario puede simular mezcla fria o TSB en transitos altos sin bloqueo fuerte de cumplimiento. | Agregar validaciones: mezcla fria >1 M EE y TSB >500k EE deben marcarse como "fuera de recomendacion MTC". |
| A-07 | Media | `script.js`, `paverBaseFactors`, `edgeRestraintFactors`, `capacityFactor` | El adoquinado usa factores propios de capacidad, pero CE.010 Anexo F disena con EAL, CBR/Mr, base y curvas de espesor; no con un multiplicador unico. | CE.010 Anexo F: EALs ajustados, caracterizacion de subrasante, base granular/tratada y curvas F2-F4; Tabla F7 especifica base/subbase y espesores minimos. | El resultado puede ser util pedagogicamente, pero no debe leerse como calculo CE.010 real. | Declarar el modo como aproximacion y, si se quiere rigor, implementar flujo Anexo F para adoquines. |
| A-08 | Media | `script.js`, `rigidReferenceCapacityEsal()` | El pavimento rigido usa una ecuacion aproximada con factores internos y `J`, mientras CE.010 urbano para concreto usa metodo PCA/PCAPAV con ADTT, MR, k, sardineles y tablas D4. | CE.010 Anexo D: factores de diseno incluyen MR, modulo k, clasificacion de calles, ADTT, periodo, sardineles y juntas; Tablas D4(a) y D4(b) dan espesores. | Para proyecto urbano rigido, la app no esta siguiendo el flujo CE.010 sugerido. | Separar "rigido MTC/AASHTO didactico" de "rigido urbano CE.010/PCA"; no mostrar ambos como equivalentes. |
| A-09 | Baja | `index.html`, guia rapida | La formula visible usa `FC` y `Fcarril`; el codigo usa `truckFactor`, `directionFactor`, `laneFactor`. | MTC 2014 distingue factor direccional, factor carril, factor vehiculo pesado y factor por presion. | Puede confundir porque `FC` suele leerse como factor camion o factor carril segun contexto. | Renombrar en UI: `Fv` factor vehiculo, `Fd` direccion, `Fc` carril, `Fp` presion cuando aplique. |
| A-10 | Baja | `script.js`, `resilientModulusPsi()` | La app estima `Mr = 1500 * CBR` para todos los casos. | CE.010 Anexo F usa conversion 1500 psi = 1% CBR para adoquines; MTC/AASHTO tambien permite correlaciones, pero dependen de metodologia y suelo. | Esta bien como aproximacion didactica, pero no como regla universal. | Mostrarlo como correlacion aproximada y registrar fuente/alcance por modo. |

## Reglas que si estan bien encaminadas

| Tema | Estado | Evidencia |
| --- | --- | --- |
| Rangos TP0 a TP15 para carreteras MTC | Mayormente consistente | MTC 2014, clasificacion de EE de 8.2 t en carril de diseno: TP0 >75,000 a <=150,000, hasta TP15 >30,000,000. |
| Confiabilidad MTC por TP | Consistente para una etapa | MTC 2014, Cuadro 12.7: TP0 65%, TP1 70%, TP2 75%, TP3-TP4 80%, TP5-TP7 85%, TP8-TP11 90%, TP12-TP15 95%. |
| Pi y Pt MTC por TP | Consistente en el enfoque general | MTC 2014, cuadros de serviciabilidad: TP0-TP4 Pi 3.8/Pt 2.0, TP5-TP11 Pi 4.0/Pt 2.5, TP12-TP15 Pi 4.2/Pt 3.0. |
| `a1` carpeta asfaltica caliente | Consistente | MTC 2014, Cuadro 12.14: `a1 = 0.170/cm`. |
| `a1` carpeta asfaltica fria | Consistente, con limite pendiente | MTC 2014, Cuadro 12.14: `a1 = 0.125/cm`, recomendada para trafico <= 1,000,000 EE. |
| Advertencia J=4.0 hasta 1 M EE | Bien orientada | La base tecnica local registra J=4.0 sin pasadores aplicable hasta 1,000,000 EE; la app ya valida este caso. |

## Matriz de trazabilidad recomendada

Para evitar que el problema vuelva a aparecer, conviene mover la data normativa a un archivo estructurado y exigir fuente por cada valor:

```json
{
  "id": "ce010_adoquines_eals_f2",
  "scope": "urban_pavers",
  "source": "norma-ce-010-pavimentos-urbanos.pdf",
  "page": 72,
  "table": "Tabla F2",
  "values": {
    "express": { "ealDesign": 28400000, "reliability": 90 },
    "arterial": { "ealDesign": 8300000, "reliability": 85 },
    "collector": { "ealDesign": 3000000, "reliability": 80 },
    "local": { "ealDesign": 840000, "reliability": 75 }
  },
  "notes": "Ejemplos para adoquines intertrabados, 20 anos, 4% crecimiento, 50% direccional."
}
```

## Propuesta de solucion por fases

### Fase 1 - Trazabilidad sin cambiar calculos

- Crear `manuales/datos-normativos.md` o `manuales/datos-normativos.json`.
- Mover ahi rangos TP, confiabilidad, Pi, Pt, coeficientes y criterios urbanos.
- Agregar columna `alcance`: `MTC carretera`, `CE.010 adoquines`, `CE.010 concreto`, `didactico`.
- Cambiar textos de UI para no presentar supuestos didacticos como norma directa.

### Fase 2 - Correcciones de bajo riesgo

- Corregir `a2`/`a3` por defecto para granular MTC.
- Agregar advertencia para `EE < 75,000` y `EE > 30,000,000`.
- Agregar validaciones de mezcla fria >1 M EE y tratamiento superficial >500k EE.
- Corregir confiabilidades urbanas del modo adoquinado segun CE.010 Tabla F2.

### Fase 3 - Separar calculos por metodologia

- Modo carretera flexible MTC/AASHTO: conservar SN y TP.
- Modo urbano adoquinado CE.010: usar Anexo F, Tabla F2, CBR/Mr y espesores minimos.
- Modo urbano rigido CE.010: usar Anexo D, ADTT, MR, k, sardinel/berma y Tablas D4.
- Modo urbano flexible: mantener como aproximacion didactica salvo que se incorpore una fuente especifica.

### Fase 4 - Pruebas automaticas

- Test de rangos TP sin huecos ni solapes.
- Test de que cada valor normativo tenga fuente, pagina y alcance.
- Test de advertencias para fuera de catalogo.
- Test de que CE.010 no se aplique indistintamente a todos los tipos de pavimento.

## Checklist de implementacion posterior

- [ ] Crear data normativa trazable.
- [ ] Reemplazar constantes hardcodeadas en `script.js`.
- [ ] Ajustar UI para mostrar alcance de la fuente.
- [ ] Agregar validaciones de cumplimiento por modo.
- [ ] Agregar pruebas de consistencia normativa.
- [ ] Revisar manualmente un caso urbano local, colector, arterial y expresa.
