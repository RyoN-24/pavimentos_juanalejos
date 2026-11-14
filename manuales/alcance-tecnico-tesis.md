# Alcance tecnico para tesis

Fecha de trabajo: 2026-07-07  
Actualización de alcance: 2026-10-13

## Titulo tentativo

Implementación de un sistema inteligente basado en modelos predictivos para el análisis del deterioro y la vida útil de pavimentos urbanos flexibles.

## Actualización del proyecto

El proyecto inicial no se reemplaza. Se conserva como módulo normativo independiente para tránsito, ejes equivalentes, CBR, drenaje, espesores, número estructural y serviciabilidad. Sobre esa base se agregó un módulo experimental de inteligencia artificial que:

- proyecta el PCI futuro de un tramo urbano flexible,
- estima la tasa anual de deterioro,
- clasifica la condición proyectada,
- estima el tiempo hasta el umbral documentado PCI 40,
- muestra la procedencia, las métricas y las limitaciones del modelo,
- y no altera ningún resultado del cálculo normativo original.

El modelo XGBoost preliminar fue entrenado con 16 104 pares temporales de Washington D. C. y validado temporalmente con observaciones objetivo 2024. La prueba externa con San Diego mostró una pérdida importante de precisión; por ello, la salida se mantiene como académica y exploratoria hasta contar con calibración y validación peruana.

## Enfoque correcto del producto

El sistema debe presentarse como una herramienta de apoyo al predimensionamiento, no como un software de diseno definitivo.

El objetivo es ayudar al usuario a estimar una estructura preliminar de pavimento urbano, comparar alternativas y reconocer cuando una solucion sale del alcance normativo o requiere un estudio tecnico especifico.

## Problema que atiende

El predimensionamiento de pavimentos urbanos suele realizarse con hojas de calculo dispersas, criterios no siempre trazables y supuestos mezclados con parametros normativos. Esto dificulta revisar de donde sale cada valor, comparar alternativas y justificar tecnicamente una recomendacion preliminar.

El proyecto busca reducir esa brecha mediante un sistema que:

- ordene los datos de entrada,
- aplique criterios normativos seleccionados,
- documente los supuestos internos,
- compare alternativas,
- genere una memoria preliminar,
- y advierta los casos fuera de alcance.

## Usuario objetivo

- Estudiantes de ingenieria civil que necesitan entender y comparar alternativas.
- Docentes que requieren una herramienta didactica verificable.
- Bachilleres o tesistas que elaboran predimensionamientos preliminares.
- Ingenieros que desean una revision rapida antes de pasar al diseno definitivo.

## Alcance funcional propuesto

### Incluido

- Seleccion de tipo de via urbana como entrada principal de predimensionamiento: local, colectora, arterial o expresa.
- Ingreso directo de EE de diseno cuando el usuario ya cuenta con un estudio previo.
- Uso conservador de valores representativos por tipo de via cuando la norma o el caso de referencia los proporcione.
- Clasificacion funcional urbana segun RNE/CE.010/GH.020.
- Parametros de demanda y confiabilidad de CE.010 Anexo F para adoquinado, cuando aplique.
- Predimensionamiento preliminar de pavimento flexible urbano mediante metodologia permitida por CE.010.
- Evaluacion preliminar de pavimento rigido con advertencia clara de que CE.010 urbano rigido requiere flujo ADTT/PCA.
- Evaluacion preliminar de adoquinado con datos CE.010 Anexo F ya trazados, pendiente de completar con curvas y espesores.
- Comparacion de alternativas.
- Reporte tecnico preliminar con datos de entrada, resultados, fuentes, advertencias y supuestos.

### No incluido en esta etapa

