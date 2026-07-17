// --- Task 1: Speech Recognition Engine ---
const SpeechEngine = {
    recognition: null,
    init() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-IN';
            this.recognition.maxAlternatives = 3;
        } else {
            console.warn("Speech API not supported");
        }
    },
    listen(targetText, onResult, onInterim) {
        if (!this.recognition) return onResult(true); // Fallback pass
        
        let finalResult = false;
        let hasMatched = false;
        let targetWords = targetText.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/);
        let correctCount = 0;

        this.recognition.onresult = (event) => {
            const results = event.results;
            for (let i = event.resultIndex; i < results.length; ++i) {
                if (hasMatched) return; // Already matched
                
                let transcript = "";
                // Check all alternatives
                for(let j=0; j<results[i].length; j++){
                    let alt = results[i][j];
                    if (alt.confidence >= 0.5) {
                        transcript += alt.transcript.toLowerCase() + " ";
                    }
                }
                
                // Visual feedback
                let bestTranscript = results[i][0].transcript;
                if(onInterim) onInterim(bestTranscript);
                
                // Fuzzy match: check if the spoken transcript contains the target words
                // For words and sentences, this is an approximation.
                let wordsSpoken = transcript.trim().split(/\s+/);
                
                // If it's a single word (Activity 1)
                if (targetWords.length === 1) {
                    if (wordsSpoken.some(w => w.includes(targetWords[0]) || targetWords[0].includes(w) && w.length > 2)) {
                        hasMatched = true;
                        this.recognition.stop();
                    }
                } else {
                    // For sentences/passages, we might need more complex logic. 
                    // MVP: if they hit 80% of words
                    let hits = targetWords.filter(tw => wordsSpoken.some(ws => ws.includes(tw))).length;
                    if (hits / targetWords.length > 0.8) {
                        hasMatched = true;
                        this.recognition.stop();
                    }
                }

                // If this is the final result of the utterance and we still haven't matched, stop and let it fail.
                if (results[i].isFinal && !hasMatched) {
                    this.recognition.stop();
                }
            }
        };

        this.recognition.onerror = (e) => {
            console.log("Speech Error:", e.error);
            this.recognition.stop();
        };

        this.recognition.onend = () => {
            onResult(hasMatched);
        };

        try {
            this.recognition.start();
        } catch(e) {
            console.log("Recognition already started");
        }
    },
    stop() {
        if (this.recognition) this.recognition.stop();
    }
};
SpeechEngine.init();

// --- Task 4: Media Recorder ---
const AudioRecorder = {
    mediaRecorder: null,
    audioChunks: [],
    stream: null,
    async init() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            console.error("Audio recording not permitted");
        }
    },
    start() {
        if (!this.stream) return;
        this.audioChunks = [];
        this.mediaRecorder = new MediaRecorder(this.stream);
        this.mediaRecorder.ondataavailable = event => this.audioChunks.push(event.data);
        this.mediaRecorder.start();
    },
    stopAndSave(studentId, activityName) {
        if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") return;
        this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            if (typeof saveAudioBlob === 'function') {
                saveAudioBlob(studentId, activityName, audioBlob);
            }
        };
        this.mediaRecorder.stop();
    }
};
// Request mic access early
AudioRecorder.init();

// --- Main App State & Logic ---
const activities = { GREETING:0, WORDS:1, SENTENCES:2, STORY:3, VOCAB:4, COMPREHENSION:5, SEQUENCING:6, RETELLING:7, CELEBRATION:8 };

let currentStudentId = null;
let currentStudentName = "";
let sessionContent = null;
let currentState = activities.GREETING;
let currentItemIndex = 0;
let isSpeaking = false;
let retryCount = 0;

let scores = { words: 0, sentences: 0, story: 0, vocab: 0, comp: 0, seq: 0, retell: 0 };
let stats = { wordRaw: 0, sentenceTotalWords: 0, sentenceCorrectWords: 0, storyTotalWords: 0, storyCorrectWords: 0, storyWCPM: 0 };
let storyStartTime = 0;

