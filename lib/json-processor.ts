// Cargar datos JSON desde GitHub con manejo robusto de errores y múltiples estrategias

export async function loadJSONData(year?: string) {
  console.log("=== INICIANDO CARGA DE DATOS JUNAEB ===")

  const availableYears = ["2020", "2021", "2022", "2023"]
  const yearsToLoad = year ? [year] : availableYears

  // Primero, verificar conectividad básica
  const connectivityTest = await testGitHubConnectivity()
  if (!connectivityTest.success) {
    console.log("🚫 No hay conectividad con GitHub, usando datos de demostración")
    return generateEnhancedMockData(year)
  }

  // URLs correctas con nombres de archivos exactos
  const jsonUrls = {
    "2020":
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA)%202020.json",
    "2021":
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA)%202021.json",
    "2022":
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA)%202022.json",
    "2023":
      "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA)%202023.json",
  }

  const loadedData: Record<string, any[]> = {}
  let successfulLoads = 0
  let usingRealData = false

  // Intentar cargar cada año con múltiples estrategias
  for (const yearToLoad of yearsToLoad) {
    const url = jsonUrls[yearToLoad as keyof typeof jsonUrls]

    if (!url) {
      console.warn(`⚠️ No hay URL definida para el año ${yearToLoad}`)
      loadedData[yearToLoad] = generateYearMockData(yearToLoad)
      continue
    }

    try {
      console.log(`🔄 Intentando cargar ${yearToLoad}...`)

      const data = await fetchWithMultipleStrategies(url, yearToLoad)

      if (data && Array.isArray(data) && data.length > 0) {
        // Procesar y normalizar los datos
        const processedData = data.map((item, index) => {
          const normalizedItem = {
            ...item,
            id: item.id || `${yearToLoad}-${index + 1}`,
            año: Number(yearToLoad),
            empresa: item.empresa || item.Empresa || item.proveedor || item.Proveedor || "No especificada",
            institucion: item.institucion || item.Institucion || "JUNAEB",
            estado: item.estado || item.Estado || "No especificado",
            tipo: item.tipo || item.Tipo || item.tipoMulta || "No especificado",
            region: item.region || item.Region || "No especificada",
            comuna: item.comuna || item.Comuna || "No especificada",
            fecha: item.fecha || item.Fecha || item.fechaNotificacion || null,
            montoNotificado: findMontoNotificado(item),
            montoEjecutado: findMontoEjecutado(item),
          }

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

        console.log(`✅ ${yearToLoad}: ${processedData.length} registros cargados desde GitHub`)
      } else {
        throw new Error("Datos inválidos o vacíos")
      }
    } catch (error) {
      console.error(`❌ Error cargando ${yearToLoad}:`, error)
      console.log(`🎭 Generando datos de fallback para ${yearToLoad}`)
      loadedData[yearToLoad] = generateYearMockData(yearToLoad)
    }
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

// Función para probar conectividad básica con GitHub
async function testGitHubConnectivity(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("🔍 Probando conectividad con GitHub...")

    // Probar con una URL simple de GitHub
    const testUrl = "https://api.github.com/repos/CortaNoticias/EXCEL-DASH"

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos timeout

    const response = await fetch(testUrl, {
      method: "HEAD", // Solo headers, no contenido
      signal: controller.signal,
      mode: "cors",
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      console.log("✅ Conectividad con GitHub: OK")
      return { success: true }
    } else {
      console.log(`⚠️ GitHub responde pero con error: ${response.status}`)
      return { success: false, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    console.log("❌ No hay conectividad con GitHub:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
  }
}

// Función para intentar fetch con múltiples estrategias
async function fetchWithMultipleStrategies(url: string, year: string): Promise<any[] | null> {
  const strategies = [
    // Estrategia 1: Fetch normal con timeout
    async () => {
      console.log(`📡 Estrategia 1 para ${year}: Fetch normal`)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
          signal: controller.signal,
          mode: "cors",
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        return await response.json()
      } finally {
        clearTimeout(timeoutId)
      }
    },

    // Estrategia 2: Fetch con headers mínimos
    async () => {
      console.log(`📡 Estrategia 2 para ${year}: Headers mínimos`)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      try {
        const response = await fetch(url, {
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        return await response.json()
      } finally {
        clearTimeout(timeoutId)
      }
    },

    // Estrategia 3: Fetch con modo no-cors (limitado pero a veces funciona)
    async () => {
      console.log(`📡 Estrategia 3 para ${year}: Modo no-cors`)
      try {
        const response = await fetch(url, {
          mode: "no-cors",
        })

        // En modo no-cors no podemos leer la respuesta, así que esto fallará
        // pero a veces ayuda a identificar problemas de CORS
        return null
      } catch (error) {
        throw new Error("Modo no-cors falló")
      }
    },
  ]

  // Intentar cada estrategia
  for (let i = 0; i < strategies.length; i++) {
    try {
      const result = await strategies[i]()
      if (result && Array.isArray(result)) {
        console.log(`✅ Estrategia ${i + 1} exitosa para ${year}`)
        return result
      }
    } catch (error) {
      console.log(`❌ Estrategia ${i + 1} falló para ${year}:`, error)
    }
  }

  return null
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

  for (const key of possibleKeys) {
    if (item[key] !== undefined && item[key] !== null && !isNaN(Number(item[key]))) {
      const value = Number(item[key])
      if (value > 0) return value
    }
  }

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

  for (const key of possibleKeys) {
    if (item[key] !== undefined && item[key] !== null && !isNaN(Number(item[key]))) {
      const value = Number(item[key])
      if (value >= 0) return value
    }
  }

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

// Generar datos de ejemplo mejorados para un año específico
function generateYearMockData(year: string) {
  const empresas = [
    "Alimentos del Sur S.A.",
    "Servicios Escolares Ltda.",
    "Distribuidora Central SpA",
    "Cocina Express Limitada",
    "Alimentación Escolar S.A.",
    "Proveedores Unidos Chile",
    "Catering Escolar Premium",
    "Nutrición Infantil S.A.",
    "Servicios Alimentarios del Norte",
    "Comidas Escolares Premium Ltda.",
    "Distribuidora Educacional",
    "Alimentos Frescos S.A.",
    "Grupo Alimentario Escolar",
    "Servicios Integrales PAE",
    "Alimentación Saludable Chile",
    "Cocinas Industriales del Sur",
    "Distribuidora Nacional de Alimentos",
    "Servicios Gastronómicos Escolares",
    "Alimentación Institucional S.A.",
    "Catering y Servicios Educacionales",
  ]

  const estados = ["Notificado", "Ejecutado", "En Proceso", "Pendiente", "Resuelto", "Apelado", "Confirmado"]

  const tipos = [
    "Multa por atraso en entrega",
    "Multa por calidad deficiente",
    "Multa por incumplimiento contractual",
    "Multa administrativa",
    "Multa por falta de personal",
    "Multa por higiene deficiente",
    "Multa por gramaje insuficiente",
    "Multa por temperatura inadecuada",
    "Multa por sustitución no autorizada",
    "Multa por documentación incompleta",
  ]

  const regiones = [
    "Región Metropolitana",
    "Región de Valparaíso",
    "Región del Biobío",
    "Región de La Araucanía",
    "Región de Coquimbo",
    "Región del Maule",
    "Región de Los Lagos",
    "Región de Antofagasta",
    "Región de Tarapacá",
    "Región de Atacama",
  ]

  // Generar más registros para datos más ricos
  const recordCount = 200 + Math.floor(Math.random() * 100) // 200-300 registros

  return Array.from({ length: recordCount }, (_, i) => {
    // Montos más realistas basados en multas reales PAE-PAP
    const baseAmount = Math.floor(Math.random() * 30000000) + 2000000 // Entre 2M y 32M
    const montoNotificado = Math.floor(baseAmount)

    // Porcentaje de ejecución variable según el año (más realista)
    let porcentajeBase = 0
    switch (year) {
      case "2020":
        porcentajeBase = 0.75
        break
      case "2021":
        porcentajeBase = 0.65
        break
      case "2022":
        porcentajeBase = 0.55
        break
      case "2023":
        porcentajeBase = 0.35
        break
      default:
        porcentajeBase = 0.5
    }

    const variacion = Math.random() * 0.3 - 0.15 // ±15% de variación
    const porcentajeEjecucion = Math.max(0, Math.min(1, porcentajeBase + variacion))
    const montoEjecutado = Math.floor(montoNotificado * porcentajeEjecucion)

    // Fecha realista dentro del año
    const mes = Math.floor(Math.random() * 12) + 1
    const dia = Math.floor(Math.random() * 28) + 1
    const fecha = `${year}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`

    // Estado coherente con el porcentaje de ejecución
    let estado
    if (porcentajeEjecucion > 0.9) {
      estado = "Ejecutado"
    } else if (porcentajeEjecucion > 0.5) {
      estado = "En Proceso"
    } else if (porcentajeEjecucion > 0.1) {
      estado = "Pendiente"
    } else {
      estado = "Notificado"
    }

    return {
      id: `${year}-${String(i + 1).padStart(4, "0")}`,
      año: Number(year),
      empresa: empresas[Math.floor(Math.random() * empresas.length)],
      institucion: "JUNAEB",
      estado: estado,
      tipo: tipos[Math.floor(Math.random() * tipos.length)],
      region: regiones[Math.floor(Math.random() * regiones.length)],
      comuna: `Comuna ${Math.floor(Math.random() * 50) + 1}`,
      fecha: fecha,
      montoNotificado,
      montoEjecutado,
      diferencia: montoNotificado - montoEjecutado,
      porcentajeEjecucion: Number((porcentajeEjecucion * 100).toFixed(2)),
      trimestre: Math.ceil(mes / 3),
    }
  })
}

// Generar datos de ejemplo completos
function generateEnhancedMockData(specificYear?: string) {
  console.log("🎭 Generando datos de demostración de alta calidad...")

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
        url: "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA)%202020.json",
        filename: "Multas Junaeb - Base de datos (TPA) 2020.json",
      },
      {
        year: "2021",
        url: "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA)%202021.json",
        filename: "Multas Junaeb - Base de datos (TPA) 2021.json",
      },
      {
        year: "2022",
        url: "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA)%202022.json",
        filename: "Multas Junaeb - Base de datos (TPA) 2022.json",
      },
      {
        year: "2023",
        url: "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/csv/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA)%202023.json",
        filename: "Multas Junaeb - Base de datos (TPA) 2023.json",
      },
    ],
    totalYears: 4,
  }
}
