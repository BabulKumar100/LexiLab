import React from 'react';

/*
 * DFAGraph - automaton diagram drawn with plain SVG.
 *
 * The state set, transition set and accept/trap roles come verbatim from the
 * model; this file only decides *where and how* they are painted. Raw model
 * coordinates are normalised into one fixed schematic canvas, edges are bowed
 * away from unrelated nodes, and every label gets a backing chip so nothing
 * becomes unreadable over a wire.
 */

// Fixed viewBox space. The SVG is width:100% + height:auto, so the whole space
// scales down fluidly on narrow screens instead of clipping.
const CANVAS_W = 680;
const CANVAS_H = 410;
const PAD = { left: 96, right: 44, topBase: 48, topLoop: 82, bottom: 58 };

const NODE_R = 25;
const LOOP_R = 17;

// Literal theme palette: SVG primitives cannot be styled with Tailwind classes.
const P = {
  surface: '#070B14',
  grid: '#1E2F4D',
  edgeIdle: '#3B5C8C',
  edgeActive: '#22D3EE',
  edgeTrap: '#F43F5E',
  accept: '#10B981',
  trap: '#F43F5E',
  start: '#67E8F9',
  ringIdle: '#3B82F6',
  chipFill: '#0A101D',
  chipStroke: '#27406A',
  textIdle: '#94A3B8',
  textStrong: '#E2E8F0',
  textMuted: '#64748B',
  textActive: '#A5F3FC',
};

const rad = (deg) => (deg * Math.PI) / 180;
const unit = (deg) => ({ x: Math.cos(rad(deg)), y: Math.sin(rad(deg)) });
const round = (n) => Math.round(n * 100) / 100;

/* ---------------------------------------------------------------- layout -- */

function buildLayout(nodes, hasLoops) {
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const top = hasLoops ? PAD.topLoop : PAD.topBase;
  const innerW = CANVAS_W - PAD.left - PAD.right;
  const innerH = CANVAS_H - top - PAD.bottom;

  const extentX = Math.max(maxX - minX, 1);
  const extentY = Math.max(maxY - minY, 1);
  const fitted = Math.min(innerW / extentX, innerH / extentY);
  // Clamped: 2-state machines are not blown up, 8-state ones stay roomy.
  const scale = Math.min(1.5, Math.max(0.95, fitted));

  const usedW = extentX * scale;
  const usedH = extentY * scale;
  const originX = PAD.left + (innerW - usedW) / 2 - minX * scale;
  const originY = top + (innerH - usedH) / 2 - minY * scale;

  const layout = new Map();
  nodes.forEach((n) => {
    layout.set(n.id, { ...n, x: round(originX + n.x * scale), y: round(originY + n.y * scale) });
  });
  return layout;
}

/** A->B and B->A share a corridor, so their bows must lean opposite ways. */
function pairKey(from, to) {
  return [from, to].sort().join('~');
}

/* -------------------------------------------------------------- geometry -- */

function quadAt(s, c, e, t) {
  const it = 1 - t;
  return {
    x: round(it * it * s.x + 2 * it * t * c.x + t * t * e.x),
    y: round(it * it * s.y + 2 * it * t * c.y + t * t * e.y),
  };
}

function clearanceToNodes(point, nodeList, excludeIds, pad = 0) {
  let min = Infinity;
  nodeList.forEach((n) => {
    if (n.id === excludeIds[0] || n.id === excludeIds[1]) return;
    const d = Math.hypot(point.x - n.x, point.y - n.y) - NODE_R - pad;
    if (d < min) min = d;
  });
  return min;
}

function boundsPenalty(p, halfW, halfH) {
  const outside =
    (p.x - halfW < 6 ? 1 : 0) +
    (p.x + halfW > CANVAS_W - 6 ? 1 : 0) +
    (p.y - halfH < 6 ? 1 : 0) +
    (p.y + halfH > CANVAS_H - 6 ? 1 : 0);
  return outside * -500;
}

/**
 * Curved transition: bow sign + magnitude are chosen by clearance, so the wire
 * and its label chip never have to cross an unrelated state.
 */
