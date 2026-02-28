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
};
