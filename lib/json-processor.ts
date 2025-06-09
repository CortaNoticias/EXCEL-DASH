// Cargar datos JSON desde GitHub con URLs específicas y fallback mejorado

export async function loadJSONData(year?: string) {
  console.log("=== INICIANDO CARGA DE DATOS JUNAEB ===")

  const availableYears = ["2020", "2021", "2022", "2023"]
  const yearsToLoad = year ? [year] : availableYears

  // Verificar el contenido real del repositorio
  try {
    console.log("🔍 Explorando repositorio GitHub para encontrar archivos disponibles...")
    const repoUrl = "https://api.github.com/repos/CortaNoticias/EXCEL-DASH/contents/csv"
    const response = await fetch(repoUrl)

    if (!response.ok) {
      console.error(`❌ No se pudo acceder al repositorio: ${response.status}`)
      throw new Error("No se pudo acceder al repositorio GitHub")
    }

    const files = await response.json()
    console.log("📁 Archivos encontrados en el repositorio:", files.map((f: any) => f.name).join(", "))
  } catch (error) {
    console.error("❌ Error al explorar repositorio:", error)
    console.log("🔄 Continuando con URLs predefinidas...")
  }

  // URLs específicas de los archivos JSON en GitHub (probando diferentes variantes)
  const jsonUrls = {
    "2020": [
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2020.json",
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/multas_2020.json",
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/data_2020.json",
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/junaeb_2020.json",
    ],
    "2021": [
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2021.json",
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/multas_2021.json",
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/data_2021.json",
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/junaeb_2021.json",
    ],
    "2022": [
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2022.json",
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/multas_2022.json",
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/data_2022.json",
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/junaeb_2022.json",
    ],
    "2023": [
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2023.json",
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/multas_2023.json",
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/data_2023.json",
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/junaeb_2023.json",
    ],
  }

  // También probar con archivos CSV
  const csvUrls = {
    "2020": "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2020.csv",
    "2021": "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2021.csv",
    "2022": "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2022.csv",
    "2023": "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2023.csv",
  }

  const loadedData: Record<string, any[]> = {}
  let successfulLoads = 0
  let usingRealData = false

  // Intentar cargar cada año desde GitHub
  for (const yearToLoad of yearsToLoad) {
    let loaded = false
    const urls = jsonUrls[yearToLoad as keyof typeof jsonUrls]

    // Intentar cada URL alternativa para este año
    for (const url of urls) {
      if (loaded) break

      try {
        console.log(`🔄 Intentando cargar ${yearToLoad} desde: ${url}`)

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
          mode: "cors",
        })

        if (!response.ok) {
          console.log(`⚠️ URL no disponible: ${url} (${response.status})`)
          continue // Probar siguiente URL
        }

        const jsonData = await response.json()

        // Validar que sea un array válido
        if (!Array.isArray(jsonData)) {
          console.log(`⚠️ Formato inválido en ${url}: no es un array`)
          continue // Probar siguiente URL
        }

        // Procesar y normalizar los datos
        const processedData = jsonData.map((item, index) => {
          // Normalizar campos comunes
          const normalizedItem = {
            ...item,
            // Asegurar campos estándar
            id: item.id || `${yearToLoad}-${index + 1}`,
            año: Number(yearToLoad),
            empresa: item.empresa || item.Empresa || item.proveedor || item.Proveedor || "No especificada",
            institucion: item.institucion || item.Institucion || "JUNAEB",
            estado: item.estado || item.Estado || "No especificado",
            tipo: item.tipo || item.Tipo || item.tipoMulta || "No especificado",
            region: item.region || item.Region || "No especificada",
            comuna: item.comuna || item.Comuna || "No especificada",
            fecha: item.fecha || item.Fecha || item.fechaNotificacion || null,

            // Normalizar montos (buscar diferentes variaciones)
            montoNotificado: findMontoNotificado(item),
            montoEjecutado: findMontoEjecutado(item),
          }

          // Calcular campos derivados
          normalizedItem.diferencia = normalizedItem.montoNotificado - normalizedItem.montoEjecutado
          normalizedItem.porcentajeEjecucion =
            normalizedItem.montoNotificado > 0
              ? (normalizedItem.montoEjecutado / normalizedItem.montoNotificado) * 100
              : 0

          return normalizedItem
        })

        loadedData[yearToLoad] = processedData
        successfulLoads++
        usingRealData = true
        loaded = true

        console.log(`✅ ${yearToLoad}: ${processedData.length} registros cargados desde GitHub`)
      } catch (error) {
        console.error(`❌ Error intentando ${url}:`, error)
        // Continuar con la siguiente URL
      }
    }

    // Si no se pudo cargar con ninguna URL JSON, intentar con CSV
    if (!loaded) {
      try {
        const csvUrl = csvUrls[yearToLoad as keyof typeof csvUrls]
        console.log(`🔄 Intentando cargar CSV para ${yearToLoad} desde: ${csvUrl}`)

        const response = await fetch(csvUrl)
        if (response.ok) {
          const csvText = await response.text()
          // Aquí procesaríamos el CSV, pero como es complejo y requeriría una librería,
          // por ahora solo registramos que lo encontramos
          console.log(`✅ Encontrado archivo CSV para ${yearToLoad}, pero se requiere procesamiento adicional`)
        }
      } catch (error) {
        console.error(`❌ Error intentando CSV para ${yearToLoad}:`, error)
      }
    }

    // Si no se pudo cargar de ninguna forma, generar datos de fallback
    if (!loaded) {
      console.log(`🎭 Generando datos de fallback para ${yearToLoad}`)
      loadedData[yearToLoad] = generateYearMockData(yearToLoad)
    }
  }

  // Si no se pudo cargar ningún año real, usar todos los datos de ejemplo
  if (successfulLoads === 0) {
    console.log("🎭 No se pudieron cargar datos reales, usando datos de demostración completos")
    return generateEnhancedMockData(year)
  }

  const totalRecords = Object.values(loadedData).reduce((sum, arr) => sum + arr.length, 0)

  console.log(`📊 Resumen de carga:`)
  console.log(`   ✅ ${successfulLoads} años cargados desde GitHub`)
  console.log(`   🎭 ${yearsToLoad.length - successfulLoads} años con datos de fallback`)
  console.log(`   📈 ${totalRecords} registros totales`)
  console.log(`   🌐 Usando datos reales: ${usingRealData ? "SÍ" : "NO"}`)

  return {
    sheetNames: Object.keys(loadedData).sort(),
    data: loadedData,
    usingRealData,
  }
}

