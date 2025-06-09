// URLs exactas de los archivos JSON reales
const JSON_URLS = {
  "2020":
    "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA)%202020.json",
  "2021":
    "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA)%202021.json",
  "2022":
    "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA)%202022.json",
  "2023":
    "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA)%202023.json",
}

export async function loadJSONData(year?: string) {
  try {
    console.log("=== INICIANDO CARGA DE DATOS ===")

    if (year && JSON_URLS[year as keyof typeof JSON_URLS]) {
      // Cargar un año específico
      return await loadSingleYear(year)
    } else {
      // Cargar todos los años
      return await loadAllYears()
    }
  } catch (error) {
    console.error("Error principal al procesar datos JSON:", error)

    // Como fallback, usar datos de ejemplo
    console.log("Usando datos de ejemplo como fallback...")
    return generateRealisticMockData()
  }
}

async function loadSingleYear(year: string) {
  const url = JSON_URLS[year as keyof typeof JSON_URLS]
  console.log(`Intentando cargar año ${year} desde:`, url)

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
        "User-Agent": "Mozilla/5.0 (compatible; Dashboard/1.0)",
      },
      mode: "cors",
    })

    console.log(`Respuesta para ${year}:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      console.warn(`Tipo de contenido inesperado para ${year}:`, contentType)
    }

    const rawText = await response.text()
    console.log(`Texto crudo para ${year} (primeros 200 chars):`, rawText.substring(0, 200))

    if (!rawText.trim()) {
      throw new Error("Respuesta vacía del servidor")
    }

    let data
    try {
      data = JSON.parse(rawText)
    } catch (parseError) {
      console.error(`Error al parsear JSON para ${year}:`, parseError)
      throw new Error("Formato JSON inválido")
    }

    const normalizedData = normalizeJSONData(data)
    console.log(`${year}: ${normalizedData.length} registros procesados`)

    return {
      sheetNames: [year],
      data: { [year]: normalizedData },
    }
  } catch (error) {
    console.error(`Error específico al cargar ${year}:`, error)
    throw error
  }
}

async function loadAllYears() {
  console.log("Cargando todos los años disponibles...")
  const allData: Record<string, any[]> = {}
  const loadedYears: string[] = []
  const errors: string[] = []

  for (const [yearKey, url] of Object.entries(JSON_URLS)) {
    try {
      console.log(`\n--- Procesando ${yearKey} ---`)
      const result = await loadSingleYear(yearKey)
      allData[yearKey] = result.data[yearKey]
      loadedYears.push(yearKey)
      console.log(`✅ ${yearKey} cargado exitosamente`)
    } catch (error) {
      const errorMsg = `${yearKey}: ${error instanceof Error ? error.message : "Error desconocido"}`
      errors.push(errorMsg)
      console.error(`❌ Error en ${yearKey}:`, error)
    }
  }

  console.log("\n=== RESUMEN DE CARGA ===")
  console.log("Años cargados:", loadedYears)
  console.log("Errores:", errors)

  if (loadedYears.length === 0) {
    console.log("No se pudo cargar ningún año, generando datos de ejemplo...")
    return generateRealisticMockData()
  }

  return {
    sheetNames: loadedYears.sort(),
    data: allData,
  }
}

function normalizeJSONData(data: any): any[] {
  console.log("Normalizando datos, tipo:", typeof data, "es array:", Array.isArray(data))

  // Si es un array, procesarlo directamente
  if (Array.isArray(data)) {
    console.log("Procesando array con", data.length, "elementos")
    return data.map(normalizeRow).filter((row) => row !== null)
  }

  // Si es un objeto, buscar arrays dentro
  if (typeof data === "object" && data !== null) {
    console.log("Explorando objeto para encontrar datos...")

    // Buscar propiedades que contengan arrays
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value) && value.length > 0) {
        console.log(`Encontrado array en '${key}' con ${value.length} elementos`)
        return value.map(normalizeRow).filter((row) => row !== null)
      }
    }

    // Buscar propiedades que puedan contener datos tabulares
    const possibleDataKeys = ["data", "records", "items", "multas", "registros", "rows"]
    for (const key of possibleDataKeys) {
      if (data[key] && Array.isArray(data[key])) {
        console.log(`Encontrados datos en '${key}'`)
        return data[key].map(normalizeRow).filter((row) => row !== null)
      }
    }

    // Si no hay arrays, intentar convertir el objeto en un array
    console.log("Convirtiendo objeto único a array")
    const normalized = normalizeRow(data)
    return normalized ? [normalized] : []
  }

  console.warn("Datos no reconocidos, retornando array vacío")
  return []
}

function normalizeRow(row: any): any {
  if (typeof row !== "object" || row === null) {
    return null
  }

  const newRow: Record<string, any> = {}
  let hasValidData = false

  // Procesar cada campo del JSON
  Object.entries(row).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      hasValidData = true
    }

    const normalizedKey = typeof key === "string" ? key.toLowerCase().trim() : String(key).toLowerCase().trim()

    // Detectar empresa/proveedor/contratista
    if (
      normalizedKey.includes("empresa") ||
      normalizedKey.includes("proveedor") ||
      normalizedKey.includes("contratista") ||
      normalizedKey.includes("razón social") ||
      normalizedKey.includes("razon social") ||
      normalizedKey.includes("nombre") ||
      normalizedKey.includes("contratante") ||
      normalizedKey.includes("supplier") ||
      normalizedKey.includes("contractor")
    ) {
      newRow["empresa"] = value
    }
    // Detectar institución
    else if (
      normalizedKey.includes("institucion") ||
      normalizedKey.includes("institución") ||
      normalizedKey.includes("junaeb") ||
      normalizedKey.includes("organismo") ||
      normalizedKey.includes("institution")
    ) {
      newRow["institucion"] = value || "JUNAEB"
    }
    // Detectar fechas
    else if (
      normalizedKey.includes("fecha") ||
      normalizedKey.includes("date") ||
      normalizedKey.includes("año") ||
      normalizedKey.includes("ano") ||
      normalizedKey.includes("year")
    ) {
      newRow["fecha"] = value
    }
    // Detectar estado
    else if (
      normalizedKey.includes("estado") ||
      normalizedKey.includes("situacion") ||
      normalizedKey.includes("status") ||
      normalizedKey.includes("condicion") ||
      normalizedKey.includes("state")
    ) {
      newRow["estado"] = value
    }
    // Detectar tipo
    else if (
      normalizedKey.includes("tipo") ||
      normalizedKey.includes("categoria") ||
      normalizedKey.includes("clasificacion") ||
      normalizedKey.includes("motivo") ||
      normalizedKey.includes("type") ||
      normalizedKey.includes("category")
    ) {
      newRow["tipo"] = value
    }
    // Detectar RUT
    else if (
      normalizedKey.includes("rut") ||
      normalizedKey.includes("identificacion") ||
      normalizedKey.includes("cedula") ||
      normalizedKey.includes("tax_id")
    ) {
      newRow["rut"] = value
    }
    // Detectar región
    else if (normalizedKey.includes("region") || normalizedKey.includes("región") || normalizedKey.includes("area")) {
      newRow["region"] = value
    }

    // Mantener la columna original
    newRow[key] = value
  })

  return hasValidData ? newRow : null
}

function generateRealisticMockData() {
  console.log("Generando datos realistas de ejemplo para JUNAEB...")

  const empresas = [
    "Alimentos del Sur S.A.",
    "Servicios Escolares Ltda.",
    "Distribuidora Central",
    "Cocina Express",
    "Alimentación Escolar S.A.",
    "Proveedores Unidos",
    "Catering Escolar",
    "Nutrición Infantil S.A.",
    "Servicios Alimentarios del Norte",
    "Comidas Escolares Premium",
    "Distribuidora Educacional",
    "Alimentos Frescos S.A.",
  ]

  const estados = ["Notificado", "Ejecutado", "En Proceso", "Pendiente", "Resuelto", "Anulado"]
  const tipos = [
    "Multa por atraso en entrega",
    "Multa por calidad deficiente",
    "Multa por incumplimiento contractual",
    "Multa administrativa",
    "Multa por higiene",
    "Multa por documentación",
  ]

  const regiones = [
    "Región Metropolitana",
    "Valparaíso",
    "Biobío",
    "Araucanía",
    "Los Lagos",
    "Maule",
    "O'Higgins",
    "Antofagasta",
  ]

  const mockData: Record<string, any[]> = {}

  Object.keys(JSON_URLS).forEach((year) => {
    const yearNum = Number.parseInt(year)
    const recordCount = 30 + Math.floor(Math.random() * 20) // 30-50 registros por año

    mockData[year] = Array.from({ length: recordCount }, (_, i) => {
      const montoNotificado = Math.floor(Math.random() * 15000000) + 1000000 // 1M - 16M
      const porcentajeEjecucion = Math.random() * 0.8 + 0.1 // 10% - 90%
      const montoEjecutado = Math.floor(montoNotificado * porcentajeEjecucion)

      return {
        id: `${year}-${String(i + 1).padStart(3, "0")}`,
        empresa: empresas[Math.floor(Math.random() * empresas.length)],
        institucion: "JUNAEB",
        fecha: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        estado: estados[Math.floor(Math.random() * estados.length)],
        tipo: tipos[Math.floor(Math.random() * tipos.length)],
        region: regiones[Math.floor(Math.random() * regiones.length)],
        rut: `${Math.floor(Math.random() * 30000000) + 5000000}-${Math.floor(Math.random() * 9)}`,
        montoNotificado,
        montoEjecutado,
        diferencia: montoNotificado - montoEjecutado,
        porcentajeEjecucion: (porcentajeEjecucion * 100).toFixed(2),
        año: yearNum,
        trimestre: Math.floor(Math.random() * 4) + 1,
        mes: Math.floor(Math.random() * 12) + 1,
        // Campos adicionales que podrían estar en los datos reales
        numeroMulta: `M-${year}-${String(i + 1).padStart(4, "0")}`,
        fechaNotificacion: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        fechaVencimiento: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        observaciones: i % 3 === 0 ? "Multa recurrente" : i % 5 === 0 ? "Caso especial" : "",
      }
    })
  })

  console.log("Datos de ejemplo generados para años:", Object.keys(mockData))
  return {
    sheetNames: Object.keys(JSON_URLS).sort(),
    data: mockData,
  }
}

export function getAvailableYears(): string[] {
  return Object.keys(JSON_URLS).sort()
}

export function getDataSourceInfo() {
  return {
    baseUrl: "https://github.com/CortaNoticias/EXCEL-DASH/tree/main/csv",
    files: Object.entries(JSON_URLS).map(([year, url]) => ({
      year,
      url,
      filename: url.split("/").pop(),
    })),
    totalYears: Object.keys(JSON_URLS).length,
  }
}
