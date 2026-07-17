// State & Data
const activities = {
    GREETING: 0,
    WORDS: 1,
    SENTENCES: 2,
    STORY: 3,
    VOCAB: 4,
    COMPREHENSION: 5,
    SEQUENCING: 6,
    RESULT: 7
};

const wordBank = ["cat", "dog", "sun", "hat", "run", "jump", "blue", "tree", "bird", "play"];
const sentenceBank = [
    "The cat is on the mat.",
    "I can see the sun.",
    "He runs very fast.",
    "The little bird flies."
];
const storyText = "The orange cat was sleeping on a blue mat. A little blue bird flew to the window. The cat woke up and looked at the bird. They smiled at each other.";
const storyImages = ["assets/story_1.png", "assets/story_2.png", "assets/story_3.png", "assets/story_4.png"];

let currentState = activities.GREETING;
let scores = {
    words: 0, // out of 2
    sentences: 0, // out of 2
    story: 0, // out of 2
    vocab: 0, // out of 2
    comp: 0, // out of 2
    seq: 0, // out of 2
};

let currentItemIndex = 0;
let rawWordScore = 0; // count of correct words (0-10)
let isSpeaking = false;

// DOM Elements
const mikoBubble = document.getElementById('miko-bubble');
const mainContent = document.getElementById('main-content');
const controlsContainer = document.getElementById('controls-container');
const btnNext = document.getElementById('btn-next');
const sfxPop = document.getElementById('sfx-pop');
const sfxChime = document.getElementById('sfx-chime');
const sfxSuccess = document.getElementById('sfx-success');

// Audio Helpers
function playPop() { sfxPop.currentTime = 0; sfxPop.play().catch(e=>console.log(e)); }
function playChime() { sfxChime.currentTime = 0; sfxChime.play().catch(e=>console.log(e)); }
function playSuccess() { sfxSuccess.currentTime = 0; sfxSuccess.play().catch(e=>console.log(e)); }

function speak(text, callback) {
    mikoBubble.innerText = text;
    mikoBubble.classList.remove('hidden');
    
    isSpeaking = true;
    const finish = () => {
        isSpeaking = false;
        window.dispatchEvent(new Event('miko-done-speaking'));
        if(callback) callback();
    };
    
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for kids
        utterance.pitch = 1.2; // Higher pitch for "cute" robot voice
        utterance.onend = finish;
        utterance.onerror = finish;
        window.speechSynthesis.speak(utterance);
    } else {
        setTimeout(finish, text.length * 50); // mock timing
    }
}

// Initialization
document.getElementById('btn-start').addEventListener('click', () => {
    playPop();
    document.querySelector('.start-screen').classList.add('hidden');
    startActivity(activities.GREETING);
});

btnNext.addEventListener('click', () => {
    playPop();
    // Logic to move to next activity
    if (currentState === activities.WORDS) {
        // Calculate word score (0-2)
        if(rawWordScore >= 8) scores.words = 2;
        else if (rawWordScore >= 4) scores.words = 1;
        else scores.words = 0;

        // Skip logic: If child read 3 or fewer of the first 10 words correctly, skip sentence and passage reading
        if (rawWordScore <= 3) {
            console.log("Skip Logic Triggered. Jumping to picture tasks.");
            scores.sentences = 0;
            scores.story = 0;
            startActivity(activities.VOCAB);
            return;
        }
    }
    startActivity(currentState + 1);
});

function startActivity(activityType) {
    currentState = activityType;
    mainContent.innerHTML = ''; // Clear
    controlsContainer.classList.add('hidden');
    currentItemIndex = 0;
    
    switch(activityType) {
        case activities.GREETING:
            speak("Hello! I am Miko. Let's read some things together. Don't worry, just try your best!", () => {
                setTimeout(() => startActivity(activities.WORDS), 1000);
            });
            break;
            
        case activities.WORDS:
            rawWordScore = 0;
            speak("Read the word on the screen out loud.");
            renderWords();
            break;
            
        case activities.SENTENCES:
            speak("Great job! Now let's read some short sentences.");
            renderSentences();
            break;
            
        case activities.STORY:
            speak("You are doing wonderful! Let's read a short story.");
            renderStory();
            break;
            
        case activities.VOCAB:
            speak("Look at the pictures. Tap the picture of the 'Bird'.");
            renderVocab();
            break;
            
        case activities.COMPREHENSION:
            speak("Where was the cat sleeping? Tap the right picture.");
            renderComprehension();
            break;
            
        case activities.SEQUENCING:
            speak("Can you put the story in the right order? Drag the pictures.");
            renderSequencing();
            break;
            
        case activities.RESULT:
            renderResult();
            break;
    }
}

