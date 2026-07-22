// High-Fidelity Smartboard ORF Prototype Engine

// App Screens
const screens = {
    HOME: document.getElementById('screen-01-home'),
    TRANSITION: document.getElementById('screen-02-transition'),
    ACTIVITY: document.getElementById('screen-03-activity'),
    END: document.getElementById('screen-04-end')
};

// Demo State
let currentLevel = 'L1';
let currentTier = 'tier1';
let currentTemplate = 'WORD_READ_TEXT';
let sampleIndex = 0; // 0, 1, or 2

let activeCountdownInterval = null;
let simulatedSpeechTimeout = null;

// Roster Mock Data for Home Screen
let rosterStudents = [
    { name: "Aarav Patel", status: "waiting", id: "04" },
    { name: "Meera Shah", status: "waiting", id: "05" },
    { name: "Kunal Joshi", status: "waiting", id: "06" },
    { name: "Diya Parikh", status: "done", id: "01" },
    { name: "Riya Mehta", status: "done", id: "02" },
    { name: "Vihaan Sharma", status: "done", id: "03" }
];
let currentStudentIndex = 0;

// Screen Router
function showScreen(targetScreen) {
    Object.values(screens).forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    targetScreen.classList.remove('hidden');
    targetScreen.classList.add('active');
}

// Demo Bar Initialization & Handlers
function initDemoControls() {
    const levelSelect = document.getElementById('demo-level-select');
    const tierSelect = document.getElementById('demo-tier-select');
    const templateSelect = document.getElementById('demo-template-select');

    levelSelect.onchange = (e) => {
        currentLevel = e.target.value;
        populateTemplatesForLevel(currentLevel);
        renderCurrentActivity();
    };

    tierSelect.onchange = (e) => {
        currentTier = e.target.value;
        renderCurrentActivity();
    };

    templateSelect.onchange = (e) => {
        currentTemplate = e.target.value;
        renderCurrentActivity();
    };

    populateTemplatesForLevel(currentLevel);
}

function populateTemplatesForLevel(level) {
    const templateSelect = document.getElementById('demo-template-select');
    templateSelect.innerHTML = '';

    const levelObj = PROTOTYPE_DATA[level];
    if (!levelObj) return;

    const templates = Object.keys(levelObj.templates);
    templates.forEach(tKey => {
        const opt = document.createElement('option');
        opt.value = tKey;
        opt.innerText = tKey;
        templateSelect.appendChild(opt);
    });

    currentTemplate = templates[0];
    templateSelect.value = currentTemplate;
}

// Simulate Progression (Advance, Stay, Move Down)
function simulateProgression(action) {
    const toast = document.getElementById('progression-toast');
    const icon = document.getElementById('toast-icon');
    const title = document.getElementById('toast-title');
    const subtitle = document.getElementById('toast-subtitle');

    let prevLvl = currentLevel;
    let prevTier = currentTier;

    if (action === 'Advance') {
        icon.innerText = 'north_east';
        icon.style.color = '#7ED957';
        title.innerText = 'Advancing Progression';

        if (currentLevel === 'L1') { currentLevel = 'L2'; }
        else if (currentLevel === 'L2') { currentLevel = 'L3'; }
        else if (currentLevel === 'L3') { currentLevel = 'L4'; }
        else if (currentTier === 'tier1') { currentTier = 'tier2'; }
        else if (currentTier === 'tier2') { currentTier = 'tier3'; }

        subtitle.innerText = `${prevLvl} (${prevTier})  ➔  ${currentLevel} (${currentTier})`;
    } 
    else if (action === 'Stay') {
        icon.innerText = 'remove';
        icon.style.color = '#FF9800';
        title.innerText = 'Maintaining Level';
        subtitle.innerText = `Continue practicing at ${currentLevel} (${currentTier})`;
    } 
    else if (action === 'Move Down') {
        icon.innerText = 'south_east';
        icon.style.color = '#EF5350';
        title.innerText = 'Adjusting Support';

        if (currentLevel === 'L4') { currentLevel = 'L3'; }
        else if (currentLevel === 'L3') { currentLevel = 'L2'; }
        else if (currentLevel === 'L2') { currentLevel = 'L1'; }
        else if (currentTier === 'tier3') { currentTier = 'tier2'; }
        else if (currentTier === 'tier2') { currentTier = 'tier1'; }

        subtitle.innerText = `${prevLvl} (${prevTier})  ➔  ${currentLevel} (${currentTier})`;
    }

    // Sync Dropdowns
    document.getElementById('demo-level-select').value = currentLevel;
    document.getElementById('demo-tier-select').value = currentTier;
    populateTemplatesForLevel(currentLevel);

    // Show Toast
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2800);

    // If currently on activity screen, re-render
    if (screens.ACTIVITY.classList.contains('active')) {
        renderCurrentActivity();
    }
}

