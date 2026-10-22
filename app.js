// Sistema ROWAN - Gestión Integral Avanzada

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
    localStorage.setItem('rowan_nombres', JSON.stringify([
        "DANTE", "ENZO", "BRUNO", "MILO", "IAN", "GAEL", "LUCA", "AXEL", "THIAGO", "SANTINO", "MILAN"
    ]));
}

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

// --- PROVEEDORES: CREAR, EDITAR ---
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
            if (prov) {
                prov.nombre = nombre;
                prov.contacto = contacto;
                prov.web = web;
            }
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

// --- CATEGORÍAS: CREAR, EDITAR Y SKU INFORMATIVO ---
function guardarCategoria() {
    const editId = document.getElementById("cat_edit_id").value;
    const nombre = document.getElementById("cat_nombre").value.trim();

    if (!nombre) return alert("El nombre de la categoría es obligatorio.");

    try {
        let cats = JSON.parse(localStorage.getItem('rowan_categorias')) || [];
        if (editId) {
            const cat = cats.find(c => c.id === editId);
            if (cat) cat.nombre = nombre;
            alert("¡Categoría actualizada con éxito!");
        } else {
            if (cats.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
                alert("La categoría ya existe.");
                return;
            }
            cats.push({ id: 'cat_' + Date.now(), nombre });
            alert("¡Categoría creada con éxito!");
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
        listado.innerHTML = `<li class="py-3 text-sm text-zinc-500">No hay categorías.</li>`;
    }
}

// --- NOMBRES: GESTIÓN E IMPORTACIÓN DE EXCEL/TXT ---
function guardarNombreNuevo() {
    const inputNombre = document.getElementById("nombre_nuevo").value.trim().toUpperCase();
    if (!inputNombre) return;

    try {
        let nombres = JSON.parse(localStorage.getItem('rowan_nombres')) || [];
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
        if (nombres.length === 0) nombres = ["ROWAN"];
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
        listado.innerHTML = `<li class="py-3 text-sm text-zinc-500">No hay nombres cargados.</li>`;
    }
}

window.procesarArchivoNombres = function() {
    const input = document.getElementById("archivoNombres");
    if (!input.files || input.files.length === 0) {
        alert("Por favor selecciona un archivo CSV o TXT.");
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const contenido = e.target.result;
            const lineas = contenido.split(/\r\n|\n/);
            let nuevosNombres = [];

            lineas.forEach(linea => {
                // Si es CSV tomamos la primera columna, si es TXT tomamos la línea entera
                let columnas = linea.split(/[,;\t]/);
                let val = columnas[0] ? columnas[0].replace(/["']/g, "").trim().toUpperCase() : "";
                if (val && val !== "NOMBRE" && val !== "NOMBRES") {
                    nuevosNombres.push(val);
                }
            });

            if (nuevosNombres.length > 0) {
                localStorage.setItem('rowan_nombres', JSON.stringify(nuevosNombres));
                localStorage.setItem('rowan_indice_nombre', '0'); // Reiniciar contador
                cargarNombresGestion();
                alert(`¡Se importaron ${nuevosNombres.length} nombres correctamente respetando el orden del archivo!`);
                input.value = "";
            } else {
                alert("No se encontraron nombres válidos en el archivo.");
            }
        } catch (err) {
            alert("Error al leer el archivo: " + err.message);
        }
    };

    reader.readAsText(file);
}

// --- PRODUCTOS Y COSTOS ---
function procesarNuevoProducto() {
    const proveedorId = document.getElementById("proveedor_select").value;
    const descProveedor = document.getElementById("desc_proveedor").value;
    const categoria = document.getElementById("categoria_select").value;
    const color = document.getElementById("color").value;
    const costoProv = parseFloat(document.getElementById("costo_prov").value);
    const costoPack = parseFloat(document.getElementById("costo_pack").value) || 0;
    const precioVenta = parseFloat(document.getElementById("precio_venta").value);

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

        let nombres = JSON.parse(localStorage.getItem('rowan_nombres')) || ["ROWAN"];
        let indiceContador = parseInt(localStorage.getItem('rowan_indice_nombre') || '0', 10);
        const nombreElegido = nombres[indiceContador % nombres.length];
        
        localStorage.setItem('rowan_indice_nombre', (indiceContador + 1).toString());

        const nombreRowan = `${nombreBaseSingular} ${nombreElegido}`;

        const nuevoProd = {
            id: 'prod_' + Date.now(),
            sku, categoria, nombre_rowan: nombreRowan, descripcion_proveedor: descProveedor,
            proveedor_id: proveedorId, color, costo_proveedor: costoProv, costo_packaging: costoPack,
            precio_venta: precioVenta
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
                    <li class="text-xs text-zinc-300 py-3 border-b border-zinc-800/50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
                        <div class="flex flex-col md:flex-row gap-2 w-full xl:w-auto">
                            <!-- Recuadro 1: Descripción del Proveedor -->
                            <div class="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded">
                                <span class="text-[10px] uppercase text-zinc-400 block font-semibold">Descripción Proveedor</span>
                                <span class="font-medium text-zinc-200">${prod.descripcion_proveedor}</span>
                            </div>
                            <!-- Recuadro 2: Nombre ROWAN y Variante -->
                            <div class="bg-zinc-900 border border-emerald-950/60 px-3 py-2 rounded">
                                <span class="text-[10px] uppercase text-emerald-500/80 block font-semibold">Artículo ROWAN (${prod.sku})</span>
                                <span class="font-bold text-zinc-100">${prod.nombre_rowan}</span> <span class="text-zinc-400">(${prod.color || 'Único'})</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 justify-between w-full xl:w-auto">
                            <div class="flex items-center gap-1 bg-zinc-900 px-2.5 py-1.5 rounded border border-zinc-800">
                                <span class="text-zinc-400 text-[11px]">Costo: $</span>
                                <input type="number" value="${prod.costo_proveedor}" onchange="actualizarCostoProducto('${prod.id}', this.value)" class="w-20 bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-emerald-400 font-semibold focus:outline-none">
                            </div>
                            <span class="text-xs text-zinc-400">Venta: <b class="text-emerald-400">$${prod.precio_venta}</b></span>
                        </div>
                    </li>
                `).join('')
                : `<li class="text-xs text-zinc-500 py-1">Aún no tiene productos cargados de este proveedor.</li>`;

            container.innerHTML += `
                <div class="bg-zinc-950 border border-zinc-800 p-4 rounded-lg mb-4">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h3 class="font-bold text-zinc-100 text-base">${prov.nombre}</h3>
                            <p class="text-xs text-zinc-400">Contacto: ${prov.contacto || 'No especificado'} | Web: ${prov.web || 'No especificada'}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded text-zinc-300">${prodsProv.length} productos</span>
                            <button onclick="editarProveedor('${prov.id}')" class="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 rounded hover:bg-zinc-700 transition">Editar</button>
                        </div>
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
