// Busca imagens de exercícios na API pública do wger.de com cache em memória.
const _cache = new Map();
const BASE = "https://wger.de";

function absoluta(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${BASE}${url}`;
}

export async function buscarImagemExercicio(englishName) {
  if (_cache.has(englishName)) return _cache.get(englishName);

  const salvar = (url) => { _cache.set(englishName, url); return url; };

  try {
    // 1ª tentativa: endpoint de busca (retorna URL relativa)
    const res = await fetch(
      `${BASE}/api/v2/exercise/search/?term=${encodeURIComponent(englishName)}&language=english&format=json`
    );
    if (res.ok) {
      const data = await res.json();
      const sug = data.suggestions?.[0]?.data;

      // Imagem direta na sugestão (pode ser caminho relativo)
      if (sug?.image) return salvar(absoluta(sug.image));

      // Sem imagem na sugestão mas temos o base_id → buscar exerciseimage
      if (sug?.base_id) {
        const imgRes = await fetch(
          `${BASE}/api/v2/exerciseimage/?exercise=${sug.base_id}&format=json`
        );
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          const img =
            imgData.results?.find((r) => r.is_main)?.image ??
            imgData.results?.[0]?.image ??
            null;
          return salvar(absoluta(img));
        }
      }
    }

    // 2ª tentativa: buscar pelo exercício diretamente (language=2 = inglês)
    const listRes = await fetch(
      `${BASE}/api/v2/exercise/?format=json&language=2&limit=5&name=${encodeURIComponent(englishName)}`
    );
    if (listRes.ok) {
      const listData = await listRes.json();
      const id = listData.results?.[0]?.id;
      if (id) {
        const imgRes = await fetch(
          `${BASE}/api/v2/exerciseimage/?exercise=${id}&format=json`
        );
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          const img =
            imgData.results?.find((r) => r.is_main)?.image ??
            imgData.results?.[0]?.image ??
            null;
          return salvar(absoluta(img));
        }
      }
    }
  } catch {
    // rede indisponível — retorna null silenciosamente
  }

  return salvar(null);
}
