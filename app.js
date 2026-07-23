// High-Fidelity Smartboard ORF Prototype Engine

// App Screens
const screens = {
    HOME: document.getElementById('screen-01-home'),
    TRANSITION: document.getElementById('screen-02-transition'),
    ACTIVITY: document.getElementById('screen-03-activity'),
    COMPREHENSION: document.getElementById('screen-03b-comprehension'),
    END: document.getElementById('screen-04-end'),
    REPORTING: document.getElementById('screen-05-reporting')
};

// Unified Application State (Single Source of Truth)
let AppState = {
    config: {
        district: "Ahmedabad • Primary Block 1",
        schoolName: "Government Primary School No. 4",
        grade: "Grade 1",
        languageTrack: "Gujarati / English",
        rosterSize: 40
    },
    students: [],
    responseLog: []
};

function loadAppState() {
    const saved = localStorage.getItem('miko_app_state');
    if (saved) {
        try {
            AppState = JSON.parse(saved);
        } catch (e) {
            initDefaultAppState();
        }
    } else {
        initDefaultAppState();
    }
}

function saveAppState() {
    localStorage.setItem('miko_app_state', JSON.stringify(AppState));
}

function initDefaultAppState(customConfig) {
    if (customConfig) {
        AppState.config = customConfig;
    }

    const count = AppState.config.rosterSize || 40;
    const baseList = (typeof MOCK_REPORTING_STUDENTS !== 'undefined') ? MOCK_REPORTING_STUDENTS : [];

    AppState.students = [];
    for (let i = 0; i < count; i++) {
        const base = baseList[i % baseList.length] || { name: `Student ${i+1}`, level: 'L2', tier: 'tier1', accuracy: 88, wcpm: 40, compScore: 85, journey: ['L1', 'L2'], flag: null };
        const avatarNum = (i % 4) + 1;
        AppState.students.push({
            id: `student_${i+1}`,
            name: base.name || `Student ${i+1}`,
            avatarImg: `assets/kid_avatar_${avatarNum}.jpg`,
            grade: AppState.config.grade,
            lang: AppState.config.languageTrack,
            level: base.level || 'L2',
            readingTier: 1,
            compTier: 0,
            stageType: 'LEVEL',
            stageDisplay: base.level || 'L2',
            tier: base.tier || 'Tier 1',
            status: i < Math.floor(count * 0.8) ? 'done' : i === Math.floor(count * 0.8) ? 'waiting' : 'absent',
            accuracy: base.accuracy || 88,
            wcpm: base.wcpm || 40,
            compScore: base.compScore || 85,
            assessments: 4,
            journey: base.journey || ['L1', 'L2'],
            flag: base.flag || null
        });
    }

    AppState.responseLog = AppState.students.filter(s => s.status === 'done').map(s => ({
        date: "2026-07-22",
        studentId: s.id,
        name: s.name,
        avatarImg: s.avatarImg,
        grade: s.grade,
        lang: s.lang,
        level: s.level,
        tier: s.tier,
        accuracy: s.accuracy,
        wcpm: s.wcpm,
        compScore: s.compScore,
        transition: "Advanced"
    }));

    saveAppState();
}

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

// Live WCPM (Words Correct Per Minute) Metrics Engine
let sessionStartTime = Date.now();
let sessionCorrectWordsCount = 0;
let currentSessionWCPM = 0;

function resetWCPMTracker() {
    sessionStartTime = Date.now();
    sessionCorrectWordsCount = 0;
    currentSessionWCPM = 0;
    updateLiveWCPMDisplay();
}

function incrementCorrectWordWCPM() {
    sessionCorrectWordsCount++;
    const elapsedMins = (Date.now() - sessionStartTime) / 60000;
    currentSessionWCPM = Math.round(sessionCorrectWordsCount / Math.max(0.08, elapsedMins));
    updateLiveWCPMDisplay();
}

function updateLiveWCPMDisplay() {
    const el = document.getElementById('wcpm-val-display');
    if (el) el.innerText = currentSessionWCPM;
}

// ----------------------------------------------------
// AUTOMATIC ASSESSMENT PROGRESSION ENGINE & CEILING RULES
// ----------------------------------------------------
function getGradeCeilingLevel(gradeStr) {
    if (!gradeStr) return "L2";
    if (gradeStr.includes("Balvatika")) return "L1";
    if (gradeStr.includes("1")) return "L2";
    if (gradeStr.includes("2")) return "L3";
    if (gradeStr.includes("3")) return "L4";
    return "L4";
}

