// Task 8: Validated Bank of Grade-1 Content
const wordBanks = [
    ["cat", "dog", "sun", "hat", "run", "jump", "blue", "tree", "bird", "play", "fast", "look", "good", "happy", "little"],
    ["bat", "pig", "box", "red", "sit", "hop", "green", "flower", "fish", "stop", "slow", "see", "big", "sad", "friend"]
];

const sentenceBanks = [
    [
        "The cat is on the mat.",
        "I can see the sun.",
        "He runs very fast.",
        "The little bird flies."
    ],
    [
        "The dog has a bone.",
        "She likes to jump.",
        "Look at the big tree.",
        "We play in the park."
    ]
];

const storyBanks = [
    {
        id: "story_cat_bird",
        text: "The orange cat was sleeping on a blue mat. A little blue bird flew to the window. The cat woke up and looked at the bird. They smiled at each other.",
        images: ["assets/story_1.png", "assets/story_2.png", "assets/story_3.png", "assets/story_4.png"],
        vocab: [
            {
                word: "Bird",
                audioLabel: "Bird",
                options: ["assets/story_2.png", "assets/story_1.png", "assets/story_3.png", "assets/story_4.png"],
                correctIndex: 0
            },
            {
                word: "Mat",
                audioLabel: "Mat",
                options: ["assets/story_1.png", "assets/story_4.png", "assets/story_2.png", "assets/story_3.png"],
                correctIndex: 0
            }
        ],
        comprehension: [
            {
                question: "Where was the cat sleeping?",
                audioLabel: "Where was the cat sleeping?",
                options: ["assets/story_1.png", "assets/story_3.png", "assets/story_4.png", "assets/story_2.png"],
                correctIndex: 0
            }
        ]
    }
];

// Returns a complete, randomized assessment payload
function generateAssessmentContent() {
    const wordSet = wordBanks[Math.floor(Math.random() * wordBanks.length)];
    const sentenceSet = sentenceBanks[Math.floor(Math.random() * sentenceBanks.length)];
    const storySet = storyBanks[Math.floor(Math.random() * storyBanks.length)];
    
    // Select 10 random words from the chosen set
    const selectedWords = [...wordSet].sort(() => 0.5 - Math.random()).slice(0, 10);
    
    return {
        words: selectedWords,
        sentences: sentenceSet,
        story: storySet
    };
}
