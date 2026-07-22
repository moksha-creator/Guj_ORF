// High-Fidelity Smartboard ORF Prototype Engine

// App Screens
const screens = {
    HOME: document.getElementById('screen-01-home'),
    TRANSITION: document.getElementById('screen-02-transition'),
    ACTIVITY: document.getElementById('screen-03-activity'),
    COMPREHENSION: document.getElementById('screen-03b-comprehension'),
    END: document.getElementById('screen-04-end')
};

// Demo State
let currentLevel = 'L1';
let currentTier = 'tier1';
let currentTemplate = 'WORD_READ_TEXT';
let sampleIndex = 0; // Index into template sample array
let studentSampleCount = 1; // 1, 2, or 3 samples per student session

let activeCountdownInterval = null;
let simulatedSpeechTimeout = null;

// Real Web Speech API State
let speechRecognition = null;
let isRealListening = false;
let currentTargetWordList = [];
let currentMatchedWordIndex = 0;

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

// Live Transcript Helper
function updateLiveTranscriptText(rawText) {
    const box = document.getElementById('live-transcript-box');
    const textEl = document.getElementById('live-transcript-text');
    if (!box || !textEl) return;

    if (rawText && rawText.trim().length > 0) {
        textEl.innerText = `Heard: "${rawText.trim()}"`;
        box.classList.remove('hidden');
    } else {
        box.classList.add('hidden');
    }
}

function clearLiveTranscript() {
    updateLiveTranscriptText('');
}

// Initialize Speech Recognition Engine
function initSpeechRecognitionEngine() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        speechRecognition = new SpeechRecognition();
        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        speechRecognition.lang = 'en-IN'; // English (India)

        speechRecognition.onstart = () => {
            isRealListening = true;
            updateMicUI('listening');
        };

        speechRecognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const spokenText = (finalTranscript + ' ' + interimTranscript).trim();
            updateLiveTranscriptText(spokenText);
            processSpokenTranscript(spokenText.toLowerCase());
        };

        speechRecognition.onerror = (event) => {
            console.log("Speech recognition error:", event.error);
            if (event.error !== 'no-speech') {
                updateMicUI('error');
            }
        };

        speechRecognition.onend = () => {
            if (isRealListening && screens.ACTIVITY.classList.contains('active')) {
                try { speechRecognition.start(); } catch (e) {}
            } else {
                isRealListening = false;
                updateMicUI('idle');
            }
        };
    }
}

function startRealSpeechRecognition() {
    if (!speechRecognition) initSpeechRecognitionEngine();
    if (speechRecognition && !isRealListening) {
        try {
            speechRecognition.start();
            isRealListening = true;
            updateMicUI('listening');
        } catch (e) {
            console.log("Recognition start error:", e);
        }
    }
}

function stopRealSpeechRecognition() {
    isRealListening = false;
    if (speechRecognition) {
        try { speechRecognition.stop(); } catch (e) {}
    }
    updateMicUI('idle');
}

function toggleRealSpeechRecognition() {
    if (isRealListening) {
        stopRealSpeechRecognition();
    } else {
        startRealSpeechRecognition();
    }
}

function updateMicUI(state) {
    const indicator = document.getElementById('listening-indicator');
    const label = document.getElementById('listening-label');
    const dots = document.getElementById('waveform-dots');

    if (!indicator || !label) return;

    if (state === 'listening') {
        indicator.className = 'listening-indicator listening-active';
        label.innerText = 'Listening... Speak clearly';
        if (dots) dots.style.display = 'flex';
    } else if (state === 'processing') {
        indicator.className = 'listening-indicator processing';
        label.innerText = 'Processing speech...';
    } else {
        indicator.className = 'listening-indicator';
        label.innerText = 'Tap mic to start listening';
        if (dots) dots.style.display = 'none';
    }
}