- Diseno definitivo de expediente tecnico.
- Reemplazo de ensayos de laboratorio.
- Diseno geometrico vial.
- Diseno hidraulico o drenaje detallado.
- Analisis mecanistico avanzado por capas elasticas.
- Calibracion local de deterioro con datos de campo.
- Calculo detallado de ejes equivalentes por cada tipo de vehiculo, configuracion de ejes y carga.
- Predimensionamiento de carreteras interurbanas por clases TP del Manual MTC, salvo como antecedente o trabajo futuro.
- Metrados, costos, planos constructivos o especificaciones finales.
- Firma, aprobacion o responsabilidad profesional automatizada.

## Fuentes normativas base

- Norma CE.010 Pavimentos Urbanos del Reglamento Nacional de Edificaciones.
- Norma GH.020 Componentes de Diseno Urbano del Reglamento Nacional de Edificaciones.
- Norma G.040 Definiciones del Reglamento Nacional de Edificaciones.
- Manual de Carreteras MTC 2014 y EG-2013 solo como referencias complementarias cuando aporten criterios de materiales, construccion o comparacion.

Las fuentes y paginas ya estan registradas en `manuales/datos-normativos.json`.

## Fortalezas actuales del proyecto

- Ya existe una interfaz funcional para simular tipos de pavimento y comparar escenarios.
- La app ya contiene criterios para pavimento urbano CE.010 y permite acotar el alcance de tesis a vias urbanas.
- La data normativa ya esta separada de los supuestos internos en un catalogo trazable.
- Hay pruebas automaticas que verifican consistencia entre el catalogo normativo y la data usada por `script.js`.
- El sistema muestra advertencias cuando se exceden limites relevantes o cuando una metodologia no corresponde directamente al tipo de via urbana.
- La interfaz ya comunica que el rango urbano clasifica demanda y no representa por si solo capacidad estructural.
- El reporte exportado ya incluye alcance del modelo y notas tecnicas.

## Debilidades actuales del proyecto

- El motor de calculo todavia esta acoplado al frontend en `script.js`.
- Falta una suite de casos de validacion contra calculos manuales o ejemplos de referencia.
- CE.010 rigido urbano aun no esta implementado con flujo completo ADTT, modulo k, MR, sardineles, juntas y tablas PCA/PCAPAV.
- CE.010 adoquinado aun no esta completo con curvas, CBR/Mr, base/subbase y espesores minimos.
- El deterioro visual y la curva de PSI son aproximaciones internas, no modelos calibrados con datos de campo.
- No existe persistencia de proyectos, alternativas ni historial de cambios.
- El reporte todavia debe evolucionar hacia una memoria de predimensionamiento mas formal.
- Falta revision externa por docente o especialista vial.

## Variables principales

### Entradas de transito

- Tipo de via urbana: local, colectora, arterial o expresa.
- Rango o demanda representativa asociada al tipo de via, cuando corresponda.
- EE de diseno directo, cuando exista estudio previo.
- Valor representativo adoptado para el rango.
- Periodo de analisis.
- IMDA y factores vehiculares solo como informacion complementaria o futura.

### Entradas geotecnicas y estructurales

- CBR de subrasante.
- Espesor de capa de rodadura.
- Espesor de base.
- Espesor de subbase.
- Coeficientes estructurales, cuando aplique.
- Drenaje o coeficientes de capa.
- Modulo de rotura para concreto.
- Modulo k estimado o ingresado, en una etapa futura.

### Salidas esperadas

- EE de diseno o demanda representativa.
- Tipo de via urbana.
- Valor representativo usado para predimensionar.
- Indicador estructural preliminar.
- Capacidad admisible estimada.
- Consumo de vida.
- PSI final estimado.
- Estado de cumplimiento preliminar.
- Advertencias normativas.
- Comparacion de alternativas.
- Reporte tecnico preliminar.

## Criterios de validacion para tesis

El software debera validarse con una matriz de casos de referencia.

### Casos minimos sugeridos

- 4 casos de pavimento flexible urbano.
- 3 casos de pavimento rigido urbano CE.010/PCA.
- 3 casos de adoquinado urbano CE.010.
- 2 casos fuera de alcance para verificar advertencias.
- 2 casos de sensibilidad por CBR o cambio de rango de transito.

