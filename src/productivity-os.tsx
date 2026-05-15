import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  Circle,
  Target,
  Archive,
  Trash2,
  Play,
  History,
  RotateCcw,
  ShieldAlert,
  Pause,
  Inbox,
  Flag,
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type BlockStatus = 'idle' | 'active' | 'done';
type Block = {
  id: string;
  name: string;
  type: 'deep' | 'light';
  duration: number;
  intent: string;
  status: BlockStatus;
  timeLeft: number;
};
type DayLog = {
  date: string;
  dayName: string;
  intent: string;
  blocksCompleted: number;
  totalBlocks: number;
  blockDetails: { name: string; intent: string; completed: boolean }[];
};
type WeeklyPlan = { startDate: string; mainGoal: string; milestones: string[] };
type Priority = {
  id: string;
  title: string;
  subtitle: string;
  completed: boolean;
};

// ============================================================================
// CONSTANTS & HELPERS
// ============================================================================
const WEEK_THEMES = [
  {
    day: 0,
    name: 'Sunday: Recovery & Reset',
    focus:
      'Planning next week, sleep correction, lighter work only. NO revenge grinding.',
  },
  {
    day: 1,
    name: 'Monday: Deep Build',
    focus: 'Feature development only. Execution over perfection.',
  },
  {
    day: 2,
    name: 'Tuesday: Deep Build',
    focus: 'Feature development only. Maintain consistency.',
  },
  {
    day: 3,
    name: 'Wednesday: Deep Build',
    focus: 'Feature development only. Push through the middle.',
  },
  {
    day: 4,
    name: 'Thursday: Deep Build',
    focus: 'Feature development only. Wrap up heavy logic.',
  },
  {
    day: 5,
    name: 'Friday: Interview & Consolidation',
    focus: 'Project explanation, React/JS revision, debugging understanding.',
  },
  {
    day: 6,
    name: 'Saturday: Professionalization',
    focus: 'Responsiveness, refactor, code cleanup, deployment verify.',
  },
];

const INITIAL_BLOCKS: Block[] = [
  {
    id: 'b1',
    name: 'Deep Session 1',
    type: 'deep',
    duration: 90 * 60,
    intent: '',
    status: 'idle',
    timeLeft: 90 * 60,
  },
  {
    id: 'b2',
    name: 'Deep Session 2 (Same Task)',
    type: 'deep',
    duration: 90 * 60,
    intent: '',
    status: 'idle',
    timeLeft: 90 * 60,
  },
  {
    id: 'b3',
    name: 'Light Session (Polish)',
    type: 'light',
    duration: 45 * 60,
    intent: '',
    status: 'idle',
    timeLeft: 45 * 60,
  },
];

