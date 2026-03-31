const { prisma } = require('../lib/prisma');

function rowToJson(row) {
  return {
    id: row.id,
    name: row.name,
    specs: row.specs,
    price: row.price,
    image: row.image,
    cpu: row.cpu,
    gpu: row.gpu,
    ram: row.ram,
    storage: row.storage,
    cooling: row.cooling,
    badge: row.badge,
    sortOrder: row.sortOrder,
    homeOrder: row.homeOrder,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rows = await prisma.readyBuild.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    return res.status(200).json(rows.map(rowToJson));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database unavailable' });
  }
};