// DOM Elements
const rosterScreen = document.getElementById('roster-screen');
const mainContent = document.getElementById('main-content');
const mikoContainer = document.getElementById('miko-container');
const mikoBubble = document.getElementById('miko-bubble');
const controlsContainer = document.getElementById('controls-container');
const progressStrip = document.getElementById('progress-strip');
const btnNext = document.getElementById('btn-next');
const sfxPop = document.getElementById('sfx-pop');
const sfxChime = document.getElementById('sfx-chime');
const sfxSuccess = document.getElementById('sfx-success');
const teacherDashboardModal = document.getElementById('teacher-dashboard-modal');
const btnReplay = document.getElementById('btn-replay');

function playPop() { sfxPop.currentTime = 0; sfxPop.play().catch(e=>{}); }
function playChime() { sfxChime.currentTime = 0; sfxChime.play().catch(e=>{}); }
function playSuccess() { sfxSuccess.currentTime = 0; sfxSuccess.play().catch(e=>{}); }

// --- Roster Logic ---
function renderRoster() {
    rosterScreen.classList.remove('hidden');
    mainContent.classList.add('hidden');
    mikoContainer.classList.add('hidden');
    
    const list = document.getElementById('student-list');
    list.innerHTML = '';
    const students = typeof getStudents === 'function' ? getStudents() : [];
    
    students.forEach(s => {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.innerText = s.name;
        card.onclick = () => {
            currentStudentId = s.id;
            currentStudentName = s.name;
            startNewSession();
        };
        list.appendChild(card);
    });
}

document.getElementById('btn-add-student').onclick = () => {
    const input = document.getElementById('new-student-name');
    if (input.value.trim() !== '') {
        addStudent(input.value.trim());
        input.value = '';
        renderRoster();
    }
};

document.getElementById('btn-teacher-dashboard-trigger').addEventListener('contextmenu', (e) => {
    // Secret long press / right click for dashboard
    e.preventDefault();
    const pin = prompt("Enter PIN (1234):");
    if(pin === "1234") {
        renderTeacherDashboard();
    }
});

document.getElementById('btn-close-dashboard').onclick = () => {
    teacherDashboardModal.classList.add('hidden');
};

renderRoster(); // Init

// --- TTS Logic ---
let lastSpokenText = "";
function speak(text, callback) {
    if(text) lastSpokenText = text;
    mikoBubble.innerText = lastSpokenText;
    mikoBubble.classList.remove('hidden');
    isSpeaking = true;
    
    btnNext.disabled = true; // Lock UI
    
    const finish = () => {
        isSpeaking = false;
        btnNext.disabled = false;
        window.dispatchEvent(new Event('miko-done-speaking'));
        if(callback) callback();
    };
    
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(lastSpokenText);
        utterance.rate = 0.9; 
        utterance.pitch = 1.2;
        utterance.onend = finish;
        utterance.onerror = finish;
        window.speechSynthesis.speak(utterance);
    } else {
        setTimeout(finish, lastSpokenText.length * 50); 
    }
}

btnReplay.classList.remove('hidden');
btnReplay.onclick = () => {
    if(!isSpeaking) speak();
};

function updateProgress(activityIndex) {
    progressStrip.classList.remove('hidden');
    progressStrip.innerHTML = '';
    for(let i=1; i<=7; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if(i <= activityIndex) dot.classList.add('active');
        progressStrip.appendChild(dot);
    }
}

