// Sistema ROWAN - Gestión Integral con División de Colores e Importación de Tienda Negocio

function inicializarSistema() {
    if (!localStorage.getItem('rowan_categorias')) {
        localStorage.setItem('rowan_categorias', JSON.stringify([
            { id: '1', nombre: 'Mochilas' },
            { id: '2', nombre: 'Riñoneras' },
            { id: '3', nombre: 'Neceres' },
            { id: '4', nombre: 'Relojes' },
            { id: '5', nombre: 'Cintos' },
            { id: '6', nombre: 'Tote Bags' }
        ]));
    }
    if (!localStorage.getItem('rowan_proveedores')) {
        localStorage.setItem('rowan_proveedores', JSON.stringify([]));
    }
    if (!localStorage.getItem('rowan_productos')) {
        localStorage.setItem('rowan_productos', JSON.stringify([]));
    }
    if (!localStorage.getItem('rowan_compras')) {
        localStorage.setItem('rowan_compras', JSON.stringify([]));
    }
    if (!localStorage.getItem('rowan_nombres')) {
        localStorage.setItem('rowan_nombres', JSON.stringify([
            "DANTE", "ENZO", "BRUNO", "MILO", "IAN", "GAEL", "LUCA", "AXEL", "THIAGO", "SANTINO", "MILAN"
        ]));
    }
    if (!localStorage.getItem('rowan_colores')) {
        localStorage.setItem('rowan_colores', JSON.stringify([
            "Negro", "Marrón", "Plateado", "Dorado", "Azul", "Gris", "Verde", "Blanco", "Rojo", "Camel"
        ]));
    }

    try {
        let proveedores = JSON.parse(localStorage.getItem('rowan_proveedores')) || [];
        let productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
        let compras = JSON.parse(localStorage.getItem('rowan_compras')) || [];

        if (proveedores.length === 0 && compras.length > 0) {
            let provMap = new Map();
            compras.forEach(c => {
                if (c.proveedor) {
                    const provNombreClean = c.proveedor.trim();
                    const provId = c.proveedor_id || ('prov_' + provNombreClean.toLowerCase().replace(/\s+/g, '_'));
                    provMap.set(provId, { id: provId, nombre: provNombreClean, contacto: '', web: '' });
                }
            });
            proveedores = Array.from(provMap.values());
            localStorage.setItem('rowan_proveedores', JSON.stringify(proveedores));
        }

        if (productos.length > 0 && proveedores.length > 0) {
            const primerProvId = proveedores[0].id;
            productos.forEach(p => {
                if (!p.proveedor_id) {
                    p.proveedor_id = primerProvId;
                }
            });
            localStorage.setItem('rowan_productos', JSON.stringify(productos));
        }
    } catch (err) {
        console.error("Error en autorreparación:", err);
    }
}

inicializarSistema();

window.cambiarPestana = function(pestana) {
    const secciones = ["productos", "compras", "proveedores", "categorias", "nombres", "colores", "tiendanube"];
    secciones.forEach(sec => {
        const el = document.getElementById(`seccion-${sec}`);
        if (el) el.classList.add("hidden");
        const btn = document.getElementById(`btn-${sec}`);
        if (btn) btn.className = "px-3 py-1.5 text-xs font-medium rounded text-zinc-400 hover:text-zinc-200 transition";
    });

    const targetSec = document.getElementById(`seccion-${pestana}`);
    const targetBtn = document.getElementById(`btn-${pestana}`);

    if (targetSec) targetSec.classList.remove("hidden");
    if (targetBtn) targetBtn.className = "px-3 py-1.5 text-xs font-medium rounded bg-zinc-800 text-zinc-100 transition";

    if (pestana === 'compras') {
        cargarSelectoresCompras();
        cargarHistorialCompras();
    } else if (pestana === 'proveedores') {
        cargarProveedoresFicha();
    } else if (pestana === 'productos') {
        cargarProductos();
    } else if (pestana === 'tiendanube') {
        cargarVistaPreviaTiendanube();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const statusEl = document.getElementById("status");
    if (statusEl) {
        statusEl.textContent = "Sistema Local Activo";
        statusEl.className = "text-xs px-3 py-1 bg-emerald-950 border border-emerald-800 rounded text-emerald-400";
    }

    cargarSelectores();
    cargarProductos();
    cargarProveedoresFicha();
    cargarCategoriasGestion();
    cargarNombresGestion();
    cargarColoresGestion();
    actualizarSelectNombresProducto();
    actualizarCheckboxesColoresProducto();

    const productForm = document.getElementById("productForm");
    if (productForm) {
        productForm.addEventListener("submit", (e) => {
            e.preventDefault();
            procesarNuevoProducto();
        });
    }

    const proveedorForm = document.getElementById("proveedorForm");
    if (proveedorForm) {
        proveedorForm.addEventListener("submit", (e) => {
            e.preventDefault();
            guardarProveedor();
        });
    }

    const categoriaForm = document.getElementById("categoriaForm");
    if (categoriaForm) {
        categoriaForm.addEventListener("submit", (e) => {
            e.preventDefault();
            guardarCategoria();
        });
    }

    const nombreForm = document.getElementById("nombreForm");
    if (nombreForm) {
        nombreForm.addEventListener("submit", (e) => {
            e.preventDefault();
            guardarNombreNuevo();
        });
    }

    const colorForm = document.getElementById("colorForm");
    if (colorForm) {
        colorForm.addEventListener("submit", (e) => {
            e.preventDefault();
            guardarColorNuevo();
        });
    }
});

function cargarSelectores() {
    try {
        const provs = JSON.parse(localStorage.getItem('rowan_proveedores')) || [];
        const provSelect = document.getElementById("proveedor_select");
        if (provSelect) {
            provSelect.innerHTML = provs.length > 0 ? '<option value="">Selecciona un proveedor</option>' : '<option value="">No hay proveedores cargados</option>';
            provs.forEach(p => {
                provSelect.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
            });
        }

        const cats = JSON.parse(localStorage.getItem('rowan_categorias')) || [];
        const catSelect = document.getElementById("categoria_select");
        if (catSelect) {
            catSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
            cats.forEach(c => {
                catSelect.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
            });
        }
    } catch (e) {
        console.error("Error al cargar selectores", e);
    }
}

// --- MÓDULO DE COMPRAS ---
function cargarSelectoresCompras() {
    try {
        const provs = JSON.parse(localStorage.getItem('rowan_proveedores')) || [];
        const select = document.getElementById("compra_proveedor_select");
        if (select) {
            select.innerHTML = '<option value="">Selecciona un proveedor...</option>';
            provs.forEach(p => {
                select.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
            });
        }
        cargarProductosParaComprar();
    } catch (e) {
        console.error("Error al cargar selector de compras", e);
    }
}

