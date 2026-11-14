# Caso U-01: Via local urbana

Fecha de trabajo: 2026-07-07

## Objetivo del caso

Validar que la herramienta pueda trabajar con una via local urbana como entrada principal de predimensionamiento, sin requerir el calculo detallado de ejes equivalentes por tipo de vehiculo.

Este primer caso valida:

- seleccion correcta del tipo de via urbana,
- asignacion de demanda representativa,
- trazabilidad de la fuente normativa,
- confiabilidad asociada cuando se use CE.010 Anexo F,
- advertencia de alcance cuando el valor se use fuera del metodo especifico.

## Alcance del caso

Este caso no valida todavia el espesor final de una estructura de pavimento. Valida la entrada de demanda y parametros normativos para una via local urbana.

Para tener un valor numerico verificable, se toma como primer subcaso el flujo de adoquinado de CE.010 Anexo F, porque la Tabla F2 entrega EAL de diseno y confiabilidad por clase de via.

## Fuente normativa

| Fuente | Uso en el caso |
| --- | --- |
| RNE - CE.010 Pavimentos Urbanos | Define vias urbanas y contiene Anexo F para adoquines |
| RNE - GH.020 Componentes de Diseno Urbano | Sustenta el sistema vial urbano: expresas, arteriales, colectoras, locales y pasajes |
| RNE - G.040 Definiciones | Apoya definiciones generales del RNE |

## Datos de entrada del caso

| Dato | Valor | Unidad | Fuente / criterio |
| --- | ---: | --- | --- |
| Ambito | Pavimento urbano | - | RNE / CE.010 |
| Tipo de via urbana | Local | - | CE.010 / GH.020 |
| Tipo de pavimento del subcaso | Adoquinado | - | CE.010 Anexo F |
| Periodo de referencia | 20 | anos | Nota de Tabla F2 |
| Crecimiento de referencia | 4 | % anual | Nota de Tabla F2 |
| Trafico direccional | 50 | % | Nota de Tabla F2 |
| EAL base | 0.43 | millones | CE.010 Anexo F Tabla F2 |
| Confiabilidad | 75 | % | CE.010 Anexo F Tabla F2 |
| Factor de confiabilidad | 2.010 | adim. | CE.010 Anexo F Tabla F2 |
| EAL de diseno tabulado | 0.84 | millones | CE.010 Anexo F Tabla F2 |

## Calculo manual de referencia

La Tabla F2 de CE.010 Anexo F presenta para vias locales:

```text
Clase de via: Local
EAL base: 0.43 millones
Nivel de confiabilidad: 75 %
Factor de confiabilidad: 2.010
EAL de diseno: 0.84 millones
```

Aunque la expresion general indicada es:

```text
EAL ajustado = FR x EAL
```

para la validacion se adopta el valor tabulado por la norma:

```text
EAL de diseno = 0.84 millones = 840,000 EAL
```

## Resultado manual esperado

| Variable | Resultado esperado |
| --- | ---: |
| Tipo de via urbana | Local |
| Tipo de pavimento | Adoquinado |
| Demanda representativa | 840,000 EAL |
| Confiabilidad | 75 % |
| Factor de confiabilidad | 2.010 |
| Fuente de demanda | CE.010 Anexo F Tabla F2 |

## Resultado esperado en el software

Al ingresar o seleccionar:

```text
Ambito: Pavimento urbano CE.010
Enfoque de demanda: Usar tipo de via urbana
Tipo de via: Local
Tipo de pavimento: Adoquinado
```

la herramienta debe mostrar o adoptar:

| Salida | Valor esperado |
| --- | ---: |
| Tipo de via urbana | Local |
| EAL de diseno | 840,000 |
| Confiabilidad | 75 % |
| Alcance | CE.010 Anexo F - adoquinado |

## Resultado obtenido en el software

Validacion automatizada con `npm test` el 2026-07-07.

| Salida | Valor obtenido |
| --- | ---: |
| Tipo de via urbana | Local |
| EAL representativo de predimensionamiento | 840,000 |
| Confiabilidad | 75 % |
| Fuente | CE.010 Anexo F Tabla F2 |
| Estado | Coincide |

## Comparacion

| Variable | Manual | Software | Diferencia admisible |
| --- | ---: | ---: | --- |
| Tipo de via | Local | Local | Coincidencia exacta |
| EAL de diseno | 840,000 | 840,000 | Coincidencia exacta |
| Confiabilidad | 75 % | 75 % | Coincidencia exacta |
| Fuente | CE.010 Anexo F Tabla F2 | CE.010 Anexo F Tabla F2 | Coincidencia exacta |

## Criterio de aceptacion

El caso U-01 se considera validado porque:

1. La herramienta permite seleccionar via local urbana.
2. Para adoquinado, la herramienta adopta 840,000 EAL como demanda de diseno.
3. La herramienta asigna 75 % de confiabilidad.
4. La herramienta indica que el valor proviene de CE.010 Anexo F Tabla F2.
5. La prueba automatica verifica estos valores contra la logica del software.

## Conclusion preliminar

Este caso valida el uso de la clasificacion funcional urbana como entrada del software. Para una via local urbana, CE.010 Anexo F proporciona un valor de referencia verificable para adoquinado: 840,000 EAL con 75 % de confiabilidad.

El caso no reemplaza un estudio de transito ni valida aun el espesor final del pavimento. Su funcion es comprobar que la herramienta selecciona correctamente el tipo de via, la demanda representativa y la fuente normativa asociada.