// Process Real Spoken Words against Target Content
function processSpokenTranscript(spokenText) {
    if (!spokenText || currentTargetWordList.length === 0) return;

    const spokenTokens = spokenText.split(/\s+/);

    if (currentTemplate === 'WORD_READ_TEXT') {
        const target = currentTargetWordList[0].toLowerCase();
        if (spokenText.includes(target)) {
            const el = document.getElementById('target-text-display');
            if (el) el.classList.add('highlight-green');
            updateMicUI('processing');
            setTimeout(() => {
                completeAssessmentSampleStep();
            }, 1000);
        }
    }
    else if (currentTemplate === 'WORD_IMAGE_NAMING') {
        const target = currentTargetWordList[0].toLowerCase();
        if (spokenText.includes(target)) {
            const revealed = document.getElementById('image-word-revealed');
            if (revealed) revealed.classList.remove('hidden');
            updateMicUI('processing');
            setTimeout(() => {
                completeAssessmentSampleStep();
            }, 1200);
        }
    }
    else if (currentTemplate === 'WORD_READ_SET_TEXT') {
        // Match against 5 card words
        currentTargetWordList.forEach((w, idx) => {
            if (spokenText.includes(w.toLowerCase())) {
                const card = document.getElementById(`set-card-${idx}`);
                if (card) card.classList.add('highlight-read');
            }
        });

        const allRead = currentTargetWordList.every((w, idx) => {
            const card = document.getElementById(`set-card-${idx}`);
            return card && card.classList.contains('highlight-read');
        });

        if (allRead) {
            updateMicUI('processing');
            setTimeout(() => {
                completeAssessmentSampleStep();
            }, 1000);
        }
    }
    else if (currentTemplate === 'SENTENCE_READ_CLOZE_ORAL') {
        const target = currentTargetWordList[0].toLowerCase();
        if (spokenText.includes(target)) {
            const blank = document.getElementById('cloze-blank-target');
            if (blank) {
                blank.innerText = target;
                blank.style.color = '#2E7D32';
            }
            updateMicUI('processing');
            setTimeout(() => {
                completeAssessmentSampleStep();
            }, 1200);
        }
    }
    else if (currentTemplate.includes('SENTENCE') || currentTemplate.includes('PASSAGE')) {
        // Sequential word matching
        for (let i = currentMatchedWordIndex; i < currentTargetWordList.length; i++) {
            const targetWord = currentTargetWordList[i].toLowerCase().replace(/[^\w]/g, '');
            if (spokenTokens.some(st => st.includes(targetWord))) {
                const span = document.getElementById(`word-${i}`);
                if (span) span.classList.add('green');
                currentMatchedWordIndex = i + 1;
            }
        }

        if (currentMatchedWordIndex >= currentTargetWordList.length) {
            updateMicUI('processing');
            const levelData = PROTOTYPE_DATA[currentLevel];
            const templateData = levelData.templates[currentTemplate];
            const sampleList = templateData[currentTier] || templateData.tier1;
            const sample = sampleList[sampleIndex % sampleList.length];

            if (currentTemplate.includes('PASSAGE')) {
                setTimeout(() => {
                    showComprehensionPage(sample);
                }, 800);
            } else {
                setTimeout(() => {
                    completeAssessmentSampleStep();
                }, 1000);
            }
        }
    }
}

// Demo Bar Initialization & Handlers
function initDemoControls() {
    const levelSelect = document.getElementById('demo-level-select');
    const tierSelect = document.getElementById('demo-tier-select');
    const templateSelect = document.getElementById('demo-template-select');

    levelSelect.onchange = (e) => {
        currentLevel = e.target.value;
        sampleIndex = 0;
        studentSampleCount = 1;
        populateTemplatesForLevel(currentLevel);
        renderCurrentActivity();
    };

    tierSelect.onchange = (e) => {
        currentTier = e.target.value;
        sampleIndex = 0;
        studentSampleCount = 1;
        renderCurrentActivity();
    };

    templateSelect.onchange = (e) => {
        currentTemplate = e.target.value;
        sampleIndex = 0;
        studentSampleCount = 1;
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

    sampleIndex = 0;
    studentSampleCount = 1;

    // Show Toast
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2800);

    // If currently on activity screen, re-render
    if (screens.ACTIVITY.classList.contains('active') || screens.COMPREHENSION.classList.contains('active')) {
        renderCurrentActivity();
    }
}

// ==========================================
// SCREEN 1: TEACHER HOME
// ==========================================
function renderTeacherHome() {
    stopRealSpeechRecognition();
    clearLiveTranscript();
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
    studentSampleCount = 1;
    sampleIndex = 0;
    const student = rosterStudents[currentStudentIndex] || rosterStudents[0];
    startTransitionScreen(student.name);
}

