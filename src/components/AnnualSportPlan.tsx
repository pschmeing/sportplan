import { useState, useMemo, useCallback, useRef } from "react";

const FOKUS_OPTIONS = ["Strength", "Marathon", "Deload / Longevity"];
const LOAD_OPTIONS = ["Normal", "Load", "Deload"];

const FOKUS_COLORS = {
  Strength: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-800", badge: "bg-orange-500", light: "bg-orange-100" },
  Marathon: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-800", badge: "bg-blue-500", light: "bg-blue-100" },
  "Deload / Longevity": { bg: "bg-green-50", border: "border-green-300", text: "text-green-800", badge: "bg-green-500", light: "bg-green-100" },
};

// Activity type colors for Strava data
// orange=Strength (shows training name), blue=Run (shows interval type + distance), purple=Ride, green=Yoga/Mobility
const ACTIVITY_COLORS = {
  Strength: { bg: "bg-orange-200/70", text: "text-orange-800" },
  Run: { bg: "bg-blue-200/70", text: "text-blue-800" },
  Ride: { bg: "bg-purple-200/70", text: "text-purple-800" },
  Yoga: { bg: "bg-green-200/70", text: "text-green-800" },
};

const LOAD_STYLES = {
  Normal: { indicator: "bg-gray-400", label: "Normal" },
  Load: { indicator: "bg-red-500", label: "Load" },
  Deload: { indicator: "bg-emerald-400", label: "Deload" },
};

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const INITIAL_WEEKS = [
  { kw: 1, fokus: "Strength", load: "Normal", workouts: { Di: "S:Deload_A", Mi: "R:10kLowZ2", Fr: "S:Deload_B", Sa: "R:10kLowZ2" } },
  { kw: 2, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 3, fokus: "Strength", load: "Deload", workouts: {} },
  { kw: 4, fokus: "Strength", load: "Load", workouts: {} },
  { kw: 5, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 6, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 7, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 8, fokus: "Strength", load: "Deload", workouts: { Di: "S:Deload_A", Mi: "R:10kLowZ2", Fr: "S:Deload_B", Sa: "R:10kLowZ2" } },
  { kw: 9, fokus: "Strength", load: "Normal", workouts: { Mo: "S:Chest_A", Di: "S:Back_A", Do: "R:4x4", Fr: "S:Legs_A", So: "R:15k" } },
  { kw: 10, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 11, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 12, fokus: "Strength", load: "Load", workouts: {} },
  { kw: 13, fokus: "Strength", load: "Deload", workouts: {} },
  { kw: 14, fokus: "Deload / Longevity", load: "Normal", workouts: {} },
  { kw: 15, fokus: "Deload / Longevity", load: "Normal", workouts: {} },
  { kw: 16, fokus: "Deload / Longevity", load: "Normal", workouts: {} },
  { kw: 17, fokus: "Deload / Longevity", load: "Load", workouts: {} },
  { kw: 18, fokus: "Strength", load: "Deload", workouts: {} },
  { kw: 19, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 20, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 21, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 22, fokus: "Strength", load: "Load", workouts: {} },
  { kw: 23, fokus: "Marathon", load: "Deload", workouts: {} },
  { kw: 24, fokus: "Marathon", load: "Normal", workouts: {} },
  { kw: 25, fokus: "Marathon", load: "Normal", workouts: {} },
  { kw: 26, fokus: "Marathon", load: "Normal", workouts: {} },
  { kw: 27, fokus: "Marathon", load: "Load", workouts: {} },
  { kw: 28, fokus: "Marathon", load: "Deload", workouts: {} },
  { kw: 29, fokus: "Marathon", load: "Normal", workouts: {} },
  { kw: 30, fokus: "Marathon", load: "Normal", workouts: {} },
  { kw: 31, fokus: "Marathon", load: "Normal", workouts: {} },
  { kw: 32, fokus: "Marathon", load: "Load", workouts: {} },
  { kw: 33, fokus: "Marathon", load: "Deload", workouts: {} },
  { kw: 34, fokus: "Marathon", load: "Normal", workouts: {} },
  { kw: 35, fokus: "Marathon", load: "Normal", workouts: {} },
  { kw: 36, fokus: "Marathon", load: "Normal", workouts: {} },
  { kw: 37, fokus: "Marathon", load: "Load", workouts: {} },
  { kw: 38, fokus: "Marathon", load: "Deload", workouts: {} },
  { kw: 39, fokus: "Deload / Longevity", load: "Normal", workouts: {} },
  { kw: 40, fokus: "Deload / Longevity", load: "Normal", workouts: {} },
  { kw: 41, fokus: "Deload / Longevity", load: "Normal", workouts: {} },
  { kw: 42, fokus: "Deload / Longevity", load: "Load", workouts: {} },
  { kw: 43, fokus: "Strength", load: "Deload", workouts: {} },
  { kw: 44, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 45, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 46, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 47, fokus: "Strength", load: "Load", workouts: {} },
  { kw: 48, fokus: "Strength", load: "Deload", workouts: {} },
  { kw: 49, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 50, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 51, fokus: "Strength", load: "Normal", workouts: {} },
  { kw: 52, fokus: "Strength", load: "Load", workouts: {} },
  { kw: 53, fokus: "Strength", load: "Deload", workouts: {} },
];

