const SUPABASE_URL = 'https://gvsizeknwxihjvqpcjgc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tSzqG168VZGmn_mTSndu1w_bNPlAR2B';

// Inicialización limpia compatible con el SDK v2 de Supabase
const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
});

const nombresHombres = ["DANTE", "ENZO", "BRUNO", "MILO", "IAN", "GAEL", "LUCA", "AXEL", "THIAGO", "SANTINO", "MILAN"];
let contadorNombres = 0;

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
        statusEl.textContent = "Conectado a Supabase";
        statusEl.className = "text-xs px-3 py-1 bg-emerald-950 border border-emerald-800 rounded text-emerald-400";
    }

    cargarSelectores();
    cargarProductos();
    cargarProveedoresFicha();
    cargarCategoriasGestion();

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

async function cargarSelectores() {
    try {
        const provSelect = document.getElementById("proveedor_select");
        if (provSelect) {
            const { data: provs } = await supabaseClient.from('proveedores').select('*').order('nombre');
            provSelect.innerHTML = provs && provs.length > 0 ? '<option value="">Selecciona un proveedor</option>' : '<option value="">No hay proveedores cargados</option>';
            provs?.forEach(p => {
                provSelect.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
            });
        }

        const catSelect = document.getElementById("categoria_select");
        if (catSelect) {
            const { data: cats } = await supabaseClient.from('categorias').select('*').order('nombre');
            catSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
            cats?.forEach(c => {
                catSelect.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
            });
        }
    } catch (e) {
        console.error("Error cargando selectores", e);
    }
}

async function guardarProveedor() {
    const nombre = document.getElementById("prov_nombre").value;
    const contacto = document.getElementById("prov_contacto").value;
    const web = document.getElementById("prov_web").value;

    const { error } = await supabaseClient.from('proveedores').insert([{ nombre, contacto, web }]);
    if (error) {
        alert("Error al guardar proveedor: " + error.message);
    } else {
        alert("¡Proveedor guardado con éxito!");
        document.getElementById("proveedorForm").reset();
        cargarSelectores();
        cargarProveedoresFicha();
    }
}

async function guardarCategoria() {
    const nombre = document.getElementById("cat_nombre").value;
    const { error } = await supabaseClient.from('categorias').insert([{ nombre }]);
    if (error) {
        alert("Error al guardar categoría: " + error.message);
    } else {
        alert("¡Categoría creada con éxito!");
        document.getElementById("categoriaForm").reset();
        cargarSelectores();
        cargarCategoriasGestion();
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

    const prefix = categoria.substring(0, 3).toUpperCase();
    const { count } = await supabaseClient.from('productos').select('*', { count: 'exact', head: true }).eq('categoria', categoria);
    const sku = `${prefix}-${String((count || 0) + 1).padStart(3, '0')}`;

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

    const { error } = await supabaseClient.from('productos').insert([{
        sku, categoria, nombre_rowan: nombreRowan, descripcion_proveedor: descProveedor,
        proveedor_id: proveedorId, color, costo_proveedor: costoProv, costo_packaging: costoPack,
        precio_venta: precioVenta, peso_kg: peso, alto_cm: alto, ancho_cm: ancho, profundidad_cm: prof
    }]);

    if (error) {
        alert("Error al guardar: " + error.message);
    } else {
        alert(`¡Artículo generado con éxito!\nSKU: ${sku}\nNombre: ${nombreRowan}`);
        document.getElementById("productForm").reset();
        cargarProductos();
        cargarProveedoresFicha();
    }
}

async function cargarProductos() {
    const tbody = document.getElementById("productTableBody");
    if (!tbody) return;
    
    const { data, error } = await supabaseClient.from('productos').select('*, proveedores(nombre)').order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-zinc-500">No hay productos cargados.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    data.forEach(p => {
        const costoReal = p.costo_proveedor + (p.costo_packaging || 0);
        const provNombre = p.proveedores?.nombre || 'Sin proveedor';
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
}

async function cargarProveedoresFicha() {
    const container = document.getElementById("proveedoresListado");
    if (!container) return;

    const { data: provs } = await supabaseClient.from('proveedores').select('*, productos(*)').order('nombre');

    if (!provs || provs.length === 0) {
        container.innerHTML = `<p class="text-zinc-500 text-sm">No hay proveedores registrados todavía.</p>`;
        return;
    }

    container.innerHTML = "";
    provs.forEach(prov => {
        let productosHtml = prov.productos && prov.productos.length > 0 
            ? prov.productos.map(prod => `<li class="text-xs text-zinc-300 py-1 flex justify-between border-b border-zinc-800/50"><span><b>${prod.sku}</b> - ${prod.nombre_rowan} (${prod.color || 'Único'})</span> <span class="text-emerald-400">$${prod.precio_venta}</span></li>`).join('')
            : `<li class="text-xs text-zinc-500 py-1">Aún no tiene productos cargados de este proveedor.</li>`;

        container.innerHTML += `
            <div class="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-bold text-zinc-100 text-base">${prov.nombre}</h3>
                        <p class="text-xs text-zinc-400">Contacto: ${prov.contacto || 'No especificado'} | Web: ${prov.web || 'No especificada'}</p>
                    </div>
                    <span class="text-xs bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded text-zinc-300">${prov.productos?.length || 0} productos</span>
                </div>
                <div class="mt-3">
                    <p class="text-xs uppercase text-zinc-500 font-semibold mb-1">Productos comprados a este proveedor:</p>
                    <ul class="divide-y divide-zinc-900">${productosHtml}</ul>
                </div>
            </div>
        `;
    });
}

async function cargarCategoriasGestion() {
    const listado = document.getElementById("categoriasListado");
    if (!listado) return;

    const { data: cats } = await supabaseClient.from('categorias').select('*').order('nombre');

    if (!cats || cats.length === 0) {
        listado.innerHTML = `<li class="py-3 text-sm text-zinc-500">No hay categorías.</li>`;
        return;
    }

    listado.innerHTML = "";
    cats.forEach(c => {
        listado.innerHTML += `<li class="py-2.5 text-sm font-medium text-zinc-200 flex justify-between items-center"><span>${c.nombre}</span> <span class="text-xs text-zinc-500">Activa</span></li>`;
    });
}