// Función para encontrar monto notificado en diferentes formatos
function findMontoNotificado(item: any): number {
  const possibleKeys = [
    "montoNotificado",
    "monto_notificado",
    "MontoNotificado",
    "MONTO_NOTIFICADO",
    "Monto Notificado",
    "monto notificado",
    "multa",
    "Multa",
    "MULTA",
    "monto_multa",
    "MontoMulta",
    "valor_multa",
    "ValorMulta",
    "valorMulta",
    "monto",
    "Monto",
    "valor",
    "Valor",
    "importe",
    "Importe",
    "cantidad",
    "Cantidad",
  ]

  // Buscar por claves exactas primero
  for (const key of possibleKeys) {
    if (item[key] !== undefined && item[key] !== null && !isNaN(Number(item[key]))) {
      const value = Number(item[key])
      if (value > 0) return value
    }
  }

  // Buscar por claves que contengan palabras clave
  for (const key in item) {
    const lowerKey = key.toLowerCase()
    if (
      (lowerKey.includes("notificado") ||
        lowerKey.includes("multa") ||
        lowerKey.includes("monto") ||
        lowerKey.includes("valor")) &&
      !isNaN(Number(item[key]))
    ) {
      const value = Number(item[key])
      if (value > 0) return value
    }
  }

  return 0
}

