# Matriz de validacion para tesis

Fecha de trabajo: 2026-07-07

## Objetivo

Registrar casos de referencia para validar la herramienta de apoyo al predimensionamiento de pavimentos urbanos. Cada caso debe tener datos de entrada, procedimiento manual, resultado esperado, resultado del software, diferencia y conclusion tecnica.

Esta matriz es clave para que la tesis no dependa solo de la existencia del software, sino de evidencia comparativa.

## Criterios generales

- Cada caso debe poder reproducirse manualmente.
- Cada dato de entrada debe tener unidad.
- Cada parametro normativo debe indicar fuente.
- Cada resultado debe distinguir calculo manual y resultado del software.
- Cada discrepancia debe explicarse tecnicamente.
- Los casos fuera de alcance tambien son validos si prueban advertencias del sistema.

## Resumen de casos requeridos

| Grupo | Cantidad minima | Proposito |
| --- | ---: | --- |
| Flexible urbano | 4 | Verificar tipo de via urbana, demanda representativa y capacidad preliminar |
| Rigido urbano CE.010/PCA | 3 | Verificar criterios ADTT/PCA, MR, k y advertencias CE.010 |
| Adoquinado urbano CE.010 | 3 | Verificar EAL, confiabilidad, CBR/Mr y criterios de base/subbase |
| Fuera de alcance | 2 | Verificar advertencias normativas o metodologicas |
| Sensibilidad | 2 | Evaluar efecto de CBR, cambio de rango de transito o periodo |

## Tabla maestra de validacion

| ID | Tipo de pavimento | Ambito | Fuente del caso | Variable principal validada | Resultado manual | Resultado software | Diferencia | Estado | Observacion tecnica |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | --- | --- |
| U-01 | Adoquinado / base | Via local | CE.010 Anexo F Tabla F2 | Tipo de via, EAL 0.84 M y R 75% | 840,000 EAL; R 75% | 840,000 EAL; R 75% | 0 | Validado | Ver `manuales/casos-validacion/u-01-via-local-urbana.md` |
| U-02 | Flexible | Via colectora | CE.010/GH.020 | Capacidad preliminar | - | - | - | Pendiente | - |
| U-03 | Flexible | Via arterial | CE.010/GH.020 | Comparacion de alternativa | - | - | - | Pendiente | - |
| U-04 | Flexible | Via expresa | CE.010/GH.020 | Advertencia por demanda alta | - | - | - | Pendiente | - |
| R-01 | Rigido | Via local | CE.010 Anexo D | ADTT/PCA, MR y k | - | - | - | Pendiente | - |
| R-02 | Rigido | Via colectora | CE.010 Anexo D | ADTT/PCA y espesor preliminar | - | - | - | Pendiente | - |
| R-03 | Rigido | Via arterial | CE.010 Anexo D | Advertencia de estudio de trafico | - | - | - | Pendiente | - |
| A-01 | Adoquinado | Via local | CE.010 Anexo F Tabla F2 | EAL 0.84 M y R 75% | - | - | - | Pendiente | - |
| A-02 | Adoquinado | Via colectora | CE.010 Anexo F Tabla F2 | EAL 3.0 M y R 80% | - | - | - | Pendiente | - |
| A-03 | Adoquinado | Via arterial | CE.010 Anexo F Tabla F2 | EAL 8.3 M y R 85% | - | - | - | Pendiente | - |
| X-01 | Fuera de alcance | Via expresa | CE.010 Anexo F/D | Demanda alta o rango abierto | - | - | - | Pendiente | Debe advertir que requiere sustento especifico |
| X-02 | Fuera de alcance | Urbano CE.010 | Por definir | Solucion no recomendada | - | - | - | Pendiente | Debe advertir fuera de alcance |
| S-01 | Sensibilidad | General | Por definir | Variacion de CBR | - | - | - | Pendiente | - |
| S-02 | Sensibilidad | General | Por definir | Cambio de rango de transito | - | - | - | Pendiente | - |

## Ficha por caso

Copiar esta ficha por cada caso desarrollado.

### Caso [ID]

**Tipo de pavimento:**  
**Ambito:**  
**Fuente del caso:**  
**Objetivo de validacion:**  

### Datos de entrada

| Dato | Valor | Unidad | Fuente / criterio |
| --- | ---: | --- | --- |
| Tipo de via urbana | - | - | CE.010/GH.020/G.040 |
| Limite inferior del rango | - | EE | - |
| Limite superior del rango | - | EE | - |
| Valor representativo adoptado | - | EE | Preferentemente limite superior si el rango es cerrado |
| Periodo | - | anos | - |
| CBR | - | % | - |
| Tipo de pavimento | - | - | - |

### Calculo manual de referencia

| Paso | Desarrollo | Resultado |
| --- | --- | ---: |
| 1 | Seleccion de rango o clase de demanda | - |
| 2 | Definicion del valor representativo | - |
| 3 | Parametros normativos asociados | - |
| 4 | Predimensionamiento | - |
| 5 | Verificacion | - |

### Resultado del software

| Salida | Valor |
| --- | ---: |
| Valor representativo de demanda | - |
| Clasificacion | - |
| Indicador estructural | - |
| Capacidad estimada | - |
| PSI final | - |
| Cumplimiento | - |
| Advertencias | - |

### Comparacion

| Variable | Manual | Software | Diferencia | Cumple tolerancia |
| --- | ---: | ---: | ---: | --- |
| Valor representativo de demanda | - | - | - | - |
| Indicador estructural | - | - | - | - |
| Capacidad / espesor | - | - | - | - |
| Clasificacion | - | - | - | - |
| Advertencia | - | - | - | - |

### Conclusion del caso

Pendiente.

## Tolerancias preliminares

| Variable | Tolerancia inicial |
| --- | --- |
| Valor representativo de rango | Coincidencia exacta con el criterio adoptado |
| Clasificacion TP/tipo de via | Coincidencia exacta |
| Parametros normativos discretos | Coincidencia exacta |
| Capacidad o espesor preliminar | <= 5% cuando el metodo sea directamente comparable |
| Advertencia de fuera de alcance | Coincidencia exacta |

## Fuentes candidatas para casos

- Ejemplos de clase o apuntes del asesor.
- Ejercicios resueltos de pavimentos.
- Casos academicos de CE.010, PCA, Instituto del Asfalto o AASHTO aplicados a vias urbanas.
- Expedientes simplificados con datos anonimizados.
- Casos construidos manualmente para probar limites normativos.

## Siguiente accion

Contrastar el caso U-01 en el software: seleccionar pavimento urbano, via local y adoquinado; verificar que adopte 840,000 EAL, 75% de confiabilidad y fuente CE.010 Anexo F Tabla F2.
