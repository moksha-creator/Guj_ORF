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
        if (!this.recognition) return onResult('NO_STT'); 
        
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
                
                if(onInterim) onInterim(transcript.trim());
                
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
    CONFIG: document.getElementById('screen-00-config'),
    HOME: document.getElementById('screen-01-home'),
    TRANSITION: document.getElementById('screen-02-transition'),
    ACTIVITY: document.getElementById('screen-03-activity'),
    END: document.getElementById('screen-04-end')
};
const mikoGlobal = document.getElementById('miko-global');

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
function setMikoState(state) {
    mikoGlobal.className = '';
    if(state) mikoGlobal.classList.add(`miko-${state}`);
    mikoGlobal.classList.remove('hidden');
}

function speak(text, callback) {
    isSpeaking = true;
    setMikoState('speaking');
    
    const finish = () => {
        isSpeaking = false;
        setMikoState('encouraging');
        window.dispatchEvent(new Event('miko-done-speaking'));
        if(callback) callback();
    };
    
    if ('speechSynthesis' in window && text) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; 
        utterance.onend = finish; utterance.onerror = finish;
        window.speechSynthesis.speak(utterance);
    } else { setTimeout(finish, 1000); }
}

// Switch Screen Helper
function showScreen(screenElem) {
    Object.values(screens).forEach(s => { s.classList.remove('active'); s.classList.add('hidden'); });
    screenElem.classList.remove('hidden');
    screenElem.classList.add('active');
    setMikoState('encouraging'); // Always visible global Miko
}

// ==========================================
// SCREEN 00: CONFIGURATION (ONE-TIME)
// ==========================================
function updateCoverage() {
    const rosterText = document.getElementById('config-roster').value.trim();
    const names = rosterText ? rosterText.split('\n').filter(n => n.trim()) : [];
    const rosterSize = names.length;
    
    const trackEn = document.getElementById('track-en').checked;
    const trackGj = document.getElementById('track-gj').checked;
    const numTracks = (trackEn ? 1 : 0) + (trackGj ? 1 : 0);
    
    const cadence = document.getElementById('config-cadence').value; // 'rolling' (20) or 'designated' (5)
    const slot = document.getElementById('config-slot').value; // 'lecture' (2) or 'dedicated' (5)
    
    const days = cadence === 'rolling' ? 20 : 5;
    let sessionsPerDay = 2;
    if(slot === 'dedicated') sessionsPerDay = 5;
    if(slot === 'extended') sessionsPerDay = 15;
    if(slot === 'full') sessionsPerDay = 30;
    
    const sessionsNeeded = rosterSize * numTracks;
    const sessionsAvailable = days * sessionsPerDay;
    
    const box = document.getElementById('coverage-box');
    const verdict = document.getElementById('coverage-verdict');
    const details = document.getElementById('coverage-details');
    const btn = document.getElementById('btn-confirm-config');
    
    if (rosterSize === 0 || numTracks === 0) {
        box.style.background = '#E5E7EB';
        verdict.innerText = 'Coverage Status';
        details.innerText = 'Waiting for roster and language selection...';
        btn.disabled = true;
        return;
    }
    
    if (sessionsAvailable >= sessionsNeeded) {
        box.style.background = '#f0fdf4'; // Light green
        verdict.innerText = '✅ Covered';
        details.innerText = `You need ${sessionsNeeded} sessions this month. Your chosen slot provides ${sessionsAvailable} sessions.`;
        btn.disabled = false;
    } else {
        box.style.background = '#fef2f2'; // Light red
        verdict.innerText = '❌ Not Covered';
        details.innerText = `You need ${sessionsNeeded} sessions, but only have ${sessionsAvailable} available. Try widening the slot or staggering tracks.`;
        btn.disabled = true; // Force adjustment
    }
}

// Bind live updates
['config-roster', 'config-cadence', 'config-slot'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateCoverage);
    document.getElementById(id).addEventListener('change', updateCoverage);
});
['track-en', 'track-gj'].forEach(id => {
    document.getElementById(id).addEventListener('change', updateCoverage);
});

