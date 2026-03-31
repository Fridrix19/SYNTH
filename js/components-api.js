function encodeAssetUrl(relPath) {
  if (!relPath || typeof relPath !== 'string') return '';
  return relPath.split('/').map(encodeURIComponent).join('/');
}

async function fetchComponentsDb() {
  const urls = ['/api/components', 'data/components.json'];
  for (let i = 0; i < urls.length; i++) {
    try {
      var r = await fetch(urls[i], { headers: { Accept: 'application/json' } });
      if (!r.ok) continue;
      var data = await r.json();
      if (data && typeof data === 'object' && !data.error && (data.cpu || data.gpu || data.case)) {
        return data;
      }
    } catch (e) {
      /* try next */
    }
  }
  return null;
}

function normalizeReadyBuildRow(row) {
  if (!row || !row.id) return null;
  return {
    id: row.id,
    name: row.name,
    category: 'builds',
    cpu: row.cpu,
    gpu: row.gpu,
    price: Number(row.price) || 0,
    specs: row.specs || '',
    ram: row.ram || '',
    storage: row.storage || '',
    cooling: row.cooling || '',
    image: row.image || null,
    badge: row.badge != null ? row.badge : null,
    homeOrder: row.homeOrder != null ? Number(row.homeOrder) : null,
    sortOrder: row.sortOrder != null ? Number(row.sortOrder) : 0,
  };
}

async function fetchBuildsDb() {
  const urls = ['/api/builds', 'data/builds.json'];
  for (let i = 0; i < urls.length; i++) {
    try {
      var r = await fetch(urls[i], { headers: { Accept: 'application/json' } });
      if (!r.ok) continue;
      var data = await r.json();
      if (data && data.error) continue;
      var list = Array.isArray(data) ? data : null;
      if (!list || !list.length) continue;
      var out = [];
      for (var j = 0; j < list.length; j++) {
        var item = normalizeReadyBuildRow(list[j]);
        if (item) out.push(item);
      }
      if (out.length) return out;
    } catch (e) {
      /* try next */
    }
  }
  return null;
}
