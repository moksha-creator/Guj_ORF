// High-Fidelity Prototype Content Bank
// Strictly contains sample items per template across Levels (L1-L4) and Tiers

const PROTOTYPE_DATA = {
  // BALVATIKA (L1)
  L1: {
    name: "Balvatika (L1)",
    templates: {
      WORD_READ_TEXT: {
        title: "Word Reading",
        instruction: "Read the word out loud.",
        tier1: [{ text: "Sun" }, { text: "Cat" }, { text: "Ball" }],
        tier2: [{ text: "Sun" }, { text: "Cat" }, { text: "Ball" }],
        tier3: [{ text: "Sun" }, { text: "Cat" }, { text: "Ball" }]
      },
      WORD_IMAGE_NAMING: {
        title: "Picture Naming",
        instruction: "Say the word for this picture out loud.",
        tier1: [
          { targetWord: "Elephant", image: "🐘", emoji: true },
          { targetWord: "Cat", image: "🐱", emoji: true },
          { targetWord: "Ball", image: "⚽", emoji: true }
        ],
        tier2: [
          { targetWord: "Elephant", image: "🐘", emoji: true },
          { targetWord: "Cat", image: "🐱", emoji: true },
          { targetWord: "Ball", image: "⚽", emoji: true }
        ],
        tier3: [
          { targetWord: "Elephant", image: "🐘", emoji: true },
          { targetWord: "Cat", image: "🐱", emoji: true },
          { targetWord: "Ball", image: "⚽", emoji: true }
        ]
      },
      WORD_READ_SET_TEXT: {
        title: "Batch Word Reading",
        instruction: "Read all the words in order.",
        tier1: [
          {
            items: [
              { word: "Sun", image: "☀️", colorTheme: "yellow" },
              { word: "Ball", image: "⚽", colorTheme: "green" },
              { word: "Tree", image: "🌳", colorTheme: "blue" },
              { word: "Cat", image: "🐱", colorTheme: "purple" },
              { word: "Book", image: "📚", colorTheme: "pink" }
            ]
          },
          {
            items: [
              { word: "Red", image: "🔴", colorTheme: "yellow" },
              { word: "Big", image: "🐘", colorTheme: "green" },
              { word: "Box", image: "📦", colorTheme: "blue" },
              { word: "Dog", image: "🐶", colorTheme: "purple" },
              { word: "Cup", image: "☕", colorTheme: "pink" }
            ]
          },
          {
            items: [
              { word: "Run", image: "🏃", colorTheme: "yellow" },
              { word: "Pen", image: "🖊️", colorTheme: "green" },
              { word: "Hat", image: "👒", colorTheme: "blue" },
              { word: "Bed", image: "🛏️", colorTheme: "purple" },
              { word: "Fish", image: "🐟", colorTheme: "pink" }
            ]
          }
        ],
        tier2: [
          {
            items: [
              { word: "Sun", image: "☀️", colorTheme: "yellow" },
              { word: "Ball", image: "⚽", colorTheme: "green" },
              { word: "Tree", image: "🌳", colorTheme: "blue" },
              { word: "Cat", image: "🐱", colorTheme: "purple" },
              { word: "Book", image: "📚", colorTheme: "pink" }
            ]
          }
        ],
        tier3: [
          {
            items: [
              { word: "Sun", image: "☀️", colorTheme: "yellow" },
              { word: "Ball", image: "⚽", colorTheme: "green" },
              { word: "Tree", image: "🌳", colorTheme: "blue" },
              { word: "Cat", image: "🐱", colorTheme: "purple" },
              { word: "Book", image: "📚", colorTheme: "pink" }
            ]
          }
        ]
      },
      WORD_READ_MINIMAL_PAIR: {
        title: "Minimal Pair Discrimination",
        instruction: "Say the correct word for this picture out loud.",
        tier1: [
          { image: "☀️", options: ["sun", "sub"], target: "sun" },
          { image: "🖊️", options: ["pen", "pan"], target: "pen" },
          { image: "🐱", options: ["cat", "bat"], target: "cat" }
        ],
        tier2: [
          { image: "⚽", options: ["ball", "bell"], target: "ball" },
          { image: "🎩", options: ["hat", "hot"], target: "hat" },
          { image: "🐶", options: ["dog", "dot"], target: "dog" }
        ],
        tier3: [
          { image: "🐟", options: ["fish", "dish"], target: "fish" },
          { image: "🏃", options: ["run", "sun"], target: "run" },
          { image: "🛏️", options: ["bed", "red"], target: "bed" }
        ]
      },
      SENTENCE_READ_CLOZE_ORAL: {
        title: "Cloze Oral Sentence Completion",
        instruction: "Look at the picture clue and say the missing word out loud.",
        tier1: [
          { display: "The sun is _____.", target: "bright", image: "☀️", fullText: "The sun is bright" },
          { display: "A cat says _____.", target: "meow", image: "🐱", fullText: "A cat says meow" },
          { display: "Birds fly in the _____.", target: "sky", image: "☁️", fullText: "Birds fly in the sky" }
        ],
        tier2: [
          { display: "The sun is _____.", target: "bright", image: "☀️", fullText: "The sun is bright" },
          { display: "A cat says _____.", target: "meow", image: "🐱", fullText: "A cat says meow" },
          { display: "Birds fly in the _____.", target: "sky", image: "☁️", fullText: "Birds fly in the sky" }
        ],
        tier3: [
          { display: "The sun is _____.", target: "bright", image: "☀️", fullText: "The sun is bright" },
          { display: "A cat says _____.", target: "meow", image: "🐱", fullText: "A cat says meow" },
          { display: "Birds fly in the _____.", target: "sky", image: "☁️", fullText: "Birds fly in the sky" }
        ]
      }
    }
  },

  // GRADE 1 (L2)
  L2: {
    name: "Grade 1 (L2)",
    templates: {
      SENTENCE_READ_TEXT: {
        title: "Sentence Reading",
        instruction: "Read the sentence out loud.",
        tier1: [
          { text: "The cat is sleeping." },
          { text: "The bird can fly." },
          { text: "I have a red ball." }
        ],
        tier2: [
          { text: "The cat is sleeping." },
          { text: "The bird can fly." },
          { text: "I have a red ball." }
        ],
        tier3: [
          { text: "The cat is sleeping." },
          { text: "The bird can fly." },
          { text: "I have a red ball." }
        ]
      },
      SENTENCE_READ_CLOZE_ORAL: {
        title: "Cloze Oral Sentence Completion",
        instruction: "Look at the picture clue and say the missing word out loud.",
        tier1: [
          { display: "The cat is _____ on the mat.", target: "sleeping", image: "😴", fullText: "The cat is sleeping on the mat" },
          { display: "The bird can _____ high in the sky.", target: "fly", image: "🕊️", fullText: "The bird can fly high in the sky" },
          { display: "I have a red _____ to play.", target: "ball", image: "⚽", fullText: "I have a red ball to play" }
        ],
        tier2: [
          { display: "The cat is _____ on the mat.", target: "sleeping", image: "😴", fullText: "The cat is sleeping on the mat" },
          { display: "The bird can _____ high in the sky.", target: "fly", image: "🕊️", fullText: "The bird can fly high in the sky" },
          { display: "I have a red _____ to play.", target: "ball", image: "⚽", fullText: "I have a red ball to play" }
        ],
        tier3: [
          { display: "The cat is _____ on the mat.", target: "sleeping", image: "😴", fullText: "The cat is sleeping on the mat" },
          { display: "The bird can _____ high in the sky.", target: "fly", image: "🕊️", fullText: "The bird can fly high in the sky" },
          { display: "I have a red _____ to play.", target: "ball", image: "⚽", fullText: "I have a red ball to play" }
        ]
      },
      WORD_READ_MINIMAL_PAIR: {
        title: "Minimal Pair Discrimination",
        instruction: "Say the correct word for this picture out loud.",
        tier1: [
          { image: "☀️", options: ["sun", "sub"], target: "sun" },
          { image: "🖊️", options: ["pen", "pan"], target: "pen" },
          { image: "🐱", options: ["cat", "bat"], target: "cat" }
        ],
        tier2: [
          { image: "⚽", options: ["ball", "bell"], target: "ball" },
          { image: "🎩", options: ["hat", "hot"], target: "hat" },
          { image: "🐶", options: ["dog", "dot"], target: "dog" }
        ],
        tier3: [
          { image: "🐟", options: ["fish", "dish"], target: "fish" },
          { image: "🏃", options: ["run", "sun"], target: "run" },
          { image: "🛏️", options: ["bed", "red"], target: "bed" }
        ]
      },
      SENTENCE_READ_TEXT_IMAGE: {
        title: "Illustrated Sentence Reading",
        instruction: "Read the sentence out loud.",
        tier1: [
          { text: "The cat is sleeping on the mat.", image: "🐱", emoji: true },
          { text: "A yellow sun is in the sky.", image: "☀️", emoji: true },
          { text: "The dog runs after the ball.", image: "🐶", emoji: true }
        ],
        tier2: [
          { text: "The cat is sleeping on the mat.", image: "🐱", emoji: true },
          { text: "A yellow sun is in the sky.", image: "☀️", emoji: true },
          { text: "The dog runs after the ball.", image: "🐶", emoji: true }
        ],
        tier3: [
          { text: "The cat is sleeping on the mat.", image: "🐱", emoji: true },
          { text: "A yellow sun is in the sky.", image: "☀️", emoji: true },
          { text: "The dog runs after the ball.", image: "🐶", emoji: true }
        ]
      },
      SENTENCE_READ_SET_TEXT: {
        title: "Batch Sentence Reading",
        instruction: "Read the set of sentences.",
        tier1: [
          { text: "The cat is sleeping. The bird can fly. I have a red ball." },
          { text: "The sun is hot. A dog can run fast. We play together." },
          { text: "Look at the red bus. The tree is big. She has a hat." }
        ],
        tier2: [
          { text: "The cat is sleeping. The bird can fly. I have a red ball." },
          { text: "The sun is hot. A dog can run fast. We play together." },
          { text: "Look at the red bus. The tree is big. She has a hat." }
        ],
        tier3: [
          { text: "The cat is sleeping. The bird can fly. I have a red ball." },
          { text: "The sun is hot. A dog can run fast. We play together." },
          { text: "Look at the red bus. The tree is big. She has a hat." }
        ]
      }
    }
  },

  // GRADE 2 (L3)
  L3: {
    name: "Grade 2 (L3)",
    templates: {
      PASSAGE_READ_COMP: {
        title: "Short Passage & Comprehension",
        instruction: "Read the story and answer the question.",
        tier1: [
          {
            story: "Riya planted a seed in a pot. She watered it every single day. Soon it became a flower.",
            image: "🌻",
            question: "What did Riya plant in the pot?",
            options: ["A seed", "A rock", "A leaf", "A fruit"],
            correct: "A seed"
          },
          {
            story: "A little puppy found a red ball in the garden. He chased it around the green grass. He wagged his tail happily.",
            image: "🐶",
            question: "Where did the puppy find the ball?",
            options: ["In the garden", "In the house", "On the street", "In a box"],
            correct: "In the garden"
          },
          {
            story: "Kunal went to the lake with his grandfather. They saw three ducks swimming gracefully. The sun shone bright over the water.",
            image: "🦆",
            question: "How many ducks did they see?",
            options: ["Three ducks", "One duck", "Five ducks", "Two ducks"],
            correct: "Three ducks"
          }
        ],
        tier2: [
          {
            story: "Riya planted a seed in a pot. She watered it every single day. Soon it became a flower.",
            image: "🌻",
            question: "What did Riya plant in the pot?",
            options: ["A seed", "A rock", "A leaf", "A fruit"],
            correct: "A seed"
          }
        ],
        tier3: [
          {
            story: "Riya planted a seed in a pot. She watered it every single day. Soon it became a flower.",
            image: "🌻",
            question: "What did Riya plant in the pot?",
            options: ["A seed", "A rock", "A leaf", "A fruit"],
            correct: "A seed"
          }
        ]
      },
      SENTENCE_READ_CLOZE_ORAL: {
        title: "Cloze Oral Sentence Completion",
        instruction: "Look at the picture clue and say the missing word out loud.",
        tier1: [
          { display: "Riya planted a _____ in a pot.", target: "seed", image: "🌱", fullText: "Riya planted a seed in a pot" },
          { display: "The puppy chased the red _____.", target: "ball", image: "⚽", fullText: "The puppy chased the red ball" },
          { display: "They saw three _____ swimming.", target: "ducks", image: "🦆", fullText: "They saw three ducks swimming" }
        ],
        tier2: [
          { display: "Riya planted a _____ in a pot.", target: "seed", image: "🌱", fullText: "Riya planted a seed in a pot" }
        ],
        tier3: [
          { display: "Riya planted a _____ in a pot.", target: "seed", image: "🌱", fullText: "Riya planted a seed in a pot" }
        ]
      }
    }
  },

  // GRADE 3 (L4)
  L4: {
    name: "Grade 3 (L4)",
    templates: {
      PASSAGE_READ_ADVANCED: {
        title: "Advanced Passage & Comprehension",
        instruction: "Read the detailed passage and answer the comprehension question.",
        tier1: [
          {
            story: "The annual school science fair was full of excitement. Diya built a working model of a solar energy system using solar panels. Her project demonstrated how sunlight can generate clean electricity. The judges were impressed by her explanation and awarded her first prize.",
            image: "☀️",
            question: "Why were the judges impressed by Diya's project?",
            options: [
              "Her clear explanation of clean solar power",
              "She built the fastest toy car",
              "She brought delicious snacks",
              "She drew poster paintings"
            ],
            correct: "Her clear explanation of clean solar power"
          },
          {
            story: "In a quiet forest near Gir, a mother lion brought her two young cubs to drink water from the stream. The cubs splashed playfully while the mother watched attentively for any sign of danger. It was a peaceful morning in the sanctuary.",
            image: "🦁",
            question: "What were the lion cubs doing at the stream?",
            options: [
              "Splashing playfully in the water",
              "Sleeping under a big tree",
              "Hunting for food",
              "Climbing up a steep hill"
            ],
            correct: "Splashing playfully in the water"
          },
          {
            story: "The farmers in Kutch harvested fresh cotton after the monsoon rains. They transported the white cotton bales in wooden bullock carts to the local market. Everyone celebrated a prosperous harvest festival.",
            image: "🌾",
            question: "How did the farmers transport the cotton bales?",
            options: [
              "In wooden bullock carts",
              "By cargo train",
              "On speedboats",
              "Using heavy trucks"
            ],
            correct: "In wooden bullock carts"
          }
        ],
        tier2: [
          {
            story: "The annual school science fair was full of excitement. Diya built a working model of a solar energy system using solar panels. Her project demonstrated how sunlight can generate clean electricity. The judges were impressed by her explanation and awarded her first prize.",
            image: "☀️",
            question: "Why were the judges impressed by Diya's project?",
            options: [
              "Her clear explanation of clean solar power",
              "She built the fastest toy car",
              "She brought delicious snacks",
              "She drew poster paintings"
            ],
            correct: "Her clear explanation of clean solar power"
          }
        ],
        tier3: [
          {
            story: "The annual school science fair was full of excitement. Diya built a working model of a solar energy system using solar panels. Her project demonstrated how sunlight can generate clean electricity. The judges were impressed by her explanation and awarded her first prize.",
            image: "☀️",
            question: "Why were the judges impressed by Diya's project?",
            options: [
              "Her clear explanation of clean solar power",
              "She built the fastest toy car",
              "She brought delicious snacks",
              "She drew poster paintings"
            ],
            correct: "Her clear explanation of clean solar power"
          }
        ]
      },
      SENTENCE_READ_CLOZE_ORAL: {
        title: "Cloze Oral Sentence Completion",
        instruction: "Look at the picture clue and say the missing word out loud.",
        tier1: [
          { display: "Sunlight can generate clean _____.", target: "electricity", image: "⚡", fullText: "Sunlight can generate clean electricity" },
          { display: "The cubs splashed _____ in the stream.", target: "playfully", image: "🌊", fullText: "The cubs splashed playfully in the stream" },
          { display: "They celebrated a prosperous _____ festival.", target: "harvest", image: "🌾", fullText: "They celebrated a prosperous harvest festival" }
        ],
        tier2: [
          { display: "Sunlight can generate clean _____.", target: "electricity", image: "⚡", fullText: "Sunlight can generate clean electricity" }
        ],
        tier3: [
          { display: "Sunlight can generate clean _____.", target: "electricity", image: "⚡", fullText: "Sunlight can generate clean electricity" }
        ]
      }
    }
  }
};