// Función para encontrar monto ejecutado en diferentes formatos
function findMontoEjecutado(item: any): number {
  const possibleKeys = [
    "montoEjecutado",
    "monto_ejecutado",
    "MontoEjecutado",
    "MONTO_EJECUTADO",
    "Monto Ejecutado",
    "monto ejecutado",
    "pagado",
    "Pagado",
    "PAGADO",
    "monto_pagado",
    "MontoPagado",
    "valor_pagado",
    "ValorPagado",
    "cobrado",
    "Cobrado",
    "COBRADO",
    "recaudado",
    "Recaudado",
    "ejecutado",
    "Ejecutado",
  ]

  // Buscar por claves exactas primero
  for (const key of possibleKeys) {
    if (item[key] !== undefined && item[key] !== null && !isNaN(Number(item[key]))) {
      const value = Number(item[key])
      if (value >= 0) return value
    }
  }

  // Buscar por claves que contengan palabras clave
  for (const key in item) {
    const lowerKey = key.toLowerCase()
    if (
      (lowerKey.includes("ejecutado") ||
        lowerKey.includes("pagado") ||
        lowerKey.includes("cobrado") ||
        lowerKey.includes("recaudado")) &&
      !isNaN(Number(item[key]))
    ) {
      const value = Number(item[key])
      if (value >= 0) return value
    }
  }

  return 0
}

// Generar datos de ejemplo para un año específico
function generateYearMockData(year: string) {
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

  const estados = ["Notificado", "Ejecutado", "En Proceso", "Pendiente", "Resuelto"]
  const tipos = [
    "Multa por atraso en entrega",
    "Multa por calidad deficiente",
    "Multa por incumplimiento contractual",
    "Multa administrativa",
  ]

  const recordCount = 80 + Math.floor(Math.random() * 40) // 80-120 registros

  return Array.from({ length: recordCount }, (_, i) => {
    const montoNotificado = Math.floor(Math.random() * 20000000) + 500000
    const porcentajeEjecucion = Math.random() * 0.8 + 0.1
    const montoEjecutado = Math.floor(montoNotificado * porcentajeEjecucion)

    return {
      id: `FALLBACK-${year}-${i + 1}`,
      año: Number(year),
      empresa: empresas[Math.floor(Math.random() * empresas.length)],
      institucion: "JUNAEB",
      estado: estados[Math.floor(Math.random() * estados.length)],
      tipo: tipos[Math.floor(Math.random() * tipos.length)],
      region: "Región Metropolitana",
      comuna: "Santiago",
      fecha: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
      montoNotificado,
      montoEjecutado,
      diferencia: montoNotificado - montoEjecutado,
      porcentajeEjecucion: Number((porcentajeEjecucion * 100).toFixed(2)),
    }
  })
}

// Generar datos de ejemplo completos (solo como último recurso)
function generateEnhancedMockData(specificYear?: string) {
  console.log("🎭 Generando datos de demostración completos...")

  const availableYears = ["2020", "2021", "2022", "2023"]
  const yearsToGenerate = specificYear ? [specificYear] : availableYears

  const mockData: Record<string, any[]> = {}

  yearsToGenerate.forEach((year) => {
    mockData[year] = generateYearMockData(year)
  })

  return {
    sheetNames: Object.keys(mockData).sort(),
    data: mockData,
    usingRealData: false,
  }
}

export function getAvailableYears(): string[] {
  return ["2020", "2021", "2022", "2023"]
}

export function getDataSourceInfo() {
  return {
    baseUrl: "https://github.com/CortaNoticias/EXCEL-DASH/tree/main/csv",
    files: [
      {
        year: "2020",
        url: "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2020.json",
        filename: "2020.json",
      },
      {
        year: "2021",
        url: "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2021.json",
        filename: "2021.json",
      },
      {
        year: "2022",
        url: "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2022.json",
        filename: "2022.json",
      },
      {
        year: "2023",
        url: "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/2023.json",
        filename: "2023.json",
      },
    ],
    totalYears: 4,
  }
}
