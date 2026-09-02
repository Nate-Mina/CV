import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  Flame,
  CheckCircle2,
  Sliders,
  BarChart2,
  Grid,
  Info,
  ShieldCheck,
  TrendingUp,
  Workflow,
  Server,
  Cable,
  Brain,
  Pill,
  HeartPulse,
  Stethoscope,
  Microscope,
} from 'lucide-react';
import { JekyllTheme, SkillCompetency } from '../types';
import { profileData } from '../data/profileData';

interface TechnicalSkillsVisualizerProps {
  currentTheme: JekyllTheme;
  onNavigateToCaseStudies?: () => void;
}

type ViewMode = 'radar' | 'heatmap' | 'comparison';
type CategoryFilter = 'all' | 'hardware' | 'ai' | 'systems' | 'clinical';

export const TechnicalSkillsVisualizer: React.FC<TechnicalSkillsVisualizerProps> = ({
  currentTheme,
  onNavigateToCaseStudies,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('radar');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('hw-liquid-cooling');
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);

  const skills = useMemo(() => {
    return profileData.skillCompetencies || [];
  }, []);

  const filteredSkills = useMemo(() => {
    if (categoryFilter === 'all') return skills;
    return skills.filter((s) => s.category === categoryFilter);
  }, [skills, categoryFilter]);

  // Active skill for the inspector card
  const activeSkill = useMemo(() => {
    const targetId = hoveredSkillId || selectedSkillId;
    return skills.find((s) => s.id === targetId) || skills[0];
  }, [skills, hoveredSkillId, selectedSkillId]);

  // Aggregate stats
  const hardwareSkills = useMemo(() => skills.filter((s) => s.category === 'hardware'), [skills]);
  const aiSkills = useMemo(() => skills.filter((s) => s.category === 'ai'), [skills]);
  const systemsSkills = useMemo(() => skills.filter((s) => s.category === 'systems'), [skills]);
  const clinicalSkills = useMemo(() => skills.filter((s) => s.category === 'clinical'), [skills]);

  const avgHwScore = useMemo(
    () => (hardwareSkills.length ? Math.round(hardwareSkills.reduce((acc, s) => acc + s.score, 0) / hardwareSkills.length) : 0),
    [hardwareSkills]
  );
  const avgAiScore = useMemo(
    () => (aiSkills.length ? Math.round(aiSkills.reduce((acc, s) => acc + s.score, 0) / aiSkills.length) : 0),
    [aiSkills]
  );
  const avgSysScore = useMemo(
    () => (systemsSkills.length ? Math.round(systemsSkills.reduce((acc, s) => acc + s.score, 0) / systemsSkills.length) : 0),
    [systemsSkills]
  );
  const avgClinScore = useMemo(
    () => (clinicalSkills.length ? Math.round(clinicalSkills.reduce((acc, s) => acc + s.score, 0) / clinicalSkills.length) : 0),
    [clinicalSkills]
  );

  // Radar geometry calculations
  const size = 500;
  const center = size / 2;
  const radius = 175;
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Calculate radar vertices for a list of skills
  const getRadarCoordinates = (skillList: SkillCompetency[]) => {
    const count = skillList.length;
    if (count === 0) return { points: '', vertices: [] };

    const vertices = skillList.map((skill, index) => {
      const angle = (index * 2 * Math.PI) / count - Math.PI / 2;
      const normalizedScore = skill.score / 100;
      const r = radius * normalizedScore;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);

      // Label coordinate (slightly beyond outer perimeter)
      const labelRadius = radius + 32;
      const lx = center + labelRadius * Math.cos(angle);
      const ly = center + labelRadius * Math.sin(angle);

      return {
        skill,
        x,
        y,
        lx,
        ly,
        angle,
      };
    });

    const points = vertices.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ');
    return { points, vertices };
  };

  const currentRadarData = useMemo(() => {
    return getRadarCoordinates(filteredSkills);
  }, [filteredSkills]);

  // Radar polygons for comparison mode (Hardware, AI, Clinical)
  const hwRadarData = useMemo(() => getRadarCoordinates(hardwareSkills), [hardwareSkills]);
  const aiRadarData = useMemo(() => getRadarCoordinates(aiSkills), [aiSkills]);
  const clinRadarData = useMemo(() => getRadarCoordinates(clinicalSkills), [clinicalSkills]);

  // Ring polygon generator
  const getRingPoints = (rPercent: number, numVertices: number) => {
    const r = radius * rPercent;
    const pts = [];
    for (let i = 0; i < numVertices; i++) {
      const angle = (i * 2 * Math.PI) / numVertices - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  // Helper for heatmap cell color tone
  const getHeatIntensityStyle = (score: number, category: string) => {
    if (category === 'hardware') {
      if (score >= 95) return 'bg-cyan-500/25 border-cyan-400 text-cyan-300';
      if (score >= 90) return 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400';
      return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500';
    } else if (category === 'ai') {
      if (score >= 95) return 'bg-emerald-500/25 border-emerald-400 text-emerald-300';
      if (score >= 90) return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400';
      return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
    } else if (category === 'clinical') {
      if (score >= 95) return 'bg-rose-500/25 border-rose-400 text-rose-300';
      if (score >= 90) return 'bg-rose-500/15 border-rose-500/40 text-rose-400';
      return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    } else {
      if (score >= 95) return 'bg-amber-500/25 border-amber-400 text-amber-300';
      return 'bg-amber-500/15 border-amber-500/40 text-amber-400';
    }
  };

  return (
    <div
      id="technical-skills-visualizer"
      className={`p-6 sm:p-8 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-2xl space-y-6 transition-all`}
    >
      {/* Top Header & Section Description */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">/</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Quantitative Competency Matrix</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-mono font-bold text-slate-100 flex items-center gap-2">
            Technical Skills &amp; Systems Architecture
          </h2>
          <p className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed max-w-2xl">
            Mathematical radar telemetry and competency heatmaps highlighting Nathaniel&apos;s competencies in{' '}
            <span className="text-cyan-400 font-semibold">Bespoke Hardware Engineering</span>,{' '}
            <span className="text-emerald-400 font-semibold">Local AI / Enterprise Automation</span>, and{' '}
            <span className="text-rose-400 font-semibold">Clinical Internal Medicine, Pharmacology &amp; DSM-5 Psychology</span>.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 self-start lg:self-center shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('radar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              viewMode === 'radar'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Radar Vector</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              viewMode === 'heatmap'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-cyan-400" />
            <span>Heatmap Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('comparison')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              viewMode === 'comparison'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Multi-Domain Overlay</span>
          </button>
        </div>
      </div>

      {/* Core Competency Metric Highlights - 4 Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono text-xs">
        {/* Hardware Pillar */}
        <div
          onClick={() => {
            setCategoryFilter('hardware');
            setSelectedSkillId('hw-liquid-cooling');
          }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
            categoryFilter === 'hardware'
              ? 'bg-cyan-950/40 border-cyan-400/80 ring-1 ring-cyan-400/40'
              : 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
              <Cpu className="w-3.5 h-3.5" /> Hardware &amp; Physical
            </span>
            <span className="text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded text-cyan-300 border border-cyan-500/20">
              6 Vectors
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-cyan-300">{avgHwScore}%</span>
            <span className="text-[11px] text-slate-400">Proficiency</span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans mt-1.5 leading-snug">
            Liquid thermal dynamics, multi-GPU rigs, marine fiber backbones &amp; component forensics.
          </p>
        </div>

        {/* AI & Automation Pillar */}
        <div
          onClick={() => {
            setCategoryFilter('ai');
            setSelectedSkillId('ai-local-llm');
          }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
            categoryFilter === 'ai'
              ? 'bg-emerald-950/40 border-emerald-400/80 ring-1 ring-emerald-400/40'
              : 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5" /> AI &amp; Automation
            </span>
            <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/20">
              6 Vectors
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-300">{avgAiScore}%</span>
            <span className="text-[11px] text-slate-400">Proficiency</span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans mt-1.5 leading-snug">
            Local LLM inference, Microsoft Power Automate, Google GenAI SDK &amp; ingest pipelines.
          </p>
        </div>

        {/* Cross-Disciplinary / Systems Pillar */}
        <div
          onClick={() => {
            setCategoryFilter('systems');
            setSelectedSkillId('sys-co-optimization');
          }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
            categoryFilter === 'systems'
              ? 'bg-amber-950/40 border-amber-400/80 ring-1 ring-amber-400/40'
              : 'bg-slate-950/70 border-slate-800 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              <Flame className="w-3.5 h-3.5" /> HW-AI Co-Opt
            </span>
            <span className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded text-amber-300 border border-amber-500/20">
              Coupled
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-300">{avgSysScore}%</span>
            <span className="text-[11px] text-slate-400">Peak Synergy</span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans mt-1.5 leading-snug">
            Eliminating AI thermal throttling under continuous duty via sub-ambient thermal loops.
          </p>
        </div>

        {/* Clinical, DSM-5 & Pharmacology Pillar */}
        <div
          onClick={() => {
            setCategoryFilter('clinical');
            setSelectedSkillId('clin-dsm5-diagnostics');
          }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
            categoryFilter === 'clinical'
              ? 'bg-rose-950/40 border-rose-400/80 ring-1 ring-rose-400/40'
              : 'bg-slate-950/70 border-slate-800 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
              <Brain className="w-3.5 h-3.5" /> Clinical &amp; DSM-5
            </span>
            <span className="text-[10px] bg-rose-500/10 px-2 py-0.5 rounded text-rose-300 border border-rose-500/20">
              VitalStats
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-rose-300">{avgClinScore}%</span>
            <span className="text-[11px] text-slate-400">Proficiency</span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans mt-1.5 leading-snug">
            DSM-5 diagnostics, ADME pharmacokinetics, contraindication flags &amp; HPG/HPA endocrinology.
          </p>
        </div>
      </div>

      {/* Filter Chips when not in Comparison view */}
      {viewMode !== 'comparison' && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" /> Focus Filter:
            </span>
            {(
              [
                { id: 'all', label: `All Disciplines (${skills.length})` },
                { id: 'hardware', label: `Hardware Focus (${hardwareSkills.length})` },
                { id: 'ai', label: `AI & Automation (${aiSkills.length})` },
                { id: 'clinical', label: `Clinical, DSM-5 & Meds (${clinicalSkills.length})` },
                { id: 'systems', label: `Coupled Systems (${systemsSkills.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  categoryFilter === tab.id
                    ? 'bg-slate-100 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
            *Click any node or cell for deep architectural breakdown
          </div>
        </div>
      )}

      {/* PRIMARY VISUALIZATION CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Main Column: The Chart or Heatmap */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl bg-slate-950/80 border border-slate-800 relative overflow-hidden min-h-[460px]">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-radial from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

          {/* VIEW 1: RADAR CHART */}
          {viewMode === 'radar' && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-[480px] aspect-square relative">
                <svg
                  viewBox={`0 0 ${size} ${size}`}
                  className="w-full h-full select-none overflow-visible"
                >
                  <defs>
                    {/* Linear and Radial Gradients */}
                    <linearGradient id="radarFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.30" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="radarStrokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                    <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Concentric Calibration Rings */}
                  {rings.map((ringVal, rIdx) => (
                    <g key={rIdx}>
                      <polygon
                        points={getRingPoints(ringVal, currentRadarData.vertices.length)}
                        fill="none"
                        stroke={rIdx === rings.length - 1 ? '#334155' : '#1e293b'}
                        strokeWidth={rIdx === rings.length - 1 ? '1.5' : '1'}
                        strokeDasharray={rIdx < rings.length - 1 ? '3 3' : undefined}
                      />
                      {/* Percent scale labels on north axis */}
                      <text
                        x={center + 6}
                        y={center - radius * ringVal + 4}
                        fill="#64748b"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="start"
                      >
                        {Math.round(ringVal * 100)}%
                      </text>
                    </g>
                  ))}

                  {/* Spokes from center to outer perimeter */}
                  {currentRadarData.vertices.map((v, idx) => (
                    <line
                      key={idx}
                      x1={center}
                      y1={center}
                      x2={center + radius * Math.cos(v.angle)}
                      y2={center + radius * Math.sin(v.angle)}
                      stroke="#334155"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Center Hub Core */}
                  <circle cx={center} cy={center} r={28} fill="url(#hubGlow)" />
                  <circle cx={center} cy={center} r={3} fill="#10b981" />

                  {/* The Radar Polygon Area */}
                  {currentRadarData.points && (
                    <polygon
                      points={currentRadarData.points}
                      fill="url(#radarFillGradient)"
                      stroke="url(#radarStrokeGradient)"
                      strokeWidth="2.5"
                      className="transition-all duration-300 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    />
                  )}

                  {/* Data Points & Vertex Anchors */}
                  {currentRadarData.vertices.map((v) => {
                    const isSelected = selectedSkillId === v.skill.id;
                    const isHovered = hoveredSkillId === v.skill.id;
                    const isHw = v.skill.category === 'hardware';
                    const isAi = v.skill.category === 'ai';
                    const isClin = v.skill.category === 'clinical';

                    const pointColor = isHw
                      ? '#38bdf8'
                      : isAi
                      ? '#34d399'
                      : isClin
                      ? '#fb7185'
                      : '#fbbf24';

                    return (
                      <g
                        key={v.skill.id}
                        className="cursor-pointer group"
                        onClick={() => setSelectedSkillId(v.skill.id)}
                        onMouseEnter={() => setHoveredSkillId(v.skill.id)}
                        onMouseLeave={() => setHoveredSkillId(null)}
                      >
                        {/* Outer Glow Halo if hovered or selected */}
                        {(isSelected || isHovered) && (
                          <circle
                            cx={v.x}
                            cy={v.y}
                            r={12}
                            fill={pointColor}
                            fillOpacity="0.25"
                            className="animate-pulse"
                          />
                        )}

                        {/* Solid Data Node */}
                        <circle
                          cx={v.x}
                          cy={v.y}
                          r={isSelected || isHovered ? 6 : 4}
                          fill={pointColor}
                          stroke="#020617"
                          strokeWidth="2"
                          className="transition-all duration-200"
                        />

                        {/* Axis Edge Label */}
                        <text
                          x={v.lx}
                          y={v.ly}
                          textAnchor={v.lx > center + 10 ? 'start' : v.lx < center - 10 ? 'end' : 'middle'}
                          dominantBaseline="central"
                          fill={isSelected || isHovered ? '#f8fafc' : '#94a3b8'}
                          fontSize={isSelected || isHovered ? '11' : '9.5'}
                          fontWeight={isSelected || isHovered ? 'bold' : 'normal'}
                          fontFamily="monospace"
                          className="transition-colors duration-150"
                        >
                          {v.skill.name.length > 20
                            ? `${v.skill.name.substring(0, 18)}..`
                            : v.skill.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-3 pt-3 border-t border-slate-900 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_6px_#38bdf8]" />
                  Hardware Core
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_#34d399]" />
                  AI &amp; Automation
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block shadow-[0_0_6px_#fb7185]" />
                  Clinical &amp; DSM-5
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_6px_#fbbf24]" />
                  Coupled Systems
                </span>
              </div>
            </div>
          )}

          {/* VIEW 2: HEATMAP GRID */}
          {viewMode === 'heatmap' && (
            <div className="w-full space-y-6">
              {/* Category 1: Hardware Engineering */}
              {(categoryFilter === 'all' || categoryFilter === 'hardware') && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400 border-b border-slate-800/80 pb-1">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                      <Cpu className="w-3.5 h-3.5" /> Hardware &amp; Physical Infrastructure
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Avg: {avgHwScore}% &bull; 6 Core Competencies
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {hardwareSkills.map((skill) => {
                      const isSelected = selectedSkillId === skill.id;
                      const intensityClass = getHeatIntensityStyle(skill.score, skill.category);

                      return (
                        <div
                          key={skill.id}
                          onClick={() => setSelectedSkillId(skill.id)}
                          onMouseEnter={() => setHoveredSkillId(skill.id)}
                          onMouseLeave={() => setHoveredSkillId(null)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                            isSelected
                              ? 'ring-2 ring-cyan-400 bg-cyan-950/60 border-cyan-400'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                              {skill.name}
                            </span>
                            <span
                              className={`text-xs font-mono px-2 py-0.5 rounded font-bold border ${intensityClass}`}
                            >
                              {skill.score}%
                            </span>
                          </div>

                          {/* Mini Heat Telemetry Bar */}
                          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500 rounded-full"
                              style={{ width: `${skill.score}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                            <span>{skill.years} Yrs Applied</span>
                            <span className="text-cyan-400/90">{skill.level} Tier</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category 2: AI & Automation */}
              {(categoryFilter === 'all' || categoryFilter === 'ai') && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400 border-b border-slate-800/80 pb-1">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> AI, LLM &amp; Workflow Automation
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Avg: {avgAiScore}% &bull; 6 Core Competencies
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {aiSkills.map((skill) => {
                      const isSelected = selectedSkillId === skill.id;
                      const intensityClass = getHeatIntensityStyle(skill.score, skill.category);

                      return (
                        <div
                          key={skill.id}
                          onClick={() => setSelectedSkillId(skill.id)}
                          onMouseEnter={() => setHoveredSkillId(skill.id)}
                          onMouseLeave={() => setHoveredSkillId(null)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                            isSelected
                              ? 'ring-2 ring-emerald-400 bg-emerald-950/60 border-emerald-400'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                              {skill.name}
                            </span>
                            <span
                              className={`text-xs font-mono px-2 py-0.5 rounded font-bold border ${intensityClass}`}
                            >
                              {skill.score}%
                            </span>
                          </div>

                          {/* Mini Heat Telemetry Bar */}
                          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 rounded-full"
                              style={{ width: `${skill.score}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                            <span>{skill.years} Yrs Applied</span>
                            <span className="text-emerald-400/90">{skill.level} Tier</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category 3: Coupled Systems */}
              {(categoryFilter === 'all' || categoryFilter === 'systems') && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-400 border-b border-slate-800/80 pb-1">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5" /> Hardware-AI Coupled Systems
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Avg: {avgSysScore}% &bull; 2 Core Competencies
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {systemsSkills.map((skill) => {
                      const isSelected = selectedSkillId === skill.id;
                      const intensityClass = getHeatIntensityStyle(skill.score, skill.category);

                      return (
                        <div
                          key={skill.id}
                          onClick={() => setSelectedSkillId(skill.id)}
                          onMouseEnter={() => setHoveredSkillId(skill.id)}
                          onMouseLeave={() => setHoveredSkillId(null)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                            isSelected
                              ? 'ring-2 ring-amber-400 bg-amber-950/60 border-amber-400'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                              {skill.name}
                            </span>
                            <span
                              className={`text-xs font-mono px-2 py-0.5 rounded font-bold border ${intensityClass}`}
                            >
                              {skill.score}%
                            </span>
                          </div>

                          {/* Mini Heat Telemetry Bar */}
                          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500 rounded-full"
                              style={{ width: `${skill.score}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                            <span>{skill.years} Yrs Applied</span>
                            <span className="text-amber-400/90">{skill.level} Tier</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category 4: Clinical Medicine, Pharmacology & DSM-5 Psychology */}
              {(categoryFilter === 'all' || categoryFilter === 'clinical') && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono text-rose-400 border-b border-slate-800/80 pb-1">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                      <Brain className="w-3.5 h-3.5" /> Clinical Medicine, Pharmacology &amp; DSM-5 Psychology
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Avg: {avgClinScore}% &bull; 6 Core Competencies &bull; VitalStats Matrix
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {clinicalSkills.map((skill) => {
                      const isSelected = selectedSkillId === skill.id;
                      const intensityClass = getHeatIntensityStyle(skill.score, skill.category);

                      return (
                        <div
                          key={skill.id}
                          onClick={() => setSelectedSkillId(skill.id)}
                          onMouseEnter={() => setHoveredSkillId(skill.id)}
                          onMouseLeave={() => setHoveredSkillId(null)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                            isSelected
                              ? 'ring-2 ring-rose-400 bg-rose-950/60 border-rose-400'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-slate-100 group-hover:text-rose-300 transition-colors">
                              {skill.name}
                            </span>
                            <span
                              className={`text-xs font-mono px-2 py-0.5 rounded font-bold border ${intensityClass}`}
                            >
                              {skill.score}%
                            </span>
                          </div>

                          {/* Mini Heat Telemetry Bar */}
                          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-rose-600 to-pink-500 transition-all duration-500 rounded-full"
                              style={{ width: `${skill.score}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                            <span>{skill.years} Yrs Applied</span>
                            <span className="text-rose-400/90">{skill.level} Tier</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: COMPARISON RADAR & METRICS */}
          {viewMode === 'comparison' && (
            <div className="w-full flex flex-col items-center">
              <div className="text-center space-y-1 mb-2">
                <span className="text-xs font-mono text-slate-400">
                  Tri-Vector Synthesis: Hardware (Cyan) vs. AI &amp; Automation (Emerald) vs. Clinical &amp; DSM-5 (Rose)
                </span>
              </div>

              <div className="w-full max-w-[480px] aspect-square relative">
                <svg
                  viewBox={`0 0 ${size} ${size}`}
                  className="w-full h-full select-none overflow-visible"
                >
                  <defs>
                    <linearGradient id="hwPolyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="aiPolyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="clinPolyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e11d48" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#fb7185" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {/* Concentric rings */}
                  {rings.map((ringVal, rIdx) => (
                    <polygon
                      key={rIdx}
                      points={getRingPoints(ringVal, 6)}
                      fill="none"
                      stroke={rIdx === rings.length - 1 ? '#334155' : '#1e293b'}
                      strokeWidth={rIdx === rings.length - 1 ? '1.5' : '1'}
                      strokeDasharray={rIdx < rings.length - 1 ? '3 3' : undefined}
                    />
                  ))}

                  {/* Spokes (6 axes) */}
                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
                    return (
                      <line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={center + radius * Math.cos(angle)}
                        y2={center + radius * Math.sin(angle)}
                        stroke="#334155"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Hardware Polygon */}
                  {hwRadarData.points && (
                    <polygon
                      points={hwRadarData.points}
                      fill="url(#hwPolyGradient)"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      className="filter drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]"
                    />
                  )}

                  {/* AI Polygon */}
                  {aiRadarData.points && (
                    <polygon
                      points={aiRadarData.points}
                      fill="url(#aiPolyGradient)"
                      stroke="#34d399"
                      strokeWidth="2.5"
                      className="filter drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                    />
                  )}

                  {/* Clinical & DSM-5 Polygon */}
                  {clinRadarData.points && (
                    <polygon
                      points={clinRadarData.points}
                      fill="url(#clinPolyGradient)"
                      stroke="#fb7185"
                      strokeWidth="2.5"
                      className="filter drop-shadow-[0_0_8px_rgba(251,113,133,0.4)]"
                    />
                  )}

                  {/* Hardware Nodes */}
                  {hwRadarData.vertices.map((v) => (
                    <g
                      key={`hw-${v.skill.id}`}
                      className="cursor-pointer"
                      onClick={() => setSelectedSkillId(v.skill.id)}
                      onMouseEnter={() => setHoveredSkillId(v.skill.id)}
                      onMouseLeave={() => setHoveredSkillId(null)}
                    >
                      <circle cx={v.x} cy={v.y} r={5} fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
                    </g>
                  ))}

                  {/* AI Nodes */}
                  {aiRadarData.vertices.map((v) => (
                    <g
                      key={`ai-${v.skill.id}`}
                      className="cursor-pointer"
                      onClick={() => setSelectedSkillId(v.skill.id)}
                      onMouseEnter={() => setHoveredSkillId(v.skill.id)}
                      onMouseLeave={() => setHoveredSkillId(null)}
                    >
                      <circle cx={v.x} cy={v.y} r={5} fill="#34d399" stroke="#0f172a" strokeWidth="2" />
                    </g>
                  ))}

                  {/* Clinical Nodes */}
                  {clinRadarData.vertices.map((v) => (
                    <g
                      key={`clin-${v.skill.id}`}
                      className="cursor-pointer"
                      onClick={() => setSelectedSkillId(v.skill.id)}
                      onMouseEnter={() => setHoveredSkillId(v.skill.id)}
                      onMouseLeave={() => setHoveredSkillId(null)}
                    >
                      <circle cx={v.x} cy={v.y} r={5} fill="#fb7185" stroke="#0f172a" strokeWidth="2" />
                    </g>
                  ))}
                </svg>
              </div>

              {/* Comparative Legend and Balance Check */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-3 pt-3 border-t border-slate-900 text-xs font-mono">
                <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-500/30 text-center">
                  <div className="text-cyan-400 font-bold flex items-center justify-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> Hardware: {avgHwScore}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">16 Yrs Computer Eng.</div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-center">
                  <div className="text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI: {avgAiScore}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Local LLMs &amp; Pipelines</div>
                </div>

                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-center">
                  <div className="text-rose-400 font-bold flex items-center justify-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" /> Clinical: {avgClinScore}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">DSM-5, ADME &amp; Meds</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Deep Architectural Inspector Card */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl relative overflow-hidden">
            {/* Top Indicator Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeSkill.category === 'hardware'
                      ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
                      : activeSkill.category === 'ai'
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : activeSkill.category === 'clinical'
                      ? 'bg-rose-400 shadow-[0_0_8px_#fb7185]'
                      : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                  }`}
                />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Competency Telemetry
                </span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                  activeSkill.category === 'hardware'
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : activeSkill.category === 'ai'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : activeSkill.category === 'clinical'
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                }`}
              >
                {activeSkill.category}
              </span>
            </div>

            {/* Skill Name & Score Bar */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-mono font-bold text-slate-100 leading-snug">
                {activeSkill.name}
              </h3>

              <div className="flex items-baseline justify-between font-mono text-xs pt-1">
                <span className="text-slate-400">Proficiency Rating:</span>
                <span
                  className={`text-xl font-bold ${
                    activeSkill.category === 'hardware'
                      ? 'text-cyan-400'
                      : activeSkill.category === 'ai'
                      ? 'text-emerald-400'
                      : activeSkill.category === 'clinical'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {activeSkill.score}% ({activeSkill.level})
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    activeSkill.category === 'hardware'
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-400'
                      : activeSkill.category === 'ai'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                      : activeSkill.category === 'clinical'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-500'
                      : 'bg-gradient-to-r from-amber-600 to-amber-400'
                  }`}
                  style={{ width: `${activeSkill.score}%` }}
                />
              </div>
            </div>

            {/* Experience & Highlight */}
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Field Practice:</span>
                <span className="text-slate-200 font-bold">{activeSkill.years} Years Applied</span>
              </div>
              <p className="text-xs font-sans text-slate-300 leading-relaxed">
                {activeSkill.highlight}
              </p>
            </div>

            {/* Impact Metric Callout */}
            {activeSkill.impactMetric && (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1 font-bold">
                  <TrendingUp className="w-3.5 h-3.5" /> Proven Operational Metric
                </div>
                <div className="text-xs font-mono text-slate-100 font-semibold">
                  {activeSkill.impactMetric}
                </div>
              </div>
            )}

            {/* Technologies Chip Array */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Technologies &amp; Protocols
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeSkill.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Link to Applied Case Studies */}
            {onNavigateToCaseStudies && (
              <button
                type="button"
                onClick={onNavigateToCaseStudies}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 font-mono text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Review Case Study Benchmarks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Verification Badge */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs font-mono">
              <div className="text-slate-200 font-bold">Applied Engineering Verification</div>
              <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Evaluated against Nathaniel&apos;s real-world deployments at Pure Computers, Waveguide Marine
                Networks, Siemens Energy, and Google / Coursera AI certifications.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
