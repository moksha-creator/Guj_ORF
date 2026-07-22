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

// 3-Minute Assessment Timer State
let assessmentTimerSeconds = 180; // 3:00
let assessmentTimerInterval = null;

// Real Web Speech API State
let speechRecognition = null;
let isRealListening = false;
let currentTargetWordList = [];
let currentMatchedWordIndex = 0;
let isStepTransitioning = false; // Flag to prevent rapid double transitions

// Speech Error Handling & Silence Tracker
let lastSpeechTimestamp = Date.now();
let silenceCheckerInterval = null;
let micPermissionRequested = false;

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
    if (!targetScreen) return;
    Object.values(screens).forEach(s => {
        if (s) {
            s.classList.remove('active');
            s.classList.add('hidden');
        }
    });
    targetScreen.classList.remove('hidden');
    targetScreen.classList.add('active');
}

// ----------------------------------------------------
// 3-MINUTE ASSESSMENT COUNTDOWN TIMER (⏱ 3:00)
// ----------------------------------------------------
function startAssessmentTimer() {
    if (assessmentTimerInterval) clearInterval(assessmentTimerInterval);
    assessmentTimerSeconds = 180; // Reset to 3 minutes
    updateTimerBadgesDisplay();

    assessmentTimerInterval = setInterval(() => {
        assessmentTimerSeconds--;
        updateTimerBadgesDisplay();

        if (assessmentTimerSeconds <= 0) {
            clearInterval(assessmentTimerInterval);
            stopRealSpeechRecognition();
            showScreen(screens.END);
            triggerCelebrationConfetti();
        }
    }, 1000);
}

function stopAssessmentTimer() {
    if (assessmentTimerInterval) clearInterval(assessmentTimerInterval);
}

function updateTimerBadgesDisplay() {
    const mins = Math.floor(assessmentTimerSeconds / 60);
    const secs = assessmentTimerSeconds % 60;
    const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    const b1Text = document.getElementById('timer-display-text');
    const b2Text = document.getElementById('comp-timer-display-text');
    if (b1Text) b1Text.innerText = formatted;
    if (b2Text) b2Text.innerText = formatted;

    const b1 = document.getElementById('assessment-timer-badge');
    const b2 = document.getElementById('comp-timer-badge');
    const badges = [b1, b2];

    badges.forEach(b => {
        if (!b) return;
        b.className = 'timer-badge';

        if (assessmentTimerSeconds > 60) {
            b.classList.add('neutral');
        } else if (assessmentTimerSeconds > 15) {
            b.classList.add('amber');
        } else {
            b.classList.add('pulse-urgent');
        }
    });
}

// ----------------------------------------------------
// LIVE TRANSCRIPT & SILENCE DETECTOR (3-5s Prompt)
// ----------------------------------------------------
function updateLiveTranscriptText(rawText) {
    const box = document.getElementById('live-transcript-box');
    const textEl = document.getElementById('live-transcript-text');
    if (!box || !textEl) return;

    if (rawText && rawText.trim().length > 0) {
        textEl.innerText = `Heard: "${rawText.trim()}"`;
        box.classList.remove('hidden');
        hideSilencePrompt();
        lastSpeechTimestamp = Date.now();
    } else {
        box.classList.add('hidden');
    }
}

function clearLiveTranscript() {
    updateLiveTranscriptText('');
    hideSilencePrompt();
}

function startSilenceChecker() {
    if (silenceCheckerInterval) clearInterval(silenceCheckerInterval);
    lastSpeechTimestamp = Date.now();

    silenceCheckerInterval = setInterval(() => {
        if (isRealListening && screens.ACTIVITY.classList.contains('active')) {
            const elapsedSilence = Date.now() - lastSpeechTimestamp;
            if (elapsedSilence >= 3500) { // 3.5 seconds silence prompt
                showSilencePrompt();
            }
        }
    }, 1000);
}

function showSilencePrompt() {
    const p = document.getElementById('silence-prompt-toast');
    if (p) p.classList.remove('hidden');
}

function hideSilencePrompt() {
    const p = document.getElementById('silence-prompt-toast');
    if (p) p.classList.add('hidden');
}

