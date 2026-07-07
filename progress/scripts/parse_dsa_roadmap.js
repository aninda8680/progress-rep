const fs = require('fs');
const path = require('path');

const markdownPath = path.resolve(__dirname, '../../30-Day-DSA-CPP-Roadmap.md');
const markdown = fs.readFileSync(markdownPath, 'utf-8');

const lines = markdown.split('\n');

const roadmap = [];
let currentWeek = 0;
let currentPhase = "";
let currentDay = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Day matching: e.g., ## DAY 1 — C++ Foundations for DSA
  const dayMatch = line.match(/^## DAY (\d+)(?:\s*(?:—|-)\s*(.*?))?$/);
  if (dayMatch) {
    if (currentDay) {
      roadmap.push(currentDay);
    }
    const dayNumber = parseInt(dayMatch[1], 10);
    const rawTitle = dayMatch[2] || `Day ${dayNumber}`;
    const isProject = false; // no explicit projects here
    
    currentWeek = Math.ceil(dayNumber / 7);
    currentPhase = `Week ${currentWeek}`;

    currentDay = {
      day: dayNumber,
      week: currentWeek,
      phase: currentPhase,
      title: rawTitle,
      topics: [],
      practice: "",
      isProject: isProject
    };
    continue;
  }
  
  // Day range matching: e.g., ## DAY 4-5 — Arrays (Core)
  const dayRangeMatch = line.match(/^## DAY (\d+)-(\d+)(?:\s*(?:—|-)\s*(.*?))?$/);
  if (dayRangeMatch) {
    if (currentDay) {
      roadmap.push(currentDay);
      currentDay = null;
    }
    const startDay = parseInt(dayRangeMatch[1], 10);
    const endDay = parseInt(dayRangeMatch[2], 10);
    const rawTitle = dayRangeMatch[3] || `Days ${startDay}-${endDay}`;
    
    for (let d = startDay; d <= endDay; d++) {
        const week = Math.ceil(d / 7);
        roadmap.push({
            day: d,
            week: week,
            phase: `Week ${week}`,
            title: rawTitle + (d > startDay ? ` (Cont.)` : ''),
            topics: [],
            practice: "",
            isProject: false
        });
    }
    // We pushed directly to roadmap, need to attach topics to the last pushed day(s)?
    // The markdown structure puts topics after ## DAY 4-5. We need them on both days.
    // Let's hold them in an array and apply.
    currentDay = {
        _isRange: true,
        startDay, endDay,
        topics: [], practice: ""
    };
    continue;
  }

  if (currentDay) {
    if (line.startsWith('- Practice:')) {
      currentDay.practice = line.replace('- Practice:', '').trim();
    } else if (line.startsWith('- ')) {
      const topic = line.replace('- ', '').trim();
      currentDay.topics.push(topic);
    }
  }
}

if (currentDay) {
  if (currentDay._isRange) {
     for (let d = currentDay.startDay; d <= currentDay.endDay; d++) {
         const entry = roadmap.find(r => r.day === d);
         if (entry) {
             entry.topics = [...currentDay.topics];
             entry.practice = currentDay.practice;
         }
     }
  } else {
     roadmap.push(currentDay);
  }
} else {
    // Check if we have anything pending in range? We handled it above partially, but topics might not be set.
}

// Group by weeks
const weeks = [];
for (let i = 1; i <= 5; i++) {
  const weekDays = roadmap.filter(d => d.week === i);
  if (weekDays.length > 0) {
    weeks.push({
      weekNumber: i,
      days: weekDays
    });
  }
}

const outputPath = path.resolve(__dirname, '../data/dsa-roadmap.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(roadmap, null, 2));

console.log("DSA Roadmap parsed successfully.");