// TIMELINE ALLOCATED ROADMAP
const INITIAL_PRIORITIES: Priority[] = [
  {
    id: 'p1',
    title: 'Booking App: Reservation Logic',
    subtitle: 'Week 1 (4 Build Days) - Update flow & overlap checks',
    completed: false,
  },
  {
    id: 'p2',
    title: 'Admin App: Room Types & Inventory',
    subtitle: 'Week 2 & 3 (8 Build Days) - Sorting, filters, room CRUD',
    completed: false,
  },
  {
    id: 'p3',
    title: 'Admin App: Reservations Page',
    subtitle: 'Week 4 & 5 (6 Build Days) - Tables, details, check-in flow',
    completed: false,
  },
  {
    id: 'p4',
    title: 'Admin App: Dashboard Analytics',
    subtitle: 'Week 5 & 6 (5 Build Days) - Occupancy, revenue, charts',
    completed: false,
  },
  {
    id: 'p5',
    title: 'Admin App: Operations & Staff',
    subtitle: 'Week 7 (4 Build Days) - Housekeeping, staff creation',
    completed: false,
  },
  {
    id: 'p6',
    title: 'Admin App: Hotel & Account Settings',
    subtitle: 'Week 8 (4 Build Days) - Hotel info, account preferences',
    completed: false,
  },
  {
    id: 'p7',
    title: 'Buffer & Refactoring Week',
    subtitle: 'Week 9 - Catch up on spillover, final project polish',
    completed: false,
  },
  {
    id: 'p8',
    title: 'Phase 3: Interview & App Push',
    subtitle: 'Week 10 - Mock interviews, portfolio finalize, applications',
    completed: false,
  },
];

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// ============================================================================
// COMPONENT: Top Navigation
// ============================================================================
const TopNav = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (t: any) => void;
}) => (
  <nav className="border-b border-[#1b4332] bg-[#0a0a0a] sticky top-0 z-50 shadow-md">
    <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Productivity OS
        </h1>
        <p className="text-[#bf953f] text-xs font-bold tracking-widest uppercase mt-1">
          Target: Late July 2026 (10 Weeks)
        </p>
      </div>
      <div className="flex gap-2 bg-[#111] p-1.5 rounded-lg border border-gray-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('execution')}
          className={`px-4 py-2 text-sm whitespace-nowrap rounded transition-colors ${
            activeTab === 'execution'
              ? 'bg-[#1b4332] text-white font-bold'
              : 'hover:text-white'
          }`}
        >
          Execution
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm whitespace-nowrap rounded transition-colors ${
            activeTab === 'history'
              ? 'bg-[#1b4332] text-white font-bold'
              : 'hover:text-white'
          }`}
        >
          Review & History
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 text-sm whitespace-nowrap rounded transition-colors ${
            activeTab === 'rules'
              ? 'bg-[#bf953f] text-black font-bold'
              : 'hover:text-white'
          }`}
        >
          Mindset & Rules
        </button>
      </div>
    </div>
  </nav>
);