// Mock Strava data — type: Run|Strength|Ride|Yoga, heading: strava activity title, distance: km
const STRAVA_DATA = {
  9: {
    Mo: { type: "Run", heading: "Easy Run", distance: "5.2km" },
    Do: { type: "Run", heading: "4x1km Intervall", distance: "8.1km" },
    Fr: { type: "Strength", heading: "Chest_A" },
    So: { type: "Run", heading: "Long Run", distance: "14.8km" },
  },
  10: {
    Di: { type: "Strength", heading: "Back_A" },
    Mi: { type: "Run", heading: "Recovery", distance: "6.0km" },
    Do: { type: "Ride", heading: "Commute", distance: "12km" },
    Sa: { type: "Run", heading: "Tempo", distance: "10.2km" },
  },
  11: {
    Mo: { type: "Strength", heading: "Legs_A" },
    Mi: { type: "Run", heading: "5x800m Intervall", distance: "7.5km" },
    Fr: { type: "Yoga", heading: "Mobility Flow" },
    So: { type: "Run", heading: "Long Run", distance: "18.3km" },
  },
  12: {
    Mo: { type: "Strength", heading: "Chest_B" },
    Di: { type: "Run", heading: "Easy Run", distance: "10km" },
    Do: { type: "Ride", heading: "MTB Trail", distance: "25km" },
    Fr: { type: "Yoga", heading: "Stretch" },
    Sa: { type: "Run", heading: "Long Run", distance: "22km" },
  },
};

const currentKW = 13;

// ── Bulk Edit Panel (always rendered, content fades in/out) ──
function BulkEditPanel({ selected, onApply, onClear }) {
  const [fokus, setFokus] = useState("");
  const [load, setLoad] = useState("");
  const [workoutTemplate, setWorkoutTemplate] = useState("");
  const count = selected.size;
  const hasSelection = count > 0;

  const rangeLabel = () => {
    if (!hasSelection) return "";
    const sorted = [...selected].sort((a, b) => a - b);
    const ranges = [];
    let start = sorted[0], end = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) end = sorted[i];
      else { ranges.push(start === end ? `KW${start}` : `KW${start}-${end}`); start = sorted[i]; end = sorted[i]; }
    }
    ranges.push(start === end ? `KW${start}` : `KW${start}-${end}`);
    return ranges.join(", ");
  };

  const handleApply = () => {
    const changes = {};
    if (fokus) changes.fokus = fokus;
    if (load) changes.load = load;
    if (workoutTemplate) {
      try {
        const parsed = {};
        workoutTemplate.split(",").map(s => s.trim()).forEach(entry => {
          const parts = entry.split("=");
          if (parts.length === 2) parsed[parts[0].trim()] = parts[1].trim();
        });
        if (Object.keys(parsed).length > 0) changes.workouts = parsed;
      } catch (e) { /* ignore */ }
    }
    if (Object.keys(changes).length > 0) onApply(changes);
  };

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm mb-2" style={{ minHeight: 52 }}>
      {hasSelection ? (
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold">{count}</span>
              <span className="text-sm font-medium text-gray-700">{rangeLabel()}</span>
            </div>
            <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-600">Auswahl aufheben</button>
          </div>
          <div className="flex flex-wrap gap-2 items-end">
            <select value={fokus} onChange={e => setFokus(e.target.value)}
              className="border border-gray-200 rounded px-2 py-1.5 text-xs bg-white">
              <option value="">Fokus —</option>
              {FOKUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={load} onChange={e => setLoad(e.target.value)}
              className="border border-gray-200 rounded px-2 py-1.5 text-xs bg-white">
              <option value="">Load —</option>
              {LOAD_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input type="text" value={workoutTemplate} onChange={e => setWorkoutTemplate(e.target.value)}
              placeholder="Mo=S:Chest_A, Di=S:Back_A"
              className="flex-1 min-w-40 border border-gray-200 rounded px-2 py-1.5 text-xs" />
            <button onClick={handleApply}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium px-4 py-1.5 rounded">
              Anwenden
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 flex items-center text-xs text-gray-400">
          Wochen per Checkbox oder "Block auswählen" wählen, um Bulk-Edit zu nutzen
        </div>
      )}
    </div>
  );
}