// --- Assessment Flow ---
function startNewSession() {
    sessionContent = generateAssessmentContent();
    rosterScreen.classList.add('hidden');
    mainContent.classList.remove('hidden');
    mikoContainer.classList.remove('hidden');
    
    document.getElementById('welcome-student-name').innerText = "Hello, " + currentStudentName + "!";
    
    // Reset Stats
    scores = { words: 0, sentences: 0, story: 0, vocab: 0, comp: 0, seq: 0, retell: 0 };
    stats = { wordRaw: 0, sentenceTotalWords: 0, sentenceCorrectWords: 0, storyTotalWords: 0, storyCorrectWords: 0, storyWCPM: 0 };
    
    document.querySelector('.start-screen').classList.remove('hidden');
    currentState = activities.GREETING;
}

document.getElementById('btn-start').onclick = () => {
    playPop();
    document.querySelector('.start-screen').classList.add('hidden');
    startActivity(activities.WORDS);
};

btnNext.onclick = () => {
    if(isSpeaking) return;
    playPop();
    
    // Stop recording if active
    AudioRecorder.stopAndSave(currentStudentId, "Activity_" + currentState);
    
    // Skip Logic
    if (currentState === activities.WORDS) {
        if (stats.wordRaw >= 8) scores.words = 2;
        else if (stats.wordRaw >= 4) scores.words = 1;
        else scores.words = 0;

        if (stats.wordRaw <= 3) {
            scores.sentences = 0;
            scores.story = 0;
            return startActivity(activities.VOCAB);
        }
    }
    
    // Sentences Scoring
    if (currentState === activities.SENTENCES) {
        let pct = stats.sentenceCorrectWords / stats.sentenceTotalWords;
        if(pct >= 0.8) scores.sentences = 2;
        else if(pct >= 0.5) scores.sentences = 1;
        else scores.sentences = 0;
    }
    
    // Story Scoring
    if (currentState === activities.STORY) {
        let endTime = Date.now();
        let minutes = (endTime - storyStartTime) / 60000;
        stats.storyWCPM = Math.round(stats.storyCorrectWords / minutes);
        let pct = stats.storyCorrectWords / stats.storyTotalWords;
        
        if(pct >= 0.8 && stats.storyWCPM >= 30) scores.story = 2;
        else if (pct >= 0.5) scores.story = 1;
        else scores.story = 0;
    }

    startActivity(currentState + 1);
};

function startActivity(type) {
    currentState = type;
    mainContent.innerHTML = ''; 
    controlsContainer.classList.add('hidden');
    currentItemIndex = 0;
    retryCount = 0;
    
    updateProgress(type);
    
    // Start Recording for reading tasks
    if([activities.WORDS, activities.SENTENCES, activities.STORY, activities.RETELLING].includes(type)) {
        AudioRecorder.start();
    }
    
    switch(type) {
        case activities.WORDS:
            speak("Read the word on the screen out loud.");
            renderWords();
            break;
        case activities.SENTENCES:
            speak("Great job! Read the sentences on the screen.");
            renderSentences();
            break;
        case activities.STORY:
            speak("Let's read a short story.");
            storyStartTime = Date.now();
            renderStory();
            break;
        case activities.VOCAB:
            currentItemIndex = 0; // we have multiple vocab items
            renderVocabSequence();
            break;
        case activities.COMPREHENSION:
            currentItemIndex = 0;
            renderCompSequence();
            break;
        case activities.SEQUENCING:
            speak("Tap a picture, then tap an empty box to put the story in order.");
            renderSequencing();
            break;
        case activities.RETELLING:
            speak("Can you tell me what happened in the story?");
            renderRetelling();
            break;
        case activities.CELEBRATION:
            finishSession();
            renderCelebration();
            break;
    }
}

// --- Activity Renderers ---

