// Credenciales ROWAN - Producción
const SUPABASE_URL = 'https://gvsizeknwxihjvqpcjgc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tSzqG168VZGmn_mTSndu1w_bNPlAR2B';

const nombresHombres = ["DANTE", "ENZO", "BRUNO", "MILO", "IAN", "GAEL", "LUCA", "AXEL", "THIAGO", "SANTINO", "MILAN"];
let contadorNombres = 0;

// Navegación inmediata de solapas
window.cambiarPestana = function(pestana) {
    const secProductos = document.getElementById("seccion-productos");
    const secProveedores = document.getElementById("seccion-proveedores");
    const secCategorias = document.getElementById("seccion-categorias");

    if (secProductos) secProductos.classList.add("hidden");
    if (secProveedores) secProveedores.classList.add("hidden");
    if (secCategorias) secCategorias.classList.add("hidden");

    const btnProductos = document.getElementById("btn-productos");
    const btnProveedores = document.getElementById("btn-proveedores");
    const btnCategorias = document.getElementById("btn-categorias");

    if (btnProductos) btnProductos.className = "px-3 py-1.5 text-xs font-medium rounded text-zinc-400 hover:text-zinc-200 transition";
    if (btnProveedores) btnProveedores.className = "px-3 py-1.5 text-xs font-medium rounded text-zinc-400 hover:text-zinc-200 transition";
    if (btnCategorias) btnCategorias.className = "px-3 py-1.5 text-xs font-medium rounded text-zinc-400 hover:text-zinc-200 transition";

    const targetSec = document.getElementById(`seccion-${pestana}`);
    const targetBtn = document.getElementById(`btn-${pestana}`);

    if (targetSec) targetSec.classList.remove("hidden");
    if (targetBtn) targetBtn.className = "px-3 py-1.5 text-xs font-medium rounded bg-zinc-800 text-zinc-100 transition";
};

document.addEventListener("DOMContentLoaded", () => {
    const statusEl = document.getElementById("status");
    if (statusEl) {
        statusEl.textContent = "Sistema Online";
        statusEl.className = "text-xs px-3 py-1 bg-emerald-950 border border-emerald-800 rounded text-emerald-400";
    }

    cargarSelectores();
    cargarProductos();
    cargarProveedoresFicha();
    cargarCategoriasGestion();

    // Formularios
    const productForm = document.getElementById("productForm");
    if (productForm) {
        productForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await procesarNuevoProducto();
        });
    }

    const proveedorForm = document.getElementById("proveedorForm");
    if (proveedorForm) {
        proveedorForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await guardarProveedor();
        });
    }

    const categoriaForm = document.getElementById("categoriaForm");
    if (categoriaForm) {
        categoriaForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await guardarCategoria();
        });
    }
});

// Petición HTTP nativa ultra segura
async function dbQuery(tabla, metodo = 'GET', data = null, queryParams = '') {
    const url = `${SUPABASE_URL}/rest/v1/${tabla}${queryParams}`;
    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    const options = { method: metodo, headers: headers };
    if (data && (metodo === 'POST' || metodo === 'PATCH')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || response.statusText);
        }
        if (metodo === 'DELETE') return true;
        const result = await response.json();
        return result;
    } catch (err) {
        console.error(`Error en DB (${tabla}):`, err);
        throw err;
    }
}

async function cargarSelectores() {
    try {
        const provs = await dbQuery('proveedores', 'GET', null, '?select=*');
        const provSelect = document.getElementById("proveedor_select");
        if (provSelect) {
            provSelect.innerHTML = provs && provs.length > 0 ? '<option value="">Selecciona un proveedor</option>' : '<option value="">No hay proveedores cargados</option>';
            provs?.forEach(p => {
                provSelect.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
            });
        }

        const cats = await dbQuery('categorias', 'GET', null, '?select=*');
        const catSelect = document.getElementById("categoria_select");
        if (catSelect) {
            catSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
            cats?.forEach(c => {
                catSelect.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
            });
        }
    } catch (e) {
        console.error("Error al cargar selectores", e);
    }
}

async function guardarProveedor() {
    const nombre = document.getElementById("prov_nombre").value.trim();
    const contacto = document.getElementById("prov_contacto").value.trim();
    const web = document.getElementById("prov_web").value.trim();

    if (!nombre) {
        alert("El nombre del proveedor es obligatorio.");
        return;
    }

    try {
        await dbQuery('proveedores', 'POST', { nombre, contacto, web });
        alert("¡Proveedor guardado con éxito!");
        document.getElementById("proveedorForm").reset();
        cargarSelectores();
        cargarProveedoresFicha();
    } catch (err) {
        alert("Error al guardar proveedor: " + err.message);
    }
}

