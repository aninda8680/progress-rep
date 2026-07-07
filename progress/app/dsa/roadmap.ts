import roadmapData from '../../data/dsa-roadmap.json';

export type Day = {
  day: number;
  week: number;
  phase: string;
  title: string;
  topics: string[];
  practice: string;
  isProject: boolean;
};

export type Week = {
  weekNumber: number;
  title: string;
  accent: string;
  days: Day[];
};

export const RAW_DAYS = roadmapData as Day[];

// Group by weeks
const WEEKS_MAP = new Map<number, Day[]>();
RAW_DAYS.forEach(day => {
  if (!WEEKS_MAP.has(day.week)) {
    WEEKS_MAP.set(day.week, []);
  }
  WEEKS_MAP.get(day.week)!.push(day);
});

// Vibrant Neo-Brutalist colors
const ACCENTS = [
  "#ffd93d", // Yellow
  "#ff90e8", // Pink
  "#5ce1e6", // Cyan
  "#7bf1a8", // Mint
  "#ffa552", // Orange
  "#c084fc", // Purple
  "#ffb2b2", // Light Red
  "#b2ffcc", // Light Green
  "#b2ccff"  // Light Blue
];

export const WEEKS: Week[] = Array.from(WEEKS_MAP.entries()).map(([weekNum, days], i) => {
  // Use the phase name of the first day in the week for the title
  const phaseName = days[0]?.phase || `Week ${weekNum}`;
  return {
    weekNumber: weekNum,
    title: phaseName, 
    accent: ACCENTS[i % ACCENTS.length],
    days: days
  };
});

export const TOTAL_DAYS = RAW_DAYS.length;