// ==========================================
// SCREEN 1: TEACHER HOME
// ==========================================
function renderTeacherHome() {
    showScreen(screens.HOME);
    
    // Update Up Next Student
    const student = rosterStudents[currentStudentIndex] || rosterStudents[0];
    document.getElementById('up-next-student-name').innerText = student.name;

    // Render Queue Strip
    const strip = document.getElementById('queue-chips-strip');
    strip.innerHTML = '';
    rosterStudents.forEach(s => {
        const chip = document.createElement('div');
        chip.className = `chip-item ${s.status}`;
        chip.innerText = s.name;
        strip.appendChild(chip);
    });
}

function markCurrentStudentAbsent() {
    if (rosterStudents[currentStudentIndex]) {
        rosterStudents[currentStudentIndex].status = 'absent';
    }
    currentStudentIndex = (currentStudentIndex + 1) % rosterStudents.length;
    renderTeacherHome();
}

function triggerStartSession() {
    const student = rosterStudents[currentStudentIndex] || rosterStudents[0];
    startTransitionScreen(student.name);
}

// ==========================================
// SCREEN 2: TRANSITION SCREEN
// ==========================================
function startTransitionScreen(studentName) {
    showScreen(screens.TRANSITION);
    document.getElementById('transition-greeting').innerText = studentName;
    document.getElementById('transition-subheading').innerText = "Please come forward";

    let count = 3;
    document.getElementById('countdown').innerText = count;

    if (activeCountdownInterval) clearInterval(activeCountdownInterval);

    activeCountdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            document.getElementById('countdown').innerText = count;
        } else {
            clearInterval(activeCountdownInterval);
            renderCurrentActivity();
            showScreen(screens.ACTIVITY);
        }
    }, 1000);
}