function calculateAutomaticProgression(student, result) {
    const gradeCeiling = getGradeCeilingLevel(student.grade || AppState.config.grade);
    const accuracy = result.accuracy; // %
    const wcpm = result.wcpm;
    const compScore = result.compScore; // %

    let action = "Stay"; // Advance | Stay | Move Down
    let currLevel = student.level || "L1";
    let currReadingTier = student.readingTier || 1; // 1, 2, 3
    let currCompTier = student.compTier || 0; // 0, 1, 2, 3
    let stageType = student.stageType || "LEVEL"; // LEVEL | READING_TIER | COMP_TIER

    // 1. Evaluate Promotion Rules
    if (stageType === "COMP_TIER") {
        if (compScore >= 80) action = "Advance";
        else if (compScore >= 60) action = "Stay";
        else action = "Move Down";
    }
    else if (currLevel === "L1" || currLevel === "L2") {
        if (accuracy >= 90) action = "Advance";
        else if (accuracy >= 75) action = "Stay";
        else action = "Move Down";
    }
    else if (currLevel === "L3") {
        if (accuracy >= 90 && wcpm >= 40 && compScore >= 80) action = "Advance";
        else if (accuracy >= 75 || (wcpm >= 22 && wcpm <= 39)) action = "Stay";
        else action = "Move Down";
    }
    else if (currLevel === "L4") {
        if (accuracy >= 90 && wcpm >= 55 && compScore >= 80) action = "Advance";
        else if (accuracy >= 75 || (wcpm >= 35 && wcpm <= 54)) action = "Stay";
        else action = "Move Down";
    }

    // 2. Apply Grade Ceiling & Tier Progression
    const levelOrder = ["L1", "L2", "L3", "L4"];
    const levelIdx = levelOrder.indexOf(currLevel);
    const ceilingIdx = levelOrder.indexOf(gradeCeiling);

    if (action === "Advance") {
        if (stageType === "LEVEL") {
            if (levelIdx < ceilingIdx) {
                // Advance to next reading level
                student.level = levelOrder[levelIdx + 1];
            } else {
                // Ceiling reached! Switch to Reading Tier 2
                student.stageType = "READING_TIER";
                student.readingTier = 2;
            }
        } else if (stageType === "READING_TIER") {
            if (currReadingTier < 3) {
                student.readingTier = currReadingTier + 1;
            } else {
                // Reading Tier 3 Mastered! Begin Comprehension Tier 1
                student.stageType = "COMP_TIER";
                student.compTier = 1;
            }
        } else if (stageType === "COMP_TIER") {
            if (currCompTier < 3) {
                student.compTier = currCompTier + 1;
            }
        }
    }
    else if (action === "Move Down") {
        if (stageType === "COMP_TIER") {
            if (currCompTier > 1) {
                student.compTier = currCompTier - 1;
            } else {
                student.stageType = "READING_TIER";
                student.readingTier = 3;
            }
        } else if (stageType === "READING_TIER") {
            if (currReadingTier > 1) {
                student.readingTier = currReadingTier - 1;
            } else {
                student.stageType = "LEVEL";
                if (levelIdx > 0) student.level = levelOrder[levelIdx - 1];
            }
        } else if (stageType === "LEVEL") {
            if (levelIdx > 0) {
                student.level = levelOrder[levelIdx - 1];
            }
        }
    }

    // Format Stage Label
    let stageDisplay = student.level;
    if (student.stageType === "READING_TIER") stageDisplay += ` • Tier ${student.readingTier}`;
    if (student.stageType === "COMP_TIER") stageDisplay += ` • Comp Tier ${student.compTier}`;

    student.stageDisplay = stageDisplay;
    student.tier = (student.stageType === "COMP_TIER") ? `Comp T${student.compTier}` : `Tier ${student.readingTier || 1}`;

    // Update Journey Log
    if (!student.journey) student.journey = [student.level];
    if (student.journey[student.journey.length - 1] !== stageDisplay) {
        student.journey.push(stageDisplay);
    }

    return { action, stageDisplay };
}

// ----------------------------------------------------
// WEB AUDIO API SOUND EFFECTS (SFX) ENGINE
// ----------------------------------------------------
let audioCtx = null;
let sfxEnabled = true;
let sfxVolume = 0.5;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSFX(type) {
    if (!sfxEnabled) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(sfxVolume, now);
        masterGain.connect(ctx.destination);

        if (type === 'tap') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(260, now);
            osc.frequency.exponentialRampToValueAtTime(130, now + 0.04);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.04);
        }
        else if (type === 'mic_on') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.15);
        }
        else if (type === 'mic_off') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(550, now);
            osc.frequency.exponentialRampToValueAtTime(330, now + 0.12);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.12);
        }
        else if (type === 'word_tick') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(784, now);
            osc.frequency.exponentialRampToValueAtTime(987, now + 0.035);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.035);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.035);
        }
        else if (type === 'success_chime') {
            [523.25, 659.25, 783.99].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0.2, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
                osc.connect(gain);
                gain.connect(masterGain);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.25);
            });
        }
        else if (type === 'transition') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(450, now + 0.08);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.08);
        }
        else if (type === 'timer_reminder') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.15);
        }
        else if (type === 'level_up') {
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                gain.gain.setValueAtTime(0.22, now + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);
                osc.connect(gain);
                gain.connect(masterGain);
                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.3);
            });
        }
    } catch (e) {
        console.warn("SFX Error:", e);
    }
}

function toggleSFXEnabled(val) {
    sfxEnabled = val;
    if (val) playSFX('tap');
}

function updateSFXVolume(val) {
    sfxVolume = parseFloat(val);
    const label = document.getElementById('sfx-volume-val');
    if (label) label.innerText = `${Math.round(sfxVolume * 100)}%`;
    playSFX('tap');
}

// Global click event listener to play soft tap SFX on buttons and cards
document.addEventListener('click', (e) => {
    const target = e.target.closest('button, .card, .chip-item, .rep-tab-btn, .settings-option-card, .minimal-pair-option, .comp-option-page-btn');
    if (target) {
        playSFX('tap');
    }
});

