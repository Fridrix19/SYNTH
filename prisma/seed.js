const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.join(__dirname, '..', 'data', 'components.json');
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);

  await prisma.component.deleteMany();

  for (const [sourceKey, items] of Object.entries(data)) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (!item.id || item.name == null || item.price == null) continue;
      await prisma.component.create({
        data: {
          id: String(item.id),
          sourceKey,
          name: String(item.name),
          price: Number(item.price),
          image: item.image != null ? String(item.image) : null,
          socket: item.socket != null ? String(item.socket) : null,
          hot: Boolean(item.hot),
          isAmd: Boolean(item.isAmd),
        },
      });
    }
  }

  const buildsPath = path.join(__dirname, '..', 'data', 'builds.json');
  const buildsRaw = fs.readFileSync(buildsPath, 'utf8');
  const builds = JSON.parse(buildsRaw);

  await prisma.readyBuild.deleteMany();

  if (Array.isArray(builds)) {
    for (const b of builds) {
      if (!b.id || b.name == null || b.price == null) continue;
      await prisma.readyBuild.create({
        data: {
          id: String(b.id),
          name: String(b.name),
          specs: String(b.specs || ''),
          price: Number(b.price),
          image: b.image != null ? String(b.image) : null,
          cpu: String(b.cpu || ''),
          gpu: String(b.gpu || ''),
          ram: String(b.ram || ''),
          storage: String(b.storage || ''),
          cooling: String(b.cooling || ''),
          badge: b.badge != null ? String(b.badge) : null,
          sortOrder: Number(b.sortOrder) || 0,
          homeOrder: b.homeOrder != null ? Number(b.homeOrder) : null,
        },
      });
    }
  }

  const count = await prisma.component.count();
  const buildCount = await prisma.readyBuild.count();
  console.log('Seeded components:', count, 'ready builds:', buildCount);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
