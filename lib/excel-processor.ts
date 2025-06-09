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

      // Normalizar nombres de columnas
      const normalizedData = jsonData.map((row) => {
        const newRow: Record<string, any> = {}

        // Procesar cada columna
        Object.entries(row).forEach(([key, value]) => {
          // Normalizar nombres de columnas comunes
          const normalizedKey = key.toLowerCase()

          if (normalizedKey.includes("empresa")) {
            newRow["empresa"] = value
          } else if (normalizedKey.includes("institucion") || normalizedKey.includes("institución")) {
            newRow["institucion"] = value
          } else {
            // Mantener la columna original
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
