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
    if (year && JSON_URLS[year as keyof typeof JSON_URLS]) {
      // Cargar un año específico
      const url = JSON_URLS[year as keyof typeof JSON_URLS]
      console.log(`Cargando datos para el año ${year} desde:`, url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Error al cargar datos de ${year}: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`Datos de ${year} cargados:`, Array.isArray(data) ? data.length : "estructura compleja", "registros")

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
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Cache-Control": "no-cache",
            },
          })

          if (response.ok) {
            const yearData = await response.json()
            const normalizedData = normalizeJSONData(yearData)
            allData[yearKey] = normalizedData
            loadedYears.push(yearKey)
            console.log(`${yearKey}: ${normalizedData.length} registros cargados`)
          } else {
            console.warn(`No se pudo cargar ${yearKey}: ${response.status} ${response.statusText}`)
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

function normalizeJSONData(data: any): any[] {
  console.log("Normalizando datos JSON, tipo:", typeof data, "es array:", Array.isArray(data))

  // Si es un array, procesarlo directamente
  if (Array.isArray(data)) {
    console.log("Datos son un array con", data.length, "elementos")
    return data.map(normalizeRow)
  }

  // Si es un objeto, buscar arrays dentro
  if (typeof data === "object" && data !== null) {
    console.log("Datos son un objeto, buscando arrays...")

    // Buscar propiedades que contengan arrays
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        console.log(`Encontrado array en propiedad '${key}' con ${value.length} elementos`)
        return value.map(normalizeRow)
      }
    }

    // Si no hay arrays, intentar convertir el objeto en un array de un elemento
    console.log("No se encontraron arrays, convirtiendo objeto a array")
    return [normalizeRow(data)]
  }

  console.warn("Datos no reconocidos, retornando array vacío")
  return []
}

function normalizeRow(row: any): any {
  if (typeof row !== "object" || row === null) {
    return row
  }

  const newRow: Record<string, any> = {}

  // Procesar cada campo del JSON
  Object.entries(row).forEach(([key, value]) => {
    const normalizedKey = typeof key === "string" ? key.toLowerCase().trim() : String(key).toLowerCase().trim()

    // Detectar empresa/proveedor/contratista
    if (
      normalizedKey.includes("empresa") ||
      normalizedKey.includes("proveedor") ||
      normalizedKey.includes("contratista") ||
      normalizedKey.includes("razón social") ||
      normalizedKey.includes("razon social") ||
      normalizedKey.includes("nombre") ||
      normalizedKey.includes("contratante")
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
    else if (
      normalizedKey.includes("fecha") ||
      normalizedKey.includes("date") ||
      normalizedKey.includes("año") ||
      normalizedKey.includes("ano")
    ) {
      newRow["fecha"] = value
    }
    // Detectar estado
    else if (
      normalizedKey.includes("estado") ||
      normalizedKey.includes("situacion") ||
      normalizedKey.includes("status") ||
      normalizedKey.includes("condicion")
    ) {
      newRow["estado"] = value
    }
    // Detectar tipo
    else if (
      normalizedKey.includes("tipo") ||
      normalizedKey.includes("categoria") ||
      normalizedKey.includes("clasificacion") ||
      normalizedKey.includes("motivo")
    ) {
      newRow["tipo"] = value
    }
    // Detectar RUT
    else if (
      normalizedKey.includes("rut") ||
      normalizedKey.includes("identificacion") ||
      normalizedKey.includes("cedula")
    ) {
      newRow["rut"] = value
    }
    // Detectar región
    else if (normalizedKey.includes("region") || normalizedKey.includes("región")) {
      newRow["region"] = value
    }
    // Mantener la columna original
    newRow[key] = value
  })

  return newRow
}

export function getAvailableYears(): string[] {
  return Object.keys(JSON_URLS).sort()
}

// Función para obtener información sobre los archivos
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
