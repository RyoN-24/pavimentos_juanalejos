# Ficha del modelo predictivo de PCI urbano

## Propósito

El modelo estima la tasa anual de cambio del Índice de Condición del Pavimento y la transforma en un PCI futuro entre 0 y 100. Está diseñado como apoyo para analizar deterioro de pavimentos urbanos flexibles sin rehabilitación mayor durante el horizonte pronosticado.

## Datos

- Entrenamiento y prueba temporal: capas oficiales DDOT FY-2019 a FY-2024.
- Filtro de pavimento flexible: segmentos clasificados como superficie `AC` en FY-2023.
- Validación externa: evaluaciones oficiales de San Diego 2016 y 2023.
- Se excluyeron pares cuyo PCI aumentó más de cinco puntos, registrados separadamente como tratamiento probable.

Después de la limpieza se obtuvieron 16 104 pares de D. C. y 21 347 pares externos de San Diego. La prueba temporal reservó 3 972 observaciones con objetivo 2024.

## Variables utilizadas

- PCI actual.
- PCI previo del mismo tramo.
- Cambio anual previo.
- Tiempo desde la medición previa.
- Longitud del segmento.

## Comparación

La validación cruzada de tres pliegues se agrupó por segmento para evitar que una misma calle apareciera simultáneamente en entrenamiento y validación. XGBoost obtuvo el menor MAE promedio, 5.75 puntos de PCI, frente a 5.76 de la regresión lineal, 5.81 de Random Forest y 6.57 de la persistencia.

En la prueba temporal 2024, XGBoost alcanzó MAE 6.32, RMSE 8.32 y R² 0.75. La regresión lineal obtuvo MAE 6.10 y R² 0.77. El criterio de selección se fijó antes de abrir la prueba temporal: menor MAE en validación cruzada agrupada.

En San Diego 2016–2023, XGBoost obtuvo MAE 17.73 y R² 0.31. La pérdida de precisión y el sesgo negativo muestran que el modelo no debe presentarse como validado para otra ciudad sin calibración.

## Modelo guardado

El artefacto `models/pci_model.joblib` contiene el pipeline XGBoost reentrenado con los 16 104 pares de D. C., la lista ordenada de variables y la regla de conversión a PCI futuro.

## Uso permitido

- Comparación académica de modelos.
- Simulación exploratoria de trayectorias de PCI.
- Integración experimental al simulador con una advertencia de dominio.
- Base inicial para calibración con información peruana.

## Limitaciones

- No incorpora todavía tránsito, clima, espesores ni mantenimiento confirmado.
- Las mejoras pequeñas de PCI pueden contener ruido o tratamientos menores no documentados.
- La validación externa muestra cambio de dominio entre ciudades.
- No reemplaza inspecciones PCI, evaluación estructural ni criterio profesional.
- No existe aún validación empírica en vías peruanas.

## Fuentes oficiales

- https://rh.dcgis.dc.gov/dcgis/rest/services/DDOT/PavementConditionIndex/FeatureServer
- https://data.sandiego.gov/datasets/pavement-condition-assessment/