// ----------------------------------------------------
// REAL WEB SPEECH RECOGNITION & STREAMING ASR ENGINE
// ----------------------------------------------------
function initSpeechRecognitionEngine() {
    try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            speechRecognition = new SpeechRecognition();
            speechRecognition.continuous = true;
            speechRecognition.interimResults = true;
            speechRecognition.lang = 'en-US';

            speechRecognition.onstart = () => {
                isRealListening = true;
                updateMicUI('listening');
                startSilenceChecker();
            };

            speechRecognition.onresult = (event) => {
                if (isStepTransitioning) return;

                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcriptPiece = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcriptPiece + ' ';
                    } else {
                        interimTranscript += transcriptPiece;
                    }
                }

                const spokenText = (finalTranscript + interimTranscript).trim();
                if (spokenText.length > 0) {
                    updateLiveTranscriptText(spokenText);
                    processSpokenTranscriptStream(spokenText.toLowerCase());
                }
            };

            speechRecognition.onerror = (event) => {
                console.log("Speech recognition error:", event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    updateMicUI('permission-denied');
                } else if (event.error !== 'no-speech') {
                    updateMicUI('error');
                }
            };

            speechRecognition.onend = () => {
                if (isRealListening && screens.ACTIVITY && screens.ACTIVITY.classList.contains('active')) {
                    try { speechRecognition.start(); } catch (e) {}
                } else {
                    isRealListening = false;
                    updateMicUI('idle');
                }
            };
        } else {
            console.warn("Web Speech API not supported in this browser environment.");
            updateMicUI('unsupported');
        }
    } catch (err) {
        console.warn("Speech recognition initialization failed:", err);
    }
}

function startRealSpeechRecognition() {
    if (!speechRecognition) initSpeechRecognitionEngine();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !micPermissionRequested) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                micPermissionRequested = true;
                stream.getTracks().forEach(track => track.stop());
                launchRecognitionInstance();
            })
            .catch(err => {
                console.warn("Microphone permission denied:", err);
                updateMicUI('permission-denied');
            });
    } else {
        launchRecognitionInstance();
    }
}

function launchRecognitionInstance() {
    if (speechRecognition && !isRealListening) {
        try {
            speechRecognition.start();
            isRealListening = true;
            updateMicUI('listening');
            startSilenceChecker();
        } catch (e) {
            console.warn("Recognition start error:", e);
        }
    }
}

function stopRealSpeechRecognition() {
    isRealListening = false;
    if (silenceCheckerInterval) clearInterval(silenceCheckerInterval);
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
        label.innerText = 'Listening... Read out loud';
        if (dots) dots.style.display = 'flex';
    } else if (state === 'processing') {
        indicator.className = 'listening-indicator processing';
        label.innerText = 'Processing speech...';
    } else if (state === 'permission-denied') {
        indicator.className = 'listening-indicator';
        label.innerText = 'Microphone permission blocked. Please allow mic in browser address bar.';
        if (dots) dots.style.display = 'none';
    } else if (state === 'unsupported') {
        indicator.className = 'listening-indicator';
        label.innerText = 'Use Chrome/Edge for Web Speech ASR';
        if (dots) dots.style.display = 'none';
    } else {
        indicator.className = 'listening-indicator';
        label.innerText = 'Tap mic to start listening';
        if (dots) dots.style.display = 'none';
    }
}