document.getElementById('btn-confirm-config').onclick = () => {
    const config = {
        grade: document.getElementById('config-grade').value,
        division: document.getElementById('config-division').value,
        tracks: {
            en: document.getElementById('track-en').checked,
            gj: document.getElementById('track-gj').checked
        },
        cadence: document.getElementById('config-cadence').value,
        slot: document.getElementById('config-slot').value
    };
    saveConfig(config);
    importRoster(document.getElementById('config-roster').value);
    renderHome();
};

// ==========================================
// SCREEN 01: HOME (ROSTER)
// ==========================================
function renderHome() {
    showScreen(screens.HOME);
    const students = getStudents();
    const upNextSection = document.getElementById('up-next-section');
    const queueSection = document.getElementById('queue-section');
    
    // Progress Bar
    const completed = students.filter(s => s.dailyStatus === 'done').length;
    document.getElementById('progress-bar-fill').style.width = `${(completed / students.length) * 100}%`;
    
    const nextStudent = students.find(s => s.dailyStatus === 'waiting');
    currentStudent = nextStudent;
    
    // Up Next Card
    if (nextStudent) {
        upNextSection.innerHTML = `
            <div class="card up-next-card">
                <div class="avatar-placeholder"></div>
                <h2>${nextStudent.name}</h2>
                <p>Roll No. ${nextStudent.id}</p>
                <div style="display:flex; gap:16px; justify-content:center;">
                    <button class="btn-primary" onclick="startSession()">Start Reading</button>
                    <button class="btn-secondary" onclick="updateStudentStatus('${nextStudent.id}', 'absent'); renderHome();">Mark Absent</button>
                </div>
            </div>
        `;
    } else {
        upNextSection.innerHTML = `<h2>All done for today!</h2><button class="btn-secondary" onclick="resetDailyQueue(); renderHome();">Reset Queue</button>`;
    }
    
    // Queue Chips
    queueSection.innerHTML = '';
    students.forEach(s => {
        const chip = document.createElement('div');
        chip.className = `chip status-${s.dailyStatus}`;
        chip.innerText = s.name;
        chip.onclick = () => {
            if (s.dailyStatus !== 'waiting') { updateStudentStatus(s.id, 'waiting'); renderHome(); }
        };
        queueSection.appendChild(chip);
    });
}

// Teacher Dashboard (PIN Gated)
window.switchDashboardTab = function(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    document.getElementById(`tab-${tabId}`).classList.add('active');
};

