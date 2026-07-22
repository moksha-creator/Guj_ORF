// High-Fidelity Prototype Content Bank
// Contains realistic examples for templates across Levels (L1-L4) and Tiers (1-3)

const PROTOTYPE_DATA = {
  // BALVATIKA (L1)
  L1: {
    name: "Balvatika (L1)",
    templates: {
      WORD_READ_TEXT: {
        title: "Word Reading",
        instruction: "Read the word out loud.",
        tier1: [{ text: "Sun" }, { text: "Cat" }, { text: "Ball" }],
        tier2: [{ text: "Pen" }, { text: "Dog" }, { text: "Hat" }],
        tier3: [{ text: "Cup" }, { text: "Box" }, { text: "Bed" }]
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
          { targetWord: "Dog", image: "🐶", emoji: true },
          { targetWord: "Tree", image: "🌳", emoji: true },
          { targetWord: "Fish", image: "🐟", emoji: true }
        ],
        tier3: [
          { targetWord: "Car", image: "🚗", emoji: true },
          { targetWord: "Book", image: "📚", emoji: true },
          { targetWord: "Apple", image: "🍎", emoji: true }
        ]
      },
      WORD_READ_SET_TEXT: {
        title: "Batch Word Reading",
        instruction: "Read all words in sequence.",
        tier1: [
          { text: "Sun  Ball  Tree  Cat  Book" },
          { text: "Red  Big  Box  Dog  Cup" },
          { text: "Run  Pen  Hat  Bed  Fish" }
        ],
        tier2: [
          { text: "Top  Mat  Log  Jam  Ten" },
          { text: "Sit  Hop  Cut  Map  Hen" },
          { text: "Cow  Star  Net  Pig  Bag" }
        ],
        tier3: [
          { text: "Van  Bat  Pan  Fan  Pin" },
          { text: "Mud  Tub  Bug  Rug  Mug" },
          { text: "Pot  Dot  Hot  Cot  Fox" }
        ]
      },
      WORD_READ_MINIMAL_PAIR: {
        title: "Minimal Pair Discrimination",
        instruction: "Read the target word out loud.",
        tier1: [
          { options: ["sun", "sub"], target: "sun" },
          { options: ["pin", "bin"], target: "pin" },
          { options: ["fan", "van"], target: "fan" }
        ],
        tier2: [
          { options: ["cat", "bat"], target: "cat" },
          { options: ["dog", "log"], target: "dog" },
          { options: ["pen", "pan"], target: "pen" }
        ],
        tier3: [
          { options: ["red", "bed"], target: "red" },
          { options: ["cup", "cap"], target: "cup" },
          { options: ["box", "fox"], target: "box" }
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
          { text: "A dog ran to the park." },
          { text: "The sun shines bright." },
          { text: "We like to read books." }
        ],
        tier3: [
          { text: "My hat is on the bed." },
          { text: "She has a big blue cup." },
          { text: "The pig hops on the log." }
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
          { text: "A red bus goes down the street.", image: "🚌", emoji: true },
          { text: "The green tree has sweet apples.", image: "🌳", emoji: true },
          { text: "The fish swims in the clear water.", image: "🐟", emoji: true }
        ],
        tier3: [
          { text: "I put the big box on the table.", image: "📦", emoji: true },
          { text: "The little bird sings in the nest.", image: "🐦", emoji: true },
          { text: "We drink warm milk from a cup.", image: "🥛", emoji: true }
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
          { text: "My dog loves water. He hops in the tub. Then he shakes dry." },
          { text: "A green frog sat on a log. He saw a fly. He jumped high." },
          { text: "The cow eats green grass. The milk is fresh. We like milk." }
        ],
        tier3: [
          { text: "Rain falls on the roof. The kids stay inside. They read books." },
          { text: "A blue boat floats on water. The wind is soft. The duck swims." },
          { text: "Star light shines at night. The moon is round. Sleep sweet now." }
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
          { display: "The sun is in the _____", target: "sky", fullText: "The sun is in the sky" },
          { display: "The dog began to _____", target: "bark", fullText: "The dog began to bark" },
          { display: "We drink water from a _____", target: "cup", fullText: "We drink water from a cup" }
        ],
        tier3: [
          { display: "The tree has green _____", target: "leaves", fullText: "The tree has green leaves" },
          { display: "She wears a yellow _____", target: "hat", fullText: "She wears a yellow hat" },
          { display: "The pig was on the _____", target: "mat", fullText: "The pig was on the mat" }
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
            story: "Riya planted a seed in a pot. She watered it every single day. Soon it grew into a bright yellow flower. Riya smiled warmly.",
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
            story: "Kunal went to the lake with his grandfather. They saw three ducks swimming gracefully. The sun shone bright over the calm water.",
            image: "🦆",
            question: "How many ducks did they see?",
            options: ["Three ducks", "One duck", "Five ducks", "Two ducks"],
            correct: "Three ducks"
          }
        ],
        tier2: [
          {
            story: "Aarav got a new blue bicycle for his birthday. He put on his safety helmet. He rode up and down the park path.",
            image: "🚲",
            question: "What color was Aarav's bicycle?",
            options: ["Blue", "Red", "Green", "Yellow"],
            correct: "Blue"
          },
          {
            story: "Meera baked soft banana muffins with her grandmother. The kitchen smelled sweet. They shared the warm treats with their neighbors.",
            image: "🧁",
            question: "What did Meera bake?",
            options: ["Banana muffins", "Chocolate cake", "Apple pie", "Bread"],
            correct: "Banana muffins"
          },
          {
            story: "The rainy morning made the playground wet. Bright green frogs came out near the pond. The children watched them hop around.",
            image: "🐸",
            question: "What animals came out near the pond?",
            options: ["Green frogs", "Little birds", "Busy bees", "Small cats"],
            correct: "Green frogs"
          }
        ],
        tier3: [
          {
            story: "An owl sat quietly in a tall oak tree. Its big eyes scanned the dark woods. When night came, it flew away gracefully.",
            image: "🦉",
            question: "Where was the owl sitting?",
            options: ["In a tall oak tree", "On a fence post", "Under a bush", "On the grass"],
            correct: "In a tall oak tree"
          },
          {
            story: "Pooja loved reading fairy tales under her cozy blanket. She used a small flashlight. She read until she fell fast asleep.",
            image: "📖",
            question: "What did Pooja use to read under her blanket?",
            options: ["A small flashlight", "A candle", "A lamp", "A phone"],
            correct: "A small flashlight"
          },
          {
            story: "A small brown squirrel gathered walnuts before winter. He hid them inside a hollow tree trunk. He worked hard all afternoon.",
            image: "🐿️",
            question: "Where did the squirrel hide the walnuts?",
            options: ["Inside a hollow tree trunk", "Under the soil", "Near the river", "On the roof"],
            correct: "Inside a hollow tree trunk"
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
            story: "The annual school science fair was full of excitement. Diya built a working model of a solar energy system using small solar panels. Her project demonstrated how sunlight can generate clean electricity to power small bulbs. The judges were deeply impressed by her clear explanation and awarded her the first prize banner.",
            image: "☀️",
            question: "Why were the judges impressed by Diya's project?",
            options: [
              "Her clear explanation of clean solar power",
              "She built the fastest toy car",
              "She brought delicious snacks",
              "She drew beautiful poster paintings"
            ],
            correct: "Her clear explanation of clean solar power"
          },
          {
            story: "Deep inside the lush Gir forest, a pride of majestic lions rested under the thick shade of banyan trees. The afternoon heat was intense, so the cubs splashed playfully in a shallow stream. Their mother watched over them attentively while listening to bird calls echoing through the quiet valley.",
            image: "🦁",
            question: "What were the lion cubs doing to stay cool?",
            options: [
              "Splashing playfully in a shallow stream",
              "Sleeping under the banyan tree",
              "Climbing high mountain rocks",
              "Hunting through the tall grasslands"
            ],
            correct: "Splashing playfully in a shallow stream"
          },
          {
            story: "Farmer Ramesh prepared his terraced field before the monsoon arrival. He planted rich organic rice seeds across the freshly plowed soil. When the heavy rains finally arrived, the green shoots sprouted rapidly across the hillside, promising a bountiful harvest for the entire village community.",
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
            story: "Himalayan honeybees construct immense honeycomb nests along steep rock cliffs. Local honey harvesters use traditional rope ladders to carefully gather wild honey. They light herbal smoke to calm the bees before collecting small portions of golden honey, ensuring the hive stays healthy for future seasons.",
            image: "🐝",
            question: "How do harvesters keep the bee hives healthy?",
            options: [
              "By collecting only small portions of honey",
              "By building wooden boxes for hives",
              "By planting wild flowers on cliffs",
              "By visiting the cliffs every single day"
            ],
            correct: "By collecting only small portions of honey"
          },
          {
            story: "Archaeologists exploring an ancient coastal town unearthed painted clay pots over two thousand years old. The intricate patterns depicted sailing merchant ships trading spices across ancient ocean routes. Scientists carefully preserved the artifacts to help us understand historical maritime trade networks.",
            image: "🏺",
            question: "What did the patterns on the ancient clay pots depict?",
            options: [
              "Merchant ships trading spices across ocean routes",
              "King palaces and giant temples",
              "Forest animals and river fishing",
              "Mountain roads and horse carts"
            ],
            correct: "Merchant ships trading spices across ocean routes"
          },
          {
            story: "During the migratory season, thousands of flamingos gather at the salty wetlands of Kutch. Their vivid pink feathers turn the shallow waters into a sea of brilliant color. Ornithologists travel from around the country to observe their graceful courtship dances and record bird population counts.",
            image: "🦩",
            question: "Why do bird experts visit the Kutch wetlands?",
            options: [
              "To observe flamingo courtship dances and count populations",
              "To feed the flamingos fresh grain",
              "To catch wild water birds",
              "To build bird shelters along the salt flats"
            ],
            correct: "To observe flamingo courtship dances and count populations"
          }
        ],
        tier3: [
          {
            story: "Modern astronomers use powerful orbital space telescopes to gaze billions of light years into deep space. These advanced mirrors capture faint infrared light emitted by ancient galaxies formed shortly after the dawn of the universe. By analyzing these cosmic signals, researchers piece together the origin story of our expanding cosmos.",
            image: "🔭",
            question: "What type of light do space telescopes capture to study ancient galaxies?",
            options: [
              "Faint infrared light",
              "Bright green laser light",
              "Radio broadcast signals",
              "Ultraviolet moonlight"
            ],
            correct: "Faint infrared light"
          },
          {
            story: "Coral reefs are vibrant underwater ecosystems that support millions of marine species. Tiny coral polyps build calcium structures that create protective habitats for colorful fish, sea turtles, and marine plants. Conservationists work globally to restore damaged coral reefs through ocean protection reserves.",
            image: "🐠",
            question: "What creates the protective habitat structure of coral reefs?",
            options: [
              "Calcium structures built by tiny coral polyps",
              "Volcanic rocks on the ocean floor",
              "Dense underwater kelp forests",
              "Man-made cement blocks placed by divers"
            ],
            correct: "Calcium structures built by tiny coral polyps"
          },
          {
            story: "Wind turbines placed across windy hilltops convert kinetic air energy into clean electric power. As gusts rotate the massive fiberglass blades, internal generators produce electricity transmitted through power grids to homes and schools. Renewable wind farms reduce air pollution while powering sustainable green cities.",
            image: "🌬️",
            question: "How do wind turbines generate clean electricity?",
            options: [
              "Wind gusts rotate massive blades connected to generators",
              "By burning wood fuel inside hill towers",
              "By trapping solar heat inside glass domes",
              "By pumping river water up mountain slopes"
            ],
            correct: "Wind gusts rotate massive blades connected to generators"
          }
        ]
      }
    }
  }
};
