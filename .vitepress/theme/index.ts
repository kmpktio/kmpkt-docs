import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import DefaultTheme from 'vitepress/theme';
import { inBrowser, useData } from 'vitepress';
import './custom.css';

let mermaidCounter = 0;

const MermaidDiagram = defineComponent({
  name: 'MermaidDiagram',
  props: {
    code: { type: String, required: true },
  },
  setup(props) {
    const svgHtml = ref('');
    const errorText = ref('');
    const dialogRef = ref<HTMLDialogElement | null>(null);
    const { isDark } = useData();

    async function render() {
      if (!inBrowser) return;
      const decoded = decodeURIComponent(props.code);
      try {
        const { default: mermaid } = await import('mermaid');
        const palette = PALETTES[paletteIndex.value];
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: isDark.value
            ? {
              darkMode: true,
              background: '#0B0F17',
              mainBkg: '#111827',
              primaryColor: '#111827',
              primaryTextColor: '#F8FAFC',
              primaryBorderColor: palette.c1,
              nodeBorder: palette.c1,
              lineColor: palette.c2,
              textColor: '#F8FAFC',
              edgeLabelBackground: '#111827',
              secondaryColor: '#161F30',
              tertiaryColor: '#0B0F17',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }
            : {
              darkMode: false,
              background: '#F8FAFC',
              mainBkg: '#FFFFFF',
              primaryColor: '#FFFFFF',
              primaryTextColor: '#0F172A',
              primaryBorderColor: palette.c1,
              nodeBorder: palette.c1,
              lineColor: palette.c2,
              textColor: '#0F172A',
              edgeLabelBackground: '#FFFFFF',
              secondaryColor: '#F1F5F9',
              tertiaryColor: '#F8FAFC',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            },
        });
        const id = `kmpkt-mermaid-${++mermaidCounter}`;
        const { svg } = await mermaid.render(id, decoded);
        svgHtml.value = svg;
        errorText.value = '';
      } catch (err) {
        console.error('[kmpkt-mermaid]', err);
        svgHtml.value = '';
        errorText.value = decoded;
      }
    }

    function openDialog() {
      dialogRef.value?.showModal();
    }

    function closeDialog() {
      dialogRef.value?.close();
    }

    function onDialogClick(e: MouseEvent) {
      if (e.target === dialogRef.value) {
        closeDialog();
      }
    }

    onMounted(render);
    watch([() => props.code, isDark, paletteIndex], render);

    return () => {
      if (svgHtml.value) {
        return h('div', { class: 'kmpkt-mermaid' }, [
          h(
            'button',
            {
              type: 'button',
              class: 'kmpkt-mermaid-expand',
              onClick: openDialog,
              title: 'Enlarge diagram',
              'aria-label': 'Enlarge diagram',
            },
            [
              h(
                'svg',
                {
                  width: 15,
                  height: 15,
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  stroke: 'currentColor',
                  'stroke-width': 2,
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round',
                },
                [
                  h('path', { d: 'M15 3h6v6' }),
                  h('path', { d: 'M9 21H3v-6' }),
                  h('path', { d: 'M21 3l-7 7' }),
                  h('path', { d: 'M3 21l7-7' }),
                ]
              ),
            ]
          ),
          h('div', { class: 'kmpkt-mermaid-canvas', innerHTML: svgHtml.value }),
          h(
            'dialog',
            {
              ref: dialogRef,
              class: 'kmpkt-mermaid-dialog',
              onClick: onDialogClick,
            },
            [
              h('div', { class: 'kmpkt-mermaid-dialog-inner' }, [
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'kmpkt-mermaid-close',
                    onClick: closeDialog,
                    title: 'Close (Esc)',
                    'aria-label': 'Close diagram',
                  },
                  [
                    h(
                      'svg',
                      {
                        width: 18,
                        height: 18,
                        viewBox: '0 0 24 24',
                        fill: 'none',
                        stroke: 'currentColor',
                        'stroke-width': 2,
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                      },
                      [
                        h('path', { d: 'M18 6 6 18' }),
                        h('path', { d: 'm6 6 12 12' }),
                      ]
                    ),
                  ]
                ),
                h('div', { class: 'kmpkt-mermaid-dialog-svg', innerHTML: svgHtml.value }),
              ]),
            ]
          ),
        ]);
      }
      if (errorText.value) {
        return h('pre', { class: 'kmpkt-mermaid' }, errorText.value);
      }
      return h('div', { class: 'kmpkt-mermaid' });
    };
  },
});

