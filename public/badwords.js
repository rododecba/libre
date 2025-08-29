// Versión mejorada de badwords.js

// Lista de palabras ofensivas con sus variantes comunes
const BAD_WORDS = [
  // Lista original que ya tienes
  "puta", "puto", "put@", "pvt@", "pvt0", "pvto", "p-u-t-a", "p-u-t-o", "putita", "putito", "putear", "puteada", "puteado",
  "hijo de puta", "hdp", "hp", "malparido", "malparida",
  "mierda", "mierd@", "m13rd4", "mierdoso", "mierdosa", "cagada", "cagar", "cagado", "cagando", "cagas", "cagon",
  "culiar", "culero", "culear",
  "coño", "coñazo", "coñ0", "c0ñ0", "chocho",
  "verga", "vergon", "vergudo", "v3rg4", "vrg",
  "pendejo", "pendeja", "pendej@", "pendejada", "pendejo", "pndj",
  "cabrón", "cabron", "cabr0n", "kabron", "kabrona",
  "joder", "jodete", "jodido", "j0d3r", "jd3r",
  "marica", "maricón", "maricon", "mar1c0n", "marik", "mariquita",
  "polla", "p0lla", "p0ll4", "poya",
  "cojones", "cojon", "coj0n", "cojudo", "cojuda", "kj0n", "huevos",
  "pinga", "ping@", "pingo", "p1ng4", "p1ngudo",
  "pinche", "pinches", "p1nche", "pinch3",
  "idiota", "imbecil", "imbécil", "tarado",
  "pedo", "pedos", "pedorro", "pedorr@", "p3d0",
  
  // Añadir estos patrones adicionales que son comúnmente utilizados para evadir filtros
  "p+[.\\s_-]*u+[.\\s_-]*t+[.\\s_-]*[oa@4]", // Variaciones de "puta/puto"
  "c+[.\\s_-]*[ou0]+[.\\s_-]*[ñn]+[.\\s_-]*[oa@4]", // Variaciones de "coño"
  "j+[.\\s_-]*[oa0@]+[.\\s_-]*d+[.\\s_-]*[eéè3]+[.\\s_-]*[r]+", // Variaciones de "joder"
  "m+[.\\s_-]*[i1]+[.\\s_-]*[eéè3]+[.\\s_-]*r+[.\\s_-]*d+[.\\s_-]*[a@4]", // Variaciones de "mierda"
  "n+[.\\s_-]*[i1]+[.\\s_-]*g+[.\\s_-]*g+[.\\s_-]*[a@4e3]", // Variaciones racistas en inglés
  "f+[.\\s_-]*[uüû]+[.\\s_-]*c+[.\\s_-]*k+", // Variaciones de "fuck"
  
  // Palabras comúnmente utilizadas en ataques de spam
  "v1[a@]gra", "c[i1][a@]l[i1]s", "x[a@]n[a@]x", "v[a@]l[i1]um", 
  "p[o0]rn[o0]", "s[e3]x", "c[a@]s[i1]n[o0]", "[o0]nl[i1]n[e3] g[a@]mbl[i1]ng",
  "fr[e3][e3] m[o0]n[e3]y", "m[a@]k[e3] m[o0]n[e3]y f[a@]st"
];

// Mejora de la normalización de texto
function normalize(text) {
  return text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar diacríticos (tildes)
    .replace(/[^\w\s@]/g, "") // Quitar símbolos pero dejar espacios y @
    .replace(/\s+/g, " ")     // Convertir múltiples espacios en uno solo
    .toLowerCase()
    .trim();
}

// Mejorar detección para incluir patrones de evasión comunes
function detectarEvasiones(texto) {
  // Detectar sustituciones de caracteres comunes
  let textoNormalizado = texto
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/0/g, 'o')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/\+/g, 't');
  
  // Eliminar caracteres repetidos que se usan para evadir
  textoNormalizado = textoNormalizado.replace(/(.)\1{2,}/g, '$1');
  
  return textoNormalizado;
}