// ── Single Week Row (fixed height, no layout shift) ──
function WeekRow({ week, isSelected, isCurrent, strava, onToggleSelect }) {
  const colors = FOKUS_COLORS[week.fokus] || FOKUS_COLORS.Strength;
  const loadStyle = LOAD_STYLES[week.load] || LOAD_STYLES.Normal;
  const stravaWeek = strava || {};

  const selectedClass = isSelected ? "ring-2 ring-indigo-300 bg-indigo-50/70" : "";
  const currentClass = isCurrent ? "ring-2 ring-yellow-400" : "";
  const baseClass = !isSelected && !isCurrent ? `${colors.bg} border-l-4 ${colors.border}` : `border border-gray-200 ${colors.bg}`;

  return (
    <div className={`flex items-center h-10 rounded mb-px ${baseClass} ${selectedClass} ${currentClass}`}
      style={{ contain: "layout style" }}>
      {/* Checkbox */}
      <div className="w-8 flex items-center justify-center shrink-0">
        <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(week.kw)}
          className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-500 cursor-pointer" />
      </div>

      {/* KW */}
      <div className="w-12 shrink-0 font-mono text-xs font-bold text-center">
        <span className={isCurrent ? "bg-yellow-300 px-1.5 py-0.5 rounded text-yellow-900 text-[10px]" : colors.text}>
          KW{week.kw}
        </span>
      </div>

      {/* Fokus + Load */}
      <div className="w-36 shrink-0 flex items-center gap-2 px-1">
        <span className={`text-[11px] font-semibold ${colors.text} truncate`}>{week.fokus}</span>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${loadStyle.indicator}`} title={loadStyle.label}></span>
        <span className="text-[10px] text-gray-400">{loadStyle.label}</span>
      </div>

      {/* Days */}
      <div className="flex-1 grid grid-cols-7 gap-px pr-2 min-w-0">
        {DAYS.map(day => {
          const planned = week.workouts[day];
          const actual = stravaWeek[day];

          // Planned workout color: use same scheme (S:=Strength=orange, R:=Run=blue)
          const plannedColor = planned
            ? planned.startsWith("S:") ? ACTIVITY_COLORS.Strength : ACTIVITY_COLORS.Run
            : null;

          // Strava activity display
          const actColor = actual ? (ACTIVITY_COLORS[actual.type] || ACTIVITY_COLORS.Run) : null;
          let actLabel = "";
          if (actual) {
            if (actual.type === "Strength") {
              actLabel = actual.heading || "Strength";
            } else if (actual.type === "Run") {
              const isInterval = actual.heading && /intervall|interval|tempo|threshold/i.test(actual.heading);
              actLabel = isInterval ? `${actual.heading.split(" ")[0]} ${actual.distance || ""}`.trim() : (actual.distance || "Run");
            } else if (actual.type === "Ride") {
              actLabel = actual.distance || "Ride";
            } else if (actual.type === "Yoga") {
              actLabel = actual.heading || "Yoga";
            }
          }

          return (
            <div key={day} className="flex flex-col items-center justify-center h-8 min-w-0">
              {planned ? (
                <span className={`text-[9px] leading-tight px-1 rounded truncate max-w-full text-center ${plannedColor.bg} ${plannedColor.text}`}
                  title={planned}>
                  {planned.replace("S:", "").replace("R:", "")}
                </span>
              ) : null}
              {actual ? (
                <span className={`text-[9px] leading-tight px-1 rounded truncate max-w-full text-center ${actColor.bg} ${actColor.text}`}
                  title={`${actual.heading || actual.type}${actual.distance ? ` · ${actual.distance}` : ""}`}>
                  {actLabel}
                </span>
              ) : null}
              {!planned && !actual && <span className="text-[9px] text-gray-300">·</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Block Boundary Handle (drag to resize / split blocks) ──
function BlockBoundary({ phaseAbove, phaseBelow, onMoveWeek }) {
  const [dragHover, setDragHover] = useState(false);

  if (!phaseAbove || !phaseBelow) return null;

  const lastAbove = phaseAbove.weeks[phaseAbove.weeks.length - 1];
  const firstBelow = phaseBelow.weeks[0];

  return (
    <div className={`relative flex items-center justify-center h-6 my-0.5 group cursor-row-resize ${dragHover ? "bg-indigo-100" : ""}`}
      onMouseEnter={() => setDragHover(true)} onMouseLeave={() => setDragHover(false)}>
      <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-gray-300"></div>
      <div className="relative flex items-center gap-1 bg-white px-2 z-10">
        <button onClick={() => onMoveWeek(firstBelow.kw, "up")}
          title={`KW${firstBelow.kw} nach oben (→ ${phaseAbove.fokus})`}
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] border border-gray-300 hover:bg-indigo-100 hover:border-indigo-400 text-gray-500 hover:text-indigo-600">
          ▲
        </button>
        <span className="text-[9px] text-gray-400 px-1">Grenze</span>
        <button onClick={() => onMoveWeek(lastAbove.kw, "down")}
          title={`KW${lastAbove.kw} nach unten (→ ${phaseBelow.fokus})`}
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] border border-gray-300 hover:bg-indigo-100 hover:border-indigo-400 text-gray-500 hover:text-indigo-600">
          ▼
        </button>
      </div>
    </div>
  );
}

// ── Quick Pattern Panel ──
function QuickPatternPanel({ onApplyPattern, selectedCount }) {
  const patterns = [
    { label: "Strength 5er", desc: "Normal → Normal → Deload → Load → Normal", fokus: "Strength", loads: ["Normal", "Normal", "Deload", "Load", "Normal"] },
    { label: "Marathon 5er", desc: "Deload → Normal → Normal → Normal → Load", fokus: "Marathon", loads: ["Deload", "Normal", "Normal", "Normal", "Load"] },
    { label: "Longevity 4er", desc: "Normal → Normal → Normal → Load", fokus: "Deload / Longevity", loads: ["Normal", "Normal", "Normal", "Load"] },
    { label: "Alle Normal", desc: "Alle auf Normal setzen", fokus: null, loads: ["Normal"] },
    { label: "Alle Deload", desc: "Alle auf Deload setzen", fokus: null, loads: ["Deload"] },
  ];

  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-2 px-1">
      <span className="text-[10px] text-gray-400 self-center mr-1">Muster:</span>
      {patterns.map(p => (
        <button key={p.label} onClick={() => onApplyPattern(p)}
          className="text-[10px] border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 hover:border-gray-300 text-gray-600"
          title={p.desc}>
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ── Summary Bar ──
function SummaryBar({ weeks }) {
  const counts = {};
  FOKUS_OPTIONS.forEach(f => { counts[f] = 0; });
  weeks.forEach(w => { counts[w.fokus]++; });
  return (
    <div className="flex gap-4 mb-2 text-xs">
      {Object.entries(counts).map(([fokus, count]) => (
        <div key={fokus} className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${FOKUS_COLORS[fokus].badge}`}></span>
          <span className="text-gray-500">{fokus}: <strong className="text-gray-700">{count}</strong></span>
        </div>
      ))}
    </div>
  );
}