// --- Activity Renderers ---

function createMicButton(onComplete) {
    const micBtn = document.createElement('div');
    micBtn.className = 'mic-btn';
    micBtn.innerHTML = '🎤';
    
    const startListening = () => {
        if(micBtn.classList.contains('listening')) return;
        micBtn.classList.add('listening');
        playChime();
        
        micBtn.listeningTimeout = setTimeout(() => {
            if (micBtn.classList.contains('listening')) {
                micBtn.classList.remove('listening');
                playPop();
                onComplete(true);
            }
        }, 3000);
    };

    if (isSpeaking) {
        const onFinish = () => {
            startListening();
            window.removeEventListener('miko-done-speaking', onFinish);
        };
        window.addEventListener('miko-done-speaking', onFinish);
    } else {
        startListening();
    }

    // Secret override for testing: click to simulate mistake
    micBtn.addEventListener('click', (e) => {
        if(micBtn.classList.contains('listening')) {
            clearTimeout(micBtn.listeningTimeout);
            micBtn.classList.remove('listening');
            playPop();
            onComplete(false);
        }
    });
    return micBtn;
}

function renderWords() {
    if (currentItemIndex >= wordBank.length) {
        controlsContainer.classList.remove('hidden');
        mainContent.innerHTML = `<h2>You finished the words!</h2>`;
        return;
    }
    
    const word = wordBank[currentItemIndex];
    const display = document.createElement('div');
    display.className = 'word-display';
    display.innerText = word;
    
    const mic = createMicButton((passed) => {
        if(passed) rawWordScore++;
        currentItemIndex++;
        renderWords();
    });
    
    const instruction = document.createElement('p');
    instruction.innerText = "(Mic listens automatically. Click mic while listening to simulate a mistake.)";
    instruction.style.opacity = '0.5';
    
    mainContent.appendChild(display);
    mainContent.appendChild(mic);
    mainContent.appendChild(instruction);
}

function renderSentences() {
    if (currentItemIndex >= sentenceBank.length) {
        scores.sentences = 2; // Mock perfect score for sentences if we reach end
        controlsContainer.classList.remove('hidden');
        mainContent.innerHTML = `<h2>Sentences complete!</h2>`;
        return;
    }
    
    const sentence = sentenceBank[currentItemIndex];
    const display = document.createElement('div');
    display.className = 'sentence-display';
    display.innerText = sentence;
    
    const mic = createMicButton(() => {
        currentItemIndex++;
        renderSentences();
    });
    
    mainContent.appendChild(display);
    mainContent.appendChild(mic);
}

function renderStory() {
    const container = document.createElement('div');
    container.className = 'story-display';
    
    const imagesDiv = document.createElement('div');
    imagesDiv.className = 'story-images';
    storyImages.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'story-img';
        imagesDiv.appendChild(img);
    });
    
    const text = document.createElement('div');
    text.className = 'story-text';
    text.innerText = storyText;
    
    const mic = createMicButton(() => {
        scores.story = 2;
        controlsContainer.classList.remove('hidden');
    });
    
    container.appendChild(imagesDiv);
    container.appendChild(text);
    container.appendChild(mic);
    mainContent.appendChild(container);
}

function renderVocab() {
    const grid = document.createElement('div');
    grid.className = 'grid-2x2';
    
    const shuffledImages = [...storyImages].sort(() => Math.random() - 0.5);
    // Correct answer is "Bird" (story_2.png)
    
    shuffledImages.forEach(src => {
        const card = document.createElement('div');
        card.className = 'choice-card';
        const img = document.createElement('img');
        img.src = src;
        card.appendChild(img);
        
        card.addEventListener('click', () => {
            playChime();
            scores.vocab = src.includes('story_2') ? 2 : 1; // 2 for perfect, 1 for wrong tap first
            setTimeout(() => startActivity(activities.COMPREHENSION), 1000);
        });
        
        grid.appendChild(card);
    });
    
    mainContent.appendChild(grid);
}