// ----------------------------------------------------
// STREAMING WORD MATCHING & SKIP / ADVANCE LOGIC
// ----------------------------------------------------
function processSpokenTranscriptStream(spokenText) {
    if (isStepTransitioning || !spokenText || currentTargetWordList.length === 0) return;

    const spokenTokens = spokenText.split(/\s+/).map(t => t.replace(/[^\w]/g, ''));

    if (currentTemplate === 'WORD_READ_TEXT') {
        const target = currentTargetWordList[0].toLowerCase();
        if (spokenTokens.some(st => st === target || spokenText.includes(target))) {
            const el = document.getElementById('target-text-display');
            if (el) el.classList.add('highlight-green');
            updateMicUI('processing');
            isStepTransitioning = true;
            setTimeout(() => {
                completeAssessmentSampleStep();
            }, 1000);
        }
    }
    else if (currentTemplate === 'WORD_IMAGE_NAMING') {
        const target = currentTargetWordList[0].toLowerCase();
        if (spokenTokens.some(st => st === target || spokenText.includes(target))) {
            const revealed = document.getElementById('image-word-revealed');
            if (revealed) revealed.classList.remove('hidden');
            updateMicUI('processing');
            isStepTransitioning = true;
            setTimeout(() => {
                completeAssessmentSampleStep();
            }, 1200);
        }
    }
    else if (currentTemplate === 'WORD_READ_SET_TEXT') {
        currentTargetWordList.forEach((w, idx) => {
            const target = w.toLowerCase();
            if (spokenTokens.some(st => st === target || st.includes(target))) {
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
            isStepTransitioning = true;
            setTimeout(() => {
                completeAssessmentSampleStep();
            }, 1000);
        }
    }
    else if (currentTemplate === 'WORD_READ_MINIMAL_PAIR') {
        const target = currentTargetWordList[0].toLowerCase();
        if (spokenTokens.some(st => st === target || spokenText.includes(target))) {
            const targetOptEl = document.getElementById(`min-option-${target}`);
            if (targetOptEl) targetOptEl.classList.add('correct');
            updateMicUI('processing');
            isStepTransitioning = true;
            setTimeout(() => {
                completeAssessmentSampleStep();
            }, 1200);
        }
    }
    else if (currentTemplate === 'SENTENCE_READ_CLOZE_ORAL') {
        const target = currentTargetWordList[0].toLowerCase();
        if (spokenTokens.some(st => st === target || spokenText.includes(target))) {
            const blank = document.getElementById('cloze-blank-target');
            if (blank) {
                blank.innerText = target;
                blank.style.color = '#2E7D32';
            }
            updateMicUI('processing');
            isStepTransitioning = true;
            setTimeout(() => {
                completeAssessmentSampleStep();
            }, 1200);
        }
    }
    else if (currentTemplate.includes('SENTENCE') || currentTemplate.includes('PASSAGE')) {
        for (let i = currentMatchedWordIndex; i < currentTargetWordList.length; i++) {
            const targetWord = currentTargetWordList[i].toLowerCase().replace(/[^\w]/g, '');
            
            let foundIdx = -1;
            for (let lookahead = i; lookahead < Math.min(i + 3, currentTargetWordList.length); lookahead++) {
                const futureTarget = currentTargetWordList[lookahead].toLowerCase().replace(/[^\w]/g, '');
                if (spokenTokens.some(st => st === futureTarget || st.includes(futureTarget))) {
                    foundIdx = lookahead;
                    break;
                }
            }

            if (foundIdx !== -1) {
                for (let skip = currentMatchedWordIndex; skip < foundIdx; skip++) {
                    const skippedSpan = document.getElementById(`word-${skip}`);
                    if (skippedSpan) skippedSpan.classList.add('missed');
                }

                const span = document.getElementById(`word-${foundIdx}`);
                if (span) span.classList.add('green');
                currentMatchedWordIndex = foundIdx + 1;
                break;
            }
        }

        if (currentMatchedWordIndex > 0 && currentMatchedWordIndex >= currentTargetWordList.length) {
            updateMicUI('processing');
            isStepTransitioning = true;

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

// ----------------------------------------------------
// DEMO CONTROLS & SELECTION HANDLERS
// ----------------------------------------------------
function initDemoControls() {
    const levelSelect = document.getElementById('demo-level-select');
    const tierSelect = document.getElementById('demo-tier-select');
    const templateSelect = document.getElementById('demo-template-select');

    if (!levelSelect || !tierSelect || !templateSelect) return;

    levelSelect.onchange = (e) => {
        currentLevel = e.target.value;
        sampleIndex = 0;
        studentSampleCount = 1;
        populateTemplatesForLevel(currentLevel);
        if (screens.ACTIVITY.classList.contains('active')) {
            renderCurrentActivity();
        }
    };

    tierSelect.onchange = (e) => {
        currentTier = e.target.value;
        sampleIndex = 0;
        studentSampleCount = 1;
        if (screens.ACTIVITY.classList.contains('active')) {
            renderCurrentActivity();
        }
    };

    templateSelect.onchange = (e) => {
        currentTemplate = e.target.value;
        sampleIndex = 0;
        studentSampleCount = 1;
        if (screens.ACTIVITY.classList.contains('active')) {
            renderCurrentActivity();
        }
    };

    populateTemplatesForLevel(currentLevel);
}

function populateTemplatesForLevel(level) {
    const templateSelect = document.getElementById('demo-template-select');
    if (!templateSelect) return;
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

    const levelSelect = document.getElementById('demo-level-select');
    const tierSelect = document.getElementById('demo-tier-select');
    if (levelSelect) levelSelect.value = currentLevel;
    if (tierSelect) tierSelect.value = currentTier;

    populateTemplatesForLevel(currentLevel);

    sampleIndex = 0;
    studentSampleCount = 1;

    if (toast) {
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 2800);
    }

    if (screens.ACTIVITY.classList.contains('active') || screens.COMPREHENSION.classList.contains('active')) {
        renderCurrentActivity();
    }
}

// ==========================================
// SCREEN 1: TEACHER HOME
// ==========================================
function renderTeacherHome() {
    isStepTransitioning = false;
    if (simulatedSpeechTimeout) clearInterval(simulatedSpeechTimeout);
    stopRealSpeechRecognition();
    stopAssessmentTimer();
    clearLiveTranscript();
    showScreen(screens.HOME);
    
    const student = rosterStudents[currentStudentIndex] || rosterStudents[0];
    const nameEl = document.getElementById('up-next-student-name');
    if (nameEl) nameEl.innerText = student.name;

    const strip = document.getElementById('queue-chips-strip');
    if (strip) {
        strip.innerHTML = '';
        rosterStudents.forEach(s => {
            const chip = document.createElement('div');
            chip.className = `chip-item ${s.status}`;
            chip.innerText = s.name;
            strip.appendChild(chip);
        });
    }
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
    isStepTransitioning = false;
    if (simulatedSpeechTimeout) clearInterval(simulatedSpeechTimeout);
    stopRealSpeechRecognition();
    clearLiveTranscript();
    showScreen(screens.TRANSITION);

    const greetingEl = document.getElementById('transition-greeting');
    const subEl = document.getElementById('transition-subheading');
    const countEl = document.getElementById('countdown');

    if (greetingEl) greetingEl.innerText = studentName;
    if (subEl) subEl.innerText = "Please come forward";

    let count = 3;
    if (countEl) countEl.innerText = count;

    if (activeCountdownInterval) clearInterval(activeCountdownInterval);

    activeCountdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            if (countEl) countEl.innerText = count;
        } else {
            clearInterval(activeCountdownInterval);
            try {
                startAssessmentTimer(); // Start 3-Minute Timer on session start!
                renderCurrentActivity();
            } catch (err) {
                console.error("Error rendering activity:", err);
                showScreen(screens.ACTIVITY);
            }
        }
    }, 1000);
}

// ==========================================
// SCREEN 3: ASSESSMENT ACTIVITY
// ==========================================
function renderCurrentActivity() {
    if (simulatedSpeechTimeout) clearInterval(simulatedSpeechTimeout);
    isStepTransitioning = false;
    clearLiveTranscript();

    const levelData = PROTOTYPE_DATA[currentLevel];
    if (!levelData) return;

    const templateData = levelData.templates[currentTemplate];
    if (!templateData) return;

    showScreen(screens.ACTIVITY);

    const lvlBadge = document.getElementById('activity-level-badge');
    const tmplBadge = document.getElementById('activity-template-badge');
    const counterBadge = document.getElementById('activity-sample-counter');
    const instructText = document.getElementById('activity-instruction-text');

    if (lvlBadge) lvlBadge.innerText = levelData.name;
    if (tmplBadge) tmplBadge.innerText = currentTemplate;
    if (counterBadge) counterBadge.innerText = `Sample ${studentSampleCount} of 3`;
    if (instructText) instructText.innerText = templateData.instruction;

    const container = document.getElementById('reading-card-container');
    if (!container) return;
    container.innerHTML = '';

    const sampleList = templateData[currentTier] || templateData.tier1 || Object.values(templateData)[0];
    if (!sampleList || sampleList.length === 0) return;

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
        const targetWord = sample.target || "sun";
        const optionsList = sample.options || ["sun", "sub"];
        const imgDisplay = sample.image || (targetWord === "sun" ? "☀️" : targetWord === "pin" ? "🖊️" : "🐱");
        
        currentTargetWordList = [targetWord];

        let optionsHtml = optionsList.map(opt => `
            <div class="minimal-pair-option" id="min-option-${opt.toLowerCase()}" onclick="selectMinimalPair(this, '${opt}', '${targetWord}')">${opt}</div>
        `).join('');

        container.innerHTML = `
            <div class="display-image-word" style="margin-bottom: 24px;">
                <div class="image-emoji" style="font-size: 110px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));">${imgDisplay}</div>
            </div>
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

    try {
        startRealSpeechRecognition();
    } catch (e) {
        console.warn("Auto-start speech recognition failed:", e);
    }
}

// Dedicated Comprehension Screen (Screen 3b)
function showComprehensionPage(sample) {
    if (simulatedSpeechTimeout) clearInterval(simulatedSpeechTimeout);
    stopRealSpeechRecognition();
    clearLiveTranscript();
    showScreen(screens.COMPREHENSION);

    const levelData = PROTOTYPE_DATA[currentLevel];
    const lvlBadge = document.getElementById('comp-level-badge');
    const counterBadge = document.getElementById('comp-sample-counter');
    const qText = document.getElementById('comp-page-question-text');

    if (lvlBadge) lvlBadge.innerText = levelData ? levelData.name : currentLevel;
    if (counterBadge) counterBadge.innerText = `Sample ${studentSampleCount} of 3`;
    if (qText) qText.innerText = sample.question;

    const grid = document.getElementById('comp-page-options-grid');
    if (!grid) return;
    grid.innerHTML = '';

    sample.options.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'comp-option-page-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            if (isStepTransitioning) return;
            isStepTransitioning = true;
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
    if (isStepTransitioning) return;
    updateMicUI('listening');

    const levelData = PROTOTYPE_DATA[currentLevel];
    const templateData = levelData ? levelData.templates[currentTemplate] : null;
    if (!templateData) return;

    const sampleList = templateData[currentTier] || templateData.tier1 || Object.values(templateData)[0];
    if (!sampleList) return;

    const sample = sampleList[sampleIndex % sampleList.length];

    if (currentTemplate === 'WORD_READ_TEXT') {
        updateLiveTranscriptText(sample.text);
        const el = document.getElementById('target-text-display');
        if (el) {
            el.classList.add('highlight-green');
            updateMicUI('processing');
            isStepTransitioning = true;
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
                isStepTransitioning = true;
                setTimeout(() => {
                    completeAssessmentSampleStep();
                }, 1000);
            }
        }, 350);
    }
    else if (currentTemplate === 'WORD_READ_MINIMAL_PAIR') {
        const targetWord = sample.target || "sun";
        updateLiveTranscriptText(targetWord);
        const targetOptEl = document.getElementById(`min-option-${targetWord.toLowerCase()}`);
        if (targetOptEl) {
            targetOptEl.classList.add('correct');
            updateMicUI('processing');
            isStepTransitioning = true;
            setTimeout(() => {
                completeAssessmentSampleStep();
            }, 1200);
        }
    }
    else if (currentTemplate === 'WORD_IMAGE_NAMING') {
        updateLiveTranscriptText(sample.targetWord);
        const revealed = document.getElementById('image-word-revealed');
        if (revealed) {
            revealed.classList.remove('hidden');
            updateMicUI('processing');
            isStepTransitioning = true;
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
            isStepTransitioning = true;
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
                isStepTransitioning = true;

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
    if (isStepTransitioning) return;
    isStepTransitioning = true;
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
    if (simulatedSpeechTimeout) clearInterval(simulatedSpeechTimeout);
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

        showScreen(screens.TRANSITION);
        const greetingEl = document.getElementById('transition-greeting');
        const subEl = document.getElementById('transition-subheading');
        const countEl = document.getElementById('countdown');

        if (greetingEl) greetingEl.innerText = "Great Reading!";
        if (subEl) subEl.innerText = "You're done for today 🌟";
        if (countEl) countEl.innerText = "✓";

        setTimeout(() => {
            currentStudentIndex++;
            if (currentStudentIndex >= rosterStudents.length) {
                stopAssessmentTimer();
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
    if (screens.ACTIVITY.classList.contains('active')) {
        startRealSpeechRecognition();
    }
}

function endAssessmentSessionPrompt() {
    if (confirm("End assessment session for this student?")) {
        stopAssessmentTimer();
        renderTeacherHome();
    }
}

// ==========================================
// SCREEN 4: SESSION COMPLETE SCREEN
// ==========================================
function triggerCelebrationConfetti() {
    stopRealSpeechRecognition();
    stopAssessmentTimer();
    clearLiveTranscript();
    const container = document.getElementById('confetti-container');
    if (!container) return;
    container.innerHTML = '';

    const assessed = rosterStudents.filter(s => s.status === 'done').length;
    const absent = rosterStudents.filter(s => s.status === 'absent').length;

    const assEl = document.getElementById('summary-stat-assessed');
    const absEl = document.getElementById('summary-stat-absent');
    if (assEl) assEl.innerText = assessed || 38;
    if (absEl) absEl.innerText = absent || 2;

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
    stopAssessmentTimer();
    rosterStudents.forEach(s => s.status = 'waiting');
    currentStudentIndex = 0;
    renderTeacherHome();
}

// App Initialization
initDemoControls();
initSpeechRecognitionEngine();
renderTeacherHome();