// ── Phase Header ──
function PhaseHeader({ phase, onSelectBlock, onSplitAt }) {
  const colors = FOKUS_COLORS[phase.fokus];
  const startKw = phase.weeks[0].kw;
  const endKw = phase.weeks[phase.weeks.length - 1].kw;
  const [showSplit, setShowSplit] = useState(false);

  return (
    <div className="flex items-center gap-2 mt-2 mb-0.5 px-1">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${colors.badge}`}>
        {phase.fokus}
      </span>
      <span className="text-[10px] text-gray-400">
        KW{startKw}–{endKw} · {phase.weeks.length} Wo.
      </span>
      <button onClick={() => onSelectBlock(startKw, endKw)}
        className="text-[10px] text-indigo-500 hover:text-indigo-700 hover:underline">
        auswählen
      </button>
      {phase.weeks.length > 1 && (
        <div className="relative">
          <button onClick={() => setShowSplit(!showSplit)}
            className="text-[10px] text-gray-400 hover:text-gray-600 hover:underline">
            splitten
          </button>
          {showSplit && (
            <div className="absolute top-5 left-0 bg-white border border-gray-200 rounded shadow-lg p-2 z-30 min-w-32">
              <p className="text-[10px] text-gray-500 mb-1">Split nach KW:</p>
              <div className="flex flex-wrap gap-1">
                {phase.weeks.slice(0, -1).map(w => (
                  <button key={w.kw} onClick={() => { onSplitAt(w.kw); setShowSplit(false); }}
                    className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 hover:bg-indigo-50 hover:border-indigo-300">
                    {w.kw}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Day Header Row ──
function DayHeaderRow() {
  return (
    <div className="flex items-center h-5 mb-0.5 text-[10px] text-gray-400 font-medium">
      <div className="w-8 shrink-0"></div>
      <div className="w-12 shrink-0"></div>
      <div className="w-36 shrink-0"></div>
      <div className="flex-1 grid grid-cols-7 gap-px pr-2">
        {DAYS.map(d => <div key={d} className="text-center">{d}</div>)}
      </div>
    </div>
  );
}

// ── Main Component ──
export default function AnnualSportPlan() {
  const [weeks, setWeeks] = useState(INITIAL_WEEKS);
  const [selected, setSelected] = useState(new Set());

  const toggleSelect = useCallback((kw) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(kw) ? next.delete(kw) : next.add(kw);
      return next;
    });
  }, []);

  const selectRange = useCallback((startKw, endKw) => {
    setSelected(prev => {
      const next = new Set(prev);
      for (let i = startKw; i <= endKw; i++) next.add(i);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const selectAll = useCallback(() => setSelected(new Set(weeks.map(w => w.kw))), [weeks]);

  const bulkApply = useCallback((changes) => {
    setWeeks(prev => prev.map(w => {
      if (!selected.has(w.kw)) return w;
      const updated = { ...w };
      if (changes.fokus) updated.fokus = changes.fokus;
      if (changes.load) updated.load = changes.load;
      if (changes.workouts) updated.workouts = { ...changes.workouts };
      return updated;
    }));
  }, [selected]);

  const applyPattern = useCallback((pattern) => {
    if (selected.size === 0) return;
    const sorted = [...selected].sort((a, b) => a - b);
    setWeeks(prev => prev.map(w => {
      const idx = sorted.indexOf(w.kw);
      if (idx === -1) return w;
      const updated = { ...w, load: pattern.loads[idx % pattern.loads.length] };
      if (pattern.fokus) updated.fokus = pattern.fokus;
      return updated;
    }));
  }, [selected]);

  // Move a week's fokus to the adjacent block (resize blocks)
  const moveWeek = useCallback((kw, direction) => {
    setWeeks(prev => {
      const idx = prev.findIndex(w => w.kw === kw);
      if (idx === -1) return prev;
      const neighbor = direction === "up" ? prev[idx - 1] : prev[idx + 1];
      if (!neighbor) return prev;
      const targetFokus = direction === "up" ? neighbor.fokus : neighbor.fokus;
      return prev.map(w => w.kw === kw ? { ...w, fokus: targetFokus } : w);
    });
  }, []);

  // Split a block after a given KW (change fokus of weeks after split point)
  const splitAt = useCallback((kw) => {
    // Find current phase for this KW, then prompt-free: just select the weeks after split
    const idx = weeks.findIndex(w => w.kw === kw);
    if (idx === -1) return;
    const phase = weeks[idx].fokus;
    // Find end of this phase block
    let endIdx = idx;
    while (endIdx + 1 < weeks.length && weeks[endIdx + 1].fokus === phase) endIdx++;
    // Select weeks after split point for easy re-assignment
    const afterSplit = new Set();
    for (let i = idx + 1; i <= endIdx; i++) afterSplit.add(weeks[i].kw);
    setSelected(afterSplit);
  }, [weeks]);

  // Phases grouped by consecutive fokus
  const phases = useMemo(() => {
    const result = [];
    let current = null;
    weeks.forEach(w => {
      if (!current || current.fokus !== w.fokus) {
        current = { fokus: w.fokus, weeks: [] };
        result.push(current);
      }
      current.weeks.push(w);
    });
    return result;
  }, [weeks]);

  return (
    <div className="max-w-5xl mx-auto p-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Annual Sport Plan 2026</h1>
          <p className="text-xs text-gray-400">Philipp — KW{currentKW} aktuell</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={selectAll}
            className="text-[10px] border border-gray-200 rounded px-2 py-1 hover:bg-gray-50">Alle</button>
          {FOKUS_OPTIONS.map(f => {
            const c = FOKUS_COLORS[f];
            return (
              <button key={f} onClick={() => setSelected(new Set(weeks.filter(w => w.fokus === f).map(w => w.kw)))}
                className={`text-[10px] border rounded px-2 py-1 hover:opacity-80 ${c.border} ${c.text} ${c.bg}`}>
                {f.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      <SummaryBar weeks={weeks} />

      {/* Sticky bulk edit — always rendered, no layout jump */}
      <BulkEditPanel selected={selected} onApply={bulkApply} onClear={clearSelection} />

      <QuickPatternPanel onApplyPattern={applyPattern} selectedCount={selected.size} />

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-1.5 text-[10px] text-gray-400 px-1">
        <span className="text-gray-500 font-medium">Aktivitäten:</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-1.5 rounded bg-orange-200"></span>Strength</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-1.5 rounded bg-blue-200"></span>Run</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-1.5 rounded bg-purple-200"></span>Ride</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-1.5 rounded bg-green-200"></span>Yoga/Mobility</span>
        <span className="text-gray-300 mx-1">|</span>
        <span className="text-gray-500 font-medium">Load:</span>
        <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"></span>Normal</span>
        <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>Load</span>
        <span className="flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Deload</span>
      </div>

      <DayHeaderRow />

      {/* Phase blocks with boundary handles */}
      {phases.map((phase, pi) => (
        <div key={`${pi}-${phase.fokus}-${phase.weeks[0].kw}`}>
          <PhaseHeader phase={phase} onSelectBlock={selectRange} onSplitAt={splitAt} />
          {phase.weeks.map(w => (
            <WeekRow key={w.kw} week={w} isSelected={selected.has(w.kw)}
              isCurrent={w.kw === currentKW} strava={STRAVA_DATA[w.kw]}
              onToggleSelect={toggleSelect} />
          ))}
          {pi < phases.length - 1 && (
            <BlockBoundary phaseAbove={phase} phaseBelow={phases[pi + 1]} onMoveWeek={moveWeek} />
          )}
        </div>
      ))}

      {/* JSON Export */}
      <details className="mt-4 text-xs">
        <summary className="cursor-pointer text-gray-400 hover:text-gray-600">JSON Export</summary>
        <pre className="mt-1 p-2 bg-gray-50 rounded overflow-auto max-h-48 text-[9px]">
          {JSON.stringify(weeks, null, 2)}
        </pre>
      </details>
    </div>
  );
}
