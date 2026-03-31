# Пути к изображениям

## Готовые ПК — `atribut/done_pc/`

| Файл | Назначение |
|------|------------|
| `b1.png` … `b10.png` | Сборки в каталоге (`readyBuilds`) |
| `streaming.png` | Карточка «Streaming» на главной |
| `workstation.png` | Карточка «Workstation» на главной |

## Корпуса — `atribut/box/`

| Файл в `data/components.json` |
|-------------------------------|
| `atribut/box/case-atx-standard.png` |
| `atribut/box/case-atx-glass.png` |
| `atribut/box/case-mini-itx.png` |

## Остальное

Материнские платы, БП, GPU и т.д. — как в `components.json`, обычно под `atribut/motherboard/`, `atribut/psu/`, `atribut/cpu/` и т.д.

После смены путей в JSON при использовании БД: `npm run db:seed`.
