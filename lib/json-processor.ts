// URLs base para los archivos JSON
const BASE_URL = "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv"

// Posibles nombres de archivos por año
const POSSIBLE_FILENAMES = [
  "{year}.json",
  "data_{year}.json",
  "multas_{year}.json",
  "junaeb_{year}.json",
  "{year}_data.json",
  "{year}_multas.json",
]

// Años disponibles
const AVAILABLE_YEARS = ["2021", "2022", "2023", "2024"]

export async function discoverAvailableFiles() {
  const availableFiles: Record<string, string> = {}

  for (const year of AVAILABLE_YEARS) {
    for (const pattern of POSSIBLE_FILENAMES) {
      const filename = pattern.replace("{year}", year)
      const url = `${BASE_URL}/${filename}`

      try {
        console.log(`Probando: ${url}`)
        const response = await fetch(url, { method: "HEAD" })
        if (response.ok) {
          availableFiles[year] = url
          console.log(`✓ Encontrado: ${year} -> ${url}`)
          break // Encontramos el archivo para este año
        }
      } catch (error) {
        // Continuar con el siguiente patrón
      }
    }
  }

  return availableFiles
}

export async function loadJSONData(year?: string) {
  try {
    console.log("Iniciando carga de datos JSON...")

    // Primero, descubrir qué archivos están disponibles
    const availableFiles = await discoverAvailableFiles()
    console.log("Archivos disponibles:", availableFiles)

    if (Object.keys(availableFiles).length === 0) {
      // Si no encontramos archivos, intentar con URLs directas conocidas
      console.log("No se encontraron archivos, intentando URLs directas...")
      return await loadWithDirectURLs(year)
    }

    if (year && availableFiles[year]) {
      // Cargar un año específico
      const url = availableFiles[year]
      console.log(`Cargando datos para el año ${year} desde:`, url)

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Error al cargar datos de ${year}: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`Datos de ${year} cargados:`, data.length, "registros")

      return {
        sheetNames: [year],
        data: { [year]: normalizeJSONData(data) },
      }
    } else {
      // Cargar todos los años disponibles
      console.log("Cargando datos de todos los años disponibles...")
      const allData: Record<string, any[]> = {}
      const loadedYears: string[] = []

      for (const [yearKey, url] of Object.entries(availableFiles)) {
        try {
          console.log(`Cargando ${yearKey} desde:`, url)
          const response = await fetch(url)

          if (response.ok) {
            const yearData = await response.json()
            allData[yearKey] = normalizeJSONData(yearData)
            loadedYears.push(yearKey)
            console.log(`${yearKey}: ${yearData.length} registros cargados`)
          } else {
            console.warn(`No se pudo cargar ${yearKey}: ${response.status}`)
          }
        } catch (error) {
          console.warn(`Error al cargar ${yearKey}:`, error)
        }
      }

      if (loadedYears.length === 0) {
        throw new Error("No se pudieron cargar datos de ningún año disponible")
      }

      console.log("Años cargados exitosamente:", loadedYears)
      return {
        sheetNames: loadedYears.sort(),
        data: allData,
      }
    }
  } catch (error) {
    console.error("Error al procesar datos JSON:", error)
    throw error
  }
}

async function loadWithDirectURLs(year?: string) {
  // URLs directas como fallback
  const directURLs = {
    "2021": `${BASE_URL}/2021.json`,
    "2022": `${BASE_URL}/2022.json`,
    "2023": `${BASE_URL}/2023.json`,
    "2024": `${BASE_URL}/2024.json`,
  }

  console.log("Intentando con URLs directas...")

  if (year && directURLs[year as keyof typeof directURLs]) {
    const url = directURLs[year as keyof typeof directURLs]
    console.log(`Cargando ${year} desde URL directa:`, url)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error al cargar datos de ${year}: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return {
      sheetNames: [year],
      data: { [year]: normalizeJSONData(data) },
    }
  } else {
    const allData: Record<string, any[]> = {}
    const loadedYears: string[] = []

    for (const [yearKey, url] of Object.entries(directURLs)) {
      try {
        console.log(`Intentando cargar ${yearKey} desde:`, url)
        const response = await fetch(url)

        if (response.ok) {
          const yearData = await response.json()
          allData[yearKey] = normalizeJSONData(yearData)
          loadedYears.push(yearKey)
          console.log(`${yearKey}: ${yearData.length} registros cargados`)
        } else {
          console.warn(`No se pudo cargar ${yearKey}: ${response.status}`)
        }
      } catch (error) {
        console.warn(`Error al cargar ${yearKey}:`, error)
      }
    }

    if (loadedYears.length === 0) {
      // Como último recurso, generar datos de ejemplo
      console.log("Generando datos de ejemplo...")
      return generateMockData()
    }

    return {
      sheetNames: loadedYears.sort(),
      data: allData,
    }
  }
}