### Indicadores de validacion

- Coincidencia de tipo de via urbana y parametros asociados.
- Diferencia porcentual entre resultado del software y calculo manual.
- Coincidencia de cumplimiento/no cumplimiento.
- Registro de advertencias generadas.
- Explicacion tecnica de discrepancias.

### Umbral preliminar de aceptacion

Como criterio inicial de tesis, el error frente a casos de referencia deberia mantenerse dentro de un rango definido por variable:

- Valor representativo del rango: coincidencia exacta con el criterio adoptado.
- Parametros normativos discretos: coincidencia exacta.
- Capacidad o espesor preliminar: tolerancia a definir segun metodo, idealmente menor o igual a 5% para casos comparables.
- Advertencias de alcance: coincidencia exacta en casos preparados.

## Riesgos principales

| Riesgo | Impacto | Mitigacion |
| --- | --- | --- |
| Presentar el software como diseno definitivo | Alto | Mantener lenguaje de predimensionamiento y advertencias en UI/reporte |
| Mezclar CE.010 con criterios MTC sin alcance | Alto | Mantener CE.010/RNE como eje de tesis y MTC solo como referencia complementaria |
| No contar con casos de validacion | Alto | Construir matriz de casos por rango antes de agregar nuevas funciones grandes |
| Resultados no reproducibles | Medio | Registrar inputs, version de datos normativos y formulas usadas |
| Supuestos internos leidos como norma | Medio | Etiquetar todo supuesto interno en catalogo, UI y reporte |

## Roadmap inmediato recomendado

### Sprint 1 - Fundacion de tesis

- [ ] Consolidar este documento con el asesor o docente.
- [ ] Definir titulo final o subtitulo tecnico.
- [ ] Crear matriz de variables: entrada, unidad, fuente, rango, validacion.
- [ ] Crear matriz de casos de referencia vacia.

### Sprint 2 - Metodologia de predimensionamiento

- [ ] Redactar el procedimiento de seleccion de rango o clase de demanda.
- [ ] Redactar el procedimiento de seleccion de parametros normativos.
- [ ] Redactar el procedimiento de predimensionamiento por tipo de pavimento.
- [ ] Redactar las condiciones de fuera de alcance y advertencias tecnicas.

### Sprint 3 - Validacion inicial

- [ ] Crear al menos 5 casos manuales de referencia.
- [ ] Comparar resultado del software contra cada caso.
- [ ] Registrar error, coincidencias y discrepancias.
- [ ] Ajustar formulas o textos de alcance donde corresponda.

### Sprint 4 - Memoria de predimensionamiento

- [ ] Mejorar reporte con estructura de memoria tecnica.
- [ ] Incluir version de normativa y fuente por parametro clave.
- [ ] Incluir tabla de supuestos internos.
- [ ] Incluir advertencias y conclusion preliminar.

## Decision metodologica inmediata

La siguiente etapa debe concentrarse en la validación local y no en ampliar indiscriminadamente las funciones:

1. Conseguir mediciones PCI peruanas repetidas de los mismos tramos urbanos.
2. Registrar fechas, tratamientos y longitud; añadir tránsito, clima, drenaje y estructura cuando su calidad lo permita.
3. Separar una prueba temporal o espacial que no participe en el entrenamiento.
4. Reentrenar y comparar persistencia, regresión, Random Forest y XGBoost con la misma partición.
5. Contrastar la trayectoria predictiva con el módulo normativo sin mezclar sus resultados.
6. Mantener la advertencia de uso académico hasta lograr desempeño aceptable en datos peruanos independientes.

Esta decisión mantiene el proyecto alineado con una tesis de ingeniería civil: el software se evalúa por su utilidad técnica, trazabilidad, validez predictiva y comportamiento frente a datos independientes, no por la cantidad de funciones incorporadas.
