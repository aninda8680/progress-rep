const fs = require('fs');
const path = require('path');

const markdownPath = path.resolve(__dirname, '../../60-day-flutter-dart-developer-roadmap.md');
const markdown = fs.readFileSync(markdownPath, 'utf-8');

const lines = markdown.split('\n');

const roadmap = [];
let currentWeek = 0;
let currentPhase = "";
let currentDay = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Phase matching
  const phaseMatch = line.match(/^## Phase \d+: (.+) \(Days (\d+)–(\d+)\)/);
  if (phaseMatch) {
    currentPhase = phaseMatch[1];
    continue;
  }

  // Day matching
  const dayMatch = line.match(/^\*\*Day (\d+)(?:[ \-]+(.*?))?\*\*/);
  if (dayMatch) {
    if (currentDay) {
      roadmap.push(currentDay);
    }
    const dayNumber = parseInt(dayMatch[1], 10);
    const rawTitle = dayMatch[2] || "";
    const isProject = rawTitle.includes("Project");
    const cleanTitle = rawTitle.replace(/^[—\-\s]+/, '').replace(/^(🔁|🎯)\s*/, '');
    
    currentWeek = Math.ceil(dayNumber / 7);

    currentDay = {
      day: dayNumber,
      week: currentWeek,
      phase: currentPhase,
      title: cleanTitle,
      topics: [],
      practice: "",
      isProject: isProject
    };
    continue;
  }

  if (currentDay) {
    if (line.startsWith('- *Practice:*')) {
      currentDay.practice = line.replace('- *Practice:*', '').trim();
    } else if (line.startsWith('- ')) {
      const topic = line.replace('- ', '').trim();
      currentDay.topics.push(topic);
    }
  }
}

if (currentDay) {
  roadmap.push(currentDay);
}

// Group by weeks
const weeks = [];
for (let i = 1; i <= 9; i++) {
  const weekDays = roadmap.filter(d => d.week === i);
  if (weekDays.length > 0) {
    weeks.push({
      weekNumber: i,
      days: weekDays
    });
  }
}

const outputPath = path.resolve(__dirname, '../data/roadmap.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(roadmap, null, 2));

console.log("Roadmap parsed successfully.");
