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
if (!localStorage.getItem('rowan_colores')) {
    localStorage.setItem('rowan_colores', JSON.stringify([
        "Negro", "Marrón", "Plateado", "Dorado", "Azul", "Gris", "Verde", "Blanco", "Rojo", "Camel"
    ]));
}

window.cambiarPestana = function(pestana) {
    const secciones = ["productos", "proveedores", "categorias", "nombres", "colores"];
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
    cargarColoresGestion();
    actualizarSelectNombresProducto();
    actualizarSelectColoresProducto();

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

// --- GESTIÓN DE COLORES EDITABLES ---
function actualizarSelectColoresProducto() {
    const select = document.getElementById("color");
    if (!select) return;

    try {
        const colores = JSON.parse(localStorage.getItem('rowan_colores')) || [];
        select.innerHTML = '<option value="">Sin color / Único</option>';
        colores.forEach(col => {
            select.innerHTML += `<option value="${col}">${col}</option>`;
        });
    } catch (e) {
        console.error("Error al actualizar colores", e);
    }
}

function guardarColorNuevo() {
    const input = document.getElementById("color_nuevo");
    const nuevoColor = input.value.trim();
    if (!nuevoColor) return;

    try {
        let colores = JSON.parse(localStorage.getItem('rowan_colores')) || [];
        if (colores.some(c => c.toLowerCase() === nuevoColor.toLowerCase())) {
            alert("Este color ya existe en la lista.");
            return;
        }
        colores.push(nuevoColor);
        localStorage.setItem('rowan_colores', JSON.stringify(colores));
        input.value = "";
        cargarColoresGestion();
        actualizarSelectColoresProducto();
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
        actualizarSelectColoresProducto();
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

// --- ACTUALIZAR SELECT DE NOMBRES EN CARGA DE PRODUCTOS (TACHANDO USADOS) ---
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

        select.innerHTML = '<option value="">Automático (Siguiente disponible en orden)</option>';
        nombres.forEach(nom => {
            const usado = nombresUsadosSet.has(nom.toUpperCase());
            const etiqueta = usado ? `${nom} (USADO / OCUPADO)` : nom;
            select.innerHTML += `<option value="${nom}" ${usado ? 'class="text-zinc-500 bg-zinc-900"' : ''}>${etiqueta}</option>`;
        });
    } catch (e) {
        console.error("Error al actualizar nombres de producto", e);
    }
}

// --- PROVEEDORES ---
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

window.filtrarProveedores = function() {
    cargarProveedoresFicha();
}

// --- CATEGORÍAS ---
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

// --- NOMBRES ---
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
        alert("Por favor selecciona un archivo (.xlsx, .csv o .txt).");
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
        alert(`¡Se importaron ${nuevosNombres.length} nombres correctamente respetando el orden del archivo!`);
        document.getElementById("archivoNombres").value = "";
    } else {
        alert("No se encontraron nombres válidos en el archivo.");
    }
}

// --- PRODUCTOS: CREAR, EDITAR, ELIMINAR, BUSCAR ---
function procesarNuevoProducto() {
    const editId = document.getElementById("prod_edit_id").value;
    const proveedorId = document.getElementById("proveedor_select").value;
    const descProveedor = document.getElementById("desc_proveedor").value;
    const categoria = document.getElementById("categoria_select").value;
    const color = document.getElementById("color").value;
    const nombreManualSeleccionado = document.getElementById("nombre_hombre_select").value;
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
        let productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];

        if (editId) {
            const prod = productos.find(p => p.id === editId);
            if (prod) {
                prod.proveedor_id = proveedorId;
                prod.descripcion_proveedor = descProveedor;
                prod.categoria = categoria;
                prod.color = color;
                prod.costo_proveedor = costoProv;
                prod.costo_packaging = costoPack;
                prod.precio_venta = precioVenta;
                prod.peso_kg = peso;
                prod.alto_cm = alto;
                prod.ancho_cm = ancho;
                prod.profundidad_cm = prof;
            }
            localStorage.setItem('rowan_productos', JSON.stringify(productos));
            alert("¡Artículo actualizado con éxito!");
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
                proveedor_id: proveedorId, color, costo_proveedor: costoProv, costo_packaging: costoPack,
                precio_venta: precioVenta, peso_kg: peso, alto_cm: alto, ancho_cm: ancho, profundidad_cm: prof
            };

            productos.unshift(nuevoProd);
            localStorage.setItem('rowan_productos', JSON.stringify(productos));
            alert(`¡Artículo generado con éxito!\nSKU: ${sku}\nNombre: ${nombreRowan}`);
            document.getElementById("productForm").reset();
        }

        cargarProductos();
        cargarProveedoresFicha();
        cargarNombresGestion();
        actualizarSelectNombresProducto();
    } catch (err) {
        alert("Error al guardar producto: " + err.message);
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
            document.getElementById("categoria_select").value = prod.categoria;
            document.getElementById("color").value = prod.color || "";
            document.getElementById("costo_prov").value = prod.costo_proveedor;
            document.getElementById("costo_pack").value = prod.costo_packaging || 1000;
            document.getElementById("precio_venta").value = prod.precio_venta;
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
}

