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
// SCREEN 00: CONFIGURATION (ORF SETUP)
// ==========================================
let tempRoster = [];

function initSetupScreen() {
    const existingConfig = getConfig();
    const students = getStudents();
    
    if (students.length > 0) {
        tempRoster = students.map(s => s.name);
    } else {
        tempRoster = ["Aarav", "Meera", "Kunal", "Diya", "Riya"];
    }

    if (existingConfig) {
        if (existingConfig.grade) document.getElementById('config-grade').value = existingConfig.grade;
        if (existingConfig.division) document.getElementById('config-division').value = existingConfig.division;
        if (existingConfig.tracks) {
            document.getElementById('track-en').checked = !!existingConfig.tracks.en;
            document.getElementById('track-gj').checked = !!existingConfig.tracks.gj;
        }
        if (existingConfig.cadence) {
            const radio = document.querySelector(`input[name="cadence-radio"][value="${existingConfig.cadence}"]`);
            if (radio) {
                radio.checked = true;
                updateCadenceRadioUI(existingConfig.cadence);
            }
        }
        if (existingConfig.slot) document.getElementById('config-slot').value = existingConfig.slot;
        if (existingConfig.duration) document.getElementById('config-duration').value = existingConfig.duration;
    }

    renderRosterChips();
    updateCoverage();
}

function renderRosterChips() {
    const container = document.getElementById('roster-display-container');
    const badge = document.getElementById('roster-count-badge');
    badge.innerText = `${tempRoster.length} Students`;

    if (tempRoster.length === 0) {
        container.innerHTML = `<p class="text-muted" style="font-size: 0.95rem; margin: auto;">No students added yet. Click "Import Student List" or "Add Student".</p>`;
        return;
    }

    container.innerHTML = '';
    tempRoster.forEach((name, index) => {
        const chip = document.createElement('div');
        chip.className = 'roster-chip-item';
        chip.innerHTML = `
            <span>✓ ${name}</span>
            <button title="Edit name" onclick="editRosterStudent(${index})">✏️</button>
            <button title="Delete student" onclick="deleteRosterStudent(${index})">✕</button>
        `;
        container.appendChild(chip);
    });
}

function deleteRosterStudent(index) {
    tempRoster.splice(index, 1);
    renderRosterChips();
    updateCoverage();
}

function editRosterStudent(index) {
    const newName = prompt("Edit student name:", tempRoster[index]);
    if (newName && newName.trim()) {
        tempRoster[index] = newName.trim();
        renderRosterChips();
        updateCoverage();
    }
}

function updateCadenceRadioUI(selectedVal) {
    document.querySelectorAll('.m3-radio-card').forEach(card => card.classList.remove('active'));
    if (selectedVal === 'designated') {
        document.getElementById('cadence-option-designated').classList.add('active');
    } else {
        document.getElementById('cadence-option-rolling').classList.add('active');
    }
}