// ============================================================================
// COMPONENT: Rules & Mindset Tab
// ============================================================================
const RulesTab = () => (
  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
    <div className="space-y-8">
      <div className="bg-[#0a1f16] border border-[#1b4332] p-6 rounded-xl">
        <h3 className="text-[#bf953f] font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> The Master Rule
        </h3>
        <p className="text-white text-lg font-bold leading-snug">
          Even if wakeup is late: the day is NOT ruined.
        </p>
        <p className="text-gray-400 mt-2 text-sm">
          Adapt the schedule. Still complete the sessions. The goal is daily
          visible progress, not perfect wakeup consistency.
        </p>
      </div>
      <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
        <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-4 border-b border-gray-800 pb-2">
          Avoid At All Costs
        </h3>
        <ul className="space-y-3 text-sm text-gray-300">
          <li className="flex gap-2 items-start">
            <span className="text-red-500 mt-0.5">✖</span> Daily replanning and
            overengineering.
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-red-500 mt-0.5">✖</span> Tutorial addiction
            (build it yourself).
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-red-500 mt-0.5">✖</span> Perfection paralysis.
            Functional + explainable &gt; enterprise perfection.
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-red-500 mt-0.5">✖</span> Emotional
            all-or-nothing cycles & revenge grinding.
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-red-500 mt-0.5">✖</span> Adding features: No
            AI, No advanced RBAC, No websockets. Keep it employable.
          </li>
        </ul>
      </div>
    </div>

    <div className="space-y-8">
      <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
        <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-4 border-b border-gray-800 pb-2">
          Interview Phases
        </h3>
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            <strong className="text-[#bf953f]">Phase 1 (Wks 1-3):</strong>{' '}
            Explain own projects (Supabase, flow, state).
          </p>
          <p>
            <strong className="text-[#bf953f]">Phase 2 (Wks 4-6):</strong> Core
            JS (closures, event loop, hooks).
          </p>
          <p>
            <strong className="text-[#bf953f]">Phase 3 (Wks 7-10):</strong> Mock
            interviews, debugging, architecture.
          </p>
        </div>
      </div>
      <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
        <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-4 border-b border-gray-800 pb-2">
          Weekly War Rhythm
        </h3>
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            <strong className="text-white">Mon-Thu:</strong> Deep Build Days
            (Features only)
          </p>
          <p>
            <strong className="text-white">Friday:</strong> Interview &
            Consolidation
          </p>
          <p>
            <strong className="text-white">Saturday:</strong>{' '}
            Professionalization
          </p>
          <p>
            <strong className="text-white">Sunday:</strong> Recovery & Reset
          </p>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// COMPONENT: History & Planning Tab
// ============================================================================
const HistoryTab = ({
  weeklyPlan,
  setWeeklyPlan,
  handleMilestoneChange,
  sundayBacklog,
  setSundayBacklog,
  history,
  priorities,
  togglePriority,
}: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
    <div className="lg:col-span-5 space-y-6">
      {/* Weekly Goal */}
      <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">
          Weekly Goal
        </h2>
        <input
          type="text"
          value={weeklyPlan.mainGoal}
          onChange={(e) =>
            setWeeklyPlan((prev: any) => ({
              ...prev,
              mainGoal: e.target.value,
            }))
          }
          placeholder="Primary objective this week..."
          className="w-full bg-black border border-gray-800 focus:border-[#bf953f] text-white p-3 rounded-lg outline-none text-sm mb-4"
        />
        <p className="text-xs text-gray-500 mb-2">Milestones:</p>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              type="text"
              value={weeklyPlan.milestones[i]}
              onChange={(e) => handleMilestoneChange(i, e.target.value)}
              placeholder={`Milestone ${i + 1}`}
              className="w-full bg-transparent border-b border-gray-800 focus:border-[#1b4332] text-sm text-gray-300 py-1 outline-none"
            />
          ))}
        </div>
      </div>

      {/* Feature Tracking Roadmap */}
      <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
          <Flag className="w-4 h-4" /> 10-Week Allocated Roadmap
        </h2>
        <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
          {priorities.map((p: Priority, index: number) => (
            <div
              key={p.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                p.completed
                  ? 'bg-[#0a2a1f] border-[#1b4332] opacity-70'
                  : 'bg-black border-gray-800'
              }`}
            >
              <button
                onClick={() => togglePriority(p.id)}
                className="mt-0.5 shrink-0"
              >
                {p.completed ? (
                  <CheckCircle className="w-5 h-5 text-[#bf953f]" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-600 hover:text-white transition-colors" />
                )}
              </button>
              <div>
                <p
                  className={`text-sm font-bold ${
                    p.completed ? 'text-gray-400 line-through' : 'text-white'
                  }`}
                >
                  {p.title}
                </p>
                <p className="text-xs text-[#bf953f] mt-0.5 font-semibold">
                  {p.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sunday Backlog */}
      <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 border-b border-gray-800 pb-2 flex items-center justify-between">
          Sunday Backlog
          <button
            onClick={() => setSundayBacklog([])}
            className="text-gray-600 hover:text-red-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </h2>
        {sundayBacklog.length === 0 ? (
          <p className="text-xs text-gray-500 italic">
            No overthinking thoughts saved.
          </p>
        ) : (
          <ul className="space-y-3">
            {sundayBacklog.map((item: string, i: number) => (
              <li
                key={i}
                className="text-sm text-gray-400 bg-black p-3 rounded border border-gray-800"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

    {/* Consistency Log */}
    <div className="lg:col-span-7">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5" /> Consistency Record
        </h2>
        <div className="text-xs font-bold bg-[#1b4332] text-white px-3 py-1.5 rounded-full">
          Total Days Logged: {history.length}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 border border-gray-800 rounded-xl bg-[#111]">
          <Archive className="w-8 h-8 mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">Your completed days will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6 h-[850px] overflow-y-auto pr-2 custom-scrollbar pb-12">
          {history.map((log: DayLog, i: number) => (
            <div
              key={i}
              className="bg-[#111] border border-gray-800 rounded-xl p-6 relative"
            >
              {i !== history.length - 1 && (
                <div className="absolute left-10 -bottom-6 w-0.5 h-6 bg-gray-800" />
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[#bf953f] text-xs font-bold uppercase tracking-widest">
                    {log.dayName}
                  </span>
                  <span className="text-gray-500 text-xs ml-2">{log.date}</span>
                  <p className="text-lg text-white font-bold mt-1">
                    {log.intent}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`font-bold text-xl ${
                      log.blocksCompleted > 0
                        ? 'text-[#1b4332]'
                        : 'text-gray-500'
                    }`}
                  >
                    {log.blocksCompleted}/3
                  </span>
                  <p className="text-xs text-gray-500 uppercase">Blocks</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-gray-800">
                {log.blockDetails.map((bd: any, j: number) => (
                  <div key={j} className="flex items-start gap-3">
                    {bd.completed ? (
                      <CheckCircle className="w-4 h-4 text-[#1b4332] shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-700 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        {bd.name}
                      </p>
                      <p
                        className={`text-sm ${
                          bd.completed
                            ? 'text-gray-300'
                            : 'text-gray-600 line-through'
                        }`}
                      >
                        {bd.intent || 'No intent specified'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ============================================================================
// COMPONENT: Execution Tab
// ============================================================================
const ExecutionTab = ({
  todayTheme,
  dayStatus,
  dailyIntent,
  setDailyIntent,
  blocks,
  startDay,
  endDay,
  resetEntireDay,
  prepareTomorrow,
  updateBlockIntent,
  resetBlock,
  toggleBlockTimer,
  markBlockDone,
  brainDump,
  setBrainDump,
  archiveOverthinking,
}: any) => {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-8">
      {/* Theme Header */}
      <div className="bg-gradient-to-r from-[#0a2a1f] to-[#0a0a0a] border border-[#1b4332] px-6 py-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_20px_rgba(27,67,50,0.1)]">
        <div>
          <p className="text-[#bf953f] font-bold text-xs uppercase tracking-widest mb-1">
            {todayTheme.name}
          </p>
          <p className="text-gray-300 text-sm">{todayTheme.focus}</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
            Consistency &gt; Intensity
          </p>
        </div>
      </div>

      {/* STATE: IDLE */}
      {dayStatus === 'idle' && (
        <div className="border border-gray-800 bg-[#111] p-8 md:p-16 rounded-2xl text-center shadow-2xl">
          <Target className="w-16 h-16 mx-auto text-[#1b4332] mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            What is the One Thing today?
          </h2>
          <input
            autoFocus
            type="text"
            value={dailyIntent}
            onChange={(e) => setDailyIntent(e.target.value)}
            placeholder="e.g., Build the Reservation Update flow"
            className="w-full max-w-2xl mx-auto bg-black border border-gray-700 focus:border-[#bf953f] text-white text-xl p-5 rounded-xl outline-none text-center block transition-colors mb-8"
          />
          <button
            onClick={startDay}
            className="bg-[#1b4332] hover:bg-[#0a3b2c] text-white font-bold text-lg px-10 py-4 rounded-xl transition-all flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-[0_0_20px_rgba(27,67,50,0.4)]"
          >
            <Play className="w-5 h-5 fill-current" /> Begin Daily Protocol
          </button>
        </div>
      )}

      {/* STATE: ACTIVE */}
      {dayStatus === 'active' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#111] border border-gray-800 p-6 rounded-xl">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Today's Directive
              </p>
              <p className="text-2xl text-white font-bold">{dailyIntent}</p>
            </div>

            <div className="space-y-4">
              {blocks.map((block: Block) => (
                <div
                  key={block.id}
                  className={`p-5 rounded-xl border transition-all duration-300 ${
                    block.status === 'done'
                      ? 'bg-[#0a2a1f] border-[#1b4332] opacity-60'
                      : block.status === 'active'
                      ? 'bg-[#111] border-[#bf953f] shadow-[0_0_15px_rgba(191,149,63,0.15)] animate-pulse-slow'
                      : 'bg-[#111] border-gray-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="shrink-0 flex items-center md:flex-col gap-3">
                      <button
                        onClick={() =>
                          block.status !== 'done' && toggleBlockTimer(block.id)
                        }
                        disabled={block.status === 'done'}
                        className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                          block.status === 'done'
                            ? 'border-[#1b4332] text-[#1b4332]'
                            : block.status === 'active'
                            ? 'border-[#bf953f] text-[#bf953f] bg-[#bf953f]/10'
                            : 'border-gray-700 text-gray-500 hover:border-white hover:text-white'
                        }`}
                      >
                        {block.status === 'done' ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : block.status === 'active' ? (
                          <Pause className="w-6 h-6 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 ml-1 fill-current" />
                        )}
                      </button>
                      <div
                        className={`font-mono text-sm font-bold ${
                          block.status === 'active'
                            ? 'text-[#bf953f]'
                            : 'text-gray-500'
                        }`}
                      >
                        {formatTime(block.timeLeft)}
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-center">
                        <p
                          className={`font-bold text-sm uppercase tracking-wider ${
                            block.status === 'active'
                              ? 'text-[#bf953f]'
                              : 'text-gray-400'
                          }`}
                        >
                          {block.name}
                        </p>
                        {block.status !== 'done' && (
                          <button
                            onClick={() => resetBlock(block.id)}
                            title="Reset Block"
                            className="text-gray-600 hover:text-red-400 p-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={block.intent}
                        onChange={(e) =>
                          updateBlockIntent(block.id, e.target.value)
                        }
                        placeholder={`Specify the output for this ${
                          block.duration / 60
                        }m block...`}
                        disabled={block.status === 'done'}
                        className={`w-full bg-transparent outline-none text-lg transition-colors ${
                          block.status === 'done'
                            ? 'text-gray-500 line-through'
                            : 'text-white border-b border-dashed border-gray-700 focus:border-[#bf953f] pb-1'
                        }`}
                      />
                      {block.status !== 'done' && block.intent && (
                        <button
                          onClick={() => markBlockDone(block.id)}
                          className="text-xs bg-[#1b4332] hover:bg-[#0a3b2c] text-white px-4 py-2 rounded font-bold transition-colors mt-2"
                        >
                          Mark Block Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button
                onClick={endDay}
                className="w-full bg-gray-900 hover:bg-black text-gray-300 border border-gray-800 hover:border-[#1b4332] font-bold text-sm px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Archive className="w-4 h-4" /> End Day & Save to History
              </button>
              <button
                onClick={resetEntireDay}
                className="w-full mt-4 text-xs text-gray-600 hover:text-red-500 flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Made a mistake? Reset Entire
                Day
              </button>
            </div>
          </div>

          <div className="lg:col-span-4">
            <section className="bg-black border border-gray-800 p-5 rounded-xl shadow-lg sticky top-24">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Overthinking Cache
              </h2>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Feeling pressure? Dump tutorial urges, "what-ifs", and random
                ideas here. Keep your working memory clean for the block.
              </p>
              <textarea
                value={brainDump}
                onChange={(e) => setBrainDump(e.target.value)}
                placeholder="e.g., I should rebuild this in GraphQL..."
                className="w-full bg-[#111] border border-gray-800 rounded p-4 text-sm text-gray-300 outline-none focus:border-[#bf953f] mb-4 resize-none"
                rows={8}
              />
              <div className="flex gap-2">
                <button
                  onClick={archiveOverthinking}
                  className="flex-1 py-3 bg-[#111] hover:bg-[#1b4332]/20 text-gray-400 hover:text-[#bf953f] text-xs font-bold rounded border border-gray-800 transition-colors flex justify-center items-center gap-2"
                >
                  <Inbox className="w-3 h-3" /> Send to Sunday Backlog
                </button>
                <button
                  onClick={() => setBrainDump('')}
                  title="Discard completely"
                  className="px-4 bg-red-950/20 hover:bg-red-900/40 text-red-500 rounded border border-red-900/30 transition-colors flex items-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* STATE: FINISHED */}
      {dayStatus === 'finished' && (
        <div className="border border-[#1b4332] bg-[#0a2a1f] p-12 rounded-2xl text-center shadow-[0_0_30px_rgba(27,67,50,0.15)]">
          <CheckCircle className="w-20 h-20 mx-auto text-[#bf953f] mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Execution Logged
          </h2>
          <p className="text-gray-300 max-w-lg mx-auto mb-8">
            You showed up. Step away from the IDE. Go to the "Review & History"
            tab to see your progress, or shut down for the day.
          </p>
          <button
            onClick={prepareTomorrow}
            className="bg-[#111] border border-gray-700 hover:border-white text-white px-6 py-3 rounded-lg text-sm font-bold transition-colors"
          >
            Prepare for Tomorrow
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT: Wrapper & State Provider
// ============================================================================
export default function ProductivityOS() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'execution' | 'history' | 'rules'>(
    'execution'
  );

  const [todayTheme, setTodayTheme] = useState(WEEK_THEMES[1]);
  const [dayStatus, setDayStatus] = useState<'idle' | 'active' | 'finished'>(
    'idle'
  );
  const [dailyIntent, setDailyIntent] = useState('');
  const [brainDump, setBrainDump] = useState('');
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({
    startDate: new Date().toLocaleDateString(),
    mainGoal: '',
    milestones: ['', '', ''],
  });
  const [history, setHistory] = useState<DayLog[]>([]);
  const [sundayBacklog, setSundayBacklog] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>(INITIAL_PRIORITIES);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTodayTheme(WEEK_THEMES[new Date().getDay()]);
    setIsMounted(true);

    const loadData = (
      key: string,
      setter: React.Dispatch<any>,
      isJson = false
    ) => {
      try {
        const data = localStorage.getItem(key);
        if (data) setter(isJson ? JSON.parse(data) : data);
      } catch (error) {
        console.error(`Error parsing data for ${key}:`, error);
      }
    };

    loadData('pos-v3-dayStatus', setDayStatus);
    loadData('pos-v3-intent', setDailyIntent);
    loadData('pos-v3-blocks', setBlocks, true);
    loadData('pos-v3-weekly', setWeeklyPlan, true);
    loadData('pos-v3-history', setHistory, true);
    loadData('pos-v3-backlog', setSundayBacklog, true);
    loadData('pos-v3-priorities', setPriorities, true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pos-v3-dayStatus', dayStatus);
    localStorage.setItem('pos-v3-intent', dailyIntent);
    localStorage.setItem('pos-v3-blocks', JSON.stringify(blocks));
    localStorage.setItem('pos-v3-weekly', JSON.stringify(weeklyPlan));
    localStorage.setItem('pos-v3-history', JSON.stringify(history));
    localStorage.setItem('pos-v3-backlog', JSON.stringify(sundayBacklog));
    localStorage.setItem('pos-v3-priorities', JSON.stringify(priorities));
  }, [
    dayStatus,
    dailyIntent,
    blocks,
    weeklyPlan,
    history,
    sundayBacklog,
    priorities,
    isMounted,
  ]);

  const isAnyBlockActive = blocks.some((b) => b.status === 'active');
  useEffect(() => {
    const activeBlockIndex = blocks.findIndex((b) => b.status === 'active');

    if (activeBlockIndex === -1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setBlocks((prev) => {
        const newBlocks = [...prev];
        const activeBlock = newBlocks[activeBlockIndex];

        if (activeBlock.timeLeft <= 1) {
          newBlocks[activeBlockIndex] = {
            ...activeBlock,
            timeLeft: 0,
            status: 'done',
          };
          clearInterval(timerRef.current!);
          try {
            new Audio(
              'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg'
            ).play();
          } catch (e) {
            console.log('Audio blocked');
          }
        } else {
          newBlocks[activeBlockIndex] = {
            ...activeBlock,
            timeLeft: activeBlock.timeLeft - 1,
          };
        }
        return newBlocks;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAnyBlockActive, blocks]);

  const startDay = () => {
    if (!dailyIntent.trim())
      return alert('Define your primary intent for today.');
    setDayStatus('active');
  };

  const endDay = () => {
    setHistory((prev) => {
      const log: DayLog = {
        date: new Date().toLocaleDateString(),
        dayName: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        intent: dailyIntent,
        blocksCompleted: blocks.filter((b) => b.status === 'done').length,
        totalBlocks: blocks.length,
        blockDetails: blocks.map((b) => ({
          name: b.name,
          intent: b.intent,
          completed: b.status === 'done',
        })),
      };
      return [log, ...prev];
    });
    setDayStatus('finished');
  };

  const resetEntireDay = () => {
    if (confirm("Wipe today's progress and start over?")) {
      setDayStatus('idle');
      setDailyIntent('');
      setBrainDump('');
      setBlocks(INITIAL_BLOCKS);
    }
  };

  const prepareTomorrow = () => {
    setDayStatus('idle');
    setDailyIntent('');
    setBrainDump('');
    setBlocks(INITIAL_BLOCKS);
  };

  const updateBlockIntent = (id: string, newIntent: string) =>
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, intent: newIntent } : b))
    );
  const resetBlock = (id: string) =>
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, intent: '', status: 'idle', timeLeft: b.duration }
          : b
      )
    );

  const toggleBlockTimer = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === id)
          return { ...b, status: b.status === 'active' ? 'idle' : 'active' };
        return { ...b, status: b.status === 'active' ? 'idle' : b.status };
      })
    );
  };

  const markBlockDone = (id: string) =>
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'done', timeLeft: 0 } : b))
    );

  const handleMilestoneChange = (index: number, value: string) => {
    setWeeklyPlan((prev) => {
      const newMilestones = [...prev.milestones];
      newMilestones[index] = value;
      return { ...prev, milestones: newMilestones };
    });
  };

  const togglePriority = (id: string) => {
    setPriorities((prev) =>
      prev.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p))
    );
  };

  const archiveOverthinking = () => {
    if (!brainDump.trim()) return;
    setSundayBacklog((prev) => [...prev, brainDump.trim()]);
    setBrainDump('');
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans selection:bg-[#1b4332] selection:text-white pb-12">
      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-8">
        {activeTab === 'execution' && (
          <ExecutionTab
            todayTheme={todayTheme}
            dayStatus={dayStatus}
            dailyIntent={dailyIntent}
            setDailyIntent={setDailyIntent}
            blocks={blocks}
            startDay={startDay}
            endDay={endDay}
            resetEntireDay={resetEntireDay}
            prepareTomorrow={prepareTomorrow}
            updateBlockIntent={updateBlockIntent}
            resetBlock={resetBlock}
            toggleBlockTimer={toggleBlockTimer}
            markBlockDone={markBlockDone}
            brainDump={brainDump}
            setBrainDump={setBrainDump}
            archiveOverthinking={archiveOverthinking}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            weeklyPlan={weeklyPlan}
            setWeeklyPlan={setWeeklyPlan}
            handleMilestoneChange={handleMilestoneChange}
            sundayBacklog={sundayBacklog}
            setSundayBacklog={setSundayBacklog}
            history={history}
            priorities={priorities}
            togglePriority={togglePriority}
          />
        )}

        {activeTab === 'rules' && <RulesTab />}
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pulse-slow {
          0%, 100% { box-shadow: 0 0 15px rgba(191,149,63,0.15); border-color: rgba(191,149,63,0.5); }
          50% { box-shadow: 0 0 25px rgba(191,149,63,0.3); border-color: rgba(191,149,63,0.8); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #111; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #bf953f; }
      `,
        }}
      />
    </div>
  );
}
