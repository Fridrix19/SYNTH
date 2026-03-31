const { prisma } = require('../lib/prisma');

function rowToItem(row) {
  const o = { id: row.id, name: row.name, price: row.price };
  if (row.image) o.image = row.image;
  if (row.socket) o.socket = row.socket;
  if (row.hot) o.hot = true;
  if (row.isAmd) o.isAmd = true;
  return o;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rows = await prisma.component.findMany({
      orderBy: [{ sourceKey: 'asc' }, { name: 'asc' }],
    });

    const out = {};
    for (const row of rows) {
      const key = row.sourceKey;
      if (!out[key]) out[key] = [];
      out[key].push(rowToItem(row));
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    return res.status(200).json(out);
  } catch (e) {
    console.error(e);
    const body = { error: 'Database unavailable' };
    if (process.env.API_DB_DEBUG === '1') {
      body.prismaCode = e.code;
      body.hint = e.message ? String(e.message).slice(0, 400) : undefined;
    }
    return res.status(500).json(body);
  }
};