function normalizeJSONData(data: any[]): any[] {
  if (!Array.isArray(data)) {
    console.warn("Los datos no son un array, intentando convertir...")
    if (typeof data === "object" && data !== null) {
      // Si es un objeto, intentar extraer arrays
      const possibleArrays = Object.values(data).filter(Array.isArray)
      if (possibleArrays.length > 0) {
        return normalizeJSONData(possibleArrays[0] as any[])
      }
    }
    return []
  }

  return data.map((row) => {
    const newRow: Record<string, any> = {}

    // Procesar cada campo del JSON
    Object.entries(row).forEach(([key, value]) => {
      const normalizedKey = typeof key === "string" ? key.toLowerCase().trim() : String(key).toLowerCase().trim()

      // Detectar empresa/proveedor
      if (
        normalizedKey.includes("empresa") ||
        normalizedKey.includes("proveedor") ||
        normalizedKey.includes("contratista") ||
        normalizedKey.includes("razón social") ||
        normalizedKey.includes("razon social") ||
        normalizedKey.includes("nombre")
      ) {
        newRow["empresa"] = value
      }
      // Detectar institución
      else if (
        normalizedKey.includes("institucion") ||
        normalizedKey.includes("institución") ||
        normalizedKey.includes("junaeb") ||
        normalizedKey.includes("organismo")
      ) {
        newRow["institucion"] = value || "JUNAEB"
      }
      // Detectar fechas
      else if (normalizedKey.includes("fecha") || normalizedKey.includes("date")) {
        newRow["fecha"] = value
      }
      // Detectar estado
      else if (
        normalizedKey.includes("estado") ||
        normalizedKey.includes("situacion") ||
        normalizedKey.includes("status")
      ) {
        newRow["estado"] = value
      }
      // Detectar tipo
      else if (
        normalizedKey.includes("tipo") ||
        normalizedKey.includes("categoria") ||
        normalizedKey.includes("clasificacion")
      ) {
        newRow["tipo"] = value
      }
      // Detectar RUT
      else if (normalizedKey.includes("rut") || normalizedKey.includes("identificacion")) {
        newRow["rut"] = value
      }
      // Mantener la columna original
      else {
        newRow[key] = value
      }
    })

    return newRow
  })
}

function generateMockData() {
  console.log("Generando datos de ejemplo para demostración...")

  const empresas = [
    "Alimentos del Sur S.A.",
    "Servicios Escolares Ltda.",
    "Distribuidora Central",
    "Cocina Express",
    "Alimentación Escolar S.A.",
    "Proveedores Unidos",
    "Catering Escolar",
    "Nutrición Infantil S.A.",
  ]

  const estados = ["Notificado", "Ejecutado", "En proceso", "Pendiente", "Resuelto"]
  const tipos = ["Multa por atraso", "Multa por calidad", "Multa por incumplimiento", "Multa administrativa"]

  const mockData: Record<string, any[]> = {}

  AVAILABLE_YEARS.forEach((year) => {
    mockData[year] = Array.from({ length: 25 }, (_, i) => ({
      empresa: empresas[Math.floor(Math.random() * empresas.length)],
      institucion: "JUNAEB",
      fecha: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
      estado: estados[Math.floor(Math.random() * estados.length)],
      tipo: tipos[Math.floor(Math.random() * tipos.length)],
      rut: `${Math.floor(Math.random() * 30000000) + 5000000}-${Math.floor(Math.random() * 9)}`,
      montoNotificado: Math.floor(Math.random() * 10000000) + 500000,
      montoEjecutado: Math.floor(Math.random() * 8000000),
      id: `${year}-${i + 1}`,
    }))
  })

  return {
    sheetNames: AVAILABLE_YEARS,
    data: mockData,
  }
}

export function getAvailableYears(): string[] {
  return AVAILABLE_YEARS
}
