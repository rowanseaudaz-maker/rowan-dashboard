// Configuración de Supabase (Reemplaza con tus credenciales de tu proyecto en Supabase)
const SUPABASE_URL = 'TU_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Listado precargado de nombres masculinos para la regla de negocio
const nombresHombres = ["DANTE", "ENZO", "BRUNO", "MILO", "IAN", "GAEL", "LUCA", "AXEL", "THIAGO", "ENZO", "SANTINO", "MILAN"];
let contadorNombres = 0;

document.addEventListener("DOMContentLoaded", () => {
    verificarConexion();
    cargarProductos();

    document.getElementById("productForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        await procesarNuevoProducto();
    });
});

async function verificarConexion() {
    const statusEl = document.getElementById("status");
    try {
        const { data, error } = await supabase.from('productos').select('id').limit(1);
        if (error) throw error;
        statusEl.textContent = "Conectado a Supabase";
        statusEl.className = "text-xs px-3 py-1 bg-emerald-950 border border-emerald-800 rounded text-emerald-400";
    } catch (err) {
        statusEl.textContent = "Error de Conexión (Revisar Credenciales)";
        statusEl.className = "text-xs px-3 py-1 bg-rose-950 border border-rose-800 rounded text-rose-400";
    }
}

async function procesarNuevoProducto() {
    const proveedor = document.getElementById("proveedor").value;
    const descProveedor = document.getElementById("desc_proveedor").value;
    const categoria = document.getElementById("categoria").value;
    const color = document.getElementById("color").value;
    const costoProv = parseFloat(document.getElementById("costo_prov").value);
    const costoPack = parseFloat(document.getElementById("costo_pack").value) || 0;
    const precioVenta = parseFloat(document.getElementById("precio_venta").value);
    const peso = parseFloat(document.getElementById("peso").value) || 0;
    const medidas = document.getElementById("medidas").value;

    // 1. Generación de SKU: Primeras 3 letras de la categoría en mayúsculas + número secuencial
    const prefix = categoria.substring(0, 3).toUpperCase();
    
    // Consultar cuántos productos hay en esta categoría para el correlativo
    const { count, error: countError } = await supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .eq('categoria', categoria);

    const numeroSecuencial = (count || 0) + 1;
    const sku = `${prefix}-${String(numeroSecuencial).padStart(3, '0')}`;

    // 2. Nomenclatura Automática por Categoría (Ej: MOCHILA DANTE)
    let nombreBaseSingular = categoria.toUpperCase().slice(0, -1); // Remueve la 's' final aproximada
    if (categoria === "Mochilas") nombreBaseSingular = "MOCHILA";
    if (categoria === "Riñoneras") nombreBaseSingular = "RIÑONERA";
    if (categoria === "Neceres") nombreBaseSingular = "NECESER";
    if (categoria === "Relojes") nombreBaseSingular = "RELOJ";
    if (categoria === "Cintos") nombreBaseSingular = "CINTO";
    if (categoria === "Tote Bags") nombreBaseSingular = "TOTE BAG";

    const nombreHombre = nombresHombres[contadorNombres % nombresHombres.length];
    contadorNombres++;

    const nombreRowan = `${nombreBaseSingular} ${nombreHombre}`;

    // 3. Guardar en Supabase
    const { data, error } = await supabase.from('productos').insert([
        {
            sku,
            categoria,
            nombre_rowan: nombreRowan,
            descripcion_proveedor: descProveedor,
            color,
            costo_proveedor: costoProv,
            costo_packaging: costoPack,
            precio_venta: precioVenta,
            peso_kg: peso,
            medidas
        }
    ]);

    if (error) {
        alert("Error al guardar: " + error.message);
    } else {
        alert(`¡Artículo generado con éxito!\nSKU: ${sku}\nNombre: ${nombreRowan}`);
        document.getElementById("productForm").reset();
        cargarProductos();
    }
}

async function cargarProductos() {
    const tbody = document.getElementById("productTableBody");
    tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-zinc-500">Cargando catálogo...</td></tr>`;

    const { data, error } = await supabase.from('productos').select('*').order('created_at', { ascending: false });

    if (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-rose-500">Error al cargar datos</td></tr>`;
        return;
    }

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-zinc-500">No hay productos cargados todavía.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    data.forEach(p => {
        const costoReal = p.costo_proveedor + (p.costo_packaging || 0);
        tbody.innerHTML += `
            <tr class="hover:bg-zinc-800/50 transition">
                <td class="py-3 font-mono text-xs text-zinc-400">${p.sku}</td>
                <td class="py-3 font-medium text-zinc-200">${p.nombre_rowan} <span class="text-xs text-zinc-500 block">${p.color || ''}</span></td>
                <td class="py-3 text-zinc-400">${p.categoria}</td>
                <td class="py-3 text-zinc-300">$${costoReal.toLocaleString()}</td>
                <td class="py-3 font-semibold text-emerald-400">$${p.precio_venta.toLocaleString()}</td>
            </tr>
        `;
    });
}
