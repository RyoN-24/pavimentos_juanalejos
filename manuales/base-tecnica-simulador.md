# Base tecnica del simulador integral de pavimentos

Fuentes locales del proyecto:

- `manual-mtc-suelos-pavimentos-2014-oficial.pdf`
- `manual-mtc-eg-2013.pdf`
- `norma-ce-010-pavimentos-urbanos.pdf`

Fuentes web consultadas:

- MTC, Manual de Carreteras: Suelos, Geologia, Geotecnia y Pavimentos, Seccion Suelos y Pavimentos, version abril 2014: https://portal.mtc.gob.pe/transportes/caminos/normas_carreteras/MTC%20NORMAS/ARCH_PDF/MAN_7%20SGGP-2014.pdf
- Gob.pe, Resolucion Directoral N. 10-2014-MTC/14: https://www.gob.pe/institucion/mtc/normas-legales/4441297-10-2014-mtc-14

## Criterios adoptados para la app

### Alcance normativo

El Manual MTC 2014 es una referencia normativa para suelos y pavimentos en carreteras. Segun la resolucion publicada en Gob.pe, la Seccion Suelos y Pavimentos aprobada por R.D. N. 10-2014-MTC/14 tiene caracter normativo y de cumplimiento obligatorio en la gestion de infraestructura vial.

CE.010 se usa como referencia para pavimentos urbanos, incluyendo pavimentos flexibles, rigidos y adoquinados.

EG-2013 se usa como referencia constructiva y de materiales para pavimentos flexibles, tratamientos superficiales, mezclas asfalticas, concreto hidraulico y adoquines.

### Trafico y ejes equivalentes

El Manual MTC 2014 usa el numero de repeticiones acumuladas de ejes equivalentes de 8.2 t en el carril de diseno como variable principal de transito.

Para pavimentos flexibles, semirrigidos y rigidos, el Manual clasifica el trafico pesado en 15 rangos desde 75,000 EE hasta 30,000,000 EE en el carril de diseno y periodo de diseno.

El calculo didactico de la app mantiene:

`EE dia-carril = IMD pesado x Fd x Fc x Fv x Fp`

Donde `Fd` es factor direccional, `Fc` factor carril, `Fv` factor vehiculo pesado y `Fp` factor por presion de neumaticos. Para afirmados y pavimentos rigidos el Manual indica `Fp = 1.0`; para flexibles puede considerarse ajuste por presion de neumaticos.

### Pavimento flexible en caliente

El Manual MTC 2014 incluye catalogos de estructuras de pavimento flexible con carpeta asfaltica en caliente para periodo de diseno de 20 anos, basados en ecuacion AASHTO.

La app conserva el modelo actual AASHTO/SN como modo principal y lo identifica como `Flexible en caliente`.

### Pavimento flexible en frio

El Manual MTC 2014 incluye:

- Tratamiento superficial bicapa.
- Pavimento flexible con mezcla asfaltica en frio.
- Refuerzo con mezcla asfaltica en frio.

Para la app se adopta como modo didactico `Flexible en frio`, con superficie de mezcla fria o tratamiento superficial, periodo tipico de 10 anos y menor coeficiente estructural de capa superficial que la carpeta en caliente.

El Manual MTC 2014 reporta coeficiente estructural para carpeta asfaltica en frio con emulsion `a1 = 0.125 / cm`; para carpeta asfaltica en caliente reporta `a1 = 0.170 / cm`.

### Pavimento adoquinado

El Manual MTC 2014 trata el pavimento con adoquines de concreto como semirrigido y propone el metodo ICPI, considerando:

- Adoquines de concreto.
- Cama de arena.
- Base granular o base tratada.
- Subrasante clasificada por CBR.
- Catalogos de estructuras para periodo de diseno de 20 anos.

CE.010 tambien describe pavimentos con bloques intertrabados sobre cama de arena y base/subbase, con comportamiento semiflexible.

### Pavimento rigido

El Manual MTC 2014 incluye diseno de pavimento rigido por metodo AASHTO 93, con espesor de losa y factor de transferencia de carga `J`.

Catalogos identificados:

- Pavimento rigido con pasadores y berma de concreto, `J = 2.8`.
- Pavimento rigido con pasadores, `J = 3.2`.
- Pavimento rigido con pasadores, `J = 3.8`.
- Pavimento rigido sin pasadores y con berma granular o asfaltica, `J = 4.0`, aplicable hasta 1,000,000 EE.

CE.010 cubre pavimentos rigidos de concreto hidraulico y criterios de juntas; para bases estabilizadas indica que la profundidad de junta puede aumentar de `D/4` a `D/3`.

## Implementacion didactica recomendada

La app debe tratar los cuatro modos como familias tecnicas con parametros propios:

- Flexible en caliente: SN, carpeta asfaltica en caliente, base, subbase, CBR, PSI.
- Flexible en frio: SN ajustado, mezcla fria o tratamiento superficial, base, subbase, CBR, renovacion superficial.
- Rigido: losa de concreto, modulo de reaccion aproximado desde CBR, factor J, transferencia de carga, juntas, PSI.
- Adoquinado: adoquin, cama de arena, base granular/tratada, confinamiento, CBR, deformacion y trabazon.

La herramienta sigue siendo academica: debe explicar criterios y comparar escenarios, pero no reemplaza un expediente tecnico definitivo.
