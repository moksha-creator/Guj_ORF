// Adaptive Content Bank mapped to L1 - L4

const L1_DATA = {
    level: 1,
    type: 'WORD_VOCAB',
    words: ["cat", "dog", "sun", "hat", "run", "jump", "blue", "tree", "bird", "play"],
    vocab: {
        word: "Bird",
        audioLabel: "Bird",
        options: ["assets/story_2.png", "assets/story_1.png", "assets/story_3.png", "assets/story_4.png"],
        correctIndex: 0
    }
};

const L2_DATA = {
    level: 2,
    type: 'SENTENCE_VOCAB',
    sentences: [
        "The cat is on the mat.",
        "I can see the sun.",
        "He runs very fast.",
        "The little bird flies."
    ],
    vocab: {
        word: "Mat",
        audioLabel: "Mat",
        options: ["assets/story_1.png", "assets/story_4.png", "assets/story_2.png", "assets/story_3.png"],
        correctIndex: 0
    }
};

const L3_DATA = {
    level: 3,
    type: 'PASSAGE_COMP',
    story: {
        id: "l3_story_1",
        text: "The orange cat was sleeping. A little bird flew to the window.",
        images: ["assets/story_1.png", "assets/story_2.png"]
    },
    comprehension: {
        question: "Where was the cat sleeping?",
        audioLabel: "Where was the cat sleeping?",
        options: ["assets/story_1.png", "assets/story_3.png", "assets/story_4.png", "assets/story_2.png"],
        correctIndex: 0
    }
};

const L4_DATA = {
    level: 4,
    type: 'PASSAGE_WCPM_SEQ',
    story: {
        id: "l4_story_1",
        text: "The orange cat was sleeping on a blue mat. A little blue bird flew to the window. The cat woke up and looked at the bird. They smiled at each other.",
        images: ["assets/story_1.png", "assets/story_2.png", "assets/story_3.png", "assets/story_4.png"]
    },
    comprehension: {
        question: "What did the cat do when it woke up?",
        audioLabel: "What did the cat do when it woke up?",
        options: ["assets/story_3.png", "assets/story_1.png", "assets/story_2.png", "assets/story_4.png"],
        correctIndex: 0
    }
};

function getContentForLevel(level) {
    if (level === 1) return JSON.parse(JSON.stringify(L1_DATA));
    if (level === 2) return JSON.parse(JSON.stringify(L2_DATA));
    if (level === 3) return JSON.parse(JSON.stringify(L3_DATA));
    return JSON.parse(JSON.stringify(L4_DATA)); // L4
}