// Single Active Reading Cursor Controller
function updateReadingCursor(targetIndex) {
    const allSpans = document.querySelectorAll('.display-passage-text span.word-span');
    allSpans.forEach(s => s.classList.remove('current-cursor'));

    if (targetIndex >= 0 && targetIndex < currentTargetWordList.length) {
        const activeSpan = document.getElementById(`word-${targetIndex}`);
        if (activeSpan && !activeSpan.classList.contains('green')) {
            activeSpan.classList.add('current-cursor');
        }
    }
}

let currentStudentIndex = 0;

// Screen Router
function showScreen(targetScreen) {
    if (!targetScreen) return;
    playSFX('transition');
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
    resetWCPMTracker(); // Reset WCPM tracker on timer start!
    updateTimerBadgesDisplay();

    assessmentTimerInterval = setInterval(() => {
        assessmentTimerSeconds--;
        updateTimerBadgesDisplay();

        if (assessmentTimerSeconds === 60) {
            playSFX('timer_reminder'); // Single soft reminder tone at 1 minute remaining
        }

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
                playSFX('mic_on');
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
                    playSFX('mic_off');
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
            playSFX('mic_on');
            updateMicUI('listening');
            startSilenceChecker();
        } catch (e) {
            console.warn("Recognition start error:", e);
        }
    }
}

