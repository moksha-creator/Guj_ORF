// Adaptive Content Bank mapped to L1 - L4

const L1_DATA = {
    level: 1,
    type: 'WORD_VOCAB',
    words: ["cat", "dog", "sun", "hat", "run", "jump", "blue", "tree", "bird", "play"],
    vocab: {
        word: "Bird",
        audioLabel: "Tap the bird.",
        options: [
            { type: 'image', value: "assets/distractor_bird_1784292846271.png" },
            { type: 'image', value: "assets/distractor_dog_1784292800403.png" },
            { type: 'image', value: "assets/distractor_cat_1784292819700.png" },
            { type: 'image', value: "assets/distractor_fish_1784292809605.png" }
        ],
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
        audioLabel: "Tap the mat.",
        options: [
            { type: 'image', value: "assets/distractor_mat_1784292870234.png" },
            { type: 'image', value: "assets/distractor_chair_1784292836710.png" },
            { type: 'image', value: "assets/distractor_cat_1784292819700.png" },
            { type: 'image', value: "assets/distractor_dog_1784292800403.png" }
        ],
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
        question: "Where did the bird fly to?",
        audioLabel: "Where did the bird fly to?",
        options: [
            { type: 'text', value: "To the window" },
            { type: 'text', value: "In a box" },
            { type: 'text', value: "On a chair" },
            { type: 'text', value: "Under a tree" }
        ],
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
        options: [
            { type: 'text', value: "Looked at the bird" },
            { type: 'text', value: "Ran away fast" },
            { type: 'text', value: "Went back to sleep" },
            { type: 'text', value: "Ate some food" }
        ],
        correctIndex: 0
    }
};

function getContentForLevel(level) {
    if (level === 1) return JSON.parse(JSON.stringify(L1_DATA));
    if (level === 2) return JSON.parse(JSON.stringify(L2_DATA));
    if (level === 3) return JSON.parse(JSON.stringify(L3_DATA));
    return JSON.parse(JSON.stringify(L4_DATA)); // L4
}
