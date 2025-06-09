import * as XLSX from "xlsx"

export async function processExcelData(url: string) {
  try {
    // Verificar si la URL es válida
    if (!url) {
      throw new Error("URL no proporcionada")
    }

    console.log("Intentando cargar archivo desde:", url)

    // Convertir URL de GitHub a URL raw si es necesario
    let rawUrl = url
    if (url.includes("github.com") && url.includes("/blob/")) {
      rawUrl = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")
      console.log("URL convertida a raw:", rawUrl)
    }

    // Obtener el archivo Excel desde la URL
    const response = await fetch(rawUrl, {
      method: "GET",
      headers: {
        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,*/*",
      },
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      throw new Error(`Error al obtener el archivo: ${response.status} ${response.statusText}. URL: ${rawUrl}`)
    }

    const contentType = response.headers.get("content-type")
    console.log("Content-Type:", contentType)

    const arrayBuffer = await response.arrayBuffer()
    console.log("Archivo descargado, tamaño:", arrayBuffer.byteLength, "bytes")

    if (arrayBuffer.byteLength === 0) {
      throw new Error("El archivo descargado está vacío")
    }

    const workbook = XLSX.read(arrayBuffer, { type: "array" })

    // Obtener nombres de las hojas
    const sheetNames = workbook.SheetNames
    console.log("Hojas encontradas:", sheetNames)

    if (sheetNames.length === 0) {
      throw new Error("El archivo Excel no contiene hojas")
    }

    // Procesar cada hoja
    const data: Record<string, any[]> = {}

    sheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null })
      console.log(`Hoja ${sheetName}: ${jsonData.length} registros`)

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

    console.log("Procesamiento completado exitosamente")
    return {
      sheetNames,
      data,
    }
  } catch (error) {
    console.error("Error detallado al procesar el archivo Excel:", error)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Error de red al intentar descargar el archivo. Verifica que la URL sea correcta y que el archivo sea accesible públicamente.`,
      )
    }
    throw error
  }
}