window.eliminarProducto = function(id) {
    if (!confirm("¿Estás seguro de eliminar este producto del catálogo?")) return;
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

window.filtrarProductos = function() {
    cargarProductos();
}

function cargarProductos() {
    const tbody = document.getElementById("productTableBody");
    if (!tbody) return;
    
    try {
        const productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
        const proveedores = JSON.parse(localStorage.getItem('rowan_proveedores')) || [];
        const filtro = document.getElementById("buscadorProductos") ? document.getElementById("buscadorProductos").value.toLowerCase() : "";

        const productosFiltrados = productos.filter(p => {
            const matchNombre = p.nombre_rowan.toLowerCase().includes(filtro);
            const matchDesc = p.descripcion_proveedor.toLowerCase().includes(filtro);
            const matchSku = p.sku.toLowerCase().includes(filtro);
            return matchNombre || matchDesc || matchSku;
        });

        if (productosFiltrados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-zinc-500">No se encontraron productos.</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        productosFiltrados.forEach(p => {
            const costoReal = p.costo_proveedor + (p.costo_packaging || 0);
            const provObj = proveedores.find(pr => pr.id === p.proveedor_id);
            const provNombre = provObj ? provObj.nombre : 'Sin proveedor';

            // Formatear peso y medidas para que se vea limpio
            let medidasTexto = [];
            if (p.peso_kg) medidasTexto.push(`${p.peso_kg} kg`);
            if (p.alto_cm || p.ancho_cm || p.profundidad_cm) {
                let dims = `${p.alto_cm || '-'}/${p.ancho_cm || '-'}/${p.profundidad_cm || '-'}`;
                medidasTexto.push(`[${dims} cm]`);
            }
            const infoMedidas = medidasTexto.length > 0 ? medidasTexto.join(' ') : '<span class="text-zinc-600">No especificado</span>';

            tbody.innerHTML += `
                <tr class="hover:bg-zinc-800/50 transition">
                    <td class="py-3 font-mono text-xs text-zinc-400">${p.sku}</td>
                    <td class="py-3 font-medium text-zinc-200">${p.nombre_rowan} <span class="text-xs text-zinc-500 block">${p.color ? p.color + ' | ' : ''}${p.categoria}</span></td>
                    <td class="py-3 text-zinc-400 text-xs">${provNombre}</td>
                    <td class="py-3 text-zinc-300">$${costoReal.toLocaleString()}</td>
                    <td class="py-3 font-semibold text-emerald-400">$${p.precio_venta.toLocaleString()}</td>
                    <td class="py-3 text-xs text-zinc-400 font-mono">${infoMedidas}</td>
                    <td class="py-3 text-right">
                        <button onclick="editarProducto('${p.id}')" class="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 rounded hover:bg-zinc-700 transition mr-1">Editar</button>
                        <button onclick="eliminarProducto('${p.id}')" class="text-xs bg-rose-950 text-rose-400 border border-rose-800 px-2.5 py-1 rounded hover:bg-rose-900 transition">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-zinc-500">No hay productos cargados.</td></tr>`;
    }
}

// --- FICHAS DE PROVEEDORES ---
function cargarProveedoresFicha() {
    const container = document.getElementById("proveedoresListado");
    if (!container) return;

    try {
        const provs = JSON.parse(localStorage.getItem('rowan_proveedores')) || [];
        const productos = JSON.parse(localStorage.getItem('rowan_productos')) || [];
        const filtroProv = document.getElementById("buscadorProveedores") ? document.getElementById("buscadorProveedores").value.toLowerCase() : "";

        const provsFiltrados = provs.filter(p => p.nombre.toLowerCase().includes(filtroProv));

        if (provsFiltrados.length === 0) {
            container.innerHTML = `<p class="text-zinc-500 text-sm">No hay proveedores registrados todavía.</p>`;
            return;
        }

        container.innerHTML = "";
        provsFiltrados.forEach(prov => {
            const prodsProv = productos.filter(p => p.proveedor_id === prov.id);
            let filasTabla = prodsProv.length > 0 
                ? prodsProv.map(prod => `
                    <tr class="border-b border-zinc-900 hover:bg-zinc-900/40 transition">
                        <td class="py-2.5 px-3 font-mono text-xs text-zinc-400">${prod.sku}</td>
                        <td class="py-2.5 px-3 text-zinc-300">${prod.descripcion_proveedor}</td>
                        <td class="py-2.5 px-3 font-semibold text-zinc-100">${prod.nombre_rowan} <span class="text-xs text-zinc-500 font-normal">(${prod.color || 'Único'})</span></td>
                        <td class="py-2.5 px-3">
                            <div class="flex items-center gap-1">
                                <span class="text-zinc-400 text-xs">$</span>
                                <input type="number" value="${prod.costo_proveedor}" onchange="actualizarCostoProducto('${prod.id}', this.value)" class="w-24 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-emerald-400 font-semibold focus:outline-none">
                            </div>
                        </td>
                        <td class="py-2.5 px-3 font-semibold text-emerald-400">$${prod.precio_venta.toLocaleString()}</td>
                    </tr>
                `).join('')
                : `<tr><td colspan="5" class="py-4 text-center text-zinc-500 text-xs">Aún no tiene productos cargados de este proveedor.</td></tr>`;

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
                    <div class="mt-3 overflow-x-auto">
                        <table class="w-full text-left text-xs">
                            <thead class="border-b border-zinc-800 text-zinc-500 uppercase">
                                <tr>
                                    <th class="pb-2 px-3">SKU</th>
                                    <th class="pb-2 px-3">Descripción Proveedor</th>
                                    <th class="pb-2 px-3">Artículo ROWAN</th>
                                    <th class="pb-2 px-3">Costo Prov.</th>
                                    <th class="pb-2 px-3">Venta</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filasTabla}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        container.innerHTML = `<p class="text-zinc-500 text-sm">No hay proveedores registrados todavía.</p>`;
    }
}