// ==========================================
// SCREEN 3: ASSESSMENT ACTIVITY
// ==========================================
function renderCurrentActivity() {
    const levelData = PROTOTYPE_DATA[currentLevel];
    if (!levelData) return;

    const templateData = levelData.templates[currentTemplate];
    if (!templateData) return;

    // Update Badges & Instruction
    document.getElementById('activity-level-badge').innerText = levelData.name;
    document.getElementById('activity-template-badge').innerText = currentTemplate;
    document.getElementById('activity-instruction-text').innerText = templateData.instruction;

    const container = document.getElementById('reading-card-container');
    const compContainer = document.getElementById('comprehension-container');
    container.innerHTML = '';
    compContainer.classList.add('hidden');

    const sampleList = templateData[currentTier] || templateData.tier1;
    const sample = sampleList[sampleIndex % sampleList.length];

    // Render by Template Type
    if (currentTemplate === 'WORD_READ_TEXT') {
        container.innerHTML = `<div class="display-word-text" id="target-text-display">${sample.text}</div>`;
    } 
    else if (currentTemplate === 'WORD_IMAGE_NAMING') {
        // Image-Only Prompt (NO text displayed initially!)
        container.innerHTML = `
            <div class="display-image-word">
                <div class="image-emoji" style="font-size: 120px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));">${sample.image}</div>
                <div class="display-word-text text-success hidden" id="image-word-revealed" style="font-size: 48px; margin-top: 12px;">${sample.targetWord}</div>
            </div>
        `;
    }
    else if (currentTemplate === 'WORD_READ_SET_TEXT') {
        container.innerHTML = `<div class="display-word-text" style="font-size: 48px;" id="target-text-display">${sample.text}</div>`;
    }
    else if (currentTemplate === 'WORD_READ_MINIMAL_PAIR') {
        let optionsHtml = sample.options.map(opt => `
            <div class="minimal-pair-option" onclick="selectMinimalPair(this, '${opt}', '${sample.target}')">${opt}</div>
        `).join('');
        container.innerHTML = `
            <div style="font-size: 1.2rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 20px;">Target word to read: <strong style="color: var(--md-sys-color-primary);">${sample.target}</strong></div>
            <div class="minimal-pairs-box">${optionsHtml}</div>
        `;
    }
    else if (currentTemplate === 'SENTENCE_READ_TEXT' || currentTemplate === 'SENTENCE_READ_SET_TEXT') {
        const words = sample.text.split(' ');
        const wrappedWords = words.map((w, idx) => `<span class="word-span" id="word-${idx}">${w}</span>`).join(' ');
        container.innerHTML = `<div class="display-passage-text">${wrappedWords}</div>`;
    }
    else if (currentTemplate === 'SENTENCE_READ_TEXT_IMAGE') {
        const words = sample.text.split(' ');
        const wrappedWords = words.map((w, idx) => `<span class="word-span" id="word-${idx}">${w}</span>`).join(' ');
        container.innerHTML = `
            <div class="display-image-word" style="margin-bottom: 20px;">
                <div class="image-emoji" style="font-size: 72px;">${sample.image}</div>
            </div>
            <div class="display-passage-text">${wrappedWords}</div>
        `;
    }
    else if (currentTemplate === 'SENTENCE_READ_CLOZE_ORAL') {
        container.innerHTML = `
            <div class="cloze-sentence-display">
                ${sample.display} <span class="cloze-blank-box" id="cloze-blank-target">?</span>
            </div>
            <div class="text-muted" style="margin-top: 20px; font-size: 1rem;">(Target word: <strong>${sample.target}</strong>)</div>
        `;
    }
    else if (currentTemplate === 'PASSAGE_READ_COMP' || currentTemplate === 'PASSAGE_READ_ADVANCED') {
        const words = sample.story.split(' ');
        const wrappedWords = words.map((w, idx) => `<span class="word-span" id="word-${idx}">${w}</span>`).join(' ');
        container.innerHTML = `
            <div style="display: flex; gap: 24px; align-items: center; width: 100%;">
                <div style="font-size: 72px;">${sample.image}</div>
                <div class="display-passage-text" style="flex: 1;">${wrappedWords}</div>
            </div>
        `;

        // Render Comprehension Question
        document.getElementById('comp-question-text').innerText = sample.question;
        const grid = document.getElementById('comp-options-grid');
        grid.innerHTML = '';
        sample.options.forEach(opt => {
            const btn = document.createElement('div');
            btn.className = 'comp-option-btn';
            btn.innerText = opt;
            btn.onclick = () => {
                document.querySelectorAll('.comp-option-btn').forEach(b => b.classList.remove('selected-correct'));
                btn.classList.add('selected-correct');
                setTimeout(() => {
                    completeAssessmentTurn();
                }, 1200);
            };
            grid.appendChild(btn);
        });
    }
}