// Detección de patrones de ataque
function detectarPatronesAtaque(texto) {
  // Detección de scripts y contenido malicioso
  const patronesMaliciosos = [
    // Scripts y alertas
    /<\s*script/i,
    /alert\s*\(/i,
    /document\.cookie/i,
    /document\.location/i,
    /window\.location/i,
    /localStorage/i,
    /sessionStorage/i,
    
    // Iframes
    /<\s*iframe/i,
    
    // Inyección de imágenes con onerror
    /<\s*img[^>]*\s+onerror\s*=/i,
    
    // Eventos en línea
    /\bon\w+\s*=/i,
    
    // Base64 sospechoso (podría indicar código ofuscado)
    /data:text\/html;base64,[A-Za-z0-9+/]{30,}/i,
    
    // URL sospechosas
    /https?:\/\/[^\s]{1,5}\.[^\s]{1,3}\//i, // URLs muy cortas son sospechosas
    
    // Patrones de flood (caracteres repetidos)
    /(.)\1{15,}/,
    
    // Comandos de sistema sospechosos
    /\b(exec|system|passthru|shell_exec|phpinfo)\b/i,
    
    // Intentos de SQL injection
    /'\s*OR\s*'1'\s*=\s*'1/i,
    /"\s*OR\s*"1"\s*=\s*"1/i,
    /--\s/,
    /UNION\s+SELECT/i
  ];
  
  for (const patron of patronesMaliciosos) {
    if (patron.test(texto)) {
      return true;
    }
  }
  
  return false;
}

// Detección de patrones de spam más avanzada
function detectarPatronesSpam(texto) {
  // Detección de URLs excesivas
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urlMatches = texto.match(urlRegex) || [];
  if (urlMatches.length > 3) {
    return true;
  }
  
  // Detección de repetición excesiva (posible spam)
  const palabras = texto.split(/\s+/);
  const palabrasUnicas = new Set(palabras);
  if (palabras.length > 15 && palabrasUnicas.size < palabras.length * 0.4) {
    return true;
  }
  
  // Detección de texto completamente en mayúsculas (gritar)
  if (texto.length > 20 && texto === texto.toUpperCase() && texto.match(/[A-ZÁ-Ú]{20,}/)) {
    return true;
  }
  
  return false;
}

// Lista normalizada de palabras prohibidas y patrones regex
const BAD_WORDS_NORM = BAD_WORDS.map(word => {
  // Si parece un patrón regex, no lo normalices
  if (word.includes("+") || word.includes("*") || word.includes("[")) {
    return word;
  }
  return normalize(word);
});

// Devuelve todas las palabras ofensivas encontradas en el texto
function palabrasOfensivasEncontradas(texto) {
  // Texto original normalizado
  const textoNorm = normalize(texto);
  
  // Texto con detección de evasiones comunes
  const textoEvadido = detectarEvasiones(texto);
  
  const encontradas = [];
  
  // Buscar en ambas versiones del texto
  [textoNorm, textoEvadido].forEach(textoAnalizado => {
    for (let bad of BAD_WORDS_NORM) {
      // Si es un patrón con caracteres especiales de regex
      if (bad.includes("+") || bad.includes("*") || bad.includes("[")) {
        try {
          const regex = new RegExp(bad, "i");
          if (regex.test(textoAnalizado)) {
            encontradas.push(bad);
          }
        } catch (e) {
          console.error("Error en patrón regex:", bad);
        }
      } else {
        // Buscar como palabra completa
        const regex = new RegExp(`\\b${bad}\\b`, "i");
        if (regex.test(textoAnalizado)) {
          encontradas.push(bad);
        }
      }
    }
  });
  
  return encontradas;
}

// Función principal para detectar contenido prohibido
window.contienePalabraOfensiva = function(texto) {
  // Verificar contenido malicioso de ataque primero
  if (detectarPatronesAtaque(texto)) {
    showNotification("Se ha detectado contenido potencialmente peligroso", "error");
    return true;
  }
  
  // Verificar si contiene palabras ofensivas
  const palabras = palabrasOfensivasEncontradas(texto);
  if (palabras.length > 0) {
    showNotification(`Tu mensaje contiene contenido inapropiado`, "error");
    return true;
  }
  
  // Verificar si parece spam
  if (detectarPatronesSpam(texto)) {
    showNotification("Tu mensaje ha sido detectado como posible spam", "error");
    return true;
  }
  
  return false;
};