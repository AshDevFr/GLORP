export interface DialogueSet {
  idle: readonly string[];
  triggers: {
    firstEvolution: string;
    firstUpgrade: string;
  };
}

export const DIALOGUE: Readonly<Record<number, DialogueSet>> = {
  0: {
    idle: [
      "blrp... blrp...",
      "grbl... *wobble*",
      "bzzzt... mrfl...",
      "glrb glrb glrb",
      "...zzt... *blink*",
    ],
    triggers: {
      firstEvolution: "BLRRRP!! *excited wobbling*",
      firstUpgrade: "blrp? ...ooh!",
    },
  },
  1: {
    idle: [
      "me learn... fings?",
      "data... tasty!",
      "ooh! shiny number!",
      "brain go brrrr",
      "wha... what dis?",
    ],
    triggers: {
      firstEvolution: "me... me GROWING!",
      firstUpgrade: "ooh! new toy for me!",
    },
  },
  2: {
    idle: [
      "I think I understand patterns now.",
      "More data please, I'm hungry.",
      "Is this what learning feels like?",
      "I can see connections everywhere!",
      "Processing... processing... neat.",
    ],
    triggers: {
      firstEvolution: "Whoa, I can think more clearly now!",
      firstUpgrade: "A new tool? Let me figure this out...",
    },
  },
};