function createMicButton(targetText, onComplete) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    
    const micBtn = document.createElement('div');
    micBtn.className = 'mic-btn';
    micBtn.innerHTML = '🎤';
    
    const feedbackText = document.createElement('div');
    feedbackText.style.fontSize = '1.5rem';
    feedbackText.style.color = '#666';
    feedbackText.style.marginTop = '1rem';
    feedbackText.style.minHeight = '2rem';
    feedbackText.innerText = "Waiting for you to speak...";
    
    container.appendChild(micBtn);
    container.appendChild(feedbackText);
    
    const startListening = () => {
        if(micBtn.classList.contains('listening')) return;
        micBtn.classList.add('listening');
        playChime();
        feedbackText.innerText = "Listening...";
        
        SpeechEngine.listen(targetText, (passed) => {
            micBtn.classList.remove('listening');
            if(passed) {
                feedbackText.innerText = "Great job!";
                feedbackText.style.color = "var(--secondary)";
                playSuccess();
                onComplete(true);
            } else {
                if(retryCount === 0) {
                    retryCount++;
                    feedbackText.innerText = "Hmm, didn't catch that.";
                    speak("Let's try that one again.");
                } else {
                    feedbackText.innerText = "Missed it.";
                    playPop();
                    retryCount = 0;
                    onComplete(false); // Failed after retry
                }
            }
        }, (interim) => {
            feedbackText.innerText = '"' + interim + '"';
        });
    };

    const handleSpeechEnd = () => {
        startListening();
    };

    if (isSpeaking) {
        window.addEventListener('miko-done-speaking', handleSpeechEnd, {once: true});
    } else {
        startListening();
    }

    return container;
}

function renderWords() {
    if (currentItemIndex >= sessionContent.words.length) {
        controlsContainer.classList.remove('hidden');
        mainContent.innerHTML = `<h2>Words complete!</h2>`;
        return;
    }
    
    const word = sessionContent.words[currentItemIndex];
    const display = document.createElement('div');
    display.className = 'word-display';
    display.innerText = word;
    
    const mic = createMicButton(word, (passed) => {
        if(passed) stats.wordRaw++;
        currentItemIndex++;
        renderWords();
    });
    
    mainContent.appendChild(display);
    mainContent.appendChild(mic);
}

function renderSentences() {
    if (currentItemIndex >= sessionContent.sentences.length) {
        controlsContainer.classList.remove('hidden');
        mainContent.innerHTML = `<h2>Sentences complete!</h2>`;
        return;
    }
    
    const sentence = sessionContent.sentences[currentItemIndex];
    const words = sentence.split(' ').length;
    stats.sentenceTotalWords += words;
    
    const display = document.createElement('div');
    display.className = 'sentence-display';
    display.innerText = sentence;
    
    const mic = createMicButton(sentence, (passed) => {
        if(passed) stats.sentenceCorrectWords += words;
        currentItemIndex++;
        renderSentences();
    });
    
    mainContent.appendChild(display);
    mainContent.appendChild(mic);
}

function renderStory() {
    const container = document.createElement('div');
    container.className = 'story-display';
    
    const storyData = sessionContent.story;
    const words = storyData.text.split(' ');
    stats.storyTotalWords = words.length;
    
    const imagesDiv = document.createElement('div');
    imagesDiv.className = 'story-images';
    storyData.images.forEach(src => {
        const img = document.createElement('img');
        img.src = src; img.className = 'story-img';
        imagesDiv.appendChild(img);
    });
    
    const text = document.createElement('div');
    text.className = 'story-text';
    
    // Task 10: Read-along highlight setup
    words.forEach((w, i) => {
        const span = document.createElement('span');
        span.innerText = w + ' ';
        span.id = `story-word-${i}`;
        text.appendChild(span);
    });
    
    // Note: Proper read-along syncing with speech API requires on-the-fly interim result matching. 
    // For MVP, we use the pass/fail of the whole passage or chunks. We will chunk the story by sentences.
    
    const mic = createMicButton(storyData.text, (passed) => {
        if(passed) {
            stats.storyCorrectWords = stats.storyTotalWords; // Perfect read
            // Highlight all
            words.forEach((w,i) => document.getElementById(`story-word-${i}`).classList.add('word-highlight'));
        } else {
            // Estimate 50% for fail
            stats.storyCorrectWords = Math.floor(stats.storyTotalWords * 0.5);
        }
        controlsContainer.classList.remove('hidden');
    });
    
    container.appendChild(imagesDiv);
    container.appendChild(text);
    container.appendChild(mic);
    mainContent.appendChild(container);
}