function updateCoverage() {
    const grade = document.getElementById('config-grade').value;
    const division = document.getElementById('config-division').value;
    const rosterSize = tempRoster.length;
    
    const trackEn = document.getElementById('track-en').checked;
    const trackGj = document.getElementById('track-gj').checked;
    const numTracks = (trackEn ? 1 : 0) + (trackGj ? 1 : 0);
    
    // Toggle helper text for language tracks
    const helperText = document.getElementById('language-helper-text');
    if (trackEn && trackGj) {
        helperText.style.display = 'block';
    } else {
        helperText.style.display = 'none';
    }

    const cadenceRadio = document.querySelector('input[name="cadence-radio"]:checked');
    const cadence = cadenceRadio ? cadenceRadio.value : 'designated';
    updateCadenceRadioUI(cadence);

    const slot = document.getElementById('config-slot').value;
    const duration = parseInt(document.getElementById('config-duration').value, 10) || 20;

    // Days per month logic
    const days = cadence === 'rolling' ? 20 : 5;

    // Capacity per day based on slot and duration
    let capacityPerDay = 4;
    if (slot === 'dedicated') {
        if (duration <= 10) capacityPerDay = 3;
        else if (duration <= 20) capacityPerDay = 6;
        else if (duration <= 30) capacityPerDay = 10;
        else capacityPerDay = 15;
    } else { // Lecture slots
        if (duration <= 10) capacityPerDay = 2;
        else if (duration <= 20) capacityPerDay = 4;
        else if (duration <= 30) capacityPerDay = 7;
        else capacityPerDay = 10;
    }

    const sessionsNeeded = rosterSize * numTracks;
    const sessionsAvailable = days * capacityPerDay;

    // Update Top Summary Checklist Card
    document.getElementById('summary-class').innerText = `${grade} - ${division}`;
    document.getElementById('summary-students').innerText = `${rosterSize} Students`;
    document.getElementById('summary-languages').innerText = (trackEn && trackGj) ? 'Gujarati + English' : (trackGj ? 'Gujarati' : (trackEn ? 'English' : 'None'));
    document.getElementById('summary-cadence').innerText = cadence === 'designated' ? '1 Week / Month' : 'Rolling';

    const summaryBadge = document.getElementById('summary-coverage-badge');
    
    // Update Right Side Panel Elements
    const box = document.getElementById('coverage-box');
    const statusIcon = document.getElementById('coverage-status-icon');
    const verdict = document.getElementById('coverage-verdict');
    const neededEl = document.getElementById('coverage-needed-count');
    const availableEl = document.getElementById('coverage-available-count');
    const statusMsg = document.getElementById('coverage-status-message');
    const details = document.getElementById('coverage-details');
    const suggestionsBox = document.getElementById('coverage-suggestions');
    const ctaBtn = document.getElementById('btn-complete-setup-trigger');

    neededEl.innerText = sessionsNeeded;
    availableEl.innerText = sessionsAvailable;

    const isCovered = (sessionsAvailable >= sessionsNeeded) && rosterSize > 0 && numTracks > 0;

    if (isCovered) {
        summaryBadge.className = 'badge-status status-ready';
        summaryBadge.innerText = '✅ Ready';

        box.style.background = 'var(--md-sys-color-success-container)';
        box.style.borderColor = '#A5D6A7';
        statusIcon.innerText = 'check_circle';
        statusIcon.className = 'material-icons-round text-success';
        verdict.innerText = 'Coverage Confirmation';
        statusMsg.innerText = '✅ Every child can be assessed.';
        details.innerText = 'Configuration looks good.';
        suggestionsBox.style.display = 'none';
    } else {
        summaryBadge.className = 'badge-status status-warning';
        summaryBadge.innerText = '⚠ Check Coverage';

        box.style.background = '#FFF8E1';
        box.style.borderColor = '#FFE082';
        statusIcon.innerText = 'warning';
        statusIcon.className = 'material-icons-round';
        statusIcon.style.color = '#F57F17';
        verdict.innerText = 'Coverage Confirmation';
        statusMsg.innerText = '⚠ Coverage may fall short.';
        details.innerText = `Needed: ${sessionsNeeded} | Available: ${sessionsAvailable}`;
        suggestionsBox.style.display = 'block';
    }

    // Bottom Sticky CTA disabled only if missing grade, division, roster, or languages
    const isValidBasic = grade && division && rosterSize > 0 && numTracks > 0;
    ctaBtn.disabled = !isValidBasic;
}

// Bind live updates for Setup Controls
['config-grade', 'config-division', 'config-slot', 'config-duration'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('change', updateCoverage);
        el.addEventListener('input', updateCoverage);
    }
});
['track-en', 'track-gj'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateCoverage);
});
document.querySelectorAll('input[name="cadence-radio"]').forEach(radio => {
    radio.addEventListener('change', updateCoverage);
});

