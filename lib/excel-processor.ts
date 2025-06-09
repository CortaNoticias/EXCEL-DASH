import * as XLSX from "xlsx"

export async function processExcelData(url: string) {
  try {
    // Verificar si la URL es válida
    if (!url) {
      throw new Error("URL no proporcionada")
    }

    // Obtener el archivo Excel desde la URL
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error al obtener el archivo: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array" })

    // Obtener nombres de las hojas
    const sheetNames = workbook.SheetNames

    if (sheetNames.length === 0) {
      throw new Error("El archivo Excel no contiene hojas")
    }

    // Procesar cada hoja
    const data: Record<string, any[]> = {}

    sheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null })

      // Normalizar nombres de columnas específicos para JUNAEB
      const normalizedData = jsonData.map((row) => {
        const newRow: Record<string, any> = {}

        // Procesar cada columna
        Object.entries(row).forEach(([key, value]) => {
          const normalizedKey = key.toLowerCase().trim()

          // Detectar empresa/proveedor
          if (
            normalizedKey.includes("empresa") ||
            normalizedKey.includes("proveedor") ||
            normalizedKey.includes("contratista") ||
            normalizedKey.includes("razón social") ||
            normalizedKey.includes("razon social")
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

      data[sheetName] = normalizedData
    })

    return {
      sheetNames,
      data,
    }
  } catch (error) {
    console.error("Error al procesar el archivo Excel:", error)
    throw error
  }
}
