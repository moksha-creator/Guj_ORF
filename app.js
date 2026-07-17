// --- Task 1: Speech Engine ---
const SpeechEngine = {
    recognition: null,
    init() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-IN';
            this.recognition.maxAlternatives = 3;
        }
    },
    listen(targetText, onResult, onInterim) {
        if (!this.recognition) {
            return onResult('NO_STT'); // Expose failure state for manual override
        }
        let hasMatched = false;
        let targetWords = targetText.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/);
        
        this.recognition.onresult = (event) => {
            const results = event.results;
            for (let i = event.resultIndex; i < results.length; ++i) {
                if (hasMatched) return;
                
                let transcript = "";
                for(let j=0; j<results[i].length; j++){
                    if (results[i][j].confidence >= 0.5) transcript += results[i][j].transcript.toLowerCase() + " ";
                }
                
                if(onInterim) onInterim(results[i][0].transcript);
                
                let wordsSpoken = transcript.trim().split(/\s+/);
                
                if (targetWords.length === 1) {
                    if (wordsSpoken.some(w => (w === targetWords[0]) || (targetWords[0].includes(w) && w.length > 3))) {
                        hasMatched = true; this.recognition.stop();
                    }
                } else {
                    let hits = targetWords.filter(tw => wordsSpoken.some(w => (w === tw) || (tw.includes(w) && w.length > 3))).length;
                    let accuracy = (hits / targetWords.length) * 100;
                    if (accuracy > 80) {
                        hasMatched = true; this.recognition.stop();
                    }
                }
                if (results[i].isFinal && !hasMatched) this.recognition.stop();
            }
        };
        this.recognition.onerror = () => this.recognition.stop();
        this.recognition.onend = () => onResult(hasMatched);
        try { this.recognition.start(); } catch(e) {}
    },
    stop() { if (this.recognition) this.recognition.stop(); }
};
SpeechEngine.init();

// --- Main App Logic for Adaptive Framework ---
const screens = {
    HOME: document.getElementById('screen-01-home'),
    TRANSITION: document.getElementById('screen-02-transition'),
    ACTIVITY: document.getElementById('screen-03-activity'),
    END: document.getElementById('screen-04-end')
};
const mikoContainer = document.getElementById('miko-container');
const mikoBubble = document.getElementById('miko-bubble');
const btnNext = document.getElementById('btn-next');
const controlsContainer = document.getElementById('controls-container');

// Audio
const sfxPop = document.getElementById('sfx-pop');
const sfxChime = document.getElementById('sfx-chime');
const sfxSuccess = document.getElementById('sfx-success');
function playPop() { sfxPop.currentTime=0; sfxPop.play().catch(()=>{}); }
function playChime() { sfxChime.currentTime=0; sfxChime.play().catch(()=>{}); }
function playSuccess() { sfxSuccess.currentTime=0; sfxSuccess.play().catch(()=>{}); }

// State variables
let currentStudent = null;
let currentSessionData = null;
let sessionStats = { readPassed: false, meaningPassed: false, wcpm: 0 };
let storyStartTime = 0;
let isSpeaking = false;
let retryCount = 0;
let activityPhase = 'READING'; // or 'MEANING'

// TTS
let lastSpokenText = "";
function speak(text, callback) {
    if(text) lastSpokenText = text;
    mikoBubble.innerText = lastSpokenText;
    mikoBubble.classList.remove('hidden');
    isSpeaking = true;
    
    const finish = () => {
        isSpeaking = false;
        window.dispatchEvent(new Event('miko-done-speaking'));
        if(callback) callback();
    };
    
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(lastSpokenText);
        utterance.rate = 0.9; 
        utterance.onend = finish; utterance.onerror = finish;
        window.speechSynthesis.speak(utterance);
    } else { setTimeout(finish, 1000); }
}

document.getElementById('btn-replay').classList.remove('hidden');
document.getElementById('btn-replay').onclick = () => { if(!isSpeaking) speak(); };

// Switch Screen Helper
function showScreen(screenElem) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screenElem.classList.remove('hidden');
    mikoContainer.classList.add('hidden'); // hidden by default unless ACTIVITY
}

// ==========================================
// SCREEN 01: HOME (ROSTER)
// ==========================================
function renderHome() {
    showScreen(screens.HOME);
    const students = getStudents();
    const list = document.getElementById('student-list');
    list.innerHTML = '';
    
    const nextStudent = students.find(s => s.dailyStatus === 'waiting');
    
    if (nextStudent) {
        document.getElementById('up-next-banner').classList.remove('hidden');
        document.getElementById('up-next-name').innerText = nextStudent.name;
        // P0-3: Level removed from front end banner
        currentStudent = nextStudent;
    } else {
        document.getElementById('up-next-banner').classList.add('hidden');
        currentStudent = null;
    }
    
    students.forEach(s => {
        const card = document.createElement('div');
        card.className = `student-card status-${s.dailyStatus}`;
        // P0-3: Level removed from public roster card
        card.innerText = `${s.name}`;
        card.onclick = () => {
            if (s.dailyStatus !== 'waiting') {
                updateStudentStatus(s.id, 'waiting');
                renderHome();
            }
        };
        list.appendChild(card);
    });
}