window.renderTeacherDashboard = function() {
    document.getElementById('teacher-dashboard-modal').classList.remove('hidden');
    const students = getStudents();
    
    // Tab C: Log
    const tbody = document.querySelector('#log-table tbody');
    tbody.innerHTML = '';
    students.forEach(s => {
        s.sessions.forEach(sess => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${new Date(sess.timestamp).toLocaleDateString()}</td>
                            <td>${s.name}</td>
                            <td>L${sess.resultLevel}</td>
                            <td>${sess.readPassed ? 'Pass' : 'Fail'}</td>
                            <td>${sess.meaningPassed ? 'Pass' : 'Fail'}</td>
                            <td>L${sess.resultLevel}</td>`;
            tbody.appendChild(tr);
        });
    });

    // Tab B: Class Report
    const completed = students.filter(s => s.dailyStatus === 'done').length;
    let classHtml = `<div class="dashboard-stats">
                        <div class="stat-card"><h3>${completed}</h3><p>Assessed this window</p></div>
                        <div class="stat-card" style="background:var(--accent);"><h3>${students.length - completed}</h3><p>Pending / Absent</p></div>
                     </div>
                     <h3 style="margin-bottom:16px;">Level Distribution</h3>`;
    students.forEach(s => {
        classHtml += `<div class="dash-student-card">
                        <div>
                            <h2>${s.name}</h2>
                        </div>
                        <div style="display:flex; align-items:center; background:#E5E7EB; border-radius:50px; padding:8px;">
                            <button class="btn-secondary lvl-btn" onclick="setStudentLevel('${s.id}', ${s.currentLevel - 1}); renderTeacherDashboard();">-</button>
                            <span style="font-size:24px; font-weight:900; margin:0 16px;">L${s.currentLevel}</span>
                            <button class="btn-secondary lvl-btn" onclick="setStudentLevel('${s.id}', ${s.currentLevel + 1}); renderTeacherDashboard();">+</button>
                        </div>
                     </div>`;
    });
    document.getElementById('tab-class').innerHTML = classHtml;
    
    // Tab A: Student Report
    const select = document.getElementById('student-select');
    select.innerHTML = '<option>Select a student...</option>';
    students.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id; opt.innerText = s.name;
        select.appendChild(opt);
    });
    
    select.onchange = () => {
        const student = students.find(s => s.id === select.value);
        if(!student) return;
        
        let detHtml = `<h2>${student.name} - Currently L${student.currentLevel}</h2>
                       <h3 style="margin-top:24px; margin-bottom:16px;">Recent Trajectory</h3>`;
        if (student.sessions.length === 0) detHtml += `<p>No sessions yet.</p>`;
        student.sessions.slice(-5).forEach(sess => {
            detHtml += `<div class="card" style="margin-bottom:8px;">
                            <p>${new Date(sess.timestamp).toLocaleDateString()} | Read: ${sess.readPassed?'✅':'❌'} | Meaning: ${sess.meaningPassed?'✅':'❌'} | ➡️ L${sess.resultLevel}</p>
                        </div>`;
        });
        document.getElementById('student-details').innerHTML = detHtml;
    };
};

window.exportToCSV = function() {
    let csv = "Date,Student,Level,Accuracy,Meaning,Result Lvl\n";
    const students = getStudents();
    students.forEach(s => {
        s.sessions.forEach(sess => {
            csv += `${new Date(sess.timestamp).toLocaleDateString()},${s.name},L${sess.resultLevel},${sess.readPassed ? 'Pass' : 'Fail'},${sess.meaningPassed ? 'Pass' : 'Fail'},L${sess.resultLevel}\n`;
        });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'miko_orf_log.csv');
    a.click();
};

document.getElementById('btn-teacher-dashboard-trigger').onclick = () => {
    const pin = prompt("Enter Teacher PIN to view scores (hint: 1234):");
    if (pin === '1234') renderTeacherDashboard();
};
document.getElementById('btn-close-dashboard').onclick = () => document.getElementById('teacher-dashboard-modal').classList.add('hidden');

// Start Session
window.startSession = function() {
    if(!currentStudent) return;
    playPop();
    showScreen(screens.TRANSITION);
    setMikoState('encouraging');
    
    currentSessionData = getContentForLevel(currentStudent.currentLevel);
    sessionStats = { readPassed: false, meaningPassed: false, wcpm: 0 };
    activityPhase = 'READING';
    
    document.getElementById('transition-greeting').innerText = `Hi ${currentStudent.name}!`;
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
    screens.ACTIVITY.innerHTML = '';
    retryCount = 0;
    
    // Teacher Controls Overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute'; overlay.style.top = '16px'; overlay.style.left = '16px';
    overlay.innerHTML = `<button class="btn-secondary" onclick="alert('Session Paused')">Pause</button>
                         <button class="btn-secondary" onclick="renderHome()">End Session</button>`;
    screens.ACTIVITY.appendChild(overlay);
    
    if (activityPhase === 'READING') {
        const lvl = currentSessionData.level;
        if (lvl === 1) { 
            const types = ['WORD_READ_TEXT', 'WORD_READ_NONWORD', 'WORD_READ_MINIMAL_PAIR', 'WORD_READ_SET'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            if (type === 'WORD_READ_NONWORD') {
                speak("Read this made up word.");
                renderTextTask('word-text', currentSessionData.nonwords);
            } else if (type === 'WORD_READ_MINIMAL_PAIR') {
                const pair = currentSessionData.minimalPairs[Math.floor(Math.random() * currentSessionData.minimalPairs.length)];
                speak(`Read the word: ${pair.target}`);
                
                const card = document.createElement('div'); card.className = 'reading-card';
                card.style.display = 'flex'; card.style.justifyContent = 'space-around';
                pair.options.forEach(opt => {
                    const div = document.createElement('div'); div.className = 'word-text'; div.innerText = opt;
                    card.appendChild(div);
                });
                const mic = createMicButton(pair.target, handleReadComplete);
                screens.ACTIVITY.appendChild(card); screens.ACTIVITY.appendChild(mic);
                
            } else if (type === 'WORD_READ_SET') {
                speak("Read these words out loud.");
                renderTextTask('sentence-text', currentSessionData.wordSets);
            } else {
                speak("Read the word out loud."); 
                renderTextTask('word-text', currentSessionData.words); 
            }
        }
        else if (lvl === 2) { 
            const types = ['SENTENCE_READ_TEXT', 'SENTENCE_READ_SET', 'SENTENCE_READ_CLOZE'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            if (type === 'SENTENCE_READ_SET') {
                speak("Read these sentences out loud.");
                renderTextTask('passage-text', currentSessionData.sentenceSets);
            } else if (type === 'SENTENCE_READ_CLOZE') {
                const cloze = currentSessionData.clozeSentences[Math.floor(Math.random() * currentSessionData.clozeSentences.length)];
                speak("Read the sentence and fill in the blank.");
                const card = document.createElement('div'); card.className = 'reading-card';
                const div = document.createElement('div'); div.id = 'text-display'; div.className = 'sentence-text'; 
                div.innerHTML = `${cloze.sentence} <span style="border-bottom: 4px solid var(--text-color); width: 80px; display: inline-block;"></span>`;
                card.appendChild(div);
                const mic = createMicButton(`${cloze.sentence} ${cloze.target}`, handleReadComplete);
                screens.ACTIVITY.appendChild(card); screens.ACTIVITY.appendChild(mic);
            } else {
                speak("Read the sentence out loud."); 
                renderTextTask('sentence-text', currentSessionData.sentences); 
            }
        }
        else { speak("Let's read this story."); storyStartTime = Date.now(); renderStoryTask(); }
    } else {
        speak("Tap the correct picture.");
        renderMeaningTask();
    }
}

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
        
        triggerCelebration();
    }
}

// --- Task Renderers ---
function createMicButton(targetText, onComplete) {
    const wrapper = document.createElement('div'); wrapper.className = 'mic-wrapper';
    const micBtn = document.createElement('div'); micBtn.className = 'mic-btn'; micBtn.innerHTML = '🎤';
    
    // Manual Override container
    const overrideContainer = document.createElement('div');
    overrideContainer.style.display = 'none'; overrideContainer.style.marginTop = '16px';
    overrideContainer.innerHTML = `
        <button id="override-pass" class="btn-primary" style="font-size:20px; padding:12px 24px;">Manual Pass</button>
        <button id="override-fail" class="btn-secondary" style="font-size:20px; padding:12px 24px;">Manual Fail</button>
    `;
    
    wrapper.appendChild(micBtn);
    wrapper.appendChild(overrideContainer);
    
    const startListening = () => {
        micBtn.classList.add('listening');
        setMikoState('listening');
        playChime();
        
        SpeechEngine.listen(targetText, (passed) => {
            micBtn.classList.remove('listening');
            setMikoState('thinking');
            
            if (passed === 'NO_STT') {
                setMikoState('encouraging');
                overrideContainer.style.display = 'block';
                document.getElementById('override-pass').onclick = () => onComplete(true);
                document.getElementById('override-fail').onclick = () => onComplete(false);
                return;
            }
            
            if(passed) {
                setMikoState('celebrating');
                playSuccess(); onComplete(true);
            } else {
                if(retryCount === 0) {
                    retryCount++; 
                    speak("Let's try that one again.", () => startListening());
                } else {
                    setMikoState('encouraging');
                    playPop(); retryCount = 0; onComplete(false);
                }
            }
        }, (interim) => {
            // Soft pointer logic for interim highlighting
            const display = document.getElementById('text-display');
            if (display) {
                const words = targetText.split(' ');
                const interimWords = interim.split(' ').length;
                const highlightIndex = Math.min(interimWords, words.length) - 1;
                if(highlightIndex >= 0) {
                    const html = words.map((w, i) => i === highlightIndex ? `<span class="highlight">${w}</span>` : w).join(' ');
                    display.innerHTML = html;
                }
            }
        });
    };

    if (isSpeaking) window.addEventListener('miko-done-speaking', startListening, {once: true});
    else startListening();

    return wrapper;
}

function handleReadComplete(passed) {
    sessionStats.readPassed = passed;
    setTimeout(() => {
        if(!isSpeaking) autoAdvanceSession();
        else window.addEventListener('miko-done-speaking', autoAdvanceSession, {once: true});
    }, 1500);
}

function renderTextTask(textClass, dataArray) {
    const text = dataArray[Math.floor(Math.random() * dataArray.length)];
    const card = document.createElement('div'); card.className = 'reading-card';
    const div = document.createElement('div'); div.id = 'text-display'; div.className = textClass; div.innerText = text;
    card.appendChild(div);
    const mic = createMicButton(text, handleReadComplete);
    screens.ACTIVITY.appendChild(card); screens.ACTIVITY.appendChild(mic);
}

function renderStoryTask() {
    const card = document.createElement('div'); card.className = 'reading-card';
    const text = currentSessionData.story.text;
    const div = document.createElement('div'); div.id = 'text-display'; div.className = 'passage-text'; div.innerText = text;
    card.appendChild(div);
    
    const mic = createMicButton(text, (passed) => {
        if(currentSessionData.level === 4) {
            let min = (Date.now() - storyStartTime) / 60000;
            if(passed) sessionStats.wcpm = Math.round((text.split(' ').length) / min);
        }
        handleReadComplete(passed);
    });
    screens.ACTIVITY.appendChild(card); screens.ACTIVITY.appendChild(mic);
}

function renderMeaningTask() {
    let bank = currentSessionData.vocabBank || currentSessionData.comprehensionBank;
    let data = (bank && bank.length > 0) ? bank[Math.floor(Math.random() * bank.length)] : (currentSessionData.vocab || currentSessionData.comprehension);
    speak(data.audioLabel);
    
    let rawCorrectValue = data.options[data.correctIndex];
    let isObjectOption = typeof rawCorrectValue === 'object';
    let correctIdentity = isObjectOption ? rawCorrectValue.value : rawCorrectValue;
    let shuffledOptions = [...data.options].sort(() => Math.random() - 0.5);
    
    const grid = document.createElement('div'); grid.className = 'meaning-grid';
    shuffledOptions.forEach((opt) => {
        const card = document.createElement('div'); card.className = 'meaning-card';
        let optValue = typeof opt === 'object' ? opt.value : opt;
        let optType = typeof opt === 'object' ? opt.type : 'image';
        
        if (optType === 'image') {
            const img = document.createElement('img'); img.src = optValue; card.appendChild(img);
        } else {
            const txt = document.createElement('h3'); txt.innerText = optValue; card.appendChild(txt);
        }
        
        card.onclick = () => {
            if(isSpeaking) return;
            playChime();
            if(optValue === correctIdentity) {
                card.classList.add('selected'); playSuccess();
                sessionStats.meaningPassed = true;
                setMikoState('celebrating');
            } else { sessionStats.meaningPassed = false; }
            
            setTimeout(() => {
                if(!isSpeaking) autoAdvanceSession();
                else window.addEventListener('miko-done-speaking', autoAdvanceSession, {once: true});
            }, 1500);
        };
        grid.appendChild(card);
    });
    screens.ACTIVITY.appendChild(grid);
}

// Celebration Sequence
function triggerCelebration() {
    showScreen(screens.END);
    playSuccess();
    setMikoState('celebrating');
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    for(let i=0; i<50; i++) {
        const c = document.createElement('div'); c.className = 'confetti';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.animationDuration = (Math.random() * 2 + 2) + 's';
        c.style.animationDelay = Math.random() * 2 + 's';
        c.style.backgroundColor = ['#7ED957', '#FFC857', '#5B7CFA'][Math.floor(Math.random()*3)];
        container.appendChild(c);
    }
}

// Init App
const savedConfig = getConfig();
if (!savedConfig) {
    showScreen(screens.CONFIG);
    updateCoverage();
} else {
    renderHome();
}