const PALETTES = [
  { c1: '#10B981', c2: '#34D399', c3: '#A3E635' },
  { c1: '#059669', c2: '#2DD4BF', c3: '#BEF264' },
  { c1: '#10B981', c2: '#06B6D4', c3: '#6366F1' },
  { c1: '#22C55E', c2: '#0EA5E9', c3: '#EC4899' },
  { c1: '#0369A1', c2: '#06B6D4', c3: '#A3E635' },
  { c1: '#3B82F6', c2: '#10B981', c3: '#FACC15' },
  { c1: '#84CC16', c2: '#FACC15', c3: '#F43F5E' },
  { c1: '#1D4ED8', c2: '#3B82F6', c3: '#93C5FD' },
];

const paletteIndex = ref(0);

function updateFavicon(p: { c1: string; c2: string; c3: string }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="7.5 3.5 49 57" fill="none"><defs><linearGradient id="g" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="${p.c1}"/><stop offset="50%" stop-color="${p.c2}"/><stop offset="100%" stop-color="${p.c3}"/></linearGradient><clipPath id="c"><path d="M30.5 4.8 C31.4 4.3 32.6 4.3 33.5 4.8 L54.5 16.9 C55.4 17.4 56 18.4 56 19.5 V44.5 C56 45.6 55.4 46.6 54.5 47.1 L33.5 59.2 C32.6 59.7 31.4 59.7 30.5 59.2 L9.5 47.1 C8.6 46.6 8 45.6 8 44.5 V19.5 C8 18.4 8.6 17.4 9.5 16.9 Z"/></clipPath></defs><g clip-path="url(#c)"><path d="M30.5 4.8 C31.4 4.3 32.6 4.3 33.5 4.8 L54.5 16.9 C55.4 17.4 56 18.4 56 19.5 V44.5 C56 45.6 55.4 46.6 54.5 47.1 L33.5 59.2 C32.6 59.7 31.4 59.7 30.5 59.2 L9.5 47.1 C8.6 46.6 8 45.6 8 44.5 V19.5 C8 18.4 8.6 17.4 9.5 16.9 Z" fill="url(#g)"/><path d="M32 -24 L80 4 L80 60 L32 32 Z" fill="#FFFFFF" opacity="0.10"/><path d="M-16 60 L32 32 L80 60 L32 88 Z" fill="#000000" opacity="0.16"/></g></svg>`;
  const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = href;
}

const PALETTE_STORAGE_KEY = 'kmpkt-palette';

function applyPalette(idx: number, persist = false) {
  paletteIndex.value = idx;
  if (!inBrowser) return;
  const p = PALETTES[idx];
  const root = document.documentElement.style;
  root.setProperty('--kmpkt-c1', p.c1);
  root.setProperty('--kmpkt-c2', p.c2);
  root.setProperty('--kmpkt-c3', p.c3);
  updateFavicon(p);
  if (persist) {
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, String(idx));
    } catch {
      // Ignore storage errors (e.g. private browsing restrictions)
    }
  }
}

let paletteRestored = false;

function restorePalette() {
  if (!inBrowser || paletteRestored) return;
  paletteRestored = true;
  try {
    const raw = localStorage.getItem(PALETTE_STORAGE_KEY);
    if (raw === null) return;
    const idx = Number.parseInt(raw, 10);
    if (!Number.isNaN(idx) && idx >= 0 && idx < PALETTES.length) {
      applyPalette(idx, false);
    }
  } catch {
    // Ignore storage errors
  }
}

function cyclePalette() {
  applyPalette((paletteIndex.value + 1) % PALETTES.length, true);
}

function buildPostmarkZigzagRow(rowIndex: number) {
  const peaks = 3;
  const rows = 3;
  const gap = 9.0;
  const totalWidth = 30;
  const segs = peaks * 2;
  const dx = totalWidth / segs;
  const dy = dx * 0.57735;
  const startX = 32 - totalWidth / 2 + 11.5;
  const centerY = 32 + 1.5;
  const firstY = centerY - ((rows - 1) * gap) / 2 + dy / 2;
  const baseY = firstY + rowIndex * gap;

  let d = `M${startX.toFixed(2)} ${baseY.toFixed(2)}`;
  for (let s = 1; s <= segs; s++) {
    const x = startX + s * dx;
    const y = s % 2 === 1 ? baseY - dy : baseY;
    d += ` L${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

function renderPostmarkStamp(partRefs: (SVGGElement | null)[]) {
  const rows = [0, 1, 2].map((i) => buildPostmarkZigzagRow(i));

  return h(
    'svg',
    {
      class: 'kmpkt-hero-stamp',
      viewBox: '7.5 3.5 49 57',
      fill: 'none',
      'aria-hidden': 'true',
    },
    [
      h(
        'g',
        {
          class: 'kmpkt-postmark-stroke',
          fill: 'none',
          'stroke-linecap': 'butt',
          'stroke-linejoin': 'miter',
          'stroke-miterlimit': '4',
        },
        [
          h(
            'g',
            { ref: (el) => { partRefs[0] = el as SVGGElement | null; } },
            [h('circle', { cx: '13.5', cy: '26.5', r: '10.5', 'stroke-width': '2.0' })]
          ),
          h(
            'g',
            { ref: (el) => { partRefs[1] = el as SVGGElement | null; } },
            [h('circle', { cx: '13.5', cy: '26.5', r: '6.5', 'stroke-width': '2.0' })]
          ),
          ...rows.map((d, idx) =>
            h(
              'g',
              { ref: (el) => { partRefs[idx + 2] = el as SVGGElement | null; } },
              [h('path', { d, 'stroke-width': '2.1' })]
            )
          ),
        ]
      ),
    ]
  );
}

const NavHexIcon = defineComponent({
  name: 'NavHexIcon',
  setup() {
    onMounted(restorePalette);
    return () => {
      const palette = PALETTES[paletteIndex.value];
      return h(
        'svg',
        {
          class: 'kmpkt-nav-hex',
          viewBox: '7.5 3.5 49 57',
          fill: 'none',
          'aria-hidden': 'true',
        },
        [
          h('defs', [
            h(
              'linearGradient',
              {
                id: 'kmpkt-nav-grad',
                x1: '8',
                y1: '6',
                x2: '56',
                y2: '58',
                gradientUnits: 'userSpaceOnUse',
              },
              [
                h('stop', { offset: '0%', 'stop-color': palette.c1 }),
                h('stop', { offset: '50%', 'stop-color': palette.c2 }),
                h('stop', { offset: '100%', 'stop-color': palette.c3 }),
              ]
            ),
            h('clipPath', { id: 'kmpkt-nav-clip' }, [
              h('path', {
                d: 'M30.5 4.8 C31.4 4.3 32.6 4.3 33.5 4.8 L54.5 16.9 C55.4 17.4 56 18.4 56 19.5 V44.5 C56 45.6 55.4 46.6 54.5 47.1 L33.5 59.2 C32.6 59.7 31.4 59.7 30.5 59.2 L9.5 47.1 C8.6 46.6 8 45.6 8 44.5 V19.5 C8 18.4 8.6 17.4 9.5 16.9 Z',
              }),
            ]),
          ]),
          h('g', { 'clip-path': 'url(#kmpkt-nav-clip)' }, [
            h('path', {
              d: 'M30.5 4.8 C31.4 4.3 32.6 4.3 33.5 4.8 L54.5 16.9 C55.4 17.4 56 18.4 56 19.5 V44.5 C56 45.6 55.4 46.6 54.5 47.1 L33.5 59.2 C32.6 59.7 31.4 59.7 30.5 59.2 L9.5 47.1 C8.6 46.6 8 45.6 8 44.5 V19.5 C8 18.4 8.6 17.4 9.5 16.9 Z',
              fill: 'url(#kmpkt-nav-grad)',
            }),
            h('path', {
              d: 'M32 -24 L80 4 L80 60 L32 32 Z',
              fill: '#FFFFFF',
              opacity: '0.10',
            }),
            h('path', {
              d: 'M-16 60 L32 32 L80 60 L32 88 Z',
              fill: '#000000',
              opacity: '0.16',
            }),
          ]),
        ]
      );
    };
  },
});

const HeroPrism = defineComponent({
  name: 'HeroPrism',
  setup() {
    const stageRef = ref<HTMLElement | null>(null);
    const outerRef = ref<SVGPolygonElement | null>(null);
    const innerRef = ref<SVGPolygonElement | null>(null);
    const outerNodeRef = ref<SVGCircleElement | null>(null);
    const innerNodeRef = ref<SVGCircleElement | null>(null);
    const gradRef = ref<SVGLinearGradientElement | null>(null);
    const stampPartRefs: (SVGGElement | null)[] = [null, null, null, null, null];

    let rafId = 0;
    let pointerActive = false;
    let mouseX = 160;
    let mouseY = 160;
    let targetRx = 0;
    let targetRy = 0;
    let targetPx = 0;
    let targetPy = 0;
    let targetScale = 1;
    let curRx = 0;
    let curRy = 0;
    let curPx = 0;
    let curPy = 0;
    let curScale = 1;

    function onPointerMove(e: PointerEvent) {
      const el = stageRef.value;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      pointerActive = true;
      mouseX = ((e.clientX - rect.left) / rect.width) * 320;
      mouseY = ((e.clientY - rect.top) / rect.height) * 320;
      targetRx = -ny * 14;
      targetRy = nx * 14;
      targetPx = nx * 14;
      targetPy = ny * 14;
      targetScale = 1.045;
      el.style.setProperty('--gx', `${((nx + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${((ny + 0.5) * 100).toFixed(1)}%`);
    }

    function onPointerLeave() {
      const el = stageRef.value;
      pointerActive = false;
      targetRx = 0;
      targetRy = 0;
      targetPx = 0;
      targetPy = 0;
      targetScale = 1;
      if (!el) return;
      el.style.setProperty('--gx', '50%');
      el.style.setProperty('--gy', '50%');
    }

    onMounted(() => {
      if (!inBrowser) return;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const baseAngles = Array.from({ length: 6 }, (_, i) => -Math.PI / 2 + (i * Math.PI) / 3);
      const outerOffsets = Array.from({ length: 6 }, () => ({ x: 0, y: 0 }));
      const innerOffsets = Array.from({ length: 6 }, () => ({ x: 0, y: 0 }));

      let outerRot = 0;
      let innerRot = 0.28;
      let innerRadius = 134;
      let gradAngle = 0.85;
      let gradCx = 32;
      let gradCy = 32;
      let lastTime = performance.now();

      const floatParts = Array.from({ length: 5 }, (_, idx) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 7 + Math.random() * 11;
        return {
          x: reducedMotion ? 0 : Math.cos(angle) * dist,
          y: reducedMotion ? 0 : Math.sin(angle) * dist,
          rot: reducedMotion ? 0 : (Math.random() - 0.5) * 44,
          vx: 0,
          vy: 0,
          vrot: 0,
          ax: 6 + Math.random() * 9,
          ay: 6 + Math.random() * 9,
          arot: 12 + Math.random() * 20,
          fx: 0.00028 + Math.random() * 0.00026,
          fy: 0.00025 + Math.random() * 0.00026,
          frot: 0.00022 + Math.random() * 0.00022,
          px: Math.random() * Math.PI * 2 + idx * 1.1,
          py: Math.random() * Math.PI * 2 + idx * 0.9,
          prot: Math.random() * Math.PI * 2,
        };
      });

      function updateRing(
        poly: SVGPolygonElement | null,
        node: SVGCircleElement | null,
        radius: number,
        rot: number,
        offsets: { x: number; y: number }[],
        pullRadius: number,
        snapDist: number,
        mode: 'attract' | 'repel'
      ) {
        if (!poly) return;
        const base = baseAngles.map((a) => ({
          x: 160 + radius * Math.cos(a + rot),
          y: 160 + radius * Math.sin(a + rot),
        }));

        let nearestIdx = -1;
        let nearestDist = Infinity;
        if (pointerActive) {
          for (let i = 0; i < 6; i++) {
            const d = Math.hypot(mouseX - base[i].x, mouseY - base[i].y);
            if (d < nearestDist) {
              nearestDist = d;
              nearestIdx = i;
            }
          }
        }

        let pullT = 0;
        if (nearestIdx !== -1 && nearestDist < pullRadius) {
          pullT = nearestDist <= snapDist ? 1 : Math.pow(1 - (nearestDist - snapDist) / (pullRadius - snapDist), 1.35);
        }

        const pts: string[] = [];
        for (let i = 0; i < 6; i++) {
          let tx = 0;
          let ty = 0;
          if (i === nearestIdx && pullT > 0) {
            if (mode === 'attract') {
              tx = (mouseX - base[i].x) * pullT;
              ty = (mouseY - base[i].y) * pullT;
            } else {
              const dx = base[i].x - mouseX;
              const dy = base[i].y - mouseY;
              const len = Math.hypot(dx, dy) || 1;
              const push = 42 * pullT;
              tx = (dx / len) * push;
              ty = (dy / len) * push;
            }
          }
          offsets[i].x += (tx - offsets[i].x) * 0.22;
          offsets[i].y += (ty - offsets[i].y) * 0.22;
          const px = base[i].x + offsets[i].x;
          const py = base[i].y + offsets[i].y;
          pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);

          if (node && i === nearestIdx) {
            node.setAttribute('cx', px.toFixed(1));
            node.setAttribute('cy', py.toFixed(1));
          }
        }
        poly.setAttribute('points', pts.join(' '));
        if (node) {
          node.style.opacity = pullT > 0.05 ? String(Math.min(1, 0.35 + pullT * 0.65)) : '0';
        }
      }

      function tick(now: number) {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        if (!reducedMotion) {
          outerRot += dt * 0.14;
          innerRot -= dt * 0.21;
        }

        const targetInnerRadius = pointerActive ? 152 : 134 + Math.sin(now * 0.0012) * 8;
        innerRadius += (targetInnerRadius - innerRadius) * 0.08;

        updateRing(outerRef.value, outerNodeRef.value, 144, outerRot, outerOffsets, 130, 26, 'attract');
        updateRing(innerRef.value, innerNodeRef.value, innerRadius, innerRot, innerOffsets, 130, 26, 'repel');

        const grad = gradRef.value;
        if (grad) {
          let targetAngle = 0.85;
          let targetCx = 32;
          let targetCy = 32;
          if (pointerActive) {
            targetAngle = Math.atan2(mouseY - 160, mouseX - 160);
            targetCx = 32 + ((mouseX - 160) / 160) * 6;
            targetCy = 32 + ((mouseY - 160) / 160) * 6;
          } else if (!reducedMotion) {
            targetAngle = 0.85 + Math.sin(now * 0.00075) * 0.55;
            targetCx = 32 + Math.cos(now * 0.00055) * 3;
            targetCy = 32 + Math.sin(now * 0.00055) * 3;
          }
          const diff = Math.atan2(Math.sin(targetAngle - gradAngle), Math.cos(targetAngle - gradAngle));
          gradAngle += diff * 0.08;
          gradCx += (targetCx - gradCx) * 0.08;
          gradCy += (targetCy - gradCy) * 0.08;
          const dx = Math.cos(gradAngle) * 34;
          const dy = Math.sin(gradAngle) * 34;
          grad.setAttribute('x1', (gradCx - dx).toFixed(2));
          grad.setAttribute('y1', (gradCy - dy).toFixed(2));
          grad.setAttribute('x2', (gradCx + dx).toFixed(2));
          grad.setAttribute('y2', (gradCy + dy).toFixed(2));
        }

        const stage = stageRef.value;
        if (stage) {
          curRx += (targetRx - curRx) * 0.16;
          curRy += (targetRy - curRy) * 0.16;
          curPx += (targetPx - curPx) * 0.16;
          curPy += (targetPy - curPy) * 0.16;
          curScale += (targetScale - curScale) * 0.16;
          stage.style.setProperty('--rx', `${curRx.toFixed(2)}deg`);
          stage.style.setProperty('--ry', `${curRy.toFixed(2)}deg`);
          stage.style.setProperty('--px', `${curPx.toFixed(2)}px`);
          stage.style.setProperty('--py', `${curPy.toFixed(2)}px`);
          stage.style.setProperty('--hs', curScale.toFixed(4));
        }

        const ox = 11.5;
        const oy = 1.5;
        const gap = 9.0;
        for (let i = 0; i < 5; i++) {
          const p = floatParts[i];
          if (pointerActive && !reducedMotion) {
            p.vx = p.vx * 0.68 + (0 - p.x) * 0.24;
            p.vy = p.vy * 0.68 + (0 - p.y) * 0.24;
            p.vrot = p.vrot * 0.68 + (0 - p.rot) * 0.24;
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vrot;
          } else {
            const tx = reducedMotion ? 0 : Math.sin(now * p.fx + p.px) * p.ax;
            const ty = reducedMotion ? 0 : Math.cos(now * p.fy + p.py) * p.ay;
            const trot = reducedMotion ? 0 : Math.sin(now * p.frot + p.prot) * p.arot;
            p.vx = (tx - p.x) * 0.032;
            p.vy = (ty - p.y) * 0.032;
            p.vrot = (trot - p.rot) * 0.032;
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vrot;
          }

          const el = stampPartRefs[i];
          if (el) {
            const pivotX = i < 2 ? 13.5 : 32 + ox;
            const pivotY = i < 2 ? 26.5 : 32 + oy + (i - 3) * gap;
            el.setAttribute(
              'transform',
              `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.rot.toFixed(2)} ${pivotX.toFixed(1)} ${pivotY.toFixed(1)})`
            );
          }
        }

        rafId = requestAnimationFrame(tick);
      }

      rafId = requestAnimationFrame(tick);
    });

    onBeforeUnmount(() => {
      if (rafId) cancelAnimationFrame(rafId);
    });

    return () => {
      const palette = PALETTES[paletteIndex.value];
      return h(
        'div',
        {
          ref: stageRef,
          class: 'kmpkt-hero-stage',
          onPointermove: onPointerMove,
          onPointerleave: onPointerLeave,
          onClick: cyclePalette,
        },
        [
          h('div', { class: 'kmpkt-hero-glow', 'aria-hidden': 'true' }),
          h(
            'svg',
            {
              class: 'kmpkt-hero-rings',
              viewBox: '0 0 320 320',
              fill: 'none',
              'aria-hidden': 'true',
            },
            [
              h('polygon', {
                ref: outerRef,
                class: 'kmpkt-ring kmpkt-ring-outer',
                points: '160,16 285,88 285,232 160,304 35,232 35,88',
                stroke: palette.c1,
                'stroke-opacity': '0.32',
                'stroke-width': '1.25',
                'stroke-dasharray': '6 8',
              }),
              h('polygon', {
                ref: innerRef,
                class: 'kmpkt-ring kmpkt-ring-inner',
                points: '160,26 276,93 276,227 160,294 44,227 44,93',
                stroke: palette.c3,
                'stroke-opacity': '0.32',
                'stroke-width': '1.25',
                'stroke-dasharray': '3 6',
              }),
              h('circle', {
                ref: outerNodeRef,
                class: 'kmpkt-ring-node',
                r: '3.5',
                fill: palette.c2,
              }),
              h('circle', {
                ref: innerNodeRef,
                class: 'kmpkt-ring-node',
                r: '3',
                fill: palette.c3,
              }),
              h('polygon', {
                class: 'kmpkt-ring-pulse',
                points: '160,52 253,106 253,214 160,268 67,214 67,106',
                stroke: palette.c2,
                'stroke-opacity': '0.45',
                'stroke-width': '1.5',
              }),
            ]
          ),
          h(
            'svg',
            {
              class: 'kmpkt-hero-hex',
              viewBox: '7.5 3.5 49 57',
              fill: 'none',
              role: 'img',
              'aria-label': 'KmpKt',
            },
            [
              h('defs', [
                h(
                  'linearGradient',
                  {
                    ref: gradRef,
                    id: 'kmpkt-hero-grad',
                    x1: '8',
                    y1: '6',
                    x2: '56',
                    y2: '58',
                    gradientUnits: 'userSpaceOnUse',
                  },
                  [
                    h('stop', { offset: '0%', 'stop-color': palette.c1 }),
                    h('stop', { offset: '50%', 'stop-color': palette.c2 }),
                    h('stop', { offset: '100%', 'stop-color': palette.c3 }),
                  ]
                ),
                h('clipPath', { id: 'kmpkt-hero-clip' }, [
                  h('path', {
                    d: 'M30.5 4.8 C31.4 4.3 32.6 4.3 33.5 4.8 L54.5 16.9 C55.4 17.4 56 18.4 56 19.5 V44.5 C56 45.6 55.4 46.6 54.5 47.1 L33.5 59.2 C32.6 59.7 31.4 59.7 30.5 59.2 L9.5 47.1 C8.6 46.6 8 45.6 8 44.5 V19.5 C8 18.4 8.6 17.4 9.5 16.9 Z',
                  }),
                ]),
              ]),
              h('g', { class: 'kmpkt-hero-prism', 'clip-path': 'url(#kmpkt-hero-clip)' }, [
                h('path', {
                  d: 'M30.5 4.8 C31.4 4.3 32.6 4.3 33.5 4.8 L54.5 16.9 C55.4 17.4 56 18.4 56 19.5 V44.5 C56 45.6 55.4 46.6 54.5 47.1 L33.5 59.2 C32.6 59.7 31.4 59.7 30.5 59.2 L9.5 47.1 C8.6 46.6 8 45.6 8 44.5 V19.5 C8 18.4 8.6 17.4 9.5 16.9 Z',
                  fill: 'url(#kmpkt-hero-grad)',
                }),
                h('path', {
                  d: 'M32 -24 L80 4 L80 60 L32 32 Z',
                  fill: '#FFFFFF',
                  opacity: '0.10',
                }),
                h('path', {
                  d: 'M-16 60 L32 32 L80 60 L32 88 Z',
                  fill: '#000000',
                  opacity: '0.16',
                }),
              ]),
            ]
          ),
          renderPostmarkStamp(stampPartRefs),
        ]
      );
    };
  },
});

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: { component: (name: string, comp: unknown) => void } }) {
    app.component('MermaidDiagram', MermaidDiagram);
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h(HeroPrism),
      'nav-bar-title-before': () => h(NavHexIcon),
      'nav-bar-title-after': () =>
        h('span', { class: 'kmpkt-nav-wordmark' }, [
          h('span', { class: 'kmpkt-nav-kmp' }, 'Kmp'),
          h('span', { class: 'kmpkt-nav-kt' }, 'Kt'),
        ]),
    });
  },
};
