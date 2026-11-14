# Especificación del entrenamiento predictivo de PCI urbano

## Objetivo

Construir un pipeline reproducible que descargue datos oficiales de condición de pavimentos urbanos, forme observaciones longitudinales por segmento, compare una línea base, regresión lineal, Random Forest y XGBoost, y conserve el modelo con mejor MAE temporal para su futura integración al simulador.

El modelo estimará la tasa anual de cambio del PCI y la convertirá en PCI futuro limitado al intervalo de 0 a 100.

## Supuestos aprobados

- Washington D. C. será la fuente principal de entrenamiento.
- Se usarán las capas fiscales 2019, 2020, 2021, 2022, 2023 y 2024.
- Los segmentos se vincularán con una clave reproducible formada por `ROUTEID`, `FROMMEASURE` y `TOMEASURE`.
- Los segmentos se limitarán a superficie asfáltica `AC` según el inventario FY-23, cuando esa clasificación está disponible.
- San Diego 2016–2023 se utilizará únicamente como validación externa porque contiene PCI e identificador de segmento, pero no las demás variables de Washington D. C.
- Los datos sintéticos del simulador no se usarán para medir la precisión empírica.
- Los aumentos mayores de 5 puntos de PCI entre mediciones se separarán como tratamiento probable; el modelo principal representará deterioro sin rehabilitación mayor.
- Esta entrega no modificará todavía la interfaz del simulador.

## Tecnologías

- Python 3.12
- pandas
- scikit-learn 1.9.1
- XGBoost 3.4.1
- joblib
- `unittest` para pruebas

## Comandos

```powershell
python -m unittest discover -s entrenamiento_pci/tests -v
python entrenamiento_pci/src/download_data.py
python entrenamiento_pci/src/train_models.py
```

## Estructura

```text
entrenamiento_pci/
  data/raw/          Copias inalteradas y metadatos de descarga
  data/processed/    Observaciones normalizadas y pares de aprendizaje
  models/            Modelo seleccionado y esquema de entrada
  reports/           Métricas, calidad de datos y predicciones de prueba
  src/               Descarga, preparación y entrenamiento
  tests/             Pruebas unitarias de transformación y partición
```

## Estilo

```python
def clip_pci(values):
    """Limita predicciones al dominio técnico de PCI."""
    return values.clip(0.0, 100.0)
```

- Funciones pequeñas y deterministas para transformación.
- Semilla fija `42` para reproducibilidad.
- Datos crudos nunca se sobrescriben durante la preparación.
- Las URLs y hashes SHA-256 se registran junto con cada descarga.

## Estrategia de pruebas

- Pruebas unitarias para normalización de claves, formación de pares y cálculo de la tasa anual.
- Pruebas para impedir que un segmento aparezca simultáneamente en particiones agrupadas.
- Verificación integral de descargas, conteos, métricas finitas y archivos del modelo.
- Evaluación temporal reservando como prueba las observaciones cuyo año objetivo sea 2024.
- Validación externa con los pares San Diego 2016–2023.

## Límites

### Siempre

- Conservar procedencia y licencia de los datos.
- Separar entrenamiento, prueba temporal y validación externa.
- Informar valores faltantes y cobertura real.
- Comparar contra la persistencia `PCI futuro = PCI actual`.

### Requiere una decisión posterior

- Integrar el modelo a la interfaz web.
- Sustituir o recalibrar el modelo con datos peruanos.
- Incorporar tránsito, clima o mantenimiento procedente de nuevas fuentes.

### Nunca

- Presentar los datos sintéticos como observaciones reales.
- Mezclar el mismo segmento entre pliegues de validación agrupada.
- Afirmar validez para Perú sin una prueba o calibración local.

## Criterios de éxito

- Se descargan y verifican las fuentes oficiales sin edición manual.
- Se generan pares longitudinales válidos y un diccionario de datos.
- Se entrenan los tres modelos solicitados y la línea base.
- Se reportan MAE, RMSE y R² en prueba temporal y validación externa.
- El modelo seleccionado, sus variables y sus limitaciones quedan guardados.
- Las pruebas automatizadas y el entrenamiento terminan sin errores.