document.getElementById('btn-add-student').onclick = () => {
    const inp = document.getElementById('new-student-name');
    if(inp.value.trim()){ addStudent(inp.value.trim()); inp.value=''; renderHome(); }
};
document.getElementById('btn-reset-queue').onclick = () => { resetDailyQueue(); renderHome(); };

document.getElementById('btn-mark-absent').onclick = () => {
    if(currentStudent) { updateStudentStatus(currentStudent.id, 'absent'); renderHome(); }
};

// Teacher Dashboard (PIN Gated - P0-2)
document.getElementById('btn-teacher-dashboard-trigger').onclick = () => {
    const pin = prompt("Enter Teacher PIN to view scores (hint: 1234):");
    if (pin !== '1234') {
        alert("Incorrect PIN.");
        return;
    }
    
    document.getElementById('teacher-dashboard-modal').classList.remove('hidden');
    const content = document.getElementById('dashboard-content');
    let html = '';
    getStudents().forEach(s => {
        html += `<h3>${s.name} - Currently L${s.currentLevel}</h3>`;
        s.sessions.forEach(sess => {
            const date = new Date(sess.timestamp).toLocaleDateString();
            html += `<p>${date} | Read Pass: ${sess.readPassed} | Meaning Pass: ${sess.meaningPassed} | WCPM: ${sess.wcpm} | Result Lvl: ${sess.resultLevel}</p>`;
        });
        html += '<hr>';
    });
    content.innerHTML = html;
};
document.getElementById('btn-close-dashboard').onclick = () => document.getElementById('teacher-dashboard-modal').classList.add('hidden');

// Start Session
document.getElementById('btn-start').onclick = () => {
    if(!currentStudent) return;
    playPop();
    showScreen(screens.TRANSITION);
    
    currentSessionData = getContentForLevel(currentStudent.currentLevel);
    sessionStats = { readPassed: false, meaningPassed: false, wcpm: 0 };
    activityPhase = 'READING';
    
    document.getElementById('transition-name').innerText = currentStudent.name;
    let count = 3;
    document.getElementById('countdown').innerText = count;
    
    const interval = setInterval(() => {
        count--;
        if(count > 0) { document.getElementById('countdown').innerText = count; }
        else {
            clearInterval(interval);
            startActivity();
        }
    }, 1000);
};

// ==========================================
// SCREEN 03: ACTIVITY ENGINE
// ==========================================
function startActivity() {
    showScreen(screens.ACTIVITY);
    mikoContainer.classList.remove('hidden');
    controlsContainer.classList.add('hidden'); // P0-5: hide child next button
    screens.ACTIVITY.innerHTML = '';
    retryCount = 0;
    
    if (activityPhase === 'READING') {
        const lvl = currentSessionData.level;
        if(lvl === 1) { speak("Read the word out loud."); renderWordTask(); }
        else if(lvl === 2) { speak("Read the sentence out loud."); renderSentenceTask(); }
        else { speak("Let's read this story."); storyStartTime = Date.now(); renderStoryTask(); }
    } else {
        speak("Tap the correct answer.");
        renderMeaningTask();
    }
}

// P0-5: Auto-advance (Replacing btn-next)
function autoAdvanceSession() {
    if(activityPhase === 'READING') {
        activityPhase = 'MEANING';
        startActivity();
    } else {
        let passedBoth = sessionStats.readPassed && sessionStats.meaningPassed;
        let newLevel = currentStudent.currentLevel;
        if (passedBoth && newLevel < 4) newLevel++;
        else if (!sessionStats.readPassed && newLevel > 1) newLevel--;
        
        sessionStats.resultLevel = newLevel;
        saveSession(currentStudent.id, sessionStats, newLevel);
        
        showScreen(screens.END);
        playSuccess();
        setTimeout(() => { renderHome(); }, 4000);
    }
}