// ==========================================
// SCREEN 2: TRANSITION SCREEN
// ==========================================
function startTransitionScreen(studentName) {
    stopRealSpeechRecognition();
    clearLiveTranscript();
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
    clearLiveTranscript();
    const levelData = PROTOTYPE_DATA[currentLevel];
    if (!levelData) return;

    const templateData = levelData.templates[currentTemplate];
    if (!templateData) return;

    // Show Assessment Screen
    showScreen(screens.ACTIVITY);

    // Update Badges, Counter & Instruction
    document.getElementById('activity-level-badge').innerText = levelData.name;
    document.getElementById('activity-template-badge').innerText = currentTemplate;
    document.getElementById('activity-sample-counter').innerText = `Sample ${studentSampleCount} of 3`;
    document.getElementById('activity-instruction-text').innerText = templateData.instruction;

    const container = document.getElementById('reading-card-container');
    container.innerHTML = '';

    const sampleList = templateData[currentTier] || templateData.tier1;
    const sample = sampleList[sampleIndex % sampleList.length];

    // Reset Target Word List & Match Index
    currentTargetWordList = [];
    currentMatchedWordIndex = 0;

    // Render by Template Type
    if (currentTemplate === 'WORD_READ_TEXT') {
        currentTargetWordList = [sample.text];
        container.innerHTML = `<div class="display-word-text" id="target-text-display">${sample.text}</div>`;
    } 
    else if (currentTemplate === 'WORD_IMAGE_NAMING') {
        currentTargetWordList = [sample.targetWord];
        container.innerHTML = `
            <div class="display-image-word">
                <div class="image-emoji" style="font-size: 120px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));">${sample.image}</div>
                <div class="display-word-text text-success hidden" id="image-word-revealed" style="font-size: 48px; margin-top: 12px;">${sample.targetWord}</div>
            </div>
        `;
    }
    else if (currentTemplate === 'WORD_READ_SET_TEXT') {
        currentTargetWordList = sample.items.map(item => item.word);
        let cardsHtml = sample.items.map((item, idx) => `
            <div class="word-set-card theme-${item.colorTheme}" id="set-card-${idx}">
                <div class="card-number-badge">${idx + 1}</div>
                <div class="card-illustration-area">
                    <span class="emoji-icon">${item.image}</span>
                </div>
                <div class="card-word-footer">${item.word}</div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="robot-speech-container">
                <div class="robot-avatar">🤖</div>
                <div class="speech-bubble">Read all the words in order.</div>
            </div>
            <div class="word-set-cards-grid">${cardsHtml}</div>
        `;
    }
    else if (currentTemplate === 'WORD_READ_MINIMAL_PAIR') {
        currentTargetWordList = [sample.target];
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
        currentTargetWordList = words;
        const wrappedWords = words.map((w, idx) => `<span class="word-span" id="word-${idx}">${w}</span>`).join(' ');
        container.innerHTML = `<div class="display-passage-text">${wrappedWords}</div>`;
    }
    else if (currentTemplate === 'SENTENCE_READ_TEXT_IMAGE') {
        const words = sample.text.split(' ');
        currentTargetWordList = words;
        const wrappedWords = words.map((w, idx) => `<span class="word-span" id="word-${idx}">${w}</span>`).join(' ');
        container.innerHTML = `
            <div class="display-image-word" style="margin-bottom: 20px;">
                <div class="image-emoji" style="font-size: 72px;">${sample.image}</div>
            </div>
            <div class="display-passage-text">${wrappedWords}</div>
        `;
    }
    else if (currentTemplate === 'SENTENCE_READ_CLOZE_ORAL') {
        currentTargetWordList = [sample.target];
        container.innerHTML = `
            <div class="cloze-sentence-display">
                ${sample.display} <span class="cloze-blank-box" id="cloze-blank-target">?</span>
            </div>
            <div class="text-muted" style="margin-top: 20px; font-size: 1rem;">(Target word: <strong>${sample.target}</strong>)</div>
        `;
    }
    else if (currentTemplate === 'PASSAGE_READ_COMP' || currentTemplate === 'PASSAGE_READ_ADVANCED') {
        const words = sample.story.split(' ');
        currentTargetWordList = words;
        const wrappedWords = words.map((w, idx) => `<span class="word-span" id="word-${idx}">${w}</span>`).join(' ');
        container.innerHTML = `
            <div style="display: flex; gap: 24px; align-items: center; width: 100%;">
                <div style="font-size: 72px;">${sample.image}</div>
                <div class="display-passage-text" style="flex: 1;">${wrappedWords}</div>
            </div>
        `;
    }

    // Auto-start Speech Recognition on Screen 3
    startRealSpeechRecognition();
}

// Dedicated Comprehension Screen (Screen 3b)
function showComprehensionPage(sample) {
    stopRealSpeechRecognition();
    clearLiveTranscript();
    showScreen(screens.COMPREHENSION);

    const levelData = PROTOTYPE_DATA[currentLevel];
    document.getElementById('comp-level-badge').innerText = levelData ? levelData.name : currentLevel;
    document.getElementById('comp-sample-counter').innerText = `Sample ${studentSampleCount} of 3`;
    document.getElementById('comp-page-question-text').innerText = sample.question;

    const grid = document.getElementById('comp-page-options-grid');
    grid.innerHTML = '';

    sample.options.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'comp-option-page-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            document.querySelectorAll('.comp-option-page-btn').forEach(b => b.classList.remove('selected-correct'));
            btn.classList.add('selected-correct');
            setTimeout(() => {
                completeAssessmentSampleStep();
            }, 1000);
        };
        grid.appendChild(btn);
    });
}

