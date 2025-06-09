// URLs de los archivos JSON por año
const JSON_URLS = {
  "2021": "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2021.json",
  "2022": "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2022.json",
  "2023": "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2023.json",
  "2024": "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2024.json",
}

export async function loadJSONData(year?: string) {
  try {
    if (year && JSON_URLS[year as keyof typeof JSON_URLS]) {
      // Cargar un año específico
      const url = JSON_URLS[year as keyof typeof JSON_URLS]
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
      // Cargar todos los años
      console.log("Cargando datos de todos los años...")
      const allData: Record<string, any[]> = {}
      const loadedYears: string[] = []

      for (const [yearKey, url] of Object.entries(JSON_URLS)) {
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
        throw new Error("No se pudieron cargar datos de ningún año")
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

function normalizeJSONData(data: any[]): any[] {
  if (!Array.isArray(data)) {
    console.warn("Los datos no son un array, intentando convertir...")
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

export function getAvailableYears(): string[] {
  return Object.keys(JSON_URLS).sort()
}
