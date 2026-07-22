// High-Fidelity Prototype Content Bank
// Strictly contains 3 sample items per template across Levels (L1-L4) and Tiers

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
        tier3: [
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
        instruction: "Read the sentence.",
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
      },
      SENTENCE_READ_CLOZE_ORAL: {
        title: "Cloze Oral Reading",
        instruction: "Read the sentence and supply the missing word out loud.",
        tier1: [
          { display: "The cat is _____", target: "sleeping", fullText: "The cat is sleeping" },
          { display: "The bird can _____", target: "fly", fullText: "The bird can fly" },
          { display: "I have a red _____", target: "ball", fullText: "I have a red ball" }
        ],
        tier2: [
          { display: "The cat is _____", target: "sleeping", fullText: "The cat is sleeping" },
          { display: "The bird can _____", target: "fly", fullText: "The bird can fly" },
          { display: "I have a red _____", target: "ball", fullText: "I have a red ball" }
        ],
        tier3: [
          { display: "The cat is _____", target: "sleeping", fullText: "The cat is sleeping" },
          { display: "The bird can _____", target: "fly", fullText: "The bird can fly" },
          { display: "I have a red _____", target: "ball", fullText: "I have a red ball" }
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
        tier3: [
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
            story: "Deep inside the lush Gir forest, lions rested under the shade of banyan trees. The afternoon heat was intense, so the cubs splashed in a shallow stream. Their mother watched over them while listening to bird calls echoing through the valley.",
            image: "🦁",
            question: "What were the lion cubs doing to stay cool?",
            options: [
              "Splashing playfully in a shallow stream",
              "Sleeping under the banyan tree",
              "Climbing high mountain rocks",
              "Hunting through tall grasslands"
            ],
            correct: "Splashing playfully in a shallow stream"
          },
          {
            story: "Farmer Ramesh prepared his terraced field before monsoon arrival. He planted organic rice seeds across the soil. When heavy rains arrived, green shoots sprouted rapidly, promising a bountiful harvest for the village.",
            image: "🌾",
            question: "What promised a bountiful harvest for the village?",
            options: [
              "Rapidly sprouting green rice shoots after heavy rain",
              "Building a new grain storage house",
              "Buying seeds from the city market",
              "Sunny weather throughout winter"
            ],
            correct: "Rapidly sprouting green rice shoots after heavy rain"
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
          },
          {
            story: "Deep inside the lush Gir forest, lions rested under the shade of banyan trees. The afternoon heat was intense, so the cubs splashed in a shallow stream. Their mother watched over them while listening to bird calls echoing through the valley.",
            image: "🦁",
            question: "What were the lion cubs doing to stay cool?",
            options: [
              "Splashing playfully in a shallow stream",
              "Sleeping under the banyan tree",
              "Climbing high mountain rocks",
              "Hunting through tall grasslands"
            ],
            correct: "Splashing playfully in a shallow stream"
          },
          {
            story: "Farmer Ramesh prepared his terraced field before monsoon arrival. He planted organic rice seeds across the soil. When heavy rains arrived, green shoots sprouted rapidly, promising a bountiful harvest for the village.",
            image: "🌾",
            question: "What promised a bountiful harvest for the village?",
            options: [
              "Rapidly sprouting green rice shoots after heavy rain",
              "Building a new grain storage house",
              "Buying seeds from the city market",
              "Sunny weather throughout winter"
            ],
            correct: "Rapidly sprouting green rice shoots after heavy rain"
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
          },
          {
            story: "Deep inside the lush Gir forest, lions rested under the shade of banyan trees. The afternoon heat was intense, so the cubs splashed in a shallow stream. Their mother watched over them while listening to bird calls echoing through the valley.",
            image: "🦁",
            question: "What were the lion cubs doing to stay cool?",
            options: [
              "Splashing playfully in a shallow stream",
              "Sleeping under the banyan tree",
              "Climbing high mountain rocks",
              "Hunting through tall grasslands"
            ],
            correct: "Splashing playfully in a shallow stream"
          },
          {
            story: "Farmer Ramesh prepared his terraced field before monsoon arrival. He planted organic rice seeds across the soil. When heavy rains arrived, green shoots sprouted rapidly, promising a bountiful harvest for the village.",
            image: "🌾",
            question: "What promised a bountiful harvest for the village?",
            options: [
              "Rapidly sprouting green rice shoots after heavy rain",
              "Building a new grain storage house",
              "Buying seeds from the city market",
              "Sunny weather throughout winter"
            ],
            correct: "Rapidly sprouting green rice shoots after heavy rain"
          }
        ]
      }
    }
  }
};

