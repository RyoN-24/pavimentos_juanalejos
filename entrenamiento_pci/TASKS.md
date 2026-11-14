# Tareas de implementación

- [x] Descargar y registrar las capas oficiales de Washington D. C. y San Diego.
  - Aceptación: cada archivo crudo tiene URL, fecha y SHA-256.
  - Verificación: conteos no nulos y encabezados esperados.

- [x] Normalizar observaciones y construir pares longitudinales.
  - Aceptación: cada fila tiene PCI actual, PCI futuro, horizonte y segmento.
  - Verificación: pruebas unitarias y auditoría de duplicados.

- [x] Entrenar y evaluar los modelos.
  - Aceptación: línea base, regresión, Random Forest y XGBoost producen métricas.
  - Verificación: prueba temporal 2024 y validación externa San Diego.

- [x] Guardar el modelo y documentar resultados.
  - Aceptación: modelo, esquema, métricas, predicciones y reporte metodológico disponibles.
  - Verificación: recarga del modelo y predicción de humo dentro de 0–100.