function buildEdge(a, b, nodeList, side) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;

  const soft = Math.min(24, Math.max(10, len * 0.09));
  const magnitudes = [0, soft, soft * 2, Math.min(58, soft * 2.6)];

  const candidates = magnitudes.flatMap((amount) =>
    [1, -1].map((sign) => {
      const bow = amount * sign;
      const s = { x: round(a.x + ux * (NODE_R + 1)), y: round(a.y + uy * (NODE_R + 1)) };
      const e = { x: round(b.x - ux * (NODE_R + 7)), y: round(b.y - uy * (NODE_R + 7)) };
      const m = { x: round((s.x + e.x) / 2 + px * bow), y: round((s.y + e.y) / 2 + py * bow) };
      const c = { x: round(2 * m.x - (s.x + e.x) / 2), y: round(2 * m.y - (s.y + e.y) / 2) };
      const traceClear = Math.min(
        ...[0.2, 0.35, 0.5, 0.65, 0.8].map((t) =>
          clearanceToNodes(quadAt(s, c, e, t), nodeList, [a.id, b.id], 4)
        )
      );
      // Pull parallel edges apart, and keep the wire (plus its label footprint)
      // inside the canvas so nothing paints off the schematic.
      const affinity = side === 0 ? 0 : sign === side ? 14 : -14;
      const score = traceClear - amount * 0.3 + affinity + boundsPenalty(m, 30, 12);
      return { s, e, c, m, bow, score };
    })
  );

  candidates.sort((p1, p2) => p2.score - p1.score);
  return candidates[0];
}

function buildLabelAnchor(s, c, e, label, nodeList, excludeIds) {
  const halfW = Math.max(15, label.length * 3.35 + 7);
  const halfH = 9;
  let best = null;

  [0.5, 0.36, 0.64, 0.24, 0.76].forEach((t) => {
    const p = quadAt(s, c, e, t);
    const corners = [
      { x: p.x - halfW, y: p.y - halfH },
      { x: p.x + halfW, y: p.y - halfH },
      { x: p.x - halfW, y: p.y + halfH },
      { x: p.x + halfW, y: p.y + halfH },
    ];
    const clearance = Math.min(
      ...corners.map((k) => clearanceToNodes(k, nodeList, excludeIds, 1)),
      clearanceToNodes(p, nodeList, excludeIds, 2)
    );
    const score = clearance + boundsPenalty(p, halfW, halfH);
    if (!best || score > best.score) best = { p, score, halfW };
  });

  // Final safety net: nudge the chip fully back inside the schematic.
  const clamped = {
    x: Math.min(Math.max(best.p.x, halfW + 6), CANVAS_W - halfW - 6),
    y: Math.min(Math.max(best.p.y, halfH + 6), CANVAS_H - halfH - 6),
  };
  return { ...best, p: clamped };
}

/** Self-loop: near-complete circle parked outside the node, arrow curling back in. */
function buildLoop(a, nodeList) {
  let best = null;

  [-90, -180, 0, 90].forEach((ang) => {
    const u = unit(ang);
    const center = {
      x: round(a.x + u.x * (NODE_R + LOOP_R * 0.78)),
      y: round(a.y + u.y * (NODE_R + LOOP_R * 0.78)),
    };
    const theta = ang + 180; // direction from the loop back to the node
    const s = {
      x: round(center.x + LOOP_R * Math.cos(rad(theta + 20))),
      y: round(center.y + LOOP_R * Math.sin(rad(theta + 20))),
    };
    const e = {
      x: round(center.x + LOOP_R * Math.cos(rad(theta - 30))),
      y: round(center.y + LOOP_R * Math.sin(rad(theta - 30))),
    };
    const label = {
      x: round(a.x + u.x * (NODE_R + 2 * LOOP_R + 13)),
      y: round(a.y + u.y * (NODE_R + 2 * LOOP_R + 13)),
    };
    const clearance = Math.min(
      ...nodeList
        .filter((n) => n.id !== a.id)
        .map((n) => Math.hypot(n.x - center.x, n.y - center.y) - NODE_R - LOOP_R),
      1e3
    );
    const score = clearance + boundsPenalty(label, 36, 10);
    if (!best || score > best.score) best = { s, e, label, score };
  });

  return {
    d: `M ${best.s.x} ${best.s.y} A ${LOOP_R} ${LOOP_R} 0 1 1 ${best.e.x} ${best.e.y}`,
    labelPos: best.label,
  };
}

/* ------------------------------------------------------------ component -- */