// Import Roster Modal Handlers
document.getElementById('btn-import-roster').onclick = () => {
    document.getElementById('import-roster-textarea').value = tempRoster.join('\n');
    document.getElementById('import-roster-modal').classList.remove('hidden');
};
document.getElementById('btn-cancel-import').onclick = () => {
    document.getElementById('import-roster-modal').classList.add('hidden');
};
document.getElementById('btn-confirm-import').onclick = () => {
    const text = document.getElementById('import-roster-textarea').value.trim();
    if (text) {
        tempRoster = text.split('\n').map(n => n.trim()).filter(n => n);
        renderRosterChips();
        updateCoverage();
    }
    document.getElementById('import-roster-modal').classList.add('hidden');
};

// Add Single Student Handler
document.getElementById('btn-add-single-student').onclick = () => {
    const name = prompt("Enter student name:");
    if (name && name.trim()) {
        tempRoster.push(name.trim());
        renderRosterChips();
        updateCoverage();
    }
};

// Complete Setup Trigger & Dialog Handlers
document.getElementById('btn-complete-setup-trigger').onclick = () => {
    document.getElementById('confirm-setup-modal').classList.remove('hidden');
};
document.getElementById('btn-cancel-setup').onclick = () => {
    document.getElementById('confirm-setup-modal').classList.add('hidden');
};
document.getElementById('btn-confirm-complete-setup').onclick = () => {
    const cadenceRadio = document.querySelector('input[name="cadence-radio"]:checked');
    const config = {
        grade: document.getElementById('config-grade').value,
        division: document.getElementById('config-division').value,
        tracks: {
            en: document.getElementById('track-en').checked,
            gj: document.getElementById('track-gj').checked
        },
        cadence: cadenceRadio ? cadenceRadio.value : 'designated',
        slot: document.getElementById('config-slot').value,
        duration: document.getElementById('config-duration').value,
        setupCompleted: true
    };
    
    saveConfig(config);

    // Save roster to students storage
    const currentStudents = getStudents();
    tempRoster.forEach(name => {
        if (!currentStudents.find(s => s.name === name)) {
            currentStudents.push({
                id: Date.now().toString() + Math.floor(Math.random()*1000),
                name: name,
                currentLevel: 1,
                dailyStatus: 'waiting',
                sessions: []
            });
        }
    });
    saveStudents(currentStudents);

    document.getElementById('confirm-setup-modal').classList.add('hidden');
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
                <div class="avatar-placeholder" style="width: 80px; height: 80px; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; background: var(--md-sys-color-primary-container); border-radius: 50%;">
                    <span class="material-icons-round" style="font-size: 48px; color: var(--md-sys-color-primary);">face</span>
                </div>
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
    // Tab Settings / Configuration Summary
    const config = getConfig() || {};
    document.getElementById('settings-summary-class').innerText = `${config.grade || 'Grade 1'} - Division ${config.division || 'A'}`;
    document.getElementById('settings-summary-languages').innerText = (config.tracks && config.tracks.en && config.tracks.gj) ? 'Gujarati + English' : (config.tracks && config.tracks.gj ? 'Gujarati' : 'English');
    document.getElementById('settings-summary-cadence').innerText = config.cadence === 'designated' ? 'One Week Every Month' : 'Rolling Across Month';
    document.getElementById('settings-summary-slot').innerText = `${config.slot || 'Dedicated'} (${config.duration || '20'} min)`;
    document.getElementById('settings-summary-students').innerText = `${students.length} Students`;
};

// Reset Configuration Handlers
document.getElementById('btn-trigger-reset-config').onclick = () => {
    document.getElementById('reset-config-modal').classList.remove('hidden');
};
document.getElementById('btn-cancel-reset-config').onclick = () => {
    document.getElementById('reset-config-modal').classList.add('hidden');
};
document.getElementById('btn-confirm-reset-config').onclick = () => {
    const config = getConfig() || {};
    config.setupCompleted = false;
    saveConfig(config);

    document.getElementById('reset-config-modal').classList.add('hidden');
    document.getElementById('teacher-dashboard-modal').classList.add('hidden');
    
    showScreen(screens.CONFIG);
    initSetupScreen();
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
if (!savedConfig || savedConfig.setupCompleted === false) {
    showScreen(screens.CONFIG);
    initSetupScreen();
} else {
    renderHome();
}