// Developer Tool: Simulate Speech / Per-Word Highlighting
function simulateWordSpeech() {
    updateMicUI('listening');
    const levelData = PROTOTYPE_DATA[currentLevel];
    const templateData = levelData.templates[currentTemplate];
    const sampleList = templateData[currentTier] || templateData.tier1;
    const sample = sampleList[sampleIndex % sampleList.length];

    if (currentTemplate === 'WORD_READ_TEXT') {
        updateLiveTranscriptText(sample.text);
        const el = document.getElementById('target-text-display');
        if (el) {
            el.classList.add('highlight-green');
            updateMicUI('processing');
            setTimeout(() => {
                completeAssessmentSampleStep();
            }, 1000);
        }
    }
    else if (currentTemplate === 'WORD_READ_SET_TEXT') {
        let cardIndex = 0;
        let simulatedTranscript = [];
        if (simulatedSpeechTimeout) clearInterval(simulatedSpeechTimeout);

        simulatedSpeechTimeout = setInterval(() => {
            if (cardIndex < 5) {
                const item = sample.items[cardIndex];
                if (item) simulatedTranscript.push(item.word);
                updateLiveTranscriptText(simulatedTranscript.join(' '));

                const card = document.getElementById(`set-card-${cardIndex}`);
                if (card) card.classList.add('highlight-read');
                cardIndex++;
            } else {
                clearInterval(simulatedSpeechTimeout);
                updateMicUI('processing');
                setTimeout(() => {
                    completeAssessmentSampleStep();
                }, 1000);
            }
        }, 350);
    }
    else if (currentTemplate === 'WORD_IMAGE_NAMING') {
        updateLiveTranscriptText(sample.targetWord);
        const revealed = document.getElementById('image-word-revealed');
        if (revealed) {
            revealed.classList.remove('hidden');
            updateMicUI('processing');
            setTimeout(() => {
                completeAssessmentSampleStep();
            }, 1200);
        }
    }
    else if (currentTemplate === 'SENTENCE_READ_CLOZE_ORAL') {
        updateLiveTranscriptText(sample.target);
        const blank = document.getElementById('cloze-blank-target');
        if (blank) {
            blank.innerText = sample.target;
            blank.style.color = '#2E7D32';
            updateMicUI('processing');
            setTimeout(() => {
                completeAssessmentSampleStep();
            }, 1200);
        }
    }
    else if (currentTemplate.includes('SENTENCE') || currentTemplate.includes('PASSAGE')) {
        const text = sample.text || sample.story;
        const words = text.split(' ');
        let wordIdx = 0;
        let simulatedWords = [];

        if (simulatedSpeechTimeout) clearInterval(simulatedSpeechTimeout);

        simulatedSpeechTimeout = setInterval(() => {
            if (wordIdx < words.length) {
                simulatedWords.push(words[wordIdx]);
                updateLiveTranscriptText(simulatedWords.join(' '));

                const span = document.getElementById(`word-${wordIdx}`);
                if (span) span.classList.add('green');
                wordIdx++;
            } else {
                clearInterval(simulatedSpeechTimeout);
                updateMicUI('processing');
                if (currentTemplate.includes('PASSAGE')) {
                    setTimeout(() => {
                        showComprehensionPage(sample);
                    }, 800);
                } else {
                    setTimeout(() => {
                        completeAssessmentSampleStep();
                    }, 1000);
                }
            }
        }, 180);
    }
}

function selectMinimalPair(elem, selected, target) {
    document.querySelectorAll('.minimal-pair-option').forEach(el => el.classList.remove('correct'));
    elem.classList.add('correct');
    updateLiveTranscriptText(selected);
    updateMicUI('processing');
    setTimeout(() => {
        completeAssessmentSampleStep();
    }, 1000);
}

// 3-Sample Progression per Student Session
function completeAssessmentSampleStep() {
    stopRealSpeechRecognition();
    if (studentSampleCount < 3) {
        studentSampleCount++;
        sampleIndex++;
        renderCurrentActivity();
    } else {
        // Complete Student Session after 3 samples
        sampleIndex++;
        studentSampleCount = 1;
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
}

// Pause & End Session Handlers
function pauseSession() {
    stopRealSpeechRecognition();
    alert("Session Paused. Click OK to resume.");
    startRealSpeechRecognition();
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
    stopRealSpeechRecognition();
    clearLiveTranscript();
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
initSpeechRecognitionEngine();
renderTeacherHome();