window.cargarProductosParaComprar = function() {
    const proveedorId = document.getElementById("compra_proveedor_select").value;
    const contenedor = document.getElementById("contenedor-items-compra");
    if (!contenedor) return;

    if (!proveedorId) {
        contenedor.innerHTML = `<p class="text-xs text-zinc-500">Selecciona un proveedor para ver sus productos disponibles.</p>`;
        return;
    }

    try {
        const productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
        const prodsProv = productos.filter(p => p.proveedor_id === proveedorId);

        if (prodsProv.length === 0) {
            contenedor.innerHTML = `<p class="text-xs text-zinc-400">Este proveedor no tiene productos cargados en el catálogo.</p>`;
            return;
        }

        let html = `
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-3">
                <h3 class="text-xs font-semibold uppercase text-zinc-400">Productos del Proveedor</h3>
                <input type="text" id="buscadorItemsCompra" oninput="filtrarProductosCompra()" placeholder="Buscar producto en esta compra..." class="bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none w-full md:w-72">
            </div>
            <div class="overflow-x-auto max-h-96 overflow-y-auto">
                <table class="w-full text-left text-xs">
                    <thead class="border-b border-zinc-800 text-zinc-400 uppercase sticky top-0 bg-zinc-900 z-10">
                        <tr>
                            <th class="pb-2 px-2">Comprar</th>
                            <th class="pb-2 px-2">SKU</th>
                            <th class="pb-2 px-2">Artículo ROWAN</th>
                            <th class="pb-2 px-2">Descripción Prov.</th>
                            <th class="pb-2 px-2">Stock Actual</th>
                            <th class="pb-2 px-2">Costo Unit. Prov. ($)</th>
                            <th class="pb-2 px-2">Cantidad</th>
                        </tr>
                    </thead>
                    <tbody id="tablaItemsCompraBody" class="divide-y divide-zinc-800/60">
        `;

        prodsProv.forEach(p => {
            const prodIdSafe = p.id || p.sku;
            html += `
                <tr class="item-fila-compra" data-nombre="${(p.nombre_rowan || '').toLowerCase()}" data-desc="${(p.descripcion_proveedor || '').toLowerCase()}" data-sku="${(p.sku || '').toLowerCase()}">
                    <td class="py-3 px-2">
                        <input type="checkbox" name="item_compra_check" value="${prodIdSafe}" class="rounded bg-zinc-950 border-zinc-700 text-emerald-500 focus:ring-0">
                    </td>
                    <td class="py-3 px-2 font-mono text-zinc-400">${p.sku}</td>
                    <td class="py-3 px-2 font-semibold text-zinc-200">${p.nombre_rowan} <span class="text-[10px] text-zinc-500 font-normal block">${p.color || 'Único'}</span></td>
                    <td class="py-3 px-2 text-zinc-400">${p.descripcion_proveedor}</td>
                    <td class="py-3 px-2 font-mono text-amber-400 font-semibold">${p.stock !== undefined ? p.stock : 0}</td>
                    <td class="py-3 px-2">
                        <input type="number" id="costo_compra_${prodIdSafe}" value="${p.costo_proveedor || 0}" class="w-24 bg-zinc-950 border border-zinc-700 rounded p-1 text-emerald-400 font-semibold focus:outline-none">
                    </td>
                    <td class="py-3 px-2">
                        <input type="number" id="cant_compra_${prodIdSafe}" value="1" min="1" class="w-20 bg-zinc-950 border border-zinc-700 rounded p-1 text-zinc-200 focus:outline-none">
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
            <div class="mt-4 pt-4 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <label class="text-xs uppercase text-zinc-400">Costo de Envío ($):</label>
                    <input type="number" id="envio_compra" value="0" class="w-32 bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-zinc-200 focus:outline-none">
                </div>
                <button type="button" onclick="registrarCompraRealizada()" class="w-full md:w-auto bg-emerald-600 text-white font-medium px-6 py-2.5 rounded text-sm hover:bg-emerald-500 transition">
                    Registrar Compra y Actualizar Stock
                </button>
            </div>
        `;

        contenedor.innerHTML = html;
    } catch (e) {
        contenedor.innerHTML = `<p class="text-xs text-rose-400">Error al cargar los productos del proveedor.</p>`;
    }
}

window.filtrarProductosCompra = function() {
    const inputBuscador = document.getElementById("buscadorItemsCompra");
    if (!inputBuscador) return;
    const filtro = inputBuscador.value.toLowerCase();
    const filas = document.querySelectorAll(".item-fila-compra");
    
    filas.forEach(fila => {
        const nombre = fila.dataset.nombre || "";
        const desc = fila.dataset.desc || "";
        const sku = fila.dataset.sku || "";
        if (nombre.includes(filtro) || desc.includes(filtro) || sku.includes(filtro)) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}

window.registrarCompraRealizada = function() {
    const proveedorId = document.getElementById("compra_proveedor_select").value;
    if (!proveedorId) return alert("Selecciona un proveedor.");

    const checkboxes = document.querySelectorAll('input[name="item_compra_check"]:checked');
    if (checkboxes.length === 0) return alert("Selecciona al menos un producto para comprar.");

    const costoEnvio = parseFloat(document.getElementById("envio_compra").value) || 0;

    try {
        let productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
        let proveedores = JSON.parse(localStorage.getItem('rowan_proveedores')) || [];
        let compras = JSON.parse(localStorage.getItem('rowan_compras')) || [];
        if (!Array.isArray(compras)) compras = [];

        const provObj = proveedores.find(p => p.id === proveedorId);
        const provNombre = provObj ? provObj.nombre : 'Proveedor';

        let itemsComprados = [];
        let subtotalProductos = 0;

        checkboxes.forEach(cb => {
            const prodRefId = cb.value;
            const inputCant = document.getElementById(`cant_compra_${prodRefId}`);
            const inputCosto = document.getElementById(`costo_compra_${prodRefId}`);

            const cantidad = inputCant ? (parseInt(inputCant.value) || 0) : 0;
            const nuevoCostoProv = inputCosto ? (parseFloat(inputCosto.value) || 0) : 0;

            if (cantidad > 0) {
                let prod = productos.find(p => p.id === prodRefId || p.sku === prodRefId);
                if (prod) {
                    prod.stock = (prod.stock || 0) + cantidad;
                    prod.costo_proveedor = nuevoCostoProv;
                    if (prod.tipo_precio !== "manual") {
                        prod.precio_venta = Math.round((prod.costo_proveedor + (prod.costo_packaging || 0)) * 2.2);
                    }

                    subtotalProductos += (nuevoCostoProv * cantidad);
                    itemsComprados.push({
                        id: prod.id,
                        sku: prod.sku,
                        nombre: prod.nombre_rowan,
                        cantidad,
                        costoUnitario: nuevoCostoProv
                    });
                }
            }
        });

        if (itemsComprados.length === 0) {
            return alert("La cantidad de los productos seleccionados debe ser mayor a 0.");
        }

        const numeroCompra = String(compras.length + 1).padStart(3, '0');
        const montoTotal = subtotalProductos + costoEnvio;
        const fechaActual = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

        const nuevaCompra = {
            id: 'compra_' + Date.now(),
            proveedor_id: proveedorId,
            proveedor: provNombre,
            numero: numeroCompra,
            fecha: fechaActual,
            envio: costoEnvio,
            total: montoTotal,
            items: itemsComprados
        };

        compras.unshift(nuevaCompra);

        localStorage.setItem('rowan_productos', JSON.stringify(productos));
        localStorage.setItem('rowan_compras', JSON.stringify(compras));

        alert(`¡Compra #${numeroCompra} registrada con éxito para ${provNombre}!\nMonto total: $${montoTotal.toLocaleString()}`);
        
        cargarProductos();
        cargarProveedoresFicha();
        cargarProductosParaComprar();
        cargarHistorialCompras();
    } catch (err) {
        alert("Error al registrar la compra: " + err.message);
    }
}

window.eliminarCompra = function(compraId) {
    if (!confirm("¿Estás seguro de eliminar esta compra? Se descontará el stock sumado y se eliminará del historial.")) return;

    try {
        let compras = JSON.parse(localStorage.getItem('rowan_compras')) || [];
        let productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];

        const compraIndex = compras.findIndex(c => c.id === compraId);
        if (compraIndex === -1) return alert("No se encontró la compra.");

        const compra = compras[compraIndex];

        if (Array.isArray(compra.items)) {
            compra.items.forEach(item => {
                const prod = productos.find(p => p.id === item.id || p.sku === item.sku);
                if (prod) {
                    prod.stock = Math.max(0, (prod.stock || 0) - (item.cantidad || 0));
                }
            });
        }

        compras.splice(compraIndex, 1);

        localStorage.setItem('rowan_compras', JSON.stringify(compras));
        localStorage.setItem('rowan_productos', JSON.stringify(productos));

        alert("¡Compra eliminada y stock actualizado correctamente!");
        cargarProductos();
        cargarProveedoresFicha();
        cargarHistorialCompras();
    } catch (e) {
        alert("Error al eliminar la compra: " + e.message);
    }
}

window.filtrarHistorialCompras = function() {
    cargarHistorialCompras();
}

function cargarHistorialCompras() {
    const container = document.getElementById("historialComprasContainer");
    if (!container) return;

    try {
        let compras = JSON.parse(localStorage.getItem('rowan_compras')) || [];
        if (!Array.isArray(compras)) compras = [];

        const filtroEl = document.getElementById("buscadorHistorialCompras");
        const filtro = filtroEl ? filtroEl.value.toLowerCase() : "";

        if (compras.length === 0) {
            container.innerHTML = `<p class="text-xs text-zinc-500">No hay compras registradas todavía.</p>`;
            return;
        }

        const comprasFiltradas = compras.filter(compra => {
            const prov = compra.proveedor || '';
            const num = compra.numero || '001';
            const items = Array.isArray(compra.items) ? compra.items : [];

            const matchProv = prov.toLowerCase().includes(filtro);
            const matchNum = num.toLowerCase().includes(filtro);
            const matchItem = items.some(it => 
                (it.sku || '').toLowerCase().includes(filtro) || (it.nombre || '').toLowerCase().includes(filtro)
            );
            return matchProv || matchNum || matchItem;
        });

        if (comprasFiltradas.length === 0) {
            container.innerHTML = `<p class="text-xs text-zinc-500 text-center py-4">No se encontraron compras con ese criterio.</p>`;
            return;
        }

        container.innerHTML = "";
        
        comprasFiltradas.forEach(compra => {
            let itemsHtml = "";
            const items = Array.isArray(compra.items) ? compra.items : [];
            
            items.forEach(it => {
                const cantidad = it.cantidad || 1;
                const costoUnit = it.costoUnitario || 0;
                const subtotal = cantidad * costoUnit;

                itemsHtml += `
                    <tr class="border-b border-zinc-900 text-xs">
                        <td class="py-2 px-2 font-mono text-zinc-400">${it.sku || ''}</td>
                        <td class="py-2 px-2 text-zinc-300 font-medium">${it.nombre || ''}</td>
                        <td class="py-2 px-2 text-amber-400 font-semibold">x${cantidad}</td>
                        <td class="py-2 px-2 text-zinc-300">$${costoUnit.toLocaleString()}</td>
                        <td class="py-2 px-2 text-emerald-400 font-bold">$${subtotal.toLocaleString()}</td>
                    </tr>
                `;
            });

            const numDisplay = compra.numero ? `#${compra.numero}` : '#001';
            const provNombre = compra.proveedor || 'Proveedor';
            const fechaCompra = compra.fecha || '';
            const costoEnvio = compra.envio || 0;
            const montoTotal = compra.total || 0;

            container.innerHTML += `
                <div class="bg-zinc-950 border border-zinc-800 p-4 rounded-lg mb-4">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 pb-2 border-b border-zinc-900 gap-2">
                        <div>
                            <span class="text-xs font-mono bg-zinc-900 text-emerald-400 px-2 py-0.5 rounded border border-zinc-800 mr-2">${numDisplay}</span>
                            <span class="font-bold text-zinc-100 text-sm mr-3">Proveedor: <span class="text-emerald-400">${provNombre}</span></span>
                            <span class="text-xs text-zinc-400">${fechaCompra}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-xs text-zinc-400">Envío: $${costoEnvio.toLocaleString()}</span>
                            <span class="text-sm font-bold text-emerald-400">Total: $${montoTotal.toLocaleString()}</span>
                            <button onclick="eliminarCompra('${compra.id}')" class="text-xs bg-rose-950 text-rose-400 border border-rose-800 px-2.5 py-1 rounded hover:bg-rose-900 transition ml-2">Eliminar Compra</button>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="text-[10px] uppercase text-zinc-500 border-b border-zinc-900">
                                <tr>
                                    <th class="pb-1.5 px-2">SKU</th>
                                    <th class="pb-1.5 px-2">Artículo</th>
                                    <th class="pb-1.5 px-2">Cantidad</th>
                                    <th class="pb-1.5 px-2">Costo Unit.</th>
                                    <th class="pb-1.5 px-2">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = `<p class="text-xs text-zinc-500">Error al cargar historial.</p>`;
    }
}

// --- CÁLCULO DE PRECIOS Y GESTIÓN DE COLORES / NOMBRES ---
window.calcularPrecioAutomatico = function() {
    const costoProv = parseFloat(document.getElementById("costo_prov").value) || 0;
    const costoPack = parseFloat(document.getElementById("costo_pack").value) || 0;
    const precioInput = document.getElementById("precio_venta");
    
    const precioAuto = (costoProv + costoPack) * 2.2;
    precioInput.value = precioAuto > 0 ? Math.round(precioAuto) : "";
    verificarModoPrecio();
}

window.verificarModoPrecio = function() {
    const costoProv = parseFloat(document.getElementById("costo_prov").value) || 0;
    const costoPack = parseFloat(document.getElementById("costo_pack").value) || 0;
    const precioInput = document.getElementById("precio_venta");
    const precioActual = parseFloat(precioInput.value) || 0;
    
    const precioAuto = (costoProv + costoPack) * 2.2;
    const esAutomatico = Math.abs(precioActual - precioAuto) < 1;

    if (esAutomatico) {
        precioInput.className = "w-full border rounded p-2 text-sm font-semibold focus:outline-none bg-amber-950/40 text-amber-300 border-amber-600";
        precioInput.dataset.tipo = "automatico";
    } else {
        precioInput.className = "w-full border rounded p-2 text-sm font-semibold focus:outline-none bg-sky-950/40 text-sky-300 border-sky-600";
        precioInput.dataset.tipo = "manual";
    }
}

function actualizarCheckboxesColoresProducto(coloresSeleccionados = []) {
    const container = document.getElementById("coloresCheckboxesContainer");
    if (!container) return;

    try {
        const colores = JSON.parse(localStorage.getItem('rowan_colores')) || [];
        if (colores.length === 0) {
            container.innerHTML = `<span class="text-xs text-zinc-500">No hay colores cargados.</span>`;
            return;
        }

        container.innerHTML = "";
        colores.forEach(col => {
            const isChecked = coloresSeleccionados.includes(col) ? 'checked' : '';
            container.innerHTML += `
                <label class="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:text-zinc-100">
                    <input type="checkbox" name="producto_color" value="${col}" ${isChecked} class="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-0">
                    <span>${col}</span>
                </label>
            `;
        });
    } catch (e) {
        console.error(e);
    }
}

function guardarColorNuevo() {
    const input = document.getElementById("color_nuevo");
    const nuevoColor = input.value.trim();
    if (!nuevoColor) return;

    try {
        let colores = JSON.parse(localStorage.getItem('rowan_colores')) || [];
        if (colores.some(c => c.toLowerCase() === nuevoColor.toLowerCase())) {
            alert("Este color ya existe.");
            return;
        }
        colores.push(nuevoColor);
        localStorage.setItem('rowan_colores', JSON.stringify(colores));
        input.value = "";
        cargarColoresGestion();
        actualizarCheckboxesColoresProducto();
        alert("¡Color agregado con éxito!");
    } catch (e) {
        alert("Error al guardar color.");
    }
}

window.eliminarColor = function(index) {
    try {
        let colores = JSON.parse(localStorage.getItem('rowan_colores')) || [];
        colores.splice(index, 1);
        localStorage.setItem('rowan_colores', JSON.stringify(colores));
        cargarColoresGestion();
        actualizarCheckboxesColoresProducto();
    } catch (e) {
        console.error(e);
    }
}

function cargarColoresGestion() {
    const listado = document.getElementById("coloresListado");
    if (!listado) return;

    try {
        const colores = JSON.parse(localStorage.getItem('rowan_colores')) || [];
        if (colores.length === 0) {
            listado.innerHTML = `<li class="py-3 text-sm text-zinc-500">No hay colores cargados.</li>`;
            return;
        }

        listado.innerHTML = "";
        colores.forEach((col, index) => {
            listado.innerHTML += `
                <li class="py-2.5 text-sm font-medium text-zinc-200 flex justify-between items-center border-b border-zinc-800/50">
                    <span>${col}</span>
                    <button onclick="eliminarColor(${index})" class="text-xs bg-rose-950 text-rose-400 border border-rose-800 px-2 py-1 rounded hover:bg-rose-900 transition">Eliminar</button>
                </li>
            `;
        });
    } catch (e) {
        listado.innerHTML = `<li class="py-3 text-sm text-zinc-500">Error al cargar colores.</li>`;
    }
}

function actualizarSelectNombresProducto() {
    const select = document.getElementById("nombre_hombre_select");
    if (!select) return;

    try {
        const nombres = JSON.parse(localStorage.getItem('rowan_nombres')) || [];
        const productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];

        let nombresUsadosSet = new Set();
        productos.forEach(p => {
            if (p.nombre_rowan) {
                const partes = p.nombre_rowan.split(' ');
                if (partes.length > 1) {
                    nombresUsadosSet.add(partes.slice(1).join(' ').toUpperCase());
                }
            }
        });

        select.innerHTML = '<option value="">Automático (Siguiente disponible)</option>';
        nombres.forEach(nom => {
            const usado = nombresUsadosSet.has(nom.toUpperCase());
            const etiqueta = usado ? `${nom} (USADO / OCUPADO)` : nom;
            select.innerHTML += `<option value="${nom}" ${usado ? 'class="text-zinc-500 bg-zinc-900"' : ''}>${etiqueta}</option>`;
        });
    } catch (e) {
        console.error(e);
    }
}

function guardarNombreNuevo() {
    const inputNombre = document.getElementById("nombre_nuevo").value.trim().toUpperCase();
    if (!inputNombre) return;

    try {
        let nombres = JSON.parse(localStorage.getItem('rowan_nombres')) || [];
        nombres.push(inputNombre);
        localStorage.setItem('rowan_nombres', JSON.stringify(nombres));
        document.getElementById("nombreForm").reset();
        cargarNombresGestion();
        actualizarSelectNombresProducto();
        alert("¡Nombre agregado con éxito!");
    } catch (e) {
        alert("Error al guardar nombre.");
    }
}

window.eliminarNombre = function(index) {
    try {
        let nombres = JSON.parse(localStorage.getItem('rowan_nombres')) || [];
        nombres.splice(index, 1);
        if (nombres.length === 0) nombres = ["ROWAN"];
        localStorage.setItem('rowan_nombres', JSON.stringify(nombres));
        cargarNombresGestion();
        actualizarSelectNombresProducto();
    } catch (e) {
        console.error(e);
    }
}

function cargarNombresGestion() {
    const listado = document.getElementById("nombresListado");
    if (!listado) return;

    try {
        const nombres = JSON.parse(localStorage.getItem('rowan_nombres')) || [];
        const productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
        let nombresUsadosSet = new Set();
        productos.forEach(p => {
            if (p.nombre_rowan) {
                const partes = p.nombre_rowan.split(' ');
                if (partes.length > 1) nombresUsadosSet.add(partes.slice(1).join(' ').toUpperCase());
            }
        });

        if (nombres.length === 0) {
            listado.innerHTML = `<li class="py-3 text-sm text-zinc-500">No hay nombres cargados.</li>`;
            return;
        }

        listado.innerHTML = "";
        nombres.forEach((nom, index) => {
            const usado = nombresUsadosSet.has(nom.toUpperCase());
            listado.innerHTML += `
                <li class="py-2.5 text-sm font-medium text-zinc-200 flex justify-between items-center border-b border-zinc-800/50">
                    <div>
                        <span>${index + 1}. ${nom}</span>
                        ${usado ? '<span class="ml-2 text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded">Usado</span>' : ''}
                    </div>
                    <button onclick="eliminarNombre(${index})" class="text-xs bg-rose-950 text-rose-400 border border-rose-800 px-2 py-1 rounded hover:bg-rose-900 transition">Eliminar</button>
                </li>
            `;
        });
    } catch (e) {
        listado.innerHTML = `<li class="py-3 text-sm text-zinc-500">No hay nombres cargados.</li>`;
    }
}

window.procesarArchivoNombres = function() {
    const input = document.getElementById("archivoNombres");
    if (!input.files || input.files.length === 0) {
        alert("Selecciona un archivo (.xlsx, .csv o .txt).");
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'xlsx' || extension === 'xls') {
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                let nuevosNombres = [];
                json.forEach(row => {
                    if (row[0]) {
                        let val = String(row[0]).trim().toUpperCase();
                        if (val && val !== "NOMBRE" && val !== "NOMBRES") {
                            nuevosNombres.push(val);
                        }
                    }
                });
                guardarNombresImportados(nuevosNombres);
            } catch (err) {
                alert("Error al leer el archivo Excel: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    } else {
        reader.onload = function(e) {
            try {
                const contenido = e.target.result;
                const lineas = contenido.split(/\r\n|\n/);
                let nuevosNombres = [];
                lineas.forEach(linea => {
                    let columnas = linea.split(/[,;\t]/);
                    let val = columnas[0] ? columnas[0].replace(/["']/g, "").trim().toUpperCase() : "";
                    if (val && val !== "NOMBRE" && val !== "NOMBRES") {
                        nuevosNombres.push(val);
                    }
                });
                guardarNombresImportados(nuevosNombres);
            } catch (err) {
                alert("Error al leer el archivo: " + err.message);
            }
        };
        reader.readAsText(file);
    }
}

function guardarNombresImportados(nuevosNombres) {
    if (nuevosNombres.length > 0) {
        localStorage.setItem('rowan_nombres', JSON.stringify(nuevosNombres));
        localStorage.setItem('rowan_indice_nombre', '0');
        cargarNombresGestion();
        actualizarSelectNombresProducto();
        alert(`¡Se importaron ${nuevosNombres.length} nombres correctamente!`);
        document.getElementById("archivoNombres").value = "";
    } else {
        alert("No se encontraron nombres válidos.");
    }
}

// --- PROVEEDORES Y PRODUCTOS ---
function guardarProveedor() {
    const editId = document.getElementById("prov_edit_id").value;
    const nombre = document.getElementById("prov_nombre").value.trim();
    const contacto = document.getElementById("prov_contacto").value.trim();
    const web = document.getElementById("prov_web").value.trim();

    if (!nombre) return alert("El nombre es obligatorio.");

    try {
        let provs = JSON.parse(localStorage.getItem('rowan_proveedores')) || [];
        if (editId) {
            const prov = provs.find(p => p.id === editId);
            if (prov) { prov.nombre = nombre; prov.contacto = contacto; prov.web = web; }
            alert("¡Proveedor actualizado con éxito!");
        } else {
            const nuevoProv = { id: 'prov_' + Date.now(), nombre, contacto, web };
            provs.push(nuevoProv);
            alert("¡Proveedor guardado con éxito!");
        }

        localStorage.setItem('rowan_proveedores', JSON.stringify(provs));
        cancelarEdicionProveedor();
        cargarSelectores();
        cargarProveedoresFicha();
        cargarProductos();
    } catch (err) {
        alert("Error al guardar proveedor: " + err.message);
    }
}

window.editarProveedor = function(id) {
    try {
        const provs = JSON.parse(localStorage.getItem('rowan_proveedores')) || [];
        const prov = provs.find(p => p.id === id);
        if (prov) {
            document.getElementById("prov_edit_id").value = prov.id;
            document.getElementById("prov_nombre").value = prov.nombre;
            document.getElementById("prov_contacto").value = prov.contacto || '';
            document.getElementById("prov_web").value = prov.web || '';
            document.getElementById("form-proveedor-titulo").textContent = "Editar Proveedor";
            document.getElementById("btn-guardar-prov").textContent = "Actualizar Proveedor";
            document.getElementById("btn-cancelar-prov").classList.remove("hidden");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (e) {
        console.error(e);
    }
}

window.cancelarEdicionProveedor = function() {
    document.getElementById("proveedorForm").reset();
    document.getElementById("prov_edit_id").value = "";
    document.getElementById("form-proveedor-titulo").textContent = "Nuevo Proveedor";
    document.getElementById("btn-guardar-prov").textContent = "Guardar Proveedor";
    document.getElementById("btn-cancelar-prov").classList.add("hidden");
}

window.filtrarProveedores = function() { cargarProveedoresFicha(); }

function guardarCategoria() {
    const editId = document.getElementById("cat_edit_id").value;
    const nombre = document.getElementById("cat_nombre").value.trim();

    if (!nombre) return alert("El nombre es obligatorio.");

    try {
        let cats = JSON.parse(localStorage.getItem('rowan_categorias')) || [];
        if (editId) {
            const cat = cats.find(c => c.id === editId);
            if (cat) cat.nombre = nombre;
            alert("¡Categoría actualizada!");
        } else {
            if (cats.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
                alert("La categoría ya existe.");
                return;
            }
            cats.push({ id: 'cat_' + Date.now(), nombre });
            alert("¡Categoría creada!");
        }

        localStorage.setItem('rowan_categorias', JSON.stringify(cats));
        cancelarEdicionCategoria();
        cargarSelectores();
        cargarCategoriasGestion();
        cargarProductos();
    } catch (err) {
        alert("Error al guardar categoría: " + err.message);
    }
}

window.editarCategoria = function(id) {
    try {
        const cats = JSON.parse(localStorage.getItem('rowan_categorias')) || [];
        const cat = cats.find(c => c.id === id);
        if (cat) {
            document.getElementById("cat_edit_id").value = cat.id;
            document.getElementById("cat_nombre").value = cat.nombre;
            document.getElementById("form-cat-titulo").textContent = "Editar Categoría";
            document.getElementById("btn-guardar-cat").textContent = "Actualizar Categoría";
            document.getElementById("btn-cancelar-cat").classList.remove("hidden");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (e) {
        console.error(e);
    }
}

window.cancelarEdicionCategoria = function() {
    document.getElementById("categoriaForm").reset();
    document.getElementById("cat_edit_id").value = "";
    document.getElementById("form-cat-titulo").textContent = "Agregar Nueva Categoría";
    document.getElementById("btn-guardar-cat").textContent = "Crear Categoría";
    document.getElementById("btn-cancelar-cat").classList.add("hidden");
}

function cargarCategoriasGestion() {
    const listado = document.getElementById("categoriasListado");
    if (!listado) return;

    try {
        const cats = JSON.parse(localStorage.getItem('rowan_categorias')) || [];
        if (cats.length === 0) {
            listado.innerHTML = `<li class="py-3 text-sm text-zinc-500">No hay categorías.</li>`;
            return;
        }

        listado.innerHTML = "";
        cats.forEach(c => {
            const codigoSku = c.nombre.substring(0, 3).toUpperCase();
            listado.innerHTML += `
                <li class="py-3 text-sm font-medium text-zinc-200 flex justify-between items-center border-b border-zinc-800/50">
                    <div>
                        <span>${c.nombre}</span>
                        <span class="ml-2 text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">SKU: (${codigoSku})</span>
                    </div>
                    <button onclick="editarCategoria('${c.id}')" class="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 rounded hover:bg-zinc-700 transition">Editar</button>
                </li>
            `;
        });
    } catch (e) {
        listado.innerHTML = `<li class="py-3 text-sm text-zinc-500">Error.</li>`;
    }
}

function procesarNuevoProducto() {
    const editId = document.getElementById("prod_edit_id").value;
    const proveedorId = document.getElementById("proveedor_select").value;
    const descProveedor = document.getElementById("desc_proveedor").value;
    const descArticulo = document.getElementById("desc_articulo").value;
    const categoria = document.getElementById("categoria_select").value;
    
    const checkboxesColores = document.querySelectorAll('input[name="producto_color"]:checked');
    let coloresSeleccionados = Array.from(checkboxesColores).map(cb => cb.value);
    const colorStr = coloresSeleccionados.length > 0 ? coloresSeleccionados.join(', ') : '';

    const nombreManualSeleccionado = document.getElementById("nombre_hombre_select").value;
    const costoProv = parseFloat(document.getElementById("costo_prov").value);
    const costoPack = parseFloat(document.getElementById("costo_pack").value) || 0;
    const precioVenta = parseFloat(document.getElementById("precio_venta").value);
    const tipoPrecio = document.getElementById("precio_venta").dataset.tipo || "automatico";
    
    const peso = parseFloat(document.getElementById("peso").value) || 0;
    const alto = parseFloat(document.getElementById("alto").value) || null;
    const ancho = parseFloat(document.getElementById("ancho").value) || null;
    const prof = parseFloat(document.getElementById("prof").value) || null;

    if (!proveedorId) return alert("Selecciona un proveedor.");

    try {
        let productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];

        if (editId) {
            const prod = productos.find(p => p.id === editId);
            if (prod) {
                prod.proveedor_id = proveedorId;
                prod.descripcion_proveedor = descProveedor;
                prod.descripcion_articulo = descArticulo;
                prod.categoria = categoria;
                prod.color = colorStr;
                prod.costo_proveedor = costoProv;
                prod.costo_packaging = costoPack;
                prod.precio_venta = precioVenta;
                prod.tipo_precio = tipoPrecio;
                prod.peso_kg = peso;
                prod.alto_cm = alto;
                prod.ancho_cm = ancho;
                prod.profundidad_cm = prof;
            }
            localStorage.setItem('rowan_productos', JSON.stringify(productos));
            alert("¡Artículo actualizado!");
            cancelarEdicionProducto();
        } else {
            const mismaCat = productos.filter(p => p.categoria === categoria);
            const prefix = categoria.substring(0, 3).toUpperCase();
            const sku = `${prefix}-${String(mismaCat.length + 1).padStart(3, '0')}`;

            let nombreBaseSingular = categoria.toUpperCase().slice(0, -1);
            if (categoria === "Mochilas") nombreBaseSingular = "MOCHILA";
            if (categoria === "Riñoneras") nombreBaseSingular = "RIÑONERA";
            if (categoria === "Neceres") nombreBaseSingular = "NECESER";
            if (categoria === "Relojes") nombreBaseSingular = "RELOJ";
            if (categoria === "Cintos") nombreBaseSingular = "CINTO";
            if (categoria === "Tote Bags") nombreBaseSingular = "TOTE BAG";

            let nombreElegido = "";
            if (nombreManualSeleccionado) {
                nombreElegido = nombreManualSeleccionado;
            } else {
                let nombres = JSON.parse(localStorage.getItem('rowan_nombres')) || ["ROWAN"];
                let indiceContador = parseInt(localStorage.getItem('rowan_indice_nombre') || '0', 10);
                nombreElegido = nombres[indiceContador % nombres.length];
                localStorage.setItem('rowan_indice_nombre', (indiceContador + 1).toString());
            }

            const nombreRowan = `${nombreBaseSingular} ${nombreElegido}`;

            const nuevoProd = {
                id: 'prod_' + Date.now(),
                sku, categoria, nombre_rowan: nombreRowan, descripcion_proveedor: descProveedor,
                descripcion_articulo: descArticulo, proveedor_id: proveedorId, color: colorStr, 
                costo_proveedor: costoProv, costo_packaging: costoPack, precio_venta: precioVenta, 
                tipo_precio: tipoPrecio, stock: 0, peso_kg: peso, alto_cm: alto, ancho_cm: ancho, 
                profundidad_cm: prof, visible: true
            };

            productos.unshift(nuevoProd);
            localStorage.setItem('rowan_productos', JSON.stringify(productos));
            alert(`¡Artículo generado con éxito!\nSKU: ${sku}\nNombre: ${nombreRowan}`);
            document.getElementById("productForm").reset();
            actualizarCheckboxesColoresProducto();
            document.getElementById("costo_pack").value = "1000";
            verificarModoPrecio();
        }

        cargarProductos();
        cargarProveedoresFicha();
        cargarNombresGestion();
        actualizarSelectNombresProducto();
    } catch (err) {
        alert("Error: " + err.message);
    }
}

window.editarProducto = function(id) {
    try {
        const productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
        const prod = productos.find(p => p.id === id);
        if (prod) {
            document.getElementById("prod_edit_id").value = prod.id;
            document.getElementById("proveedor_select").value = prod.proveedor_id;
            document.getElementById("desc_proveedor").value = prod.descripcion_proveedor;
            document.getElementById("desc_articulo").value = prod.descripcion_articulo || "";
            document.getElementById("categoria_select").value = prod.categoria;
            
            const coloresGuardados = prod.color ? prod.color.split(', ').map(c => c.trim()) : [];
            actualizarCheckboxesColoresProducto(coloresGuardados);

            document.getElementById("costo_prov").value = prod.costo_proveedor;
            document.getElementById("costo_pack").value = prod.costo_packaging || 1000;
            document.getElementById("precio_venta").value = prod.precio_venta;
            verificarModoPrecio();

            document.getElementById("peso").value = prod.peso_kg || "";
            document.getElementById("alto").value = prod.alto_cm || "";
            document.getElementById("ancho").value = prod.ancho_cm || "";
            document.getElementById("prof").value = prod.profundidad_cm || "";

            document.getElementById("form-producto-titulo").textContent = "Editar Producto";
            document.getElementById("btn-guardar-prod").textContent = "Actualizar Producto";
            document.getElementById("btn-cancelar-prod").classList.remove("hidden");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (e) {
        console.error(e);
    }
}

window.cancelarEdicionProducto = function() {
    document.getElementById("productForm").reset();
    document.getElementById("prod_edit_id").value = "";
    document.getElementById("form-producto-titulo").textContent = "Cargar Producto de Proveedor";
    document.getElementById("btn-guardar-prod").textContent = "Generar Artículo Automático";
    document.getElementById("btn-cancelar-prod").classList.add("hidden");
    document.getElementById("costo_pack").value = "1000";
    actualizarCheckboxesColoresProducto();
    verificarModoPrecio();
}

window.eliminarProducto = function(id) {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
        let productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
        productos = productos.filter(p => p.id !== id);
        localStorage.setItem('rowan_productos', JSON.stringify(productos));
        cargarProductos();
        cargarProveedoresFicha();
        cargarNombresGestion();
        actualizarSelectNombresProducto();
    } catch (e) {
        console.error(e);
    }
}

window.toggleVisibilidadProducto = function(id, checkbox) {
    try {
        let productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
        const prod = productos.find(p => p.id === id);
        if (prod) {
            prod.visible = checkbox.checked;
            localStorage.setItem('rowan_productos', JSON.stringify(productos));
            cargarProductos();
        }
    } catch (e) {
        console.error(e);
    }
}

window.actualizarCostoProducto = function(prodId, nuevoCosto) {
    const costoNum = parseFloat(nuevoCosto);
    if (isNaN(costoNum) || costoNum < 0) return;

    try {
        let productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
        const prod = productos.find(p => p.id === prodId);
        if (prod) {
            prod.costo_proveedor = costoNum;
            if (prod.tipo_precio !== "manual") {
                prod.precio_venta = Math.round((prod.costo_proveedor + (prod.costo_packaging || 0)) * 2.2);
            }
            localStorage.setItem('rowan_productos', JSON.stringify(productos));
            cargarProductos();
        }
    } catch (e) {
        console.error(e);
    }
}

window.filtrarProductos = function() { cargarProductos(); }

function cargarProductos() {
    const tbody = document.getElementById("productTableBody");
    if (!tbody) return;
    
    try {
        const productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
        const filtro = document.getElementById("buscadorProductos") ? document.getElementById("buscadorProductos").value.toLowerCase() : "";

        const productosFiltrados = productos.filter(p => {
            const matchNombre = (p.nombre_rowan || '').toLowerCase().includes(filtro);
            const matchDescProv = (p.descripcion_proveedor || '').toLowerCase().includes(filtro);
            const matchSku = (p.sku || '').toLowerCase().includes(filtro);
            return matchNombre || matchDescProv || matchSku;
        });

        if (productosFiltrados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-zinc-500">No se encontraron productos.</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        productosFiltrados.forEach(p => {
            const costoReal = (p.costo_proveedor || 0) + (p.costo_packaging || 0);
            const stockActual = p.stock !== undefined ? p.stock : 0;
            const esVisible = p.visible !== false;

            let medidasTexto = [];
            if (p.peso_kg) medidasTexto.push(`${p.peso_kg} kg`);
            if (p.alto_cm || p.ancho_cm || p.profundidad_cm) {
                let dims = `${p.alto_cm || '-'}/${p.ancho_cm || '-'}/${p.profundidad_cm || '-'}`;
                medidasTexto.push(`[${dims} cm]`);
            }
            const infoMedidas = medidasTexto.length > 0 ? medidasTexto.join(' ') : 'No especificado';

            const badgeVisibilidad = esVisible 
                ? `<label class="inline-flex items-center gap-1.5 cursor-pointer bg-emerald-950/80 border border-emerald-700 px-2 py-1 rounded text-emerald-400 text-xs font-semibold">
                       <input type="checkbox" checked onchange="toggleVisibilidadProducto('${p.id}', this)" class="rounded bg-zinc-950 border-emerald-600 text-emerald-500 focus:ring-0">
                       <span>Visible</span>
                   </label>`
                : `<label class="inline-flex items-center gap-1.5 cursor-pointer bg-rose-950/80 border border-rose-700 px-2 py-1 rounded text-rose-400 text-xs font-semibold">
                       <input type="checkbox" onchange="toggleVisibilidadProducto('${p.id}', this)" class="rounded bg-zinc-950 border-rose-600 text-rose-500 focus:ring-0">
                       <span>No visible</span>
                   </label>`;

            tbody.innerHTML += `
                <tr class="hover:bg-zinc-800/50 transition">
                    <td class="py-3 text-center">${badgeVisibilidad}</td>
                    <td class="py-3 font-mono text-xs text-zinc-400">${p.sku}</td>
                    <td class="py-3 font-medium text-zinc-200">${p.nombre_rowan} <span class="text-xs text-zinc-500 block">${p.color ? p.color + ' | ' : ''}${p.categoria}</span></td>
                    <td class="py-3 font-semibold font-mono text-amber-400">${stockActual} u.</td>
                    <td class="py-3 text-zinc-300">$${costoReal.toLocaleString()}</td>
                    <td class="py-3"><span class="font-semibold text-xs">$${p.precio_venta.toLocaleString()}</span></td>
                    <td class="py-3 text-xs text-zinc-400 font-mono">${infoMedidas}</td>
                    <td class="py-3 text-right">
                        <button onclick="editarProducto('${p.id}')" class="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 rounded hover:bg-zinc-700 transition mr-1">Editar</button>
                        <button onclick="eliminarProducto('${p.id}')" class="text-xs bg-rose-950 text-rose-400 border border-rose-800 px-2.5 py-1 rounded hover:bg-rose-900 transition">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-zinc-500">Error.</td></tr>`;
    }
}

function cargarProveedoresFicha() {
    const container = document.getElementById("proveedoresListado");
    if (!container) return;

    try {
        const provs = JSON.parse(localStorage.getItem('rowan_proveedores')) || [];
        const productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
        const filtroProv = document.getElementById("buscadorProveedores") ? document.getElementById("buscadorProveedores").value.toLowerCase() : "";

        const provsFiltrados = provs.filter(p => p.nombre.toLowerCase().includes(filtroProv));

        if (provsFiltrados.length === 0) {
            container.innerHTML = `<p class="text-zinc-500 text-sm">No hay proveedores registrados.</p>`;
            return;
        }

        container.innerHTML = "";
        provsFiltrados.forEach(prov => {
            const prodsProv = productos.filter(p => p.proveedor_id === prov.id);
            let filasTabla = prodsProv.length > 0 
                ? prodsProv.map(prod => `
                    <tr class="border-b border-zinc-900">
                        <td class="py-2.5 px-3 font-mono text-xs text-zinc-400">${prod.sku}</td>
                        <td class="py-2.5 px-3 text-zinc-300">${prod.descripcion_proveedor}</td>
                        <td class="py-2.5 px-3 font-semibold text-zinc-100">${prod.nombre_rowan}</td>
                        <td class="py-2.5 px-3 font-mono text-amber-400">${prod.stock || 0} u.</td>
                        <td class="py-2.5 px-3 font-semibold">$${prod.precio_venta.toLocaleString()}</td>
                    </tr>
                `).join('')
                : `<tr><td colspan="5" class="py-4 text-center text-zinc-500 text-xs">Sin productos cargados.</td></tr>`;

            container.innerHTML += `
                <div class="bg-zinc-950 border border-zinc-800 p-4 rounded-lg mb-4">
                    <h3 class="font-bold text-zinc-100 text-base">${prov.nombre}</h3>
                    <div class="mt-3 overflow-x-auto">
                        <table class="w-full text-left text-xs">
                            <thead class="border-b border-zinc-800 text-zinc-500 uppercase">
                                <tr>
                                    <th class="pb-2 px-3">SKU</th>
                                    <th class="pb-2 px-3">Descripción</th>
                                    <th class="pb-2 px-3">Artículo ROWAN</th>
                                    <th class="pb-2 px-3">Stock</th>
                                    <th class="pb-2 px-3">Venta</th>
                                </tr>
                            </thead>
                            <tbody>${filasTabla}</tbody>
                        </table>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        container.innerHTML = `<p class="text-zinc-500 text-sm">Error.</p>`;
    }
}

// --- MÓDULO TIENDA NEGOCIO (CON DIVISIÓN DE FILAS POR COLOR) ---
function obtenerDatosTiendanubeFormato() {
    const productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
    let filasTiendanube = [];

    productos.forEach(p => {
        const visibilidadText = (p.visible !== false) ? "Visible" : "Oculto";
        const descripcionCompleta = (p.descripcion_articulo ? p.descripcion_articulo + " - " : "") + "Proveedor: " + (p.descripcion_proveedor || '');
        
        let coloresList = [];
        if (p.color) {
            coloresList = p.color.split(',').map(c => c.trim()).filter(c => c.length > 0);
        }

        if (coloresList.length > 1) {
            // Dividir en una fila por cada color
            coloresList.forEach((colIndividual, index) => {
                filasTiendanube.push({
                    "Hash": "",
                    "Nombre del producto": p.nombre_rowan || "",
                    "Precio": p.precio_venta || 0,
                    "Oferta": "",
                    "Stock": p.stock || 0,
                    "Visibilidad (Visible o Oculto)": visibilidadText,
                    "Descripción": descripcionCompleta,
                    "SKU": `${p.sku}-${colIndividual.substring(0, 3).toUpperCase()}`,
                    "Peso en KG": p.peso_kg || 0,
                    "Alto en CM": p.alto_cm || "",
                    "Ancho en CM": p.ancho_cm || "",
                    "Profundidad en CM": p.profundidad_cm || "",
                    "Nombre de variante #1": "Color",
                    "Opción de variante #1": colIndividual,
                    "Nombre de variante #2": "",
                    "Opción de variante #2": "",
                    "Nombre de variante #3": "",
                    "Opción de variante #3": "",
                    "Categorías > Subcategorías > … > Subcategorías": p.categoria || ""
                });
            });
        } else {
            const unicoColor = coloresList.length === 1 ? coloresList[0] : "";
            filasTiendanube.push({
                "Hash": "",
                "Nombre del producto": p.nombre_rowan || "",
                "Precio": p.precio_venta || 0,
                "Oferta": "",
                "Stock": p.stock || 0,
                "Visibilidad (Visible o Oculto)": visibilidadText,
                "Descripción": descripcionCompleta,
                "SKU": p.sku || "",
                "Peso en KG": p.peso_kg || 0,
                "Alto en CM": p.alto_cm || "",
                "Ancho en CM": p.ancho_cm || "",
                "Profundidad en CM": p.profundidad_cm || "",
                "Nombre de variante #1": unicoColor ? "Color" : "",
                "Opción de variante #1": unicoColor,
                "Nombre de variante #2": "",
                "Opción de variante #2": "",
                "Nombre de variante #3": "",
                "Opción de variante #3": "",
                "Categorías > Subcategorías > … > Subcategorías": p.categoria || ""
            });
        }
    });

    return filasTiendanube;
}

function cargarVistaPreviaTiendanube() {
    const tbody = document.getElementById("tablaTiendanubeBody");
    if (!tbody) return;

    const datos = obtenerDatosTiendanubeFormato();
    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-zinc-500">No hay productos en el catálogo para exportar.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    datos.forEach(row => {
        tbody.innerHTML += `
            <tr class="hover:bg-zinc-800/40 transition">
                <td class="py-2.5 px-2 font-semibold text-zinc-200">${row["Nombre del producto"]}</td>
                <td class="py-2.5 px-2 text-emerald-400 font-semibold">$${row["Precio"].toLocaleString()}</td>
                <td class="py-2.5 px-2 font-mono text-amber-400">${row["Stock"]} u.</td>
                <td class="py-2.5 px-2 text-zinc-300">${row["Visibilidad (Visible o Oculto)"]}</td>
                <td class="py-2.5 px-2 font-mono text-zinc-400">${row["SKU"]}</td>
                <td class="py-2.5 px-2 text-zinc-300">${row["Opción de variante #1"] || '-'}</td>
                <td class="py-2.5 px-2 text-zinc-300">${row["Categorías > Subcategorías > … > Subcategorías"]}</td>
            </tr>
        `;
    });
}

window.exportarExcelTiendanube = function() {
    const datos = obtenerDatosTiendanubeFormato();
    if (datos.length === 0) return alert("No hay productos para exportar.");

    try {
        const worksheet = XLSX.utils.json_to_sheet(datos);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
        
        XLSX.writeFile(workbook, "catalogo_tienda_negocio_rowan.xlsx");
    } catch (err) {
        alert("Error al exportar archivo Excel: " + err.message);
    }
}

window.procesarActualizacionTienda = function() {
    const input = document.getElementById("archivoTiendaActualizar");
    if (!input.files || input.files.length === 0) {
        alert("Por favor selecciona el archivo exportado de Tienda Negocio (.xlsx o .csv).");
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();
    const extension = file.name.split('.').pop().toLowerCase();

    reader.onload = function(e) {
        try {
            let jsonRows = [];
            if (extension === 'xlsx' || extension === 'xls') {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                jsonRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);
            } else {
                const contenido = e.target.result;
                const workbook = XLSX.read(contenido, { type: 'string' });
                const firstSheetName = workbook.SheetNames[0];
                jsonRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);
            }

            let productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
            let actualizadosCount = 0;

            jsonRows.forEach(row => {
                const skuArchivo = String(row["SKU"] || "").trim();
                const stockArchivo = parseInt(row["Stock"], 10);
                const descArchivo = String(row["Descripción"] || "").trim();

                if (skuArchivo) {
                    productos.forEach(p => {
                        // Comprobamos si el SKU coincide directamente o con sufijo de variante
                        if (p.sku === skuArchivo || skuArchivo.startsWith(p.sku)) {
                            if (!isNaN(stockArchivo)) {
                                p.stock = stockArchivo;
                            }
                            if (descArchivo) {
                                p.descripcion_articulo = descArchivo;
                            }
                            actualizadosCount++;
                        }
                    });
                }
            });

            localStorage.setItem('rowan_productos', JSON.stringify(productos));
            alert(`¡Actualización exitosa! Se actualizaron datos en ${actualizadosCount} registros según el archivo.`);
            cargarProductos();
            cargarVistaPreviaTiendanube();
            input.value = "";
        } catch (err) {
            alert("Error al procesar el archivo: " + err.message);
        }
    };

    if (extension === 'xlsx' || extension === 'xls') {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsText(file);
    }
}