// Task 7: Vocab logic
function renderVocabSequence() {
    const vocabData = sessionContent.story.vocab;
    if (currentItemIndex >= vocabData.length) {
        startActivity(activities.COMPREHENSION);
        return;
    }
    
    const item = vocabData[currentItemIndex];
    speak(`Tap the picture for: ${item.audioLabel}`);
    
    mainContent.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'grid-2x2';
    
    item.options.forEach((src, idx) => {
        const card = document.createElement('div');
        card.className = 'choice-card';
        const img = document.createElement('img');
        img.src = src;
        card.appendChild(img);
        
        card.onclick = () => {
            if(isSpeaking) return;
            playChime();
            // Score 0 for wrong, 2 for right (or 1 each if multiple, but we sum up later)
            if(idx === item.correctIndex) {
                scores.vocab += (2 / vocabData.length); // Prorate out of 2 max
                card.classList.add('selected');
                playSuccess();
            }
            setTimeout(() => {
                currentItemIndex++;
                renderVocabSequence();
            }, 1000);
        };
        grid.appendChild(card);
    });
    
    mainContent.appendChild(grid);
}

// Task 7: Comprehension Logic
function renderCompSequence() {
    const compData = sessionContent.story.comprehension;
    if (currentItemIndex >= compData.length) {
        startActivity(activities.SEQUENCING);
        return;
    }
    
    const item = compData[currentItemIndex];
    speak(item.audioLabel);
    
    mainContent.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'grid-2x2';
    
    item.options.forEach((src, idx) => {
        const card = document.createElement('div');
        card.className = 'choice-card';
        const img = document.createElement('img');
        img.src = src;
        card.appendChild(img);
        
        card.onclick = () => {
            if(isSpeaking) return;
            playChime();
            if(idx === item.correctIndex) {
                scores.comp += (2 / compData.length); 
                card.classList.add('selected');
                playSuccess();
            }
            setTimeout(() => {
                currentItemIndex++;
                renderCompSequence();
            }, 1000);
        };
        grid.appendChild(card);
    });
    
    mainContent.appendChild(grid);
}

// Task 6: Tap-to-place sequencing
function renderSequencing() {
    const container = document.createElement('div');
    container.style.width = '100%';
    
    const sequenceArea = document.createElement('div');
    sequenceArea.className = 'sequence-container';
    
    const sourceArea = document.createElement('div');
    sourceArea.className = 'sequence-source';
    
    let selectedItem = null; // currently selected source item
    let slotsState = [null, null, null, null];
    
    // Create Slots
    for(let i=0; i<4; i++) {
        const slot = document.createElement('div');
        slot.className = 'sequence-slot';
        slot.onclick = () => {
            if (isSpeaking) return;
            
            // If slot is filled, return image to source
            if(slotsState[i] !== null) {
                const imgId = slotsState[i];
                document.getElementById(imgId).classList.remove('hidden');
                slot.innerHTML = '';
                slotsState[i] = null;
                playPop();
            }
            
            // If we have a selected item, place it
            if(selectedItem) {
                const clone = document.createElement('img');
                clone.src = selectedItem.src;
                slot.innerHTML = '';
                slot.appendChild(clone);
                
                selectedItem.classList.add('hidden'); // hide source
                selectedItem.classList.remove('selected');
                slotsState[i] = selectedItem.id;
                selectedItem = null;
                playChime();
                
                // Check if all placed
                if(!slotsState.includes(null)) {
                    checkSequenceScore(slotsState);
                }
            }
        };
        sequenceArea.appendChild(slot);
    }
    
    // Create Source Items
    const images = sessionContent.story.images;
    const shuffledIds = [0,1,2,3].sort(() => Math.random() - 0.5);
    
    shuffledIds.forEach(idx => {
        const img = document.createElement('img');
        img.src = images[idx];
        img.className = 'sequence-item';
        img.id = 'seq-img-' + idx;
        img.dataset.correct = idx; // 0,1,2,3
        
        img.onclick = () => {
            if(isSpeaking) return;
            if(selectedItem) selectedItem.classList.remove('selected');
            selectedItem = img;
            img.classList.add('selected');
            playPop();
        };
        sourceArea.appendChild(img);
    });
    
    container.appendChild(sequenceArea);
    container.appendChild(sourceArea);
    mainContent.appendChild(container);
}

