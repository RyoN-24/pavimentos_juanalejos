# Criterio metodologico: predimensionamiento por tipo de via urbana

Fecha de trabajo: 2026-07-07

## Decision

Para la tesis, el software no debe centrarse en calcular ejes equivalentes detallados a partir de todos los tipos de vehiculos. El enfoque principal sera trabajar con la clasificacion funcional de vias urbanas: local, colectora, arterial y expresa.

Esta decision responde a una limitacion real del calculo de ejes equivalentes: cuando existen multiples tipos de vehiculos, cada uno requiere factores destructivos, configuracion de ejes, cargas, distribucion direccional y crecimiento propio. Ese nivel de detalle corresponde a un estudio de transito mas completo y puede desviar la tesis de su objetivo principal: el predimensionamiento de pavimentos urbanos.

## Enfoque adoptado

El usuario podra trabajar con:

- tipo de via urbana: local, colectora, arterial o expresa,
- demanda representativa asociada al tipo de via cuando exista,
- EAL o rango de demanda cuando ya exista un estudio previo,
- y, de forma opcional, EE directo si el dato esta disponible.

El calculo detallado de EE desde IMDA y composicion vehicular queda como funcion complementaria o futura, no como eje de validacion principal.

## Justificacion tecnica

Trabajar por rangos es defendible para predimensionamiento porque:

- reduce la dependencia de informacion vehicular detallada que muchas veces no esta disponible en etapa preliminar,
- permite comparar alternativas estructurales bajo escenarios de demanda,
- se alinea con la clasificacion funcional de vias urbanas del RNE,
- evita que la tesis se convierta en un estudio de trafico vehicular,
- concentra el analisis en la respuesta estructural y en la seleccion preliminar de espesores.

## Criterio conservador

Cuando el usuario seleccione un tipo de via con demanda de referencia cerrada, el software debe usar preferentemente el valor conservador recomendado por la norma o por el caso de referencia.

Ejemplo:

| Clase | Rango | Valor recomendado para predimensionar |
| --- | --- | ---: |
| Local urbana | CE.010 Anexo F: 0.84 M EAL de diseno para adoquinado | 0.84 M EAL |
| Colectora urbana | CE.010 Anexo F: 3.0 M EAL de diseno para adoquinado | 3.0 M EAL |
| Arterial urbana | CE.010 Anexo F: 8.3 M EAL de diseno para adoquinado | 8.3 M EAL |
| Expresa urbana | CE.010 Anexo F: 28.4 M EAL de diseno para adoquinado | 28.4 M EAL |

Este criterio es conservador cuando se usa como demanda de predimensionamiento para el tipo de via seleccionado. Debe indicarse si el valor proviene de una tabla especifica, como CE.010 Anexo F para adoquines.

## Rangos abiertos

Cuando el rango sea abierto, no debe asignarse automaticamente un valor unico sin advertencia.

Ejemplos:

- Via expresa urbana: mayor a 28,400,000 EE en la clasificacion interna.

En estos casos el software debe solicitar un EE de referencia o advertir que se requiere estudio especifico.

## Implicancia para la tesis

La tesis validara principalmente:

- correcta seleccion del tipo de via urbana,
- correcta asignacion de parametros normativos asociados,
- predimensionamiento preliminar con demanda representativa del tipo de via,
- comparacion de alternativas,
- advertencias cuando el rango supere el alcance del metodo.

No se validara como objetivo principal:

- conteo vehicular detallado,
- factores destructivos por tipo de vehiculo,
- espectros de carga,
- estudio de transito completo,
- calibracion de ejes equivalentes por configuracion vehicular.

## Cambio en los casos de validacion

El primer caso de validacion ya no debe validar el calculo de EE desde IMDA. Debe validar:

1. seleccion de tipo de via urbana,
2. valor representativo adoptado,
3. confiabilidad asociada,
4. Pi y Pt asociados,
5. advertencias si corresponde.

Ejemplo:

| Dato | Valor |
| --- | --- |
| Ambito | Pavimento urbano |
| Tipo de via seleccionada | Colectora |
| Referencia de demanda | CE.010 Anexo F Tabla F2 para adoquinado |
| Valor de predimensionamiento | 3.0 M EAL |
| Confiabilidad | 80% |
| Observacion | El valor aplica directamente al flujo CE.010 de adoquinado; para flexible o rigido debe justificarse el metodo usado |

## Redaccion recomendada para la tesis

El presente trabajo no desarrolla un modelo detallado de equivalencia vehicular por tipo de eje, sino que utiliza la clasificacion funcional de vias urbanas y demandas representativas como entrada de predimensionamiento. Esta delimitacion permite enfocar el estudio en la seleccion preliminar de estructuras de pavimento urbano y en la comparacion de alternativas bajo criterios normativos trazables.
