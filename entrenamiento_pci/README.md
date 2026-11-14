# Entrenamiento predictivo de PCI urbano

Este módulo descarga datos oficiales de pavimentos urbanos, construye series por tramo y compara modelos para estimar el PCI futuro bajo una condición sin rehabilitación mayor.

## Ejecución

```powershell
py -3.12 -m venv entrenamiento_pci/.venv
entrenamiento_pci/.venv/Scripts/python.exe -m pip install -r entrenamiento_pci/requirements.txt
entrenamiento_pci/.venv/Scripts/python.exe entrenamiento_pci/src/download_data.py
entrenamiento_pci/.venv/Scripts/python.exe entrenamiento_pci/src/prepare_data.py
entrenamiento_pci/.venv/Scripts/python.exe -m unittest discover -s entrenamiento_pci/tests -v
entrenamiento_pci/.venv/Scripts/python.exe entrenamiento_pci/src/train_models.py
```

## Fuentes

- DDOT Pavement Condition Index Feature Service: https://rh.dcgis.dc.gov/dcgis/rest/services/DDOT/PavementConditionIndex/FeatureServer
- City of San Diego Pavement Condition Assessments: https://data.sandiego.gov/datasets/pavement-condition-assessment/

Las copias crudas y sus hashes se registran en `data/raw/source_manifest.json`. No se utilizan los resultados sintéticos del simulador para evaluar precisión empírica.

## Interpretación

El modelo aprende la tasa anual de cambio del PCI. El PCI futuro se calcula como `PCI actual + tasa anual × horizonte`, limitado entre 0 y 100. Los aumentos superiores a cinco puntos entre evaluaciones se guardan aparte como tratamientos probables y no entran al modelo principal de deterioro.

La validación temporal usa D. C. 2024. La validación externa usa San Diego 2016–2023. Esta última mide transportabilidad entre ciudades; no equivale a una validación peruana.