// 40 Student Mock Data for Reporting Module
const MOCK_REPORTING_STUDENTS = [
  { id: "s1", name: "Aarav Patel", grade: "Grade 1-A", lang: "Gujarati", level: "L3", tier: "Tier 2", lastAssessed: "Yesterday", journey: ["L1", "L2", "L2", "L3"], accuracy: 92, wcpm: 48, compScore: 100, assessments: 6, flag: null },
  { id: "s2", name: "Meera Shah", grade: "Grade 1-A", lang: "Gujarati", level: "L2", tier: "Tier 1", lastAssessed: "3 days ago", journey: ["L1", "L1", "L2"], accuracy: 88, wcpm: 34, compScore: 80, assessments: 4, flag: null },
  { id: "s3", name: "Kunal Joshi", grade: "Grade 1-A", lang: "Gujarati", level: "L1", tier: "Tier 1", lastAssessed: "1 week ago", journey: ["L1", "L1"], accuracy: 64, wcpm: 18, compScore: 60, assessments: 3, flag: "Stuck at Level 1" },
  { id: "s4", name: "Diya Parikh", grade: "Grade 1-B", lang: "Gujarati", level: "L4", tier: "Tier 3", lastAssessed: "Yesterday", journey: ["L2", "L3", "L4"], accuracy: 98, wcpm: 72, compScore: 100, assessments: 8, flag: null },
  { id: "s5", name: "Riya Mehta", grade: "Grade 1-B", lang: "Gujarati", level: "L3", tier: "Tier 1", lastAssessed: "Yesterday", journey: ["L1", "L2", "L3"], accuracy: 90, wcpm: 42, compScore: 90, assessments: 5, flag: null },
  { id: "s6", name: "Vihaan Sharma", grade: "Grade 1-A", lang: "Gujarati", level: "L2", tier: "Tier 2", lastAssessed: "Yesterday", journey: ["L1", "L2"], accuracy: 85, wcpm: 31, compScore: 75, assessments: 4, flag: null },
  { id: "s7", name: "Ananya Desai", grade: "Grade 1-A", lang: "English", level: "L2", tier: "Tier 1", lastAssessed: "4 days ago", journey: ["L1", "L2"], accuracy: 82, wcpm: 29, compScore: 70, assessments: 3, flag: null },
  { id: "s8", name: "Dev Trivedi", grade: "Grade 1-B", lang: "Gujarati", level: "L1", tier: "Tier 2", lastAssessed: "2 weeks ago", journey: ["L1"], accuracy: 58, wcpm: 14, compScore: 50, assessments: 2, flag: "Not Assessed Recently" },
  { id: "s9", name: "Isha Solanki", grade: "Grade 1-A", lang: "Gujarati", level: "L3", tier: "Tier 1", lastAssessed: "5 days ago", journey: ["L2", "L3"], accuracy: 91, wcpm: 46, compScore: 85, assessments: 4, flag: null },
  { id: "s10", name: "Kabir Vora", grade: "Grade 1-B", lang: "English", level: "L2", tier: "Tier 3", lastAssessed: "3 days ago", journey: ["L1", "L2"], accuracy: 89, wcpm: 38, compScore: 60, assessments: 4, flag: "Low Comprehension" },
  { id: "s11", name: "Manav Bhatia", grade: "Grade 1-A", lang: "Gujarati", level: "L1", tier: "Tier 1", lastAssessed: "1 month ago", journey: ["L1"], accuracy: 52, wcpm: 12, compScore: 40, assessments: 1, flag: "Not Assessed Recently" },
  { id: "s12", name: "Navya Chaudhari", grade: "Grade 1-A", lang: "Gujarati", level: "L4", tier: "Tier 2", lastAssessed: "Yesterday", journey: ["L2", "L3", "L4"], accuracy: 96, wcpm: 68, compScore: 100, assessments: 7, flag: null },
  { id: "s13", name: "Parth Soni", grade: "Grade 1-B", lang: "Gujarati", level: "L2", tier: "Tier 1", lastAssessed: "6 days ago", journey: ["L1", "L2"], accuracy: 80, wcpm: 28, compScore: 80, assessments: 3, flag: null },
  { id: "s14", name: "Saanvi Parmar", grade: "Grade 1-A", lang: "Gujarati", level: "L3", tier: "Tier 2", lastAssessed: "2 days ago", journey: ["L2", "L3"], accuracy: 94, wcpm: 50, compScore: 90, assessments: 5, flag: null },
  { id: "s15", name: "Tanish Kothari", grade: "Grade 1-B", lang: "English", level: "L2", tier: "Tier 2", lastAssessed: "5 days ago", journey: ["L1", "L2"], accuracy: 84, wcpm: 30, compScore: 75, assessments: 3, flag: null },
  { id: "s16", name: "Yashvi Zala", grade: "Grade 1-A", lang: "Gujarati", level: "L1", tier: "Tier 3", lastAssessed: "3 days ago", journey: ["L1"], accuracy: 70, wcpm: 22, compScore: 65, assessments: 3, flag: "Review Required" },
  { id: "s17", name: "Aditya Barot", grade: "Grade 1-B", lang: "Gujarati", level: "L2", tier: "Tier 1", lastAssessed: "Yesterday", journey: ["L1", "L2"], accuracy: 87, wcpm: 35, compScore: 85, assessments: 4, flag: null },
  { id: "s18", name: "Bhavya Dave", grade: "Grade 1-A", lang: "Gujarati", level: "L3", tier: "Tier 1", lastAssessed: "2 days ago", journey: ["L2", "L3"], accuracy: 93, wcpm: 49, compScore: 95, assessments: 5, flag: null },
  { id: "s19", name: "Charmi Vyas", grade: "Grade 1-B", lang: "English", level: "L4", tier: "Tier 1", lastAssessed: "Yesterday", journey: ["L2", "L3", "L4"], accuracy: 97, wcpm: 70, compScore: 100, assessments: 6, flag: null },
  { id: "s20", name: "Dharmi Rathod", grade: "Grade 1-A", lang: "Gujarati", level: "L2", tier: "Tier 2", lastAssessed: "4 days ago", journey: ["L1", "L2"], accuracy: 83, wcpm: 32, compScore: 70, assessments: 3, flag: null },
  { id: "s21", name: "Eshan Macwan", grade: "Grade 1-B", lang: "Gujarati", level: "L1", tier: "Tier 1", lastAssessed: "1 week ago", journey: ["L1"], accuracy: 60, wcpm: 16, compScore: 50, assessments: 2, flag: "Stuck at Level 1" },
  { id: "s22", name: "Falguni Pandva", grade: "Grade 1-A", lang: "Gujarati", level: "L2", tier: "Tier 3", lastAssessed: "Yesterday", journey: ["L1", "L2"], accuracy: 86, wcpm: 33, compScore: 80, assessments: 4, flag: null },
  { id: "s23", name: "Gaurav Jadeha", grade: "Grade 1-B", lang: "Gujarati", level: "L3", tier: "Tier 2", lastAssessed: "3 days ago", journey: ["L1", "L2", "L3"], accuracy: 90, wcpm: 45, compScore: 90, assessments: 5, flag: null },
  { id: "s24", name: "Hetal Chavda", grade: "Grade 1-A", lang: "English", level: "L2", tier: "Tier 1", lastAssessed: "5 days ago", journey: ["L1", "L2"], accuracy: 81, wcpm: 28, compScore: 75, assessments: 3, flag: null },
  { id: "s25", name: "Ishaan Bhati", grade: "Grade 1-B", lang: "Gujarati", level: "L4", tier: "Tier 2", lastAssessed: "Yesterday", journey: ["L3", "L4"], accuracy: 95, wcpm: 66, compScore: 95, assessments: 6, flag: null },
  { id: "s26", name: "Jiya Vaghela", grade: "Grade 1-A", lang: "Gujarati", level: "L2", tier: "Tier 1", lastAssessed: "2 days ago", journey: ["L1", "L2"], accuracy: 88, wcpm: 36, compScore: 85, assessments: 4, flag: null },
  { id: "s27", name: "Kavya Shrimali", grade: "Grade 1-B", lang: "Gujarati", level: "L3", tier: "Tier 3", lastAssessed: "Yesterday", journey: ["L2", "L3"], accuracy: 92, wcpm: 47, compScore: 90, assessments: 5, flag: null },
  { id: "s28", name: "Luv Dabhi", grade: "Grade 1-A", lang: "English", level: "L1", tier: "Tier 2", lastAssessed: "3 weeks ago", journey: ["L1"], accuracy: 55, wcpm: 15, compScore: 45, assessments: 2, flag: "Not Assessed Recently" },
  { id: "s29", name: "Mahi Gohil", grade: "Grade 1-B", lang: "Gujarati", level: "L2", tier: "Tier 2", lastAssessed: "4 days ago", journey: ["L1", "L2"], accuracy: 84, wcpm: 30, compScore: 75, assessments: 3, flag: null },
  { id: "s30", name: "Nikhil Panchal", grade: "Grade 1-A", lang: "Gujarati", level: "L3", tier: "Tier 1", lastAssessed: "Yesterday", journey: ["L1", "L2", "L3"], accuracy: 91, wcpm: 44, compScore: 90, assessments: 4, flag: null },
  { id: "s31", name: "Om Vania", grade: "Grade 1-B", lang: "Gujarati", level: "L2", tier: "Tier 1", lastAssessed: "5 days ago", journey: ["L1", "L2"], accuracy: 86, wcpm: 34, compScore: 80, assessments: 3, flag: null },
  { id: "s32", name: "Pooja Damor", grade: "Grade 1-A", lang: "Gujarati", level: "L4", tier: "Tier 1", lastAssessed: "Yesterday", journey: ["L2", "L3", "L4"], accuracy: 99, wcpm: 75, compScore: 100, assessments: 7, flag: null },
  { id: "s33", name: "Rohan Makwana", grade: "Grade 1-B", lang: "English", level: "L2", tier: "Tier 2", lastAssessed: "2 days ago", journey: ["L1", "L2"], accuracy: 85, wcpm: 33, compScore: 70, assessments: 4, flag: null },
  { id: "s34", name: "Shruti Thakar", grade: "Grade 1-A", lang: "Gujarati", level: "L3", tier: "Tier 2", lastAssessed: "Yesterday", journey: ["L2", "L3"], accuracy: 93, wcpm: 51, compScore: 95, assessments: 5, flag: null },
  { id: "s35", name: "Tushti Upadhyay", grade: "Grade 1-B", lang: "Gujarati", level: "L2", tier: "Tier 1", lastAssessed: "4 days ago", journey: ["L1", "L2"], accuracy: 87, wcpm: 37, compScore: 85, assessments: 3, flag: null },
  { id: "s36", name: "Urvi Garange", grade: "Grade 1-A", lang: "Gujarati", level: "L1", tier: "Tier 1", lastAssessed: "Yesterday", journey: ["L1"], accuracy: 68, wcpm: 20, compScore: 60, assessments: 2, flag: null },
  { id: "s37", name: "Vatsal Sisodiya", grade: "Grade 1-B", lang: "Gujarati", level: "L2", tier: "Tier 3", lastAssessed: "3 days ago", journey: ["L1", "L2"], accuracy: 83, wcpm: 31, compScore: 75, assessments: 3, flag: null },
  { id: "s38", name: "Yash Katara", grade: "Grade 1-A", lang: "English", level: "L3", tier: "Tier 1", lastAssessed: "Yesterday", journey: ["L1", "L2", "L3"], accuracy: 92, wcpm: 48, compScore: 90, assessments: 5, flag: null },
  { id: "s39", name: "Zoya Merchant", grade: "Grade 1-B", lang: "Gujarati", level: "L4", tier: "Tier 3", lastAssessed: "Yesterday", journey: ["L2", "L3", "L4"], accuracy: 97, wcpm: 71, compScore: 100, assessments: 8, flag: null },
  { id: "s40", name: "Dhairya Sanghavi", grade: "Grade 1-A", lang: "Gujarati", level: "L2", tier: "Tier 1", lastAssessed: "5 days ago", journey: ["L1", "L2"], accuracy: 85, wcpm: 33, compScore: 80, assessments: 4, flag: null }
];
