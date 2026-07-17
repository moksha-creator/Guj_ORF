// Adaptive Content Bank mapped to L1 - L4

const L1_DATA = {
  level: 1,
  type: 'WORD_VOCAB',
  words: [
    "cat","dog","sun","hat","run","pen","cup","bus","big","red",
    "box","bed","bag","fan","net","pig","top","mat","log","jam",
    "ten","sit","hop","cut","map","hen","cow","fish","tree","star"
  ],
  vocabBank: [
    { word:"Cat",   audioLabel:"Tap the picture of the cat.", options:["assets/cat.png","assets/dog.png","assets/bird.png","assets/fish.png"], correctIndex:0 },
    { word:"Sun",   audioLabel:"Tap the sun.",   options:["assets/moon.png","assets/sun.png","assets/star.png","assets/cloud.png"], correctIndex:1 },
    { word:"Bus",   audioLabel:"Tap the bus.",   options:["assets/car.png","assets/bike.png","assets/bus.png","assets/boat.png"], correctIndex:2 },
    { word:"Ball",  audioLabel:"Tap the ball.",  options:["assets/top.png","assets/doll.png","assets/bat.png","assets/ball.png"], correctIndex:3 },
    { word:"Apple", audioLabel:"Tap the apple.", options:["assets/apple.png","assets/banana.png","assets/mango.png","assets/grapes.png"], correctIndex:0 },
    { word:"Hat",   audioLabel:"Tap the hat.",   options:["assets/bag.png","assets/hat.png","assets/cap.png","assets/shoe.png"], correctIndex:1 },
    { word:"Tree",  audioLabel:"Tap the tree.",  options:["assets/flower.png","assets/leaf.png","assets/tree.png","assets/grass.png"], correctIndex:2 },
    { word:"Dog",   audioLabel:"Tap the dog.",   options:["assets/cat.png","assets/cow.png","assets/hen.png","assets/dog.png"], correctIndex:3 },
    { word:"Fish",  audioLabel:"Tap the fish.",  options:["assets/fish.png","assets/bird.png","assets/cat.png","assets/dog.png"], correctIndex:0 },
    { word:"Star",  audioLabel:"Tap the star.",  options:["assets/sun.png","assets/star.png","assets/moon.png","assets/cloud.png"], correctIndex:1 }
  ]
};

const L2_DATA = {
  level: 2,
  type: 'SENTENCE_VOCAB',
  sentences: [
    "The cat is on the mat.",
    "I can see the sun.",
    "The dog can run.",
    "My hat is red.",
    "We go to the park.",
    "The pig is big.",
    "A bird is in the tree.",
    "He has a red bus.",
    "The cup is on the box.",
    "She can hop on the log.",
    "I have a pen and a bag.",
    "The cow is in the grass."
  ],
  vocabBank: [
    { word:"Mat",  audioLabel:"Tap the mat.",  options:["assets/box.png","assets/mat.png","assets/cup.png","assets/pen.png"], correctIndex:1 },
    { word:"Pig",  audioLabel:"Tap the pig.",  options:["assets/cow.png","assets/hen.png","assets/pig.png","assets/dog.png"], correctIndex:2 },
    { word:"Bird", audioLabel:"Tap the bird.", options:["assets/fish.png","assets/bird.png","assets/cat.png","assets/hen.png"], correctIndex:1 },
    { word:"Bus",  audioLabel:"Tap the bus.",  options:["assets/bus.png","assets/car.png","assets/bike.png","assets/boat.png"], correctIndex:0 },
    { word:"Log",  audioLabel:"Tap the log.",  options:["assets/tree.png","assets/leaf.png","assets/log.png","assets/grass.png"], correctIndex:2 },
    { word:"Pen",  audioLabel:"Tap the pen.",  options:["assets/cup.png","assets/bag.png","assets/box.png","assets/pen.png"], correctIndex:3 },
    { word:"Cow",  audioLabel:"Tap the cow.",  options:["assets/pig.png","assets/cow.png","assets/hen.png","assets/dog.png"], correctIndex:1 },
    { word:"Cup",  audioLabel:"Tap the cup.",  options:["assets/cup.png","assets/box.png","assets/mat.png","assets/pen.png"], correctIndex:0 }
  ]
};

const L3_DATA = {
    level: 3,
    type: 'PASSAGE_COMP',
    story: {
        id: "l3_story_1",
        text: "The orange cat was sleeping. A little bird flew to the window.",
        images: ["assets/story_1.png", "assets/story_2.png"]
    },
    comprehensionBank: [
      {
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
    ]
};

const L4_DATA = {
    level: 4,
    type: 'PASSAGE_WCPM_SEQ',
    story: {
        id: "l4_story_1",
        text: "The orange cat was sleeping on a blue mat. A little blue bird flew to the window. The cat woke up and looked at the bird. They smiled at each other.",
        images: ["assets/story_1.png", "assets/story_2.png", "assets/story_3.png", "assets/story_4.png"]
    },
    comprehensionBank: [
      {
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
    ]
};

function getContentForLevel(level) {
    if (level === 1) return JSON.parse(JSON.stringify(L1_DATA));
    if (level === 2) return JSON.parse(JSON.stringify(L2_DATA));
    if (level === 3) return JSON.parse(JSON.stringify(L3_DATA));
    return JSON.parse(JSON.stringify(L4_DATA)); // L4
}
