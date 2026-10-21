// Sistema ROWAN - Almacenamiento Local Avanzado con Gestión de Nombres y Costos Editables

// Inicializar datos por defecto si está vacío
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
if (!localStorage.getItem('rowan_nombres')) {
    // Nombres iniciales por defecto que luego puedes editar en su solapa
    localStorage.setItem('rowan_nombres', JSON.stringify([
        "DANTE", "ENZO", "BRUNO", "MILO", "IAN", "GAEL", "LUCA", "AXEL", "THIAGO", "SANTINO", "MILAN"
    ]));
}

// Navegación inmediata de solapas (Incluye la nueva solapa "nombres")
window.cambiarPestana = function(pestana) {
    const secciones = ["productos", "proveedores", "categorias", "nombres"];
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

    // Formularios
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

function guardarProveedor() {
    const nombre = document.getElementById("prov_nombre").value.trim();
    const contacto = document.getElementById("prov_contacto").value.trim();
    const web = document.getElementById("prov_web").value.trim();

    if (!nombre) {
        alert("El nombre del proveedor es obligatorio.");
        return;
    }

    try {
        const provs = JSON.parse(localStorage.getItem('rowan_proveedores')) || [];
        const nuevoProv = { id: 'prov_' + Date.now(), nombre, contacto, web };
        provs.push(nuevoProv);
        localStorage.setItem('rowan_proveedores', JSON.stringify(provs));

        alert("¡Proveedor guardado con éxito!");
        document.getElementById("proveedorForm").reset();
        cargarSelectores();
        cargarProveedoresFicha();
    } catch (err) {
        alert("Error al guardar proveedor: " + err.message);
    }
}

function guardarCategoria() {
    const nombre = document.getElementById("cat_nombre").value.trim();
    if (!nombre) {
        alert("El nombre de la categoría es obligatorio.");
        return;
    }

    try {
        const cats = JSON.parse(localStorage.getItem('rowan_categorias')) || [];
        if (cats.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
            alert("La categoría ya existe.");
            return;
        }
        cats.push({ id: 'cat_' + Date.now(), nombre });
        localStorage.setItem('rowan_categorias', JSON.stringify(cats));

        alert("¡Categoría creada con éxito!");
        document.getElementById("categoriaForm").reset();
        cargarSelectores();
        cargarCategoriasGestion();
    } catch (err) {
        alert("Error al guardar categoría: " + err.message);
    }
}

function guardarNombreNuevo() {
    const inputNombre = document.getElementById("nombre_nuevo").value.trim().toUpperCase();
    if (!inputNombre) return;

    try {
        let nombres = JSON.parse(localStorage.getItem('rowan_nombres')) || [];
        if (nombres.includes(inputNombre)) {
            alert("Este nombre ya está en la lista.");
            return;
        }
        nombres.push(inputNombre);
        localStorage.setItem('rowan_nombres', JSON.stringify(nombres));
        document.getElementById("nombreForm").reset();
        cargarNombresGestion();
        alert("¡Nombre agregado con éxito!");
    } catch (e) {
        alert("Error al guardar nombre.");
    }
}

window.eliminarNombre = function(index) {
    try {
        let nombres = JSON.parse(localStorage.getItem('rowan_nombres')) || [];
        nombres.splice(index, 1);
        if (nombres.length === 0) nombres = ["ROWAN"]; // Evitar lista vacía
        localStorage.setItem('rowan_nombres', JSON.stringify(nombres));
        cargarNombresGestion();
    } catch (e) {
        console.error(e);
    }
}

function cargarNombresGestion() {
    const listado = document.getElementById("nombresListado");
    if (!listado) return;

    try {
        const nombres = JSON.parse(localStorage.getItem('rowan_nombres')) || [];
        if (nombres.length === 0) {
            listado.innerHTML = `<li class="py-3 text-sm text-zinc-500">No hay nombres cargados.</li>`;
            return;
        }

        listado.innerHTML = "";
        nombres.forEach((nom, index) => {
            listado.innerHTML += `
                <li class="py-2.5 text-sm font-medium text-zinc-200 flex justify-between items-center border-b border-zinc-800/50">
                    <span>${index + 1}. ${nom}</span>
                    <button onclick="eliminarNombre(${index})" class="text-xs bg-rose-950 text-rose-400 border border-rose-800 px-2 py-1 rounded hover:bg-rose-900 transition">Eliminar</button>
                </li>
            `;
        });
    } catch (e) {
        listado.innerHTML = `<li class="py-3 text-sm text-zinc-500">Error al cargar nombres.</li>`;
    }
}

function procesarNuevoProducto() {
    const proveedorId = document.getElementById("proveedor_select").value;
    const descProveedor = document.getElementById("desc_proveedor").value;
    const categoria = document.getElementById("categoria_select").value;
    const color = document.getElementById("color").value;
    const costoProv = parseFloat(document.getElementById("costo_prov").value);
    const costoPack = parseFloat(document.getElementById("costo_pack").value) || 0;
    const precioVenta = parseFloat(document.getElementById("precio_venta").value);
    const peso = parseFloat(document.getElementById("peso").value) || 0;
    const alto = parseFloat(document.getElementById("alto").value) || null;
    const ancho = parseFloat(document.getElementById("ancho").value) || null;
    const prof = parseFloat(document.getElementById("prof").value) || null;

    if (!proveedorId) {
        alert("Por favor selecciona un proveedor.");
        return;
    }

    try {
        const productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
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

        // Tomar el siguiente nombre de la solapa de Nombres configurable
        let nombres = JSON.parse(localStorage.getItem('rowan_nombres')) || ["ROWAN"];
        let indiceContador = parseInt(localStorage.getItem('rowan_indice_nombre') || '0', 10);
        const nombreElegido = nombres[indiceContador % nombres.length];
        
        // Incrementar y guardar el índice para el próximo producto
        localStorage.setItem('rowan_indice_nombre', (indiceContador + 1).toString());

        const nombreRowan = `${nombreBaseSingular} ${nombreElegido}`;

        const nuevoProd = {
            id: 'prod_' + Date.now(),
            sku, categoria, nombre_rowan: nombreRowan, descripcion_proveedor: descProveedor,
            proveedor_id: proveedorId, color, costo_proveedor: costoProv, costo_packaging: costoPack,
            precio_venta: precioVenta, peso_kg: peso, alto_cm: alto, ancho_cm: ancho, profundidad_cm: prof
        };

        productos.unshift(nuevoProd);
        localStorage.setItem('rowan_productos', JSON.stringify(productos));

        alert(`¡Artículo generado con éxito!\nSKU: ${sku}\nNombre: ${nombreRowan}`);
        document.getElementById("productForm").reset();
        cargarProductos();
        cargarProveedoresFicha();
    } catch (err) {
        alert("Error al guardar producto: " + err.message);
    }
}

// Función para actualizar el costo directamente desde la ficha de proveedor
window.actualizarCostoProducto = function(prodId, nuevoCosto) {
    const costoNum = parseFloat(nuevoCosto);
    if (isNaN(costoNum) || costoNum < 0) return;

    try {
        let productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
        const prod = productos.find(p => p.id === prodId);
        if (prod) {
            prod.costo_proveedor = costoNum;
            localStorage.setItem('rowan_productos', JSON.stringify(productos));
            cargarProductos();
            // Recargar sin perder la posición para actualizar totales visuales
        }
    } catch (e) {
        console.error("Error al actualizar costo", e);
    }
}

function cargarProductos() {
    const tbody = document.getElementById("productTableBody");
    if (!tbody) return;
    
    try {
        const productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
        const proveedores = JSON.parse(localStorage.getItem('rowan_proveedores')) || [];

        if (productos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-zinc-500">No hay productos cargados.</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        productos.forEach(p => {
            const costoReal = p.costo_proveedor + (p.costo_packaging || 0);
            const provObj = proveedores.find(pr => pr.id === p.proveedor_id);
            const provNombre = provObj ? provObj.nombre : 'Sin proveedor';

            tbody.innerHTML += `
                <tr class="hover:bg-zinc-800/50 transition">
                    <td class="py-3 font-mono text-xs text-zinc-400">${p.sku}</td>
                    <td class="py-3 font-medium text-zinc-200">${p.nombre_rowan} <span class="text-xs text-zinc-500 block">${p.color || ''} | ${p.categoria}</span></td>
                    <td class="py-3 text-zinc-400 text-xs">${provNombre}</td>
                    <td class="py-3 text-zinc-300">$${costoReal.toLocaleString()}</td>
                    <td class="py-3 font-semibold text-emerald-400">$${p.precio_venta.toLocaleString()}</td>
                </tr>
            `;
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-zinc-500">No hay productos cargados.</td></tr>`;
    }
}

function cargarProveedoresFicha() {
    const container = document.getElementById("proveedoresListado");
    if (!container) return;

    try {
        const provs = JSON.parse(localStorage.getItem('rowan_proveedores')) || [];
        const productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];

        if (provs.length === 0) {
            container.innerHTML = `<p class="text-zinc-500 text-sm">No hay proveedores registrados todavía.</p>`;
            return;
        }

        container.innerHTML = "";
        provs.forEach(prov => {
            const prodsProv = productos.filter(p => p.proveedor_id === prov.id);
            let productosHtml = prodsProv.length > 0 
                ? prodsProv.map(prod => `
                    <li class="text-xs text-zinc-300 py-2 border-b border-zinc-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div>
                            <span class="font-bold text-zinc-200">${prod.sku}</span> - <span class="text-zinc-100">${prod.nombre_rowan}</span> (${prod.color || 'Único'})
                            <span class="block text-[11px] text-zinc-400">Desc. Proveedor: ${prod.descripcion_proveedor}</span>
                        </div>
                        <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                            <div class="flex items-center gap-1">
                                <span class="text-zinc-400 text-[11px]">Costo: $</span>
                                <input type="number" value="${prod.costo_proveedor}" onchange="actualizarCostoProducto('${prod.id}', this.value)" class="w-24 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-emerald-400 font-semibold focus:outline-none">
                            </div>
                            <span class="text-xs text-zinc-400">Venta: <b class="text-emerald-400">$${prod.precio_venta}</b></span>
                        </div>
                    </li>
                `).join('')
                : `<li class="text-xs text-zinc-500 py-1">Aún no tiene productos cargados de este proveedor.</li>`;

            container.innerHTML += `
                <div class="bg-zinc-950 border border-zinc-800 p-4 rounded-lg mb-4">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h3 class="font-bold text-zinc-100 text-base">${prov.nombre}</h3>
                            <p class="text-xs text-zinc-400">Contacto: ${prov.contacto || 'No especificado'} | Web: ${prov.web || 'No especificada'}</p>
                        </div>
                        <span class="text-xs bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded text-zinc-300">${prodsProv.length} productos</span>
                    </div>
                    <div class="mt-3">
                        <p class="text-xs uppercase text-zinc-500 font-semibold mb-1">Listado de productos comprados:</p>
                        <ul class="divide-y divide-zinc-900">${productosHtml}</ul>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        container.innerHTML = `<p class="text-zinc-500 text-sm">No hay proveedores registrados todavía.</p>`;
    }
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
            listado.innerHTML += `<li class="py-2.5 text-sm font-medium text-zinc-200 flex justify-between items-center"><span>${c.nombre}</span> <span class="text-xs text-zinc-500">Activa</span></li>`;
        });
    } catch (e) {
        listado.innerHTML = `<li class="py-3 text-sm text-zinc-500">No hay categorías.</li>`;
    }
}