// Simulate Speech / Per-Word Highlighting
function simulateWordSpeech() {
    const levelData = PROTOTYPE_DATA[currentLevel];
    const templateData = levelData.templates[currentTemplate];
    const sampleList = templateData[currentTier] || templateData.tier1;
    const sample = sampleList[sampleIndex % sampleList.length];

    if (currentTemplate === 'WORD_READ_TEXT' || currentTemplate === 'WORD_READ_SET_TEXT') {
        const el = document.getElementById('target-text-display');
        if (el) {
            el.classList.add('highlight-green');
            setTimeout(() => {
                completeAssessmentTurn();
            }, 1200);
        }
    }
    else if (currentTemplate === 'WORD_IMAGE_NAMING') {
        const revealed = document.getElementById('image-word-revealed');
        if (revealed) {
            revealed.classList.remove('hidden');
            setTimeout(() => {
                completeAssessmentTurn();
            }, 1400);
        }
    }
    else if (currentTemplate === 'SENTENCE_READ_CLOZE_ORAL') {
        const blank = document.getElementById('cloze-blank-target');
        if (blank) {
            blank.innerText = sample.target;
            blank.style.color = '#2E7D32';
            setTimeout(() => {
                completeAssessmentTurn();
            }, 1400);
        }
    }
    else if (currentTemplate.includes('SENTENCE') || currentTemplate.includes('PASSAGE')) {
        const text = sample.text || sample.story;
        const words = text.split(' ');
        let wordIdx = 0;

        if (simulatedSpeechTimeout) clearInterval(simulatedSpeechTimeout);

        simulatedSpeechTimeout = setInterval(() => {
            if (wordIdx < words.length) {
                const span = document.getElementById(`word-${wordIdx}`);
                if (span) span.classList.add('green');
                wordIdx++;
            } else {
                clearInterval(simulatedSpeechTimeout);
                // If passage, show comprehension
                if (currentTemplate.includes('PASSAGE')) {
                    document.getElementById('comprehension-container').classList.remove('hidden');
                } else {
                    setTimeout(() => {
                        completeAssessmentTurn();
                    }, 1200);
                }
            }
        }, 220);
    }
}

function selectMinimalPair(elem, selected, target) {
    document.querySelectorAll('.minimal-pair-option').forEach(el => el.classList.remove('correct'));
    elem.classList.add('correct');
    setTimeout(() => {
        completeAssessmentTurn();
    }, 1200);
}

function completeAssessmentTurn() {
    sampleIndex++;
    if (rosterStudents[currentStudentIndex]) {
        rosterStudents[currentStudentIndex].status = 'done';
    }

    // Show completion screen or transition back
    showScreen(screens.TRANSITION);
    document.getElementById('transition-greeting').innerText = "Great Reading!";
    document.getElementById('transition-subheading').innerText = "You're done for today 🌟";
    document.getElementById('countdown').innerText = "✓";

    setTimeout(() => {
        currentStudentIndex++;
        if (currentStudentIndex >= rosterStudents.length) {
            showScreen(screens.END);
            triggerCelebrationConfetti();
        } else {
            renderTeacherHome();
        }
    }, 2200);
}

// Pause & End Session Handlers
function pauseSession() {
    alert("Session Paused. Click OK to resume.");
}

function endAssessmentSessionPrompt() {
    if (confirm("End assessment session for this student?")) {
        renderTeacherHome();
    }
}

// ==========================================
// SCREEN 4: SESSION COMPLETE SCREEN
// ==========================================
function triggerCelebrationConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    const assessed = rosterStudents.filter(s => s.status === 'done').length;
    const absent = rosterStudents.filter(s => s.status === 'absent').length;

    document.getElementById('summary-stat-assessed').innerText = assessed || 38;
    document.getElementById('summary-stat-absent').innerText = absent || 2;

    for (let i = 0; i < 40; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.animationDuration = (Math.random() * 2 + 2) + 's';
        c.style.backgroundColor = ['#7ED957', '#FFC857', '#3F51B5'][Math.floor(Math.random() * 3)];
        container.appendChild(c);
    }
}

function returnToHomeFromComplete() {
    rosterStudents.forEach(s => s.status = 'waiting');
    currentStudentIndex = 0;
    renderTeacherHome();
}

// App Initialization
initDemoControls();
renderTeacherHome();
