// Lista ultra extensa de palabras ofensivas y variantes
const BAD_WORDS = [
  "puta", "puto", "put@", "pvt@", "pvt0", "pvto", "p-u-t-a", "p-u-t-o", "putita", "putito", "putear", "puteada", "puteado",
  "zorra", "zorr@", "z0rra", "zorrazo", "zorrón", "zorrita", "putita", "putazo", "putazos", "putear", "puterio",
  "mierda", "m1erda", "mierd@", "mi3rda", "mierdero", "mierdita", "mierdoso", "mierdosa",
  "gilipollas", "gilipolla", "gil1pollas", "g1lipollas", "gilipoyas", "gili", "gilipuertas", "gil",
  "idiota", "idi0ta", "idiot@", "1diota", "idiotez", "idiotismo",
  "imbecil", "imbécil", "1mbecil", "imbecil@", "imbecilada",
  "tonto", "tonta", "ton-to", "t0nto", "t0nta", "tont@", "tontito", "tontita", "tontolaba", "tontuelo",
  "maricon", "maricón", "mar1con", "maric0n", "marik0n", "marika", "mariquita", "marica", "mariconazo", "marik@", "marikón", "maricón@", "maricon@",
  "pendejo", "pendeja", "p3ndejo", "p3ndeja", "pendej@", "pendejito", "pendejita", "pendejada", "pendejazo",
  "cabron", "cabrón", "cabrona", "cabron@", "c4bron", "c4brona", "cabrones", "cabronazo", "cabroncete", "cabronada",
  "culiao", "culiáo", "culiador", "culero", "culera", "c0lero", "c0lera", "culiaron", "culiada", "culiando", "culiador", "culiadores",
  "verga", "verg4", "v3rga", "v3rg4", "vergon", "vergon@", "vergudo", "verguita", "vergota", "vergudo", "vergona",
  "pija", "pijudo", "pijita", "pijota", "p1ja", "p1j4", "pijudo", "pijuda", "pijote", "pijas",
  "concha", "conchuda", "conchudo", "conchetumadre", "conch4", "conchudo", "conchuda", "conchudo@", "conchuda@", "conchud@", "conchadetumadre",
  "coño", "coñazo", "c0ño", "c0ñazo", "coñuda", "coñudo",
  "chinga", "chingar", "chingada", "chingado", "chingón", "chingona", "chingatumadre", "chingadera", "chingadazo", "chingones", "chingadaso", "chingadita",
  "joder", "jodido", "jodida", "jodete", "jódete", "jodete", "jodedor", "jodedora", "jodiendo",
  "perra", "perro", "perr@", "p3rra", "perrito", "perrote", "perrucho", "perrote", "perruno",
  "mamada", "mamón", "mamona", "mam0n", "mam0na", "mamoncete", "mamoncita", "mamoncito", "mamadas", "mamadita", "mamadote",
  "pedo", "pedorra", "pedorro", "p3do", "pedorro", "pedorra", "pedote", "pedorrazo",
  "tetas", "teta", "tetona", "tetón", "t3tas", "tetazas", "tetitas", "tetotas",
  "choto", "chotar", "chotazo", "ch0to", "chotada", "choteada", "chotito",
  "garcha", "garcho", "garchuda", "garchudo", "garchar", "garchando", "garchad@", "garchadito",
  "pito", "pitito", "p1to", "pitón", "pitudo", "pituda",
  "penes", "pene", "penecillo", "penecito", "penecillo",
  "ano", "an0", "anito", "anote", "anillo", "anoso",
  "nalga", "nalgas", "nalgona", "nalgón", "nalgotas", "nalguero", "nalgueta",
  "sexo", "sexual", "sexy", "sex0", "sexuado", "sexista", "sexualmente",
  "porn", "porno", "pornografía", "pornografico", "pornógrafo", "pornstar", "pornografo",
  "coger", "cogida", "cogido", "cogiéndo", "cogiendo",
  "follar", "follada", "follado", "follando", "follón", "follona", "follonero", "follonera",
  "tragar", "tragada", "tragado", "tragando", "tragadito",
  "chupame", "chupala", "chupalo", "chupamela", "chupamelo", "chupandola", "chupandolo",
  "lamer", "lamela", "lamelo", "lamete", "lametela", "lametelo",
  "sopla", "soplapollas", "soplapolla", "soplagaitas", "soplapitos", "soplaojete",
  "pelotudo", "pelotuda", "pelotud@", "pelotudazo", "pelotudita", "pelotudez", "pelotudear", "pelotudeando",
  "boludo", "boluda", "boludez", "boludear", "boludito", "boludazo", "boludona", "boludita",
  "cornudo", "cornuda", "cornud@", "cornudazo", "cornudita",
  "malparido", "malparida", "malparid@", "malparidito", "malparidez",
  "hijueputa", "hijo de puta", "hija de puta", "hdp", "hijoepu", "hijoep", "hijodepu", "hijodep",
  "carajo", "carajito", "carajazo", "carajuda", "carajudo",
  "baboso", "babosa", "babos@", "babosazo", "babosita", "babosito",
  "bastardo", "bastarda", "bastard@", "bastardito", "bastardilla",
  "estupido", "estúpido", "estupida", "estúpida", "estupid@", "estupidazo", "estupidita",
  "mamaguevo", "mamagueva", "mamador", "mamadora", "mamame", "mamamela", "mamamelo",
  // Discriminación y racismo
  "negro", "negra", "negrata", "negraco", "negrero", "negrita", "negrucho", "negrito", "negrona", "negrón", "negrillo",
  "indio", "india", "indiecito", "indiada", "indigena", "indígena", "indigente", "indio de mierda", "india de mierda",
  "judío", "judia", "judío de mierda", "judia de mierda", "judios", "judias",
  "gitano", "gitana", "gitanos", "gitanas", "gitanada", "gitanillo", "gitanona",
  "sudaca", "sudaca de mierda",
  "chino", "china", "chinito", "chinita", "chinos", "chinas", "chinada", "chinada de mierda",
  "putin", // por contexto puede ser ofensivo
  // Insultos ingleses (y variantes)
  "fuck", "fucking", "fucker", "fuk", "fuker", "fuckoff", "fuckyou", "motherfucker", "motherfuck", "motherfuker", "sonofabitch", "son of a bitch",
  "shit", "shitty", "sh1t", "shithead", "shitface", "shitbag", "shitass", "shitfuck", "shitfaced",
  "asshole", "arsehole", "as-hole", "ass", "azz", "asshat", "asslick", "asslicker", "assfucker", "assfucker", "dumbass", "jackass",
  "bitch", "b1tch", "biatch", "biches", "beetch", "bitchy", "bitchass", "bitchface", "sumbitch",
  "bastard", "bastards", "bastardly",
  "cunt", "kunt", "cnt", "cunting", "cunty",
  "dick", "d1ck", "d!ck", "dik", "dickhead", "dickweed", "dickwad", "dickface", "dickhole",
  "pussy", "pusy", "pussies", "puss", "pussyclart", "pussyclit", "pussyeater", "pussyfucker",
  "cum", "cumming", "cumshot", "cumdump", "cumslut", "cumbucket",
  "porn", "porno", "pornstar", "pornographic", "pornography", "pornographer",
  "sex", "sexy", "sexist", "sexual", "sexuality", "sexualize",
  "dildo", "dildos", "dildohead", "dildoes",
  "fap", "fapper", "fapping", "fappening",
  "jerk", "jerking", "jerkoff", "jerkass", "jerkface",
  "wank", "wanker", "wanking",
  "cock", "c0ck", "cocksucker", "cockhead", "cockface", "cockslap", "cocksmoker", "cockbite",
  "balls", "ballbag", "balllicker", "ballbuster", "ballsy",
  "anus", "butt", "butthole", "buttocks", "buttfuck", "buttfucker", "buttface",
  "sodomy", "sodomize", "sodomized",
  "queer", "lez", "lesbian", "dyke", "faggot", "fag", "fags", "faggy", "faggoty",
  "spic", "kike", "chink", "gook", "wetback", "beaner", "ape", "coon", "jigaboo", "tarbaby", "slant", "cracker", "honky",
  "tranny", "shemale", "ladyboy",
  "orgy", "orgasm", "orgasmo", "orgasms", "orgasmed",
  "rape", "rapist", "raping", "molest", "molester", "molestation", "incest", "bestiality", "zoofilia",
  "nutjob", "nutcase", "screwball", "psycho", "maniac", "lunatic", "insane", "retard", "retarded", "mongoloid", "idiot", "moron",
  // Variantes adicionales
  "mierdoso", "pichula", "vergas", "tragaleche", "tragaleches", "malnacido", "malnacida", "maldito", "maldita", "malparido", "malparida",
  "cagada", "cagado", "cagón", "cagona", "cagones", "culón", "culona", "culote", "culillo", "culin", "culera", "culeras"
  // ... sigue ampliando aquí ...
];

// Normaliza manteniendo espacios para usar regex \b (palabras completas)
function normalize(text) {
  return text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // tildes
    .replace(/[^\w\s@]/g, "") // quitar símbolos pero dejar letras/números/espacios/@
    .replace(/\s+/g, " ") // un solo espacio
    .toLowerCase().trim();
}

// Preprocesar la lista de palabras ofensivas normalizadas
const BAD_WORDS_NORM = BAD_WORDS.map(w => normalize(w));

// Filtro usando regex para buscar palabras completas (mejor precisión)
function contienePalabrasOfensivas(texto) {
  const textoNorm = normalize(texto);
  // Usamos \b para coincidir solo palabras completas o separadas por símbolos/espacios
  for (let bad of BAD_WORDS_NORM) {
    const regex = new RegExp(`\\b${bad}\\b`, "i");
    if (regex.test(textoNorm)) return true;
  }
  return false;
}
