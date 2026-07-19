// Lib — Utilitaire d'extraction JSON robuste
// L'IA peut renvoyer du JSON pur, enveloppé dans ```json, ou avec des strings mal échappées.

export function extractJSON<T = unknown>(content: string): { parsed: T | null; raw: string } {
  // 0) Nettoyage de base : retirer BOM, espaces en début/fin
  const cleaned = content.trim().replace(/^\uFEFF/, '');

  // 1) Parser directement
  try {
    return { parsed: JSON.parse(cleaned) as T, raw: content };
  } catch {
    // continuer
  }

  // 2) Retirer les fences markdown ```json ... ``` ou ``` ... ```
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    const inner = fenceMatch[1].trim();
    try {
      return { parsed: JSON.parse(inner) as T, raw: content };
    } catch {
      // continuer — tenter la réparation sur inner
      const repaired = repairJSON(inner);
      if (repaired) {
        try {
          return { parsed: JSON.parse(repaired) as T, raw: content };
        } catch {
          // continuer
        }
      }
    }
  }

  // 3) Extraire le premier bloc { ... } équilibré
  const start = cleaned.indexOf('{');
  if (start !== -1) {
    const balanced = extractBalancedBraces(cleaned, start);
    if (balanced) {
      try {
        return { parsed: JSON.parse(balanced) as T, raw: content };
      } catch {
        // tenter réparation
        const repaired = repairJSON(balanced);
        if (repaired) {
          try {
            return { parsed: JSON.parse(repaired) as T, raw: content };
          } catch {
            // continuer
          }
        }
      }
    }
  }

  // 4) Dernier recours : greedy regex + réparation
  const greedy = cleaned.match(/\{[\s\S]*\}/);
  if (greedy) {
    try {
      return { parsed: JSON.parse(greedy[0]) as T, raw: content };
    } catch {
      const repaired = repairJSON(greedy[0]);
      if (repaired) {
        try {
          return { parsed: JSON.parse(repaired) as T, raw: content };
        } catch {
          // échec total
        }
      }
    }
  }

  return { parsed: null, raw: content };
}

// Extraction du bloc { ... } équilibré (en tenant compte des strings)
function extractBalancedBraces(s: string, start: number): string | null {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

// Réparation des strings mal échappées dans les arrays
// L'IA oublie souvent des guillemets ouvrants/fermants dans les listes de hashtags
// ex: ["#Foo, #Bar", #Baz"] -> ["#Foo, #Bar", "#Baz"]
function repairJSON(s: string): string | null {
  let result = s;

  // 1) Réparer les éléments d'array non-quotés (ex: [#Foo, "#Bar"] -> ["#Foo", "#Bar"])
  // Pattern: dans un array, on trouve un #X sans guillemet -> on l'entoure
  result = result.replace(
    /(\[|\,\s*)(#?[^\s"',\]]+[^\s"',\]]*)/g,
    (match, prefix, word) => {
      // Vérifier que le mot n'est pas déjà quoté
      const trimmed = word.trim();
      if (trimmed.startsWith('"')) return match;
      return `${prefix}"${trimmed}"`;
    }
  );

  // 2) Supprimer les caractères non-ASCII qui pourraient casser le parsing (caractères chinois, etc.)
  // On garde les emojis et les accents français/ouest-africains
  // Conserver : ASCII, Latin-1, Latin Extended, emojis
  // Supprimer : CJK (0x4E00-0x9FFF), Katakana, Hiragana
  result = result.replace(/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/g, '');

  // 3) Réparer les virgules manquantes entre éléments d'array
  // ex: ["#Foo" "#Bar"] -> ["#Foo", "#Bar"]
  result = result.replace(/"\s+"\]/g, '", "]'); // border case
  result = result.replace(/"(\s+)"(#)/g, '", "$2');

  // 4) Réparer les guillemets courbes (smart quotes) -> quotes droites
  result = result.replace(/[\u201C\u201D]/g, '"');
  result = result.replace(/[\u2018\u2019]/g, "'");

  return result;
}