function renderComprehension() {
    const grid = document.createElement('div');
    grid.className = 'grid-2x2';
    
    // Q: Where was the cat sleeping? Ans: Mat (story_1)
    const shuffledImages = [...storyImages].sort(() => Math.random() - 0.5);
    
    shuffledImages.forEach(src => {
        const card = document.createElement('div');
        card.className = 'choice-card';
        const img = document.createElement('img');
        img.src = src;
        card.appendChild(img);
        
        card.addEventListener('click', () => {
            playChime();
            scores.comp = src.includes('story_1') ? 2 : 1;
            setTimeout(() => startActivity(activities.SEQUENCING), 1000);
        });
        
        grid.appendChild(card);
    });
    
    mainContent.appendChild(grid);
}

function renderSequencing() {
    const container = document.createElement('div');
    container.style.width = '100%';
    
    const sequenceArea = document.createElement('div');
    sequenceArea.className = 'sequence-container';
    
    // Create 4 slots
    for(let i=0; i<4; i++) {
        const slot = document.createElement('div');
        slot.className = 'sequence-slot';
        slot.dataset.index = i;
        
        // Basic drag and drop events for slots
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.style.borderColor = 'var(--primary)';
        });
        slot.addEventListener('dragleave', () => {
            slot.style.borderColor = '#ccc';
        });
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.style.borderColor = '#ccc';
            const imgId = e.dataTransfer.getData('text/plain');
            const img = document.getElementById(imgId);
            if(img) {
                slot.innerHTML = '';
                slot.appendChild(img);
                checkSequenceComplete();
            }
        });
        
        sequenceArea.appendChild(slot);
    }
    
    const sourceArea = document.createElement('div');
    sourceArea.className = 'story-images';
    sourceArea.style.marginTop = '2rem';
    
    const shuffledImages = [...storyImages].sort(() => Math.random() - 0.5);
    shuffledImages.forEach((src, idx) => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'draggable-item';
        img.draggable = true;
        img.id = 'drag-img-' + idx;
        img.dataset.correctIndex = storyImages.indexOf(src); // 0, 1, 2, 3
        
        img.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id);
        });
        
        sourceArea.appendChild(img);
    });
    
    container.appendChild(sequenceArea);
    container.appendChild(sourceArea);
    mainContent.appendChild(container);
}

function checkSequenceComplete() {
    const slots = document.querySelectorAll('.sequence-slot');
    let filled = 0;
    let correct = 0;
    
    slots.forEach((slot, index) => {
        if(slot.children.length > 0) {
            filled++;
            const img = slot.children[0];
            if(parseInt(img.dataset.correctIndex) === index) {
                correct++;
            }
        }
    });
    
    if(filled === 4) {
        if(correct === 4) scores.seq = 2;
        else scores.seq = 1;
        playSuccess();
        setTimeout(() => startActivity(activities.RESULT), 1500);
    }
}

function renderResult() {
    mikoBubble.classList.add('hidden');
    playSuccess();
    
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    let level = "Needs Support";
    if (totalScore >= 10) level = "Proficient";
    else if (totalScore >= 7) level = "Developing";
    
    const card = document.createElement('div');
    card.className = 'result-card bounce';
    
    card.innerHTML = `
        <h1>Teacher Dashboard</h1>
        <h2>Overall Level: ${level}</h2>
        <div class="score-badge">${totalScore} / 12</div>
        <div style="text-align: left; margin: 0 auto; display: inline-block; font-size: 1.2rem;">
            <p>Reading Words: ${scores.words}/2</p>
            <p>Reading Sentences: ${scores.sentences}/2</p>
            <p>Reading Story: ${scores.story}/2</p>
            <p>Vocabulary: ${scores.vocab}/2</p>
            <p>Comprehension: ${scores.comp}/2</p>
            <p>Sequencing: ${scores.seq}/2</p>
        </div>
        <p style="margin-top: 2rem; color: #666;">(This screen is for teachers only)</p>
        <button class="btn-primary" style="margin-top:2rem;" onclick="location.reload()">Start Next Child</button>
    `;
    
    mainContent.appendChild(card);
}