// --- Task Renderers ---
function createMicButton(targetText, onComplete) {
    const container = document.createElement('div');
    container.style.display = 'flex'; container.style.flexDirection = 'column'; container.style.alignItems = 'center';
    
    const micBtn = document.createElement('div');
    micBtn.className = 'mic-btn'; micBtn.innerHTML = '🎤';
    
    const feedback = document.createElement('div');
    feedback.style.fontSize = '1.5rem'; feedback.style.color = '#666'; feedback.style.marginTop = '1rem';
    feedback.innerText = "Waiting for Miko...";
    
    // Manual Override container
    const overrideContainer = document.createElement('div');
    overrideContainer.style.display = 'none'; overrideContainer.style.marginTop = '1rem';
    overrideContainer.innerHTML = `
        <button id="override-pass" style="background:#4ECDC4; padding:0.5rem 1rem; border-radius:10px; color:white; border:none; margin-right:1rem;">Manual Pass</button>
        <button id="override-fail" style="background:#FF6B6B; padding:0.5rem 1rem; border-radius:10px; color:white; border:none;">Manual Fail</button>
    `;
    
    container.appendChild(micBtn); 
    container.appendChild(feedback);
    container.appendChild(overrideContainer);
    
    const startListening = () => {
        micBtn.classList.add('listening');
        playChime(); feedback.innerText = "Listening...";
        
        SpeechEngine.listen(targetText, (passed) => {
            micBtn.classList.remove('listening');
            
            // P0-4: Handle STT unavailability
            if (passed === 'NO_STT') {
                feedback.innerText = "Recognition Unavailable - Teacher Override";
                overrideContainer.style.display = 'block';
                document.getElementById('override-pass').onclick = () => onComplete(true);
                document.getElementById('override-fail').onclick = () => onComplete(false);
                return;
            }
            
            if(passed) {
                feedback.innerText = "Great job!"; feedback.style.color = "var(--secondary)";
                playSuccess(); onComplete(true);
            } else {
                if(retryCount === 0) {
                    retryCount++; feedback.innerText = "Hmm, didn't catch that.";
                    speak("Let's try that one again.", () => startListening());
                } else {
                    feedback.innerText = "Missed it.";
                    playPop(); retryCount = 0; onComplete(false);
                }
            }
        }, (interim) => { feedback.innerText = '"' + interim + '"'; });
    };

    if (isSpeaking) window.addEventListener('miko-done-speaking', startListening, {once: true});
    else startListening();

    return container;
}

function handleReadComplete(passed) {
    sessionStats.readPassed = passed;
    // P0-5 auto advance after 2 seconds
    setTimeout(() => {
        if(!isSpeaking) autoAdvanceSession();
        else window.addEventListener('miko-done-speaking', autoAdvanceSession, {once: true});
    }, 1500);
}

function renderWordTask() {
    const word = currentSessionData.words[Math.floor(Math.random() * currentSessionData.words.length)];
    const div = document.createElement('div'); div.className = 'word-display'; div.innerText = word;
    const mic = createMicButton(word, handleReadComplete);
    screens.ACTIVITY.appendChild(div); screens.ACTIVITY.appendChild(mic);
}

function renderSentenceTask() {
    const sent = currentSessionData.sentences[Math.floor(Math.random() * currentSessionData.sentences.length)];
    const div = document.createElement('div'); div.className = 'sentence-display'; div.innerText = sent;
    const mic = createMicButton(sent, handleReadComplete);
    screens.ACTIVITY.appendChild(div); screens.ACTIVITY.appendChild(mic);
}

function renderStoryTask() {
    const container = document.createElement('div'); container.className = 'story-display';
    const text = document.createElement('div'); text.className = 'story-text';
    text.innerText = currentSessionData.story.text;
    
    const mic = createMicButton(currentSessionData.story.text, (passed) => {
        if(currentSessionData.level === 4) { // Compute WCPM
            let min = (Date.now() - storyStartTime) / 60000;
            if(passed) sessionStats.wcpm = Math.round((currentSessionData.story.text.split(' ').length) / min);
        }
        handleReadComplete(passed);
    });
    container.appendChild(text); container.appendChild(mic);
    screens.ACTIVITY.appendChild(container);
}

function renderMeaningTask() {
    const data = currentSessionData.vocab || currentSessionData.comprehension;
    speak(data.audioLabel);
    
    const grid = document.createElement('div'); grid.className = 'grid-2x2';
    data.options.forEach((opt, idx) => {
        const card = document.createElement('div'); card.className = 'choice-card';
        
        if (opt.type === 'image') {
            const img = document.createElement('img'); img.src = opt.value; card.appendChild(img);
        } else {
            const txt = document.createElement('h3'); txt.innerText = opt.value; txt.style.fontSize = '2rem'; card.appendChild(txt);
        }
        
        card.onclick = () => {
            if(isSpeaking) return;
            playChime();
            if(idx === data.correctIndex) {
                card.classList.add('selected'); playSuccess();
                sessionStats.meaningPassed = true;
            } else { sessionStats.meaningPassed = false; }
            
            // P0-5 auto advance
            setTimeout(() => {
                if(!isSpeaking) autoAdvanceSession();
                else window.addEventListener('miko-done-speaking', autoAdvanceSession, {once: true});
            }, 1500);
        };
        grid.appendChild(card);
    });
    screens.ACTIVITY.appendChild(grid);
}

// Init
renderHome();