async function guardarCategoria() {
    const nombre = document.getElementById("cat_nombre").value.trim();
    if (!nombre) {
        alert("El nombre de la categoría es obligatorio.");
        return;
    }

    try {
        await dbQuery('categorias', 'POST', { nombre });
        alert("¡Categoría creada con éxito!");
        document.getElementById("categoriaForm").reset();
        cargarSelectores();
        cargarCategoriasGestion();
    } catch (err) {
        alert("Error al guardar categoría: " + err.message);
    }
}

async function procesarNuevoProducto() {
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
        const prefix = categoria.substring(0, 3).toUpperCase();
        const existing = await dbQuery('productos', 'GET', null, `?select=id&categoria=eq.${categoria}`);
        const sku = `${prefix}-${String((existing ? existing.length : 0) + 1).padStart(3, '0')}`;

        let nombreBaseSingular = categoria.toUpperCase().slice(0, -1);
        if (categoria === "Mochilas") nombreBaseSingular = "MOCHILA";
        if (categoria === "Riñoneras") nombreBaseSingular = "RIÑONERA";
        if (categoria === "Neceres") nombreBaseSingular = "NECESER";
        if (categoria === "Relojes") nombreBaseSingular = "RELOJ";
        if (categoria === "Cintos") nombreBaseSingular = "CINTO";
        if (categoria === "Tote Bags") nombreBaseSingular = "TOTE BAG";

        const nombreHombre = nombresHombres[contadorNombres % nombresHombres.length];
        contadorNombres++;
        const nombreRowan = `${nombreBaseSingular} ${nombreHombre}`;

        await dbQuery('productos', 'POST', {
            sku, categoria, nombre_rowan: nombreRowan, descripcion_proveedor: descProveedor,
            proveedor_id: proveedorId, color, costo_proveedor: costoProv, costo_packaging: costoPack,
            precio_venta: precioVenta, peso_kg: peso, alto_cm: alto, ancho_cm: ancho, profundidad_cm: prof
        });

        alert(`¡Artículo generado con éxito!\nSKU: ${sku}\nNombre: ${nombreRowan}`);
        document.getElementById("productForm").reset();
        cargarProductos();
        cargarProveedoresFicha();
    } catch (err) {
        alert("Error al guardar producto: " + err.message);
    }
}

async function cargarProductos() {
    const tbody = document.getElementById("productTableBody");
    if (!tbody) return;
    
    try {
        const data = await dbQuery('productos', 'GET', null, '?select=*');
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-zinc-500">No hay productos cargados.</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        data.forEach(p => {
            const costoReal = p.costo_proveedor + (p.costo_packaging || 0);
            tbody.innerHTML += `
                <tr class="hover:bg-zinc-800/50 transition">
                    <td class="py-3 font-mono text-xs text-zinc-400">${p.sku}</td>
                    <td class="py-3 font-medium text-zinc-200">${p.nombre_rowan} <span class="text-xs text-zinc-500 block">${p.color || ''} | ${p.categoria}</span></td>
                    <td class="py-3 text-zinc-400 text-xs">Proveedor ID: ${p.proveedor_id}</td>
                    <td class="py-3 text-zinc-300">$${costoReal.toLocaleString()}</td>
                    <td class="py-3 font-semibold text-emerald-400">$${p.precio_venta.toLocaleString()}</td>
                </tr>
            `;
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-zinc-500">No hay productos cargados.</td></tr>`;
    }
}

async function cargarProveedoresFicha() {
    const container = document.getElementById("proveedoresListado");
    if (!container) return;

    try {
        const provs = await dbQuery('proveedores', 'GET', null, '?select=*');
        if (!provs || provs.length === 0) {
            container.innerHTML = `<p class="text-zinc-500 text-sm">No hay proveedores registrados todavía.</p>`;
            return;
        }

        container.innerHTML = "";
        provs.forEach(prov => {
            container.innerHTML += `
                <div class="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h3 class="font-bold text-zinc-100 text-base">${prov.nombre}</h3>
                            <p class="text-xs text-zinc-400">Contacto: ${prov.contacto || 'No especificado'} | Web: ${prov.web || 'No especificada'}</p>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        container.innerHTML = `<p class="text-zinc-500 text-sm">No hay proveedores registrados todavía.</p>`;
    }
}

async function cargarCategoriasGestion() {
    const listado = document.getElementById("categoriasListado");
    if (!listado) return;

    try {
        const cats = await dbQuery('categorias', 'GET', null, '?select=*');
        if (!cats || cats.length === 0) {
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
