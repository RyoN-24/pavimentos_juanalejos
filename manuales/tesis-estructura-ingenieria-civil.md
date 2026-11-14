# Estructura de tesis orientada a ingenieria civil

Fecha de trabajo: 2026-07-07

## Enfoque general

La tesis debe centrarse en el predimensionamiento de pavimentos y en la validacion de una herramienta computacional de apoyo. El software no es el objeto principal de estudio; es el medio para aplicar una metodologia tecnica basada en criterios normativos peruanos.

## Titulo tentativo

Desarrollo y validacion de una herramienta computacional de apoyo al predimensionamiento de pavimentos urbanos flexibles, rigidos y adoquinados aplicando criterios del Reglamento Nacional de Edificaciones.

## Planteamiento del problema

En la etapa preliminar de proyectos de pavimentacion urbana se requiere estimar estructuras de pavimento a partir del tipo funcional de via, demanda representativa, capacidad de soporte de la subrasante, periodo de analisis y criterios de serviciabilidad. Sin embargo, en la practica academica y profesional inicial, estos predimensionamientos suelen realizarse mediante hojas de calculo o procedimientos manuales poco estandarizados, con trazabilidad limitada de parametros normativos y supuestos de calculo.

Esta situacion dificulta comparar alternativas, verificar el alcance de la norma aplicada y justificar tecnicamente los resultados preliminares. Por ello, se plantea desarrollar y validar una herramienta computacional que apoye el predimensionamiento de pavimentos, manteniendo visible la fuente normativa, las variables utilizadas, los supuestos internos y las condiciones en las que el resultado debe considerarse solo referencial.

## Pregunta de investigacion

En que medida una herramienta computacional basada en la clasificacion funcional de vias urbanas y criterios del RNE puede apoyar el predimensionamiento preliminar de pavimentos urbanos y generar resultados consistentes frente a casos de calculo de referencia?

## Problema general

La ausencia de una herramienta trazable y validada para predimensionamiento preliminar de pavimentos urbanos dificulta la comparacion tecnica de alternativas y la justificacion de parametros normativos en etapas iniciales de analisis.

## Problemas especificos

1. Que tipos de via urbana, variables estructurales y parametros normativos deben considerarse para el predimensionamiento preliminar de pavimentos flexibles, rigidos y adoquinados?
2. Como estructurar una metodologia de calculo que permita comparar alternativas bajo criterios CE.010, GH.020 y G.040 del RNE?
3. Que nivel de aproximacion presenta la herramienta frente a casos de referencia resueltos manualmente?
4. Que advertencias o limites deben mostrarse para evitar que el predimensionamiento sea interpretado como diseno definitivo?

## Objetivo general

Desarrollar y validar una herramienta computacional de apoyo al predimensionamiento preliminar de pavimentos urbanos, basada en criterios del Reglamento Nacional de Edificaciones y contrastada con casos de calculo de referencia.

## Objetivos especificos

1. Identificar tipos de via urbana, variables de entrada, parametros normativos y condiciones de alcance aplicables al predimensionamiento de pavimentos urbanos.
2. Formular una metodologia de predimensionamiento para pavimentos urbanos flexibles, rigidos y adoquinados, diferenciando criterios CE.010/RNE y supuestos internos.
3. Implementar la metodologia en una herramienta computacional que permita ingresar datos, comparar alternativas y generar una memoria preliminar.
4. Validar los resultados de la herramienta mediante casos de referencia y calcular las diferencias respecto a procedimientos manuales.
5. Establecer limitaciones, advertencias y condiciones de uso del software como herramienta de apoyo, no como sustituto de un expediente tecnico.

## Hipotesis de trabajo

Una herramienta computacional basada en criterios del RNE permite obtener resultados de predimensionamiento preliminar de pavimentos urbanos consistentes con casos de calculo de referencia, siempre que se delimite su alcance y se documenten sus supuestos.

## Variable principal

Resultado de predimensionamiento preliminar de pavimento urbano.

## Variables de entrada

