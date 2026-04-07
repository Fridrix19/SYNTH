document.addEventListener('DOMContentLoaded', async () => {
  await initHomeBuildsGrid();
  initTilt();
  initScrollAnimations();
  if (document.getElementById('partsContainer')) {
    initPartSelection();
    filterParts('gpu');
  }
  if (document.getElementById('orderForm')) {
    initOrderForm();
  }
});

function escHomeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function homeBuildCardHtml(b) {
  const name = b.name || '';
  const specs = b.specs || '';
  const price = (Number(b.price) || 0).toLocaleString('ru-RU');
  const src =
    b.image && typeof encodeAssetUrl === 'function'
      ? encodeAssetUrl(b.image)
      : b.image || '';
  const badge = b.badge ? `<span class="build-badge">${escHomeHtml(b.badge)}</span>` : '';
  const safeSrc = escHomeHtml(src);
  const safeName = escHomeHtml(name);
  const safeSpecs = escHomeHtml(specs);
  return `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card build-card">
            <div class="build-card-photo-wrap"><img class="build-card-photo" src="${safeSrc}" alt="${safeName}" loading="eager" decoding="async" width="480" height="480" onerror="this.closest('.build-card-photo-wrap').classList.add('no-photo')"></div>
            <div class="card-body">
              ${badge}
              <h3 class="card-title">${safeName}</h3>
              <p class="card-text text-muted">${safeSpecs}</p>
              <p class="build-price">${price} ₽</p>
              <a href="catalog.html" class="btn btn-synth btn-sm w-100 mt-auto">В каталог</a>
            </div>
          </div>
        </div>`;
}

async function initHomeBuildsGrid() {
  const el = document.getElementById('homeBuildsGrid');
  if (!el) return;

  let list = [];
  try {
    if (typeof fetchBuildsDb === 'function') {
      const fetched = await fetchBuildsDb();
      if (fetched && fetched.length) list = fetched;
    }
  } catch (_) {}

  const featured = list
    .filter((b) => b.homeOrder != null)
    .sort((a, b) => (a.homeOrder || 0) - (b.homeOrder || 0));

  if (featured.length) {
    el.innerHTML = featured.map(homeBuildCardHtml).join('');
  }
  el.removeAttribute('aria-busy');
}

function initTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card');
  if (typeof VanillaTilt !== 'undefined' && tiltCards.length) {
    VanillaTilt.init(tiltCards, {
      max: 8,
      speed: 400,
      glare: true,
      'max-glare': 0.15,
      scale: 1.02
    });
  }
}

function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* Hero: только CSS-анимации (styles.css), без gsap.from — иначе после загрузки/refresh
     GSAP мог оставлять кнопке opacity:0 или конфликтовать с анимацией заголовка */

  gsap.from('.popular-builds .builds-grid', {
    scrollTrigger: {
      trigger: '.popular-builds',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 24,
    duration: 0.55,
    ease: 'power2.out'
  });

  gsap.from('.configurator-cta', {
    scrollTrigger: {
      trigger: '.configurator-cta',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 30,
    duration: 0.6,
    ease: 'power2.out'
  });
}

let selectedParts = {};
const totalBar = document.getElementById('totalBar');
const totalValue = document.getElementById('totalValue');

function initPartSelection() {
  const partCards = document.querySelectorAll('.part-card');
  const categoryBtns = document.querySelectorAll('.config-categories .list-group-item');

  partCards.forEach(card => {
    const btn = card.querySelector('.btn-select');
    const price = parseInt(card.dataset.price, 10);
    const partType = card.dataset.part;

    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePart(card, partType, price);
      });
    }

    card.addEventListener('click', (e) => {
      if (!e.target.closest('.btn-select')) return;
      togglePart(card, partType, price);
    });
  });

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterParts(btn.dataset.category);
    });
  });
}

function togglePart(card, partType, price) {
  const wasSelected = card.classList.contains('selected');
  const allInCategory = document.querySelectorAll(`.part-card[data-part="${partType}"]`);

  allInCategory.forEach(c => c.classList.remove('selected'));
  if (!wasSelected) {
    card.classList.add('selected');
    selectedParts[partType] = { price };
  } else {
    delete selectedParts[partType];
  }

  updateTotal();
}

function filterParts(category) {
  const parts = document.querySelectorAll('.part-card');
  parts.forEach(part => {
    part.style.display = part.dataset.part === category ? '' : 'none';
  });
}

function updateTotal() {
  if (!totalValue) return;
  let sum = 0;
  Object.values(selectedParts).forEach(p => sum += p.price);

  totalValue.textContent = sum.toLocaleString('ru-RU') + ' ₽';

  if (totalBar) {
    totalBar.classList.add('updated');
    setTimeout(() => totalBar.classList.remove('updated'), 400);
  }
}

function initOrderForm() {
  const form = document.getElementById('orderForm');
  const successToast = document.getElementById('successToast');

  if (form && successToast) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const toast = new bootstrap.Toast(successToast);
      toast.show();

      form.reset();
    });
  }
}