function stopRealSpeechRecognition() {
    if (isRealListening) playSFX('mic_off');
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
            playSFX('word_tick');
            incrementCorrectWordWCPM();
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
            playSFX('word_tick');
            incrementCorrectWordWCPM();
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
                if (card && !card.classList.contains('highlight-read')) {
                    card.classList.add('highlight-read');
                    playSFX('word_tick');
                    incrementCorrectWordWCPM();
                }
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
            playSFX('word_tick');
            incrementCorrectWordWCPM();
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
            playSFX('word_tick');
            incrementCorrectWordWCPM();
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
        let foundIdx = -1;
        const lookaheadLimit = Math.min(currentMatchedWordIndex + 3, currentTargetWordList.length);

        for (let lookahead = currentMatchedWordIndex; lookahead < lookaheadLimit; lookahead++) {
            const futureTarget = currentTargetWordList[lookahead].toLowerCase().replace(/[^\w]/g, '');
            if (!futureTarget) continue;

            const isMatch = spokenTokens.some(st => {
                if (st.length === 0) return false;
                if (futureTarget.length <= 2) {
                    return st === futureTarget;
                }
                return st === futureTarget || (st.length >= 3 && st.startsWith(futureTarget));
            });

            if (isMatch) {
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
            if (span && !span.classList.contains('green')) {
                span.classList.add('green');
                span.classList.remove('missed');
                playSFX('word_tick');
                incrementCorrectWordWCPM();
            }
            currentMatchedWordIndex = foundIdx + 1;
            updateReadingCursor(currentMatchedWordIndex);
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
    const activeStudent = AppState.students[currentStudentIndex] || AppState.students[0];
    if (!activeStudent) return;

    let prevLevel = activeStudent.level;
    let mockResult = { accuracy: 92, wcpm: 45, compScore: 90 };

    if (action === 'Advance') {
        mockResult = { accuracy: 95, wcpm: 48, compScore: 95 };
    } else if (action === 'Stay') {
        mockResult = { accuracy: 82, wcpm: 30, compScore: 70 };
    } else if (action === 'Move Down') {
        mockResult = { accuracy: 65, wcpm: 15, compScore: 50 };
    }

    const { action: outcome, stageDisplay } = calculateAutomaticProgression(activeStudent, mockResult);

    saveAppState();

    const toast = document.getElementById('progression-toast');
    const icon = document.getElementById('toast-icon');
    const title = document.getElementById('toast-title');
    const subtitle = document.getElementById('toast-subtitle');

    if (outcome === 'Advance') {
        playSFX('level_up');
        if (icon) { icon.innerText = 'north_east'; icon.style.color = '#7ED957'; }
        if (title) title.innerText = 'Advancing Progression';
    } else if (outcome === 'Stay') {
        playSFX('tap');
        if (icon) { icon.innerText = 'remove'; icon.style.color = '#FF9800'; }
        if (title) title.innerText = 'Maintaining Stage';
    } else if (outcome === 'Move Down') {
        playSFX('tap');
        if (icon) { icon.innerText = 'south_east'; icon.style.color = '#EF5350'; }
        if (title) title.innerText = 'Adjusting Support';
    }

    if (subtitle) subtitle.innerText = `${prevLevel}  ➔  ${stageDisplay}`;

    currentLevel = activeStudent.level;
    populateTemplatesForLevel(currentLevel);

    if (toast) {
        toast.classList.remove('hidden');
        setTimeout(() => { toast.classList.add('hidden'); }, 2800);
    }

    if (screens.ACTIVITY.classList.contains('active') || screens.COMPREHENSION.classList.contains('active')) {
        renderCurrentActivity();
    }
}

// ==========================================
// SCREEN 1: TEACHER HOME (STREAMLINED WITH AI AVATARS)
// ==========================================
function renderTeacherHome() {
    isStepTransitioning = false;
    if (simulatedSpeechTimeout) clearInterval(simulatedSpeechTimeout);
    stopRealSpeechRecognition();
    stopAssessmentTimer();
    clearLiveTranscript();
    showScreen(screens.HOME);

    // Update Home Header from AppState.config
    const titleEl = document.getElementById('home-school-title');
    const subEl = document.getElementById('home-district-subtitle');
    const langEl = document.getElementById('home-lang-track-label');

    if (titleEl) titleEl.innerText = AppState.config.schoolName;
    if (subEl) subEl.innerText = `${AppState.config.district} • ${AppState.config.grade}`;
    if (langEl) langEl.innerText = AppState.config.languageTrack;

    // Calculate Progress Bar
    const totalCount = AppState.students.length;
    const doneCount = AppState.students.filter(s => s.status === 'done').length;
    const pendingCount = AppState.students.filter(s => s.status === 'waiting').length;
    const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    const countEl = document.getElementById('progress-text-count');
    const fillEl = document.getElementById('progress-bar-fill-large');

    if (countEl) countEl.innerText = `${doneCount} / ${totalCount} Students (${percent}%)`;
    if (fillEl) fillEl.style.width = `${percent}%`;

    // Active Student / Hero Card
    const activeStudent = AppState.students.find(s => s.status === 'waiting');

    if (activeStudent) {
        currentStudentIndex = AppState.students.findIndex(s => s.id === activeStudent.id);
        currentLevel = activeStudent.level || "L1"; // Auto-set active student's level!
        const heroContent = document.getElementById('hero-card-content');
        const heroActions = document.getElementById('hero-card-actions');
        const avatarPath = activeStudent.avatarImg || `assets/kid_avatar_${(currentStudentIndex % 4) + 1}.jpg`;
        const stageText = activeStudent.stageDisplay || activeStudent.level || "L1";

        if (heroContent) {
            heroContent.style.display = 'flex';
            heroContent.innerHTML = `
                <div class="hero-avatar">
                    <img src="${avatarPath}" alt="${activeStudent.name}" class="hero-avatar-img">
                </div>
                <div class="hero-student-info">
                    <span class="badge-pill hero-level-badge" id="hero-student-level-badge">${stageText} (${AppState.config.grade})</span>
                    <h2 class="fredoka-text hero-student-name" id="up-next-student-name">${activeStudent.name}</h2>
                    <p class="text-muted hero-student-details" id="up-next-student-subtext">Roll No. ${currentStudentIndex + 1 < 10 ? '0' : ''}${currentStudentIndex + 1} • ${activeStudent.grade || AppState.config.grade} • ${AppState.config.languageTrack} Track</p>
                </div>
            `;
        }
        if (heroActions) {
            heroActions.style.display = 'flex';
            heroActions.innerHTML = `
                <button class="btn-primary btn-hero-start" onclick="triggerStartSession()">
                    <span class="material-icons-round" style="font-size: 28px;">play_circle</span> Start Assessment
                </button>
                <button class="btn-secondary btn-hero-absent" onclick="markCurrentStudentAbsent()">
                    <span class="material-icons-round">person_off</span> Mark Absent
                </button>
            `;
        }
    } else {
        // ALL COMPLETED EMPTY STATE
        currentStudentIndex = 0;
        const heroContent = document.getElementById('hero-card-content');
        const heroActions = document.getElementById('hero-card-actions');
        if (heroContent) {
            heroContent.style.display = 'flex';
            heroContent.innerHTML = `
                <div style="text-align: center; width: 100%; padding: 16px 0;">
                    <span class="material-icons-round text-success" style="font-size: 54px; margin-bottom: 6px;">stars</span>
                    <h2 class="fredoka-text text-success" style="font-size: 1.8rem;">Today's Assessments Complete!</h2>
                    <p class="text-muted">All ${doneCount} scheduled student assessments have been finished.</p>
                </div>
            `;
        }
        if (heroActions) {
            heroActions.style.display = 'flex';
            heroActions.innerHTML = `
                <button class="btn-primary" style="flex: 1; padding: 12px 20px;" onclick="openReportingFromSettings()">
                    <span class="material-icons-round">assessment</span> View Reporting Dashboard
                </button>
                <button class="btn-secondary" style="padding: 12px 20px;" onclick="triggerResetConfiguration()">
                    <span class="material-icons-round">restart_alt</span> Start New Cycle
                </button>
            `;
        }
    }

    // Render Assessment Queue Grid with AI Avatars
    const qRemEl = document.getElementById('queue-remaining-badge');
    if (qRemEl) qRemEl.innerText = `${pendingCount} remaining`;

    const strip = document.getElementById('queue-chips-strip');
    if (strip) {
        strip.innerHTML = '';
        AppState.students.forEach((s, idx) => {
            const isHero = activeStudent && s.id === activeStudent.id;
            const item = document.createElement('div');
            item.className = 'queue-student-item';

            const statusClass = s.status === 'done' ? 'done' : isHero ? 'waiting' : s.status === 'absent' ? 'absent' : 'pending';
            const statusText = s.status === 'done' ? '🟢 Completed' : isHero ? '🔵 Up Next' : s.status === 'absent' ? '🟠 Absent' : '⚪ Pending';
            const avatarPath = s.avatarImg || `assets/kid_avatar_${(idx % 4) + 1}.jpg`;
            const stageBadgeText = s.stageDisplay || s.level || "L1";

            item.innerHTML = `
                <div class="queue-student-left">
                    <div class="queue-student-avatar"><img src="${avatarPath}" alt="${s.name}" class="queue-avatar-img"></div>
                    <div>
                        <div class="queue-student-name">${s.name}</div>
                        <div style="font-size: 0.75rem; color: #64748B;">Roll No. ${idx + 1 < 10 ? '0' : ''}${idx + 1}</div>
                    </div>
                </div>
                <div class="queue-student-right">
                    <span class="badge-pill" style="font-size: 0.75rem; padding: 2px 8px;">${stageBadgeText}</span>
                    <span class="q-badge ${statusClass}">${statusText}</span>
                </div>
            `;
            strip.appendChild(item);
        });
    }
}

function markCurrentStudentAbsent() {
    if (AppState.students[currentStudentIndex]) {
        AppState.students[currentStudentIndex].status = 'absent';
        saveAppState();
    }
    renderTeacherHome();
}

function triggerStartSession() {
    studentSampleCount = 1;
    sampleIndex = 0;
    const activeStudent = AppState.students[currentStudentIndex] || AppState.students[0] || { name: 'Aarav Patel' };
    currentLevel = activeStudent.level || "L1"; // Auto-set active student level!
    populateTemplatesForLevel(currentLevel);
    startTransitionScreen(activeStudent.name);
}

// ==========================================
// SCREEN 2: TRANSITION SCREEN WITH AI KID AVATAR
// ==========================================
function startTransitionScreen(studentName) {
    isStepTransitioning = false;
    if (simulatedSpeechTimeout) clearInterval(simulatedSpeechTimeout);
    stopRealSpeechRecognition();
    clearLiveTranscript();
    showScreen(screens.TRANSITION);

    const activeStudent = AppState.students[currentStudentIndex] || AppState.students[0] || { name: studentName, avatarImg: 'assets/kid_avatar_1.jpg' };
    const avatarEl = document.getElementById('transition-student-avatar');
    if (avatarEl) {
        avatarEl.src = activeStudent.avatarImg || `assets/kid_avatar_${(currentStudentIndex % 4) + 1}.jpg`;
    }

    const greetingEl = document.getElementById('transition-greeting');
    const subEl = document.getElementById('transition-subheading');
    const countEl = document.getElementById('countdown');

    if (greetingEl) greetingEl.innerText = activeStudent.name;
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

    const activeStudent = AppState.students[currentStudentIndex] || AppState.students[0];
    if (activeStudent) {
        currentLevel = activeStudent.level || "L1";
    }

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

    // Rule: Hide WCPM Badge for L1 (Balvatika) & L2 (Grade 1); Show ONLY for L3 (Grade 2) & L4 (Grade 3)
    const wcpmBadge = document.getElementById('activity-wcpm-badge');
    if (wcpmBadge) {
        if (currentLevel === 'L1' || currentLevel === 'L2') {
            wcpmBadge.style.display = 'none';
        } else {
            wcpmBadge.style.display = 'inline-flex';
        }
    }

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
        const imgDisplay = sample.image || (targetWord === "sun" ? "☀️" : targetWord === "pen" ? "🖊️" : "🐱");
        
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
        updateReadingCursor(0);
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
        updateReadingCursor(0);
    }
    else if (currentTemplate === 'SENTENCE_READ_CLOZE_ORAL') {
        currentTargetWordList = [sample.target];
        const imgClue = sample.image || (sample.target === "sleeping" ? "😴" : sample.target === "fly" ? "🕊️" : sample.target === "ball" ? "⚽" : "☀️");
        container.innerHTML = `
            <div class="display-image-word" style="margin-bottom: 24px;">
                <div class="image-emoji" style="font-size: 100px; filter: drop-shadow(0 6px 16px rgba(0,0,0,0.15)); animation: popScale 0.4s ease;">${imgClue}</div>
            </div>
            <div class="cloze-sentence-display">
                ${sample.display.replace('_____', '<span class="cloze-blank-box" id="cloze-blank-target">?</span>')}
            </div>
            <div class="text-muted" style="margin-top: 16px; font-size: 0.95rem;">(Say the word for the picture clue out loud)</div>
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
        updateReadingCursor(0);
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
    isStepTransitioning = false; // Reset lock so option buttons can be tapped!
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
            playSFX('success_chime');
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
            playSFX('word_tick');
            incrementCorrectWordWCPM();
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
                if (card) {
                    playSFX('word_tick');
                    incrementCorrectWordWCPM();
                    card.classList.add('highlight-read');
                }
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
            playSFX('word_tick');
            incrementCorrectWordWCPM();
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
            playSFX('word_tick');
            incrementCorrectWordWCPM();
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
            playSFX('word_tick');
            incrementCorrectWordWCPM();
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
                if (span) {
                    playSFX('word_tick');
                    incrementCorrectWordWCPM();
                    span.classList.add('green');
                    span.classList.remove('missed');
                }
                wordIdx++;
                currentMatchedWordIndex = wordIdx;
                updateReadingCursor(wordIdx);
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
        }, 300);
    }
}

function selectMinimalPair(elem, selected, target) {
    if (isStepTransitioning) return;
    isStepTransitioning = true;
    playSFX('word_tick');
    incrementCorrectWordWCPM();
    document.querySelectorAll('.minimal-pair-option').forEach(el => el.classList.remove('correct'));
    elem.classList.add('correct');
    updateLiveTranscriptText(selected);
    updateMicUI('processing');
    setTimeout(() => {
        completeAssessmentSampleStep();
    }, 1000);
}

// Automatic 3-Sample Progression Engine
function completeAssessmentSampleStep() {
    playSFX('success_chime');
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

        const activeStudent = AppState.students[currentStudentIndex];
        if (activeStudent) {
            activeStudent.status = 'done';
            activeStudent.wcpm = (currentLevel === 'L1' || currentLevel === 'L2') ? 0 : (currentSessionWCPM > 0 ? currentSessionWCPM : Math.floor(Math.random()*20 + 35));
            activeStudent.accuracy = Math.floor(Math.random()*10 + 90);
            activeStudent.compScore = 90;
            activeStudent.assessments = (activeStudent.assessments || 0) + 1;

            // Automatically Compute Next Progression Stage
            const { action: outcome, stageDisplay } = calculateAutomaticProgression(activeStudent, {
                accuracy: activeStudent.accuracy,
                wcpm: activeStudent.wcpm,
                compScore: activeStudent.compScore
            });

            // Log session into unified responseLog
            AppState.responseLog.unshift({
                date: "2026-07-22",
                studentId: activeStudent.id,
                name: activeStudent.name,
                avatarImg: activeStudent.avatarImg,
                grade: activeStudent.grade || AppState.config.grade,
                lang: activeStudent.lang || AppState.config.languageTrack,
                level: activeStudent.level,
                tier: activeStudent.tier,
                accuracy: activeStudent.accuracy,
                wcpm: activeStudent.wcpm,
                compScore: activeStudent.compScore,
                transition: outcome
            });

            saveAppState();
        }

        showScreen(screens.TRANSITION);
        const greetingEl = document.getElementById('transition-greeting');
        const subEl = document.getElementById('transition-subheading');
        const countEl = document.getElementById('countdown');

        if (greetingEl) greetingEl.innerText = "Great Reading!";
        if (subEl) subEl.innerText = `Session Complete 🌟 (${activeStudent ? activeStudent.stageDisplay : 'Finished'})`;
        if (countEl) countEl.innerText = "✓";

        setTimeout(() => {
            currentStudentIndex++;
            if (currentStudentIndex >= AppState.students.length) {
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
    playSFX('level_up');
    const container = document.getElementById('confetti-container');
    if (!container) return;
    container.innerHTML = '';

    const assessed = AppState.students.filter(s => s.status === 'done').length;
    const absent = AppState.students.filter(s => s.status === 'absent').length;

    const assEl = document.getElementById('summary-stat-assessed');
    const absEl = document.getElementById('summary-stat-absent');
    const wcpmEl = document.getElementById('summary-stat-wcpm');

    if (assEl) assEl.innerText = assessed;
    if (absEl) absEl.innerText = absent;
    if (wcpmEl) wcpmEl.innerText = (currentLevel === 'L1' || currentLevel === 'L2') ? 'N/A' : (currentSessionWCPM > 0 ? currentSessionWCPM : 42);

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
    renderTeacherHome();
}

// ==========================================
// TEACHER SETTINGS MODAL & RESET CONFIG
// ==========================================
function openTeacherSettingsModal() {
    const modal = document.getElementById('modal-teacher-settings');
    if (modal) modal.classList.remove('hidden');
}

function closeTeacherSettingsModal() {
    const modal = document.getElementById('modal-teacher-settings');
    if (modal) modal.classList.add('hidden');
}

function openReportingFromSettings() {
    closeTeacherSettingsModal();
    showScreen(screens.REPORTING);
    populateStudentSelector();
    renderStudentReport(AppState.students[0] ? AppState.students[0].id : 'student_1');
    renderClassReport();
    renderResponseLog();
}

function triggerResetConfiguration() {
    if (confirm("Are you sure you want to reset app configuration and return to the initial setup flow?")) {
        closeTeacherSettingsModal();
        const onboardingModal = document.getElementById('modal-onboarding-setup');
        if (onboardingModal) onboardingModal.classList.remove('hidden');
    }
}

function completeInitialSetupFlow() {
    const districtSelect = document.getElementById('setup-district-select');
    const schoolInput = document.getElementById('setup-school-input');
    const gradeSelect = document.getElementById('setup-grade-select');
    const langSelect = document.getElementById('setup-lang-select');
    const sizeSelect = document.getElementById('setup-roster-size-select');

    const newConfig = {
        district: districtSelect ? districtSelect.value : "Ahmedabad • Primary Block 1",
        schoolName: schoolInput ? schoolInput.value : "Government Primary School No. 4",
        grade: gradeSelect ? gradeSelect.value : "Grade 1",
        languageTrack: langSelect ? langSelect.value : "Gujarati / English",
        rosterSize: sizeSelect ? parseInt(sizeSelect.value, 10) : 40
    };

    initDefaultAppState(newConfig);

    const onboardingModal = document.getElementById('modal-onboarding-setup');
    if (onboardingModal) onboardingModal.classList.add('hidden');

    currentStudentIndex = 0;
    renderTeacherHome();
}

// ==========================================
// SCREEN 5: 3-TAB TEACHER REPORTING MODULE
// ==========================================
function switchReportingTab(tabName) {
    const tabs = ['student', 'class', 'log'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const content = document.getElementById(`rep-tab-content-${t}`);
        if (btn && content) {
            if (t === tabName) {
                btn.classList.add('active');
                content.classList.remove('hidden');
            } else {
                btn.classList.remove('active');
                content.classList.add('hidden');
            }
        }
    });
}

function populateStudentSelector() {
    const selector = document.getElementById('rep-student-selector');
    if (!selector) return;
    selector.innerHTML = '';

    AppState.students.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.innerText = `${s.name} (${s.grade} • ${s.stageDisplay || s.level})`;
        selector.appendChild(opt);
    });
}

function renderStudentReport(studentId) {
    const container = document.getElementById('student-report-details-container');
    if (!container) return;

    const student = AppState.students.find(s => s.id === studentId) || AppState.students[0] || { name: 'Aarav Patel', grade: AppState.config.grade, lang: AppState.config.languageTrack, level: 'L2', tier: 'tier1', accuracy: 92, wcpm: 44, compScore: 100, assessments: 1, journey: ['L1', 'L2'], flag: null };

    const journeyHtml = (student.journey || [student.level || 'L1']).map((step, idx) => `
        <div style="display: inline-flex; align-items: center; gap: 8px;">
            <span style="background: var(--md-sys-color-primary-container); color: var(--md-sys-color-primary); padding: 8px 16px; border-radius: 12px; font-weight: 800; font-size: 1.05rem;">${step}</span>
            ${idx < student.journey.length - 1 ? '<span class="material-icons-round" style="color: #94A3B8;">north_east</span>' : ''}
        </div>
    `).join(' ');

    const flagHtml = student.flag ? `
        <div style="background: #FEE2E2; color: #B91C1C; padding: 12px 20px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px; margin-top: 16px;">
            <span class="material-icons-round">warning</span> ${student.flag}
        </div>
    ` : '';

    const isWCPMApplicable = (student.level === 'L3' || student.level === 'L4');
    const wcpmDisplayStr = isWCPMApplicable ? `${student.wcpm || 42} WCPM` : 'N/A (Accuracy Only)';

    container.innerHTML = `
        <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h2 class="fredoka-text">${student.name}</h2>
                    <p class="text-muted">${student.grade || AppState.config.grade} • ${student.lang || AppState.config.languageTrack} Track</p>
                </div>
                <span class="badge-pill" style="font-size: 1rem;">${student.stageDisplay || student.level}</span>
            </div>

            <div style="border-top: 1px solid #E2E8F0; padding-top: 16px;">
                <span class="rep-label" style="font-size: 0.85rem; color: #64748B;">READING JOURNEY & PROGRESSION</span>
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 12px; flex-wrap: wrap;">
                    ${journeyHtml}
                </div>
            </div>

            ${flagHtml}
        </div>

        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div class="rep-stats-grid">
                <div class="card stat-card">
                    <span class="stat-card-title">READING ACCURACY</span>
                    <h2 class="fredoka-text text-success">${student.accuracy || 90}%</h2>
                </div>
                <div class="card stat-card">
                    <span class="stat-card-title">READING RATE</span>
                    <h2 class="fredoka-text text-primary" style="font-size: ${isWCPMApplicable ? '1.5rem' : '1.1rem'}">${wcpmDisplayStr}</h2>
                </div>
                <div class="card stat-card">
                    <span class="stat-card-title">COMPREHENSION</span>
                    <h2 class="fredoka-text text-secondary">${student.compScore || 90}%</h2>
                </div>
                <div class="card stat-card">
                    <span class="stat-card-title">ASSESSMENTS</span>
                    <h2 class="fredoka-text text-muted">${student.assessments || 1}</h2>
                </div>
            </div>

            <div class="card">
                <h3 class="fredoka-text" style="margin-bottom: 12px;">Performance Sparkline Trends</h3>
                <div style="height: 100px; background: #F8FAFC; border-radius: 12px; border: 1px dashed #CBD5E1; display: flex; align-items: flex-end; justify-content: space-between; padding: 16px 32px;">
                    <div style="height: 40%; width: 14%; background: #93C5FD; border-radius: 4px;" title="Session 1"></div>
                    <div style="height: 60%; width: 14%; background: #93C5FD; border-radius: 4px;" title="Session 2"></div>
                    <div style="height: 75%; width: 14%; background: #93C5FD; border-radius: 4px;" title="Session 3"></div>
                    <div style="height: 85%; width: 14%; background: #3B82F6; border-radius: 4px;" title="Session 4"></div>
                    <div style="height: ${student.accuracy || 90}%; width: 14%; background: #1D4ED8; border-radius: 4px;" title="Current Session"></div>
                </div>
            </div>
        </div>
    `;
}

function renderClassReport() {
    const totalCount = AppState.students.length;
    const doneCount = AppState.students.filter(s => s.status === 'done').length;
    const pendingCount = AppState.students.filter(s => s.status === 'waiting').length;
    const absentCount = AppState.students.filter(s => s.status === 'absent').length;
    const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    const totEl = document.getElementById('class-rep-stat-total');
    const assEl = document.getElementById('class-rep-stat-assessed');
    const penEl = document.getElementById('class-rep-stat-pending');
    const absEl = document.getElementById('class-rep-stat-absent');
    const covLabel = document.getElementById('class-rep-coverage-label');
    const covFill = document.getElementById('class-rep-coverage-fill');

    if (totEl) totEl.innerText = totalCount;
    if (assEl) assEl.innerText = doneCount;
    if (penEl) penEl.innerText = pendingCount;
    if (absEl) absEl.innerText = absentCount;
    if (covLabel) covLabel.innerText = `${doneCount} / ${totalCount} Students Assessed (${percent}%)`;
    if (covFill) covFill.style.width = `${percent}%`;

    // Render Reading Level Distribution dynamically from AppState.students
    const l1Count = AppState.students.filter(s => s.level === 'L1').length;
    const l2Count = AppState.students.filter(s => s.level === 'L2').length;
    const l3Count = AppState.students.filter(s => s.level === 'L3').length;
    const l4Count = AppState.students.filter(s => s.level === 'L4').length;

    const distContainer = document.getElementById('class-rep-level-dist-container');
    if (distContainer) {
        distContainer.innerHTML = `
            <div class="dist-row"><span>Level 1 (Balvatika)</span><div class="dist-bar"><div style="width: ${totalCount ? (l1Count/totalCount)*100 : 0}%; background: #EF5350;"></div></div><span>${l1Count}</span></div>
            <div class="dist-row"><span>Level 2 (Grade 1)</span><div class="dist-bar"><div style="width: ${totalCount ? (l2Count/totalCount)*100 : 0}%; background: #FF9800;"></div></div><span>${l2Count}</span></div>
            <div class="dist-row"><span>Level 3 (Grade 2)</span><div class="dist-bar"><div style="width: ${totalCount ? (l3Count/totalCount)*100 : 0}%; background: #2E7D32;"></div></div><span>${l3Count}</span></div>
            <div class="dist-row"><span>Level 4 (Grade 3)</span><div class="dist-bar"><div style="width: ${totalCount ? (l4Count/totalCount)*100 : 0}%; background: #3F51B5;"></div></div><span>${l4Count}</span></div>
        `;
    }

    // Classroom Insights
    const insightsList = document.getElementById('class-rep-insights-list');
    if (insightsList) {
        insightsList.innerHTML = `
            <li>✨ <strong>Current Class Size:</strong> ${totalCount} students configured in ${AppState.config.grade}.</li>
            <li>📈 <strong>Assessment Progress:</strong> ${doneCount} of ${totalCount} students assessed (${percent}% complete).</li>
            <li>⚠️ <strong>Attention Status:</strong> ${AppState.students.filter(s => s.flag !== null).length} students requiring reassessment support.</li>
        `;
    }

    // Attention Table
    const tbody = document.getElementById('attention-students-tbody');
    if (tbody) {
        tbody.innerHTML = '';
        const attentionList = AppState.students.filter(s => s.flag !== null);
        attentionList.forEach(s => {
            const tr = document.createElement('tr');
            const badgeClass = s.flag && s.flag.includes('Not') ? 'badge-amber' : 'badge-red';
            tr.innerHTML = `
                <td><strong>${s.name}</strong></td>
                <td>${s.grade || AppState.config.grade}</td>
                <td><span class="badge-pill">${s.stageDisplay || s.level}</span></td>
                <td><span class="badge-status ${badgeClass}">${s.flag || 'Review Needed'}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function renderResponseLog() {
    const tbody = document.getElementById('response-log-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const levelFilter = document.getElementById('filter-log-level') ? document.getElementById('filter-log-level').value : 'ALL';
    const langFilter = document.getElementById('filter-log-lang') ? document.getElementById('filter-log-lang').value : 'ALL';

    let filtered = AppState.responseLog.filter(log => {
        if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
        if (langFilter !== 'ALL' && log.lang !== langFilter) return false;
        return true;
    });

    filtered.forEach(log => {
        const isWCPMApplicable = (log.level === 'L3' || log.level === 'L4');
        const wcpmLogStr = isWCPMApplicable ? `${log.wcpm} WCPM` : 'N/A';

        const trEl = document.createElement('tr');
        trEl.innerHTML = `
            <td>${log.date}</td>
            <td><strong>${log.name}</strong></td>
            <td>${log.lang || AppState.config.languageTrack}</td>
            <td>${log.level}</td>
            <td>${log.tier}</td>
            <td><strong class="text-success">${log.accuracy}%</strong></td>
            <td>${wcpmLogStr}</td>
            <td>${log.compScore}%</td>
            <td><span class="badge-status badge-green">${log.transition || 'Advanced'}</span></td>
            <td>
                <button class="btn-secondary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="alert('Playing audio recording for ${log.name}...')">
                    <span class="material-icons-round" style="font-size: 16px;">play_arrow</span> Play
                </button>
            </td>
        `;
        tbody.appendChild(trEl);
    });
}

function exportFilteredCSV() {
    const levelFilter = document.getElementById('filter-log-level') ? document.getElementById('filter-log-level').value : 'ALL';
    const langFilter = document.getElementById('filter-log-lang') ? document.getElementById('filter-log-lang').value : 'ALL';

    let filtered = AppState.responseLog.filter(log => {
        if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
        if (langFilter !== 'ALL' && log.lang !== langFilter) return false;
        return true;
    });

    let csvContent = "data:text/csv;charset=utf-8,Date,Student Name,Grade,Language,Reading Level,Tier,Accuracy %,WCPM,Comprehension %\n";

    filtered.forEach(log => {
        const isWCPMApplicable = (log.level === 'L3' || log.level === 'L4');
        const valWCPM = isWCPMApplicable ? log.wcpm : "N/A";
        csvContent += `${log.date},"${log.name}","${log.grade}","${log.lang}","${log.level}","${log.tier}",${log.accuracy},${valWCPM},${log.compScore}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Miko_ORF_${AppState.config.grade.replace(/\s+/g, '_')}_Log.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// App Initialization
loadAppState();
initDemoControls();
initSpeechRecognitionEngine();
renderTeacherHome();
