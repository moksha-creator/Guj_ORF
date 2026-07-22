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
          { image: "🖊️", options: ["pin", "bin"], target: "pin" },
          { image: "🐱", options: ["cat", "bat"], target: "cat" }
        ],
        tier2: [
          { image: "☀️", options: ["sun", "sub"], target: "sun" },
          { image: "🖊️", options: ["pin", "bin"], target: "pin" },
          { image: "🐱", options: ["cat", "bat"], target: "cat" }
        ],
        tier3: [
          { image: "☀️", options: ["sun", "sub"], target: "sun" },
          { image: "🖊️", options: ["pin", "bin"], target: "pin" },
          { image: "🐱", options: ["cat", "bat"], target: "cat" }
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
