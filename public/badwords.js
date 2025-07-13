// Lista robusta de palabras ofensivas (puedes ampliarla siempre que quieras)
const BAD_WORDS = [
  "puta", "puto", "put@", "pvt@", "pvt0", "pvto", "p-u-t-a", "p-u-t-o", "putita", "putito", "mierda", "m1erda", "mierd@", "mi3rda",
  "gilipollas", "gilipolla", "gil1pollas", "g1lipollas", "gilipoyas", "idiota", "idi0ta", "idiot@", "1diota",
  "imbecil", "imbécil", "1mbecil", "tonto", "tonta", "ton-to", "t0nto", "t0nta", "tont@", "maricon", "maricón", "mar1con", "maric0n", "marik0n", "marika", "mariquita", "marica",
  "pendejo", "pendeja", "p3ndejo", "p3ndeja", "cabron", "cabrón", "cabrona", "cabron@", "c4bron", "c4brona", "culiao", "culiáo", "culiador", "culero", "culera", "c0lero", "c0lera",
  "verga", "verg4", "v3rga", "v3rg4", "pija", "pijudo", "pijita", "pijota", "p1ja", "p1j4", "concha", "conchuda", "conchudo", "conchetumadre", "conch4", "coño", "coñazo", "c0ño", "chinga", "chingar", "chingada", "chingado", "chingón", "chingona", "chingatumadre",
  "joder", "jodido", "jodida", "jodete", "jódete", "zorra", "zorr@", "z0rra", "zorrita", "zorrón", "perra", "perro", "perr@", "p3rra", "perrito", "perrote", "mamada", "mamón", "mamona", "mam0n", "mam0na", "polla", "p0lla", "p0ya", "culo", "culito", "culazo", "culona", "culón", "pedo", "pedorra", "pedorro", "p3do", "tetas", "teta", "tetona", "tetón", "t3tas", "choto", "chotar", "chotazo", "ch0to", "vergas", "vergaso", "vergazos", "garcha", "garcho", "garchuda", "garchudo", "pito", "pitito", "p1to", "penes", "ano", "an0", "nalga", "sexo", "sexual", "sexy", "sex0", "porn", "porno", "pornografía", "coger", "cogida", "cogido", "follar", "follada", "follado", "tragar", "tragada", "chupame", "chupala", "chupalo", "lamer", "lamela", "sopla", "soplapollas", "pelotudo", "pelotuda", "boludo", "boluda", "cornudo", "cornuda", "malparido", "malparida", "hijueputa", "hijo de puta", "hija de puta", "hdp", "carajo", "baboso", "babosa", "bastardo", "bastarda", "estupido", "estúpido", "estupida", "estúpida", "mamaguevo", "mamagueva", "mamador", "mamadora",
  // Inglés y variantes
  "fuck", "fucking", "fucker", "fuk", "fuker", "shit", "shitty", "sh1t", "asshole", "as-hole", "ass", "azz", "bitch", "b1tch", "biatch", "bich", "biches", "beetch", "bastard", "cunt", "kunt", "dick", "d1ck", "d!ck", "dik", "dickhead", "dickweed", "dickwad", "pussy", "pusy", "pussies", "cum", "cumming", "cumshot", "pornstar", "sex", "sexy", "dildo", "dildos", "fap", "fapper", "fapping", "jerk", "jerking", "jerkoff", "wank", "wanker", "cock", "c0ck", "cocksucker", "balls", "anus", "butt", "butthole", "buttocks", "sodomy", "sodomize", "queer", "lez", "lesbian", "dyke", "spic", "kike", "chink", "gook", "wetback", "beaner", "motherfucker", "son of a bitch", "twat", "arse", "arsehole", "shithead", "shitface", "shitbag", "douche", "douchebag", "jackass", "jackoff", "shemale", "tranny", "orgy", "orgasm", "rape", "rapist", "molest", "molester", "bestiality", "nutjob", "nutcase", "screwball"
];

// Filtro robusto gratis
function normalize(text) {
  return text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // tildes
    .replace(/[^a-zA-Z0-9\s]/g, "") // símbolos
    .replace(/\s+/g, "") // espacios
    .toLowerCase();
}

function contienePalabrasOfensivas(texto) {
  const textoNorm = normalize(texto);
  for (let bad of BAD_WORDS) {
    if (textoNorm.includes(normalize(bad))) return true;
  }
  return false;
}
