# Spec: Módulo de Proveedores y Generación Automática de Artículos (ROWAN)

## 1. Objetivo
Permitir el ingreso rápido de un producto de proveedor (ej. "MOCHILA MESSI") para transformarlo automáticamente en un Artículo Oficial ROWAN con nomenclatura estandarizada, SKU propio por reglas de categoría, control de costos, peso y dimensiones.

## 2. Reglas de Negocio Automatizadas
1. **Generación de SKU:** 
   - Las primeras 3 letras de la categoría en mayúsculas + número secuencial de 3 dígitos.
   - Ejemplo: La primera mochila será `MOC-001`, la segunda `MOC-002`.
2. **Nomenclatura Automática por Categoría:**
   - Si Categoría = `MOCHILAS`: Nombre final = `MOCHILA + [Nombre de hombre del listado precargado]`.
   - Si Categoría = `RIÑONERAS`: Nombre final = `RIÑONERA + [Nombre de hombre]`.
   - Si Categoría = `NECESERES`: Nombre final = `NECESER + [Nombre de hombre]`.
3. **Costos y Precios:**
   - Costo Real = Costo Proveedor + Costo Packaging.
   - Precio de Venta: Ingreso manual inicial por parte del usuario.

## 3. Estructura de Datos (Campos del Formulario)
- Proveedor (Texto / Selector)
- Descripción del Proveedor (Texto)
- Categoría (`Mochilas`, `Riñoneras`, `Neceres`, `Relojes`, `Cintos`, `Tote Bags`)
- Nombre Automático ROWAN (Auto)
- SKU Propio (Auto, ej: `MOC-001`)
- Color / Variante (Texto)
- Costo Proveedor ($)
- Costo Packaging ($)
- Costo Real ($) (Automático)
- Precio de Venta (Manual)
- Peso (kg/g)
- Medidas (Alto x Ancho x Prof)

## 4. Criterios de Aceptación (Definición de Hecho)
- [ ] Al seleccionar la categoría "Mochilas" y cargar un producto de proveedor, el sistema genera automáticamente el SKU con formato `MOC-XXX`.
- [ ] El nombre se asigna tomando un nombre del listado de hombres precargado.
- [ ] Se registran correctamente el peso y las medidas para la logística.