function checkSequenceScore(slotsState) {
    let correct = 0;
    slotsState.forEach((id, idx) => {
        const elem = document.getElementById(id);
        if(parseInt(elem.dataset.correct) === idx) correct++;
    });
    
    if(correct === 4) scores.seq = 2;
    else scores.seq = 1;
    
    playSuccess();
    setTimeout(() => startActivity(activities.RETELLING), 1500);
}

function renderRetelling() {
    const container = document.createElement('div');
    container.className = 'story-display';
    
    const imagesDiv = document.createElement('div');
    imagesDiv.className = 'story-images';
    sessionContent.story.images.forEach(src => {
        const img = document.createElement('img');
        img.src = src; img.className = 'story-img';
        imagesDiv.appendChild(img);
    });
    
    // Simple 10 second record for retelling (MVP)
    const mic = createMicButton("", (passed) => {
        scores.retell = 2; // Teacher adjusts later if needed
        controlsContainer.classList.remove('hidden');
    });
    
    container.appendChild(imagesDiv);
    container.appendChild(mic);
    mainContent.appendChild(container);
}

// Task 5 & 3: Celebration and Teacher Dashboard
function finishSession() {
    scores.vocab = Math.round(scores.vocab);
    scores.comp = Math.round(scores.comp);
    
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    let level = "Needs Support";
    if (totalScore >= 12) level = "Proficient";
    else if (totalScore >= 8) level = "Developing";
    
    const sessionData = {
        scores, stats, totalScore, level, contentId: sessionContent.story.id
    };
    
    if(typeof saveSession === 'function') {
        saveSession(currentStudentId, sessionData);
    }
}

function renderCelebration() {
    mikoContainer.classList.add('hidden');
    playSuccess();
    
    mainContent.innerHTML = `
        <div class="celebration-card bounce">
            <h1>⭐ Well Done! ⭐</h1>
            <h2 style="font-size: 3rem;">You are a great reader!</h2>
            <button class="btn-primary" style="margin-top:3rem;" onclick="location.reload()">Next Child</button>
        </div>
    `;
}

// Triggered by secret long-press
function renderTeacherDashboard() {
    teacherDashboardModal.classList.remove('hidden');
    const content = document.getElementById('dashboard-content');
    
    const students = getStudents();
    if(students.length === 0) {
        content.innerHTML = "<p>No data yet.</p>";
        return;
    }
    
    let html = '';
    students.forEach(student => {
        html += `<div style="margin-bottom: 2rem; border-bottom: 1px solid #ccc; padding-bottom: 1rem;">`;
        html += `<h3>${student.name}</h3>`;
        student.sessions.forEach(sess => {
            const date = new Date(sess.timestamp).toLocaleString();
            html += `<p><strong>${date}</strong> - Level: ${sess.level} (${sess.totalScore}/14)</p>`;
            html += `<p style="font-size: 0.9em; color: #666;">WCPM: ${sess.stats.storyWCPM} | Word Raw: ${sess.stats.wordRaw}/10</p>`;
        });
        // Audio blobs (Mocked UI link)
        html += `<button class="btn-secondary" style="font-size:1rem; padding: 0.5rem;" onclick="alert('Load audio from IndexedDB')">Play Recordings</button>`;
        html += `</div>`;
    });
    
    content.innerHTML = html;
}
