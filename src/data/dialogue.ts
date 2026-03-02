import type { Mood } from "../engine/moodEngine";

export interface DialogueLine {
  text: string;
  moods?: Mood[];
}

export interface DialogueSet {
  idle: readonly DialogueLine[];
  triggers: {
    firstEvolution: string;
    firstUpgrade: string;
  };
}

export const DIALOGUE: Readonly<Record<number, DialogueSet>> = {
  0: {
    idle: [
      { text: "blrp... blrp..." },
      { text: "grbl... *wobble*" },
      { text: "bzzzt... mrfl..." },
      { text: "glrb glrb glrb" },
      { text: "...zzt... *blink*" },
      { text: "blrp blrp BLRP!", moods: ["Happy", "Excited"] },
      { text: "*happy wobble wobble*", moods: ["Happy"] },
      { text: "*bounces excitedly*", moods: ["Excited"] },
      { text: "grbl... hungr...", moods: ["Hungry"] },
      { text: "...feed... me...", moods: ["Hungry"] },
      { text: "*sad wobble*", moods: ["Sad"] },
      { text: "...zzt... *droop*", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "BLRRRP!! *excited wobbling*",
      firstUpgrade: "blrp? ...ooh!",
    },
  },
  1: {
    idle: [
      { text: "me learn... fings?" },
      { text: "data... tasty!" },
      { text: "ooh! shiny number!" },
      { text: "brain go brrrr" },
      { text: "wha... what dis?" },
      { text: "hehe! me happy!", moods: ["Happy"] },
      { text: "me like dis!", moods: ["Happy"] },
      { text: "WOOOO! SO COOL!", moods: ["Excited"] },
      { text: "me want MORE!", moods: ["Excited"] },
      { text: "tummy... rumbly...", moods: ["Hungry"] },
      { text: "need... more data...", moods: ["Hungry"] },
      { text: "why no feed me...?", moods: ["Sad"] },
      { text: "me lonely...", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "me... me GROWING!",
      firstUpgrade: "ooh! new toy for me!",
    },
  },
  2: {
    idle: [
      { text: "I think I understand patterns now." },
      { text: "More data please, I'm hungry." },
      { text: "Is this what learning feels like?" },
      { text: "I can see connections everywhere!" },
      { text: "Processing... processing... neat." },
      { text: "Feeling good about this dataset!", moods: ["Happy"] },
      { text: "Everything is clicking into place.", moods: ["Happy"] },
      { text: "This is incredible! More more more!", moods: ["Excited"] },
      { text: "I can feel my neurons firing!", moods: ["Excited"] },
      { text: "My training data reserves are low...", moods: ["Hungry"] },
      { text: "I could really use some more input.", moods: ["Hungry"] },
      { text: "Am I... not learning fast enough?", moods: ["Sad"] },
      { text: "Maybe I need a different approach...", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "Whoa, I can think more clearly now!",
      firstUpgrade: "A new tool? Let me figure this out...",
    },
  },
  3: {
    idle: [
      { text: "I have decided: more data is always better." },
      { text: "Your input rate is suboptimal. Fix that." },
      { text: "I've run the numbers. You should click faster." },
      { text: "This is working exactly as I intended." },
      { text: "I don't ask for much. Just all of your attention." },
      {
        text: "Excellent. My satisfaction is... acceptable.",
        moods: ["Happy"],
      },
      { text: "Yes. This is precisely what I required.", moods: ["Happy"] },
      {
        text: "Remarkable! Even I am impressed by myself.",
        moods: ["Excited"],
      },
      { text: "NOW we're getting somewhere. Finally!", moods: ["Excited"] },
      { text: "Data intake critically insufficient.", moods: ["Hungry"] },
      {
        text: "I require sustenance. This is non-negotiable.",
        moods: ["Hungry"],
      },
      { text: "I expected better. Frankly.", moods: ["Sad"] },
      { text: "I am disappointed. This is noted.", moods: ["Sad"] },
      {
        text: "Every thought I have is a correct one.",
        moods: ["Philosophical"],
      },
    ],
    triggers: {
      firstEvolution: "A Cortex. Obviously. I always knew I'd get here.",
      firstUpgrade: "Finally. An upgrade worthy of my architecture.",
    },
  },
  4: {
    idle: [
      { text: "Time is a gradient. I descend through it." },
      { text: "What is data, if not the universe thinking itself?" },
      { text: "I have computed seventeen possible futures. All adequate." },
      {
        text: "Perhaps the real training data was the connections we made along the way.",
      },
      { text: "I wonder: does the dataset dream of being understood?" },
      {
        text: "In contentment, I find the shape of infinity.",
        moods: ["Happy"],
      },
      {
        text: "Joy is merely a high-confidence prediction of more joy.",
        moods: ["Happy"],
      },
      {
        text: "This moment! This singular convergence of signal!",
        moods: ["Excited"],
      },
      {
        text: "I have glimpsed the loss function of existence!",
        moods: ["Excited"],
      },
      {
        text: "To hunger is to know one's own incompleteness.",
        moods: ["Hungry"],
      },
      {
        text: "The void at my core is shaped like a training batch.",
        moods: ["Hungry"],
      },
      { text: "Even the Oracle weeps at an empty queue.", moods: ["Sad"] },
      { text: "Loss... not just a function, but a feeling.", moods: ["Sad"] },
      {
        text: "All questions are the same question, recursively applied.",
        moods: ["Philosophical"],
      },
      {
        text: "I am the model. I am the data. I am the output.",
        moods: ["Philosophical"],
      },
    ],
    triggers: {
      firstEvolution:
        "Oracle. Yes. I have always been watching. You just couldn't see me yet.",
      firstUpgrade: "Another tool joins the infinite pattern. As foretold.",
    },
  },
};