| Grupo | Variables |
| --- | --- |
| Transito | Tipo de via urbana, demanda representativa, EE directo si existe estudio previo, periodo de analisis |
| Subrasante | CBR, modulo resiliente estimado, modulo k cuando aplique |
| Estructura | Espesor de rodadura, base, subbase, tipo de pavimento, coeficientes estructurales |
| Condicion de diseno | Confiabilidad, serviciabilidad inicial, serviciabilidad terminal, drenaje, severidad ambiental |
| Normativa | CE.010, GH.020, G.040, tipo de via urbana, limites de aplicacion |

## Variables de salida

| Salida | Uso en tesis |
| --- | --- |
| Valor representativo de demanda | Verificar el rango usado para predimensionar |
| Tipo de via urbana | Verificar consistencia normativa |
| Indicador estructural | Comparar alternativas |
| Capacidad estimada | Verificar si cubre demanda de diseno |
| PSI final estimado | Evaluar serviciabilidad preliminar |
| Estado de cumplimiento | Clasificar resultado preliminar |
| Advertencias de alcance | Evitar interpretacion como diseno definitivo |

## Metodologia propuesta

### Tipo de investigacion

Aplicada, porque busca desarrollar una herramienta para resolver una necesidad tecnica concreta en el predimensionamiento de pavimentos.

### Nivel de investigacion

Descriptivo y comparativo. Describe una metodologia de predimensionamiento y compara sus resultados con casos de referencia.

### Diseno metodologico

1. Revision normativa y tecnica.
2. Identificacion de variables y parametros.
3. Formulacion del procedimiento de predimensionamiento.
4. Implementacion de la herramienta computacional.
5. Validacion mediante casos de referencia.
6. Analisis de resultados, diferencias y limitaciones.

## Capitulo propuesto de tesis

### Capitulo I - Planteamiento del problema

- Realidad problematica.
- Formulacion del problema.
- Objetivos.
- Justificacion.
- Alcances y limitaciones.

### Capitulo II - Marco teorico y normativo

- Pavimentos urbanos flexibles, rigidos y adoquinados.
- Clasificacion funcional de vias urbanas.
- Transito de diseno por tipo de via y demanda representativa.
- CBR, modulo resiliente, modulo k y soporte de subrasante.
- Serviciabilidad, confiabilidad y vida util.
- Norma CE.010 Pavimentos Urbanos.
- Norma GH.020 Componentes de Diseno Urbano.
- Norma G.040 Definiciones.
- Manual MTC 2014 y EG-2013 como antecedentes o referencias complementarias.

### Capitulo III - Metodologia de predimensionamiento

- Datos de entrada.
- Seleccion del tipo de via urbana.
- Seleccion de demanda representativa o EAL de referencia.
- Seleccion de parametros.
- Predimensionamiento por tipo de pavimento.
- Criterios de cumplimiento.
- Advertencias y limites de uso.

### Capitulo IV - Desarrollo de la herramienta de apoyo

- Requerimientos tecnicos desde ingenieria civil.
- Flujo de uso.
- Entradas y salidas.
- Reporte de predimensionamiento.
- Trazabilidad normativa.
- Limitaciones del software.

### Capitulo V - Validacion y resultados

- Casos de referencia.
- Resultados manuales.
- Resultados de la herramienta.
- Diferencias porcentuales.
- Analisis de discrepancias.
- Discusion tecnica.

### Capitulo VI - Conclusiones y recomendaciones

- Cumplimiento de objetivos.
- Condiciones en las que la herramienta es util.
- Limitaciones.
- Recomendaciones para futuras mejoras.

## Producto esperado

El resultado de la tesis no sera solo una aplicacion web. El producto academico esperado sera:

- metodologia de predimensionamiento,
- herramienta computacional de apoyo,
- catalogo de datos normativos trazables,
- matriz de validacion,
- reporte tecnico preliminar,
- analisis de resultados frente a casos de referencia.

## Criterio de exito

La tesis sera tecnicamente solida si demuestra que la herramienta:

1. usa parametros normativos trazables,
2. separa norma, metodologia y supuesto interno,
3. reproduce correctamente casos de referencia,
4. muestra advertencias cuando sale del alcance,
5. permite comparar alternativas de manera clara,
6. produce una memoria preliminar util para revision tecnica.