export function DFAGraph({ model, activeStateId }) {
  const { nodes, edges } = model;
  const uid = model.id;
  const hasLoops = edges.some((edge) => edge.from === edge.to);
  const layout = buildLayout(nodes, hasLoops);
  const nodeList = Array.from(layout.values());

  const seen = new Map();
  const shapes = edges.map((edge, idx) => {
    const a = layout.get(edge.from);
    const b = layout.get(edge.to);
    if (!a || !b) return null;

    const key = pairKey(edge.from, edge.to);
    const side = seen.get(key) || 0;
    seen.set(key, side === 0 ? 1 : -1);

    const isSelfLoop = edge.from === edge.to;
    const isActive = activeStateId === edge.to;
    const chipW = Math.max(15, String(edge.label).length * 3.35 + 7);

    if (isSelfLoop) {
      const loop = buildLoop(a, nodeList);
      return {
        key: `loop-${idx}`,
        isActive,
        edge,
        leadsToTrap: !!b.isTrap,
        chipW,
        d: loop.d,
        labelPos: loop.labelPos,
      };
    }

    const geo = buildEdge(a, b, nodeList, side);
    const anchor = buildLabelAnchor(geo.s, geo.c, geo.e, String(edge.label), nodeList, [a.id, b.id]);
    return {
      key: `edge-${idx}`,
      isActive,
      edge,
      leadsToTrap: !!b.isTrap,
      chipW: Math.max(chipW, anchor.halfW),
      d: `M ${geo.s.x} ${geo.s.y} Q ${geo.c.x} ${geo.c.y} ${geo.e.x} ${geo.e.y}`,
      labelPos: anchor.p,
    };
  });

  const strokeFor = (shape) =>
    shape.isActive ? P.edgeActive : shape.leadsToTrap ? P.edgeTrap : P.edgeIdle;
  const markerFor = (shape) =>
    shape.isActive ? `${uid}-head-active` : shape.leadsToTrap ? `${uid}-head-trap` : `${uid}-head-idle`;

  return (
    <div className="relative w-full select-none overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-950/80 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_-15%,rgba(59,130,246,.13),transparent_62%)]"
      />
      <svg
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${model.name}: ${nodes.length} states, ${edges.length} transitions`}
        className="relative block h-auto w-full"
        style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
      >
        <defs>
          <pattern id={`${uid}-grid`} width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill={P.grid} opacity="0.5" />
          </pattern>

          <radialGradient id={`${uid}-fill`} cx="34%" cy="26%" r="82%">
            <stop offset="0%" stopColor="#1B2B47" />
            <stop offset="100%" stopColor="#0B1322" />
          </radialGradient>
          <radialGradient id={`${uid}-fill-accept`} cx="34%" cy="26%" r="82%">
            <stop offset="0%" stopColor="#123A31" />
            <stop offset="100%" stopColor="#0A1721" />
          </radialGradient>
          <radialGradient id={`${uid}-fill-trap`} cx="34%" cy="26%" r="82%">
            <stop offset="0%" stopColor="#2E1420" />
            <stop offset="100%" stopColor="#150A12" />
          </radialGradient>
          <radialGradient id={`${uid}-fill-active`} cx="34%" cy="26%" r="82%">
            <stop offset="0%" stopColor="#1D5268" />
            <stop offset="100%" stopColor="#0C1E2E" />
          </radialGradient>

          <filter id={`${uid}-glow`} x="-65%" y="-65%" width="230%" height="230%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={P.edgeActive} floodOpacity="0.55" />
          </filter>
          <filter id={`${uid}-drop`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.55" />
          </filter>

          {[
            { id: `${uid}-head-idle`, fill: P.edgeIdle },
            { id: `${uid}-head-active`, fill: P.edgeActive },
            { id: `${uid}-head-trap`, fill: P.edgeTrap },
            { id: `${uid}-head-start`, fill: P.start },
          ].map((m) => (
            <marker
              key={m.id}
              id={m.id}
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="9.5"
              markerHeight="9.5"
              markerUnits="userSpaceOnUse"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={m.fill} />
            </marker>
          ))}
        </defs>

        {/* dotted engineering grid */}
        <rect x="0" y="0" width={CANVAS_W} height={CANVAS_H} fill={`url(#${uid}-grid)`} opacity="0.55" />

        {/* start arrow, labelled with the start state name */}
        {nodeList
          .filter((n) => n.isStart)
          .map((n) => {
            const tailX = n.x - NODE_R - 44;
            return (
              <g key={`start-${n.id}`}>
                <line
                  x1={tailX}
                  y1={n.y}
                  x2={n.x - NODE_R - 7}
                  y2={n.y}
                  stroke={P.start}
                  strokeWidth="2"
                  strokeLinecap="round"
                  markerEnd={`url(#${uid}-head-start)`}
                  opacity="0.92"
                />
                <circle cx={tailX} cy={n.y} r="2.6" fill={P.start} />
                <text
                  x={tailX + 13}
                  y={n.y - 12}
                  fill={P.start}
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                  textAnchor="middle"
                  paintOrder="stroke"
                  stroke={P.surface}
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                >
                  {n.id}
                </text>
                <text
                  x={tailX + 13}
                  y={n.y + 18}
                  fill={P.textMuted}
                  fontSize="7.5"
                  fontWeight="800"
                  letterSpacing="1.4"
                  textAnchor="middle"
                  paintOrder="stroke"
                  stroke={P.surface}
                  strokeWidth="3"
                  strokeLinejoin="round"
                >
                  START
                </text>
              </g>
            );
          })}

        {/* transition wires, painted under the state nodes */}
        <g fill="none" strokeLinecap="round">
          {shapes
            .filter(Boolean)
            .map((shape) => (
              <path
                key={`${shape.key}-path`}
                d={shape.d}
                stroke={strokeFor(shape)}
                strokeWidth={shape.isActive ? 2.7 : 1.7}
                strokeDasharray={shape.leadsToTrap && !shape.isActive ? '7 4' : undefined}
                markerEnd={`url(#${markerFor(shape)})`}
                filter={shape.isActive ? `url(#${uid}-glow)` : undefined}
                opacity={shape.isActive ? 1 : shape.leadsToTrap ? 0.75 : 0.9}
              />
            ))}
        </g>

        {/* states */}
        {nodeList.map((node) => {
          const isActive = activeStateId === node.id;
          const isAccept = node.isAccept;
          const isTrap = node.isTrap;
          const caption = isAccept ? 'ACCEPT' : isTrap ? 'TRAP' : node.isStart ? 'START' : '';
          const ring = isActive ? P.edgeActive : isAccept ? P.accept : isTrap ? P.trap : P.ringIdle;
          const fill = isActive
            ? `url(#${uid}-fill-active)`
            : isAccept
              ? `url(#${uid}-fill-accept)`
              : isTrap
                ? `url(#${uid}-fill-trap)`
                : `url(#${uid}-fill)`;

          return (
            <g key={node.id}>
              <title>{`${node.label || node.id}${node.desc ? ` - ${node.desc}` : ''}`}</title>

              {isActive && (
                <>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_R + 13}
                    fill={P.edgeActive}
                    opacity="0.13"
                    className="animate-pulse"
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_R + 8}
                    fill="none"
                    stroke={P.edgeActive}
                    strokeWidth="1.4"
                    strokeDasharray="3 5"
                    opacity="0.8"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from={`0 ${node.x} ${node.y}`}
                      to={`360 ${node.x} ${node.y}`}
                      dur="12s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}

              <circle
                cx={node.x}
                cy={node.y}
                r={NODE_R}
                fill={fill}
                stroke={ring}
                strokeWidth={isActive ? 3 : 2}
                strokeDasharray={isTrap && !isActive ? '5 4' : undefined}
                filter={isActive ? `url(#${uid}-glow)` : `url(#${uid}-drop)`}
              />

              {/* doubled ring = accepting state (F) */}
              {isAccept && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_R - 6}
                  fill="none"
                  stroke={isActive ? P.edgeActive : P.accept}
                  strokeWidth="1.9"
                  opacity="0.95"
                />
              )}

              <text
                x={node.x}
                y={node.y + 4.5}
                fill={isActive ? '#F0FDFF' : isTrap ? '#FECDD3' : P.textStrong}
                fontSize={String(node.id).length > 4 ? 9.5 : 12.5}
                fontWeight="700"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {node.id}
              </text>

              {caption && (
                <g>
                  <rect
                    x={round(node.x - caption.length * 2.7 - 5)}
                    y={node.y + NODE_R + 6}
                    width={round(caption.length * 5.4 + 10)}
                    height="14"
                    rx="4"
                    fill={P.chipFill}
                    fillOpacity="0.92"
                    stroke={isAccept ? P.accept : isTrap ? P.trap : P.start}
                    strokeOpacity="0.35"
                    strokeWidth="0.8"
                  />
                  <text
                    x={node.x}
                    y={node.y + NODE_R + 16}
                    fill={isActive ? P.textActive : isAccept ? P.accept : isTrap ? P.trap : P.start}
                    fontSize="8"
                    fontWeight="800"
                    letterSpacing="1.2"
                    textAnchor="middle"
                  >
                    {caption}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* transition label chips, on top so they always beat the wires */}
        <g>
          {shapes
            .filter(Boolean)
            .map((shape) => (
              <g key={`${shape.key}-label`}>
                <title>{shape.edge.desc || `delta(${shape.edge.from}, ${shape.edge.label}) = ${shape.edge.to}`}</title>
                <rect
                  x={round(shape.labelPos.x - shape.chipW)}
                  y={round(shape.labelPos.y - 9)}
                  width={round(shape.chipW * 2)}
                  height="18"
                  rx="5"
                  fill={P.chipFill}
                  fillOpacity="0.95"
                  stroke={shape.isActive ? P.edgeActive : shape.leadsToTrap ? P.edgeTrap : P.chipStroke}
                  strokeOpacity={shape.isActive ? 0.85 : 0.6}
                  strokeWidth={shape.isActive ? 1.3 : 0.9}
                />
                <text
                  x={shape.labelPos.x}
                  y={round(shape.labelPos.y + 3.6)}
                  fill={shape.isActive ? P.textActive : shape.leadsToTrap ? '#FDA4AF' : P.textIdle}
                  fontSize="10.5"
                  fontWeight="700"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {shape.edge.label}
                </text>
              </g>
            ))}
        </g>
      </svg>
    </div>
  );
}
