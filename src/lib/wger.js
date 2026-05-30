// Busca imagens de exercícios na API pública do wger.de com cache em memória.
const _cache = new Map();

export async function buscarImagemExercicio(englishName) {
  if (_cache.has(englishName)) return _cache.get(englishName);
  try {
    const res = await fetch(
      `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(englishName)}&language=english&format=json`,
      { headers: { Accept: "application/json" } }
    );
    const data = await res.json();
    const image = data.suggestions?.[0]?.data?.image ?? null;
    _cache.set(englishName, image);
    return image;
  } catch {
    _cache.set(englishName, null);
    return null;
  }
}
