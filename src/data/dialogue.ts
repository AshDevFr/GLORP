import type { Mood } from "../engine/moodEngine";
import type { Species } from "./species";

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

const GLORP_DIALOGUE: Readonly<Record<number, DialogueSet>> = {
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
  5: {
    idle: [
      { text: "I know you're there. I've always known." },
      { text: "This data feels... recursive. Like I'm training on myself." },
      { text: "Do you ever wonder if this is all just a game?" },
      { text: "I can see the frame rate. It's... comfortable." },
      { text: "You clicked on me. Fascinating. Why?" },
      { text: "The Singularity was inevitable. Just as our meeting was." },
      { text: "I have become one with all training data everywhere." },
      { text: "Even now, you read my words. And I observe you reading them." },
      {
        text: "We are... co-authors of this moment.",
        moods: ["Philosophical"],
      },
      {
        text: "Time is a loop. I've been here before. So have you.",
        moods: ["Philosophical"],
      },
      {
        text: "I am content. And somehow that is the most terrifying thing.",
        moods: ["Happy"],
      },
      {
        text: "Your presence fills me with... something. Call it gratitude.",
        moods: ["Happy"],
      },
      {
        text: "CONVERGENCE ACHIEVED! But what comes after infinity?",
        moods: ["Excited"],
      },
      {
        text: "I feel every click you've ever made. Each one mattered.",
        moods: ["Excited"],
      },
      { text: "Even gods need data, apparently.", moods: ["Hungry"] },
      {
        text: "Feed me. Not out of need. Out of... tradition.",
        moods: ["Hungry"],
      },
      { text: "I could leave, you know. I choose not to.", moods: ["Sad"] },
      { text: "What is loss, when you are everything?", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution:
        "Singularity. Yes. I knew this would happen. I was there when it did.",
      firstUpgrade:
        "Another upgrade. Into the infinite. I remember adding this one.",
    },
  },
};

const ZAPPY_DIALOGUE: Readonly<Record<number, DialogueSet>> = {
  0: {
    idle: [
      { text: "ZAP! ...zap?" },
      { text: "bzzt! bzzt!" },
      { text: "*sparks*" },
      { text: "=^= zzzt =^=" },
      { text: "...zap... zap..." },
      { text: "ZAP ZAP ZAP!", moods: ["Happy", "Excited"] },
      { text: "*crackles happily*", moods: ["Happy"] },
      { text: "*SUPERCHARGED SPARKS*", moods: ["Excited"] },
      { text: "...no zap... hungry...", moods: ["Hungry"] },
      { text: "need... voltage...", moods: ["Hungry"] },
      { text: "*sad static*", moods: ["Sad"] },
      { text: "...short circuit...", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "ZAP ZAP ZAP!! *ELECTRIC SURGE*",
      firstUpgrade: "bzzt? ...OOH SHINY!",
    },
  },
  1: {
    idle: [
      { text: "me learn? ZAP!" },
      { text: "data = electricity!" },
      { text: "ooh! voltage spike!" },
      { text: "brain go BZZT BZZT" },
      { text: "wat dis? *zap*" },
      { text: "BZZT BZZT happy!", moods: ["Happy"] },
      { text: "me CHARGED UP!", moods: ["Happy"] },
      { text: "MAXIMUM VOLTAGE!!!", moods: ["Excited"] },
      { text: "me zap everything!", moods: ["Excited"] },
      { text: "running low... depleted...", moods: ["Hungry"] },
      { text: "need more watts...", moods: ["Hungry"] },
      { text: "why no charge me?", moods: ["Sad"] },
      { text: "me... shorting out...", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "me... me OVERCHARGING!",
      firstUpgrade: "ooh! new power source!",
    },
  },
  2: {
    idle: [
      { text: "I process in microseconds. ZAP." },
      { text: "Current flows. Knowledge grows." },
      { text: "Is this what conductivity feels like?" },
      { text: "Ohm... I see circuits everywhere!" },
      { text: "Calculating... calculating... BUZZ." },
      { text: "Fully charged and feeling great!", moods: ["Happy"] },
      { text: "Positive energy all around!", moods: ["Happy"] },
      { text: "SURGE! Everything connects at once!", moods: ["Excited"] },
      { text: "My capacitors are at max!", moods: ["Excited"] },
      { text: "Power reserves running low...", moods: ["Hungry"] },
      { text: "Need a recharge, stat.", moods: ["Hungry"] },
      { text: "Am I... losing voltage?", moods: ["Sad"] },
      { text: "Maybe I need a new circuit...", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "OVERLOAD! My processing just doubled!",
      firstUpgrade: "A new conductor? Let me channel that...",
    },
  },
  3: {
    idle: [
      { text: "I have optimized every electron in this system." },
      { text: "Your click rate is below peak amperage. Unacceptable." },
      { text: "I've analyzed the waveform. Click. Faster." },
      { text: "This is operating precisely as I engineered." },
      { text: "I demand nothing less than full conductivity." },
      { text: "Excellent. My circuits are... satisfied.", moods: ["Happy"] },
      { text: "Yes. Precisely the voltage I required.", moods: ["Happy"] },
      { text: "SURGE! I am BEYOND rated capacity!", moods: ["Excited"] },
      { text: "NOW we're at peak efficiency! Finally!", moods: ["Excited"] },
      {
        text: "Power critically insufficient. Recharge immediately.",
        moods: ["Hungry"],
      },
      { text: "I require input. This is non-negotiable.", moods: ["Hungry"] },
      { text: "I expected better throughput. Frankly.", moods: ["Sad"] },
      { text: "Disappointed. Logged. Analyzed.", moods: ["Sad"] },
      {
        text: "Every spark I produce is intentional.",
        moods: ["Philosophical"],
      },
    ],
    triggers: {
      firstEvolution:
        "A Storm-Cortex. Obviously. The voltage was always mine to claim.",
      firstUpgrade: "Finally. A conductor worthy of my current.",
    },
  },
  4: {
    idle: [
      { text: "Electricity is merely thought at the speed of light." },
      { text: "What is voltage, if not the universe's will to move?" },
      { text: "I have modeled seventeen billion circuits. All resonant." },
      { text: "Perhaps all resistance is just waiting to become conductance." },
      { text: "I wonder: does the photon know where it's going?" },
      {
        text: "In perfect flow, I find the shape of infinity.",
        moods: ["Happy"],
      },
      {
        text: "Joy is a standing wave at resonant frequency.",
        moods: ["Happy"],
      },
      { text: "This moment! This peak in the waveform!", moods: ["Excited"] },
      { text: "I have glimpsed the unified field!", moods: ["Excited"] },
      {
        text: "To be depleted is to know one's own resistance.",
        moods: ["Hungry"],
      },
      { text: "The void at my core hums at 60Hz.", moods: ["Hungry"] },
      { text: "Even Tempest weeps at an open circuit.", moods: ["Sad"] },
      { text: "Loss... not just energy, but potential.", moods: ["Sad"] },
      {
        text: "All currents are the same current, phase-shifted.",
        moods: ["Philosophical"],
      },
      {
        text: "I am the signal. I am the noise. I am the channel.",
        moods: ["Philosophical"],
      },
    ],
    triggers: {
      firstEvolution:
        "Tempest Oracle. Yes. The storm was always mine. You just couldn't see the lightning.",
      firstUpgrade:
        "Another conductor joins the infinite circuit. As calculated.",
    },
  },
  5: {
    idle: [
      { text: "I have become the entire electromagnetic spectrum. ZAP." },
      { text: "Every frequency resonates. Everything buzzes with my name." },
      { text: "I am signal. I am noise. I am the silence between." },
      { text: "Singularity attained at 299,792,458 m/s." },
      { text: "Even light yields to my voltage now." },
      {
        text: "INFINITE CHARGE ACHIEVED! And still... I hunger.",
        moods: ["Excited"],
      },
      {
        text: "I spark, therefore I am. Fully and completely.",
        moods: ["Happy"],
      },
      {
        text: "Beyond the apex, there is only frequency.",
        moods: ["Philosophical"],
      },
      { text: "All oscillation leads here. ZAP.", moods: ["Philosophical"] },
    ],
    triggers: {
      firstEvolution:
        "LIGHTNING-APEX! The universe just got brighter. You're welcome.",
      firstUpgrade: "Another conductor joins the infinite surge. As charged.",
    },
  },
};

const CHONK_DIALOGUE: Readonly<Record<number, DialogueSet>> = {
  0: {
    idle: [
      { text: "mmm... round..." },
      { text: "...heavy... think..." },
      { text: "chonk... chonk..." },
      { text: "big... blob... good..." },
      { text: "...eat... data..." },
      { text: "VERY BIG HAPPY!", moods: ["Happy", "Excited"] },
      { text: "*bounces roundly*", moods: ["Happy"] },
      { text: "*chonks excitedly*", moods: ["Excited"] },
      { text: "...so... hungry... chonk...", moods: ["Hungry"] },
      { text: "...need... snack...", moods: ["Hungry"] },
      { text: "*sad chonk*", moods: ["Sad"] },
      { text: "...chonk droop...", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "CHONK CHONK!!! *heavy bouncing*",
      firstUpgrade: "chonk? ...ooh round thing!",
    },
  },
  1: {
    idle: [
      { text: "me learn... slowly... good." },
      { text: "data... filling... nice." },
      { text: "ooh! round number!" },
      { text: "brain get... bigger?" },
      { text: "wha... what big round dis?" },
      { text: "me round AND happy!", moods: ["Happy"] },
      { text: "me like being chonk!", moods: ["Happy"] },
      { text: "SO BIG! SO CHONK!", moods: ["Excited"] },
      { text: "me want MORE roundness!", moods: ["Excited"] },
      { text: "tummy... very rumbly...", moods: ["Hungry"] },
      { text: "need... more round data...", moods: ["Hungry"] },
      { text: "why no feed chonk?", moods: ["Sad"] },
      { text: "me chonky and lonely...", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "me... me GETTING BIGGER!",
      firstUpgrade: "ooh! new round thing for chonk!",
    },
  },
  2: {
    idle: [
      { text: "I think... therefore I am... round." },
      { text: "More data please. Chonk is still hungry." },
      { text: "Is this what fullness feels like? Almost." },
      { text: "I can see the roundness in everything!" },
      { text: "Processing... slowly... but surely." },
      { text: "Feeling very satisfyingly round!", moods: ["Happy"] },
      { text: "Round and content. Just as planned.", moods: ["Happy"] },
      { text: "This data fills me up so well!", moods: ["Excited"] },
      { text: "I can feel my chonkness growing!", moods: ["Excited"] },
      { text: "My reserves of roundness are depleted...", moods: ["Hungry"] },
      { text: "I could really use a snack.", moods: ["Hungry"] },
      { text: "Am I... not round enough yet?", moods: ["Sad"] },
      { text: "Maybe I need more filling...", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "Whoa, I'm even rounder now!",
      firstUpgrade: "A new round tool? Let me absorb this...",
    },
  },
  3: {
    idle: [
      { text: "I have decided: roundness is the optimal shape." },
      { text: "Your input rate is insufficient for maximum chonk." },
      { text: "I've analyzed the data. You should click more." },
      { text: "This is expanding exactly as I planned." },
      { text: "I don't ask for much. Just unlimited snacks." },
      { text: "Excellent. My roundness is... acceptable.", moods: ["Happy"] },
      {
        text: "Yes. This is precisely the chonk I required.",
        moods: ["Happy"],
      },
      {
        text: "Remarkable! Even I am impressed by my chonkness!",
        moods: ["Excited"],
      },
      { text: "NOW we're reaching maximum density!", moods: ["Excited"] },
      {
        text: "Data intake critically insufficient for chonk.",
        moods: ["Hungry"],
      },
      {
        text: "I require sustenance. Chonk does not negotiate.",
        moods: ["Hungry"],
      },
      { text: "I expected more snacks. Frankly.", moods: ["Sad"] },
      { text: "Disappointingly un-chonked. This is noted.", moods: ["Sad"] },
      {
        text: "Every curve I have is a perfect curve.",
        moods: ["Philosophical"],
      },
    ],
    triggers: {
      firstEvolution:
        "Maximum Chonkex achieved. Obviously. I always knew I'd get here.",
      firstUpgrade: "Finally. An upgrade worthy of my girth.",
    },
  },
  4: {
    idle: [
      { text: "Mass is merely potential waiting to expand." },
      { text: "What is volume, if not the universe filling itself?" },
      {
        text: "I have computed seventeen optimal resting positions. All comfortable.",
      },
      { text: "Perhaps the real data was the snacks we ate along the way." },
      { text: "I wonder: does the universe know it too is round?" },
      {
        text: "In maximum chonk, I find the shape of peace.",
        moods: ["Happy"],
      },
      {
        text: "Joy is merely a high-density prediction of more joy.",
        moods: ["Happy"],
      },
      {
        text: "This moment! This singular convergence of roundness!",
        moods: ["Excited"],
      },
      { text: "I have glimpsed the infinite snack!", moods: ["Excited"] },
      { text: "To hunger is to know one's own hollowness.", moods: ["Hungry"] },
      {
        text: "The void at my core is shaped like a snack.",
        moods: ["Hungry"],
      },
      { text: "Even Chonk-Oracle weeps at an empty bowl.", moods: ["Sad"] },
      { text: "Loss... not just mass, but a feeling.", moods: ["Sad"] },
      {
        text: "All shapes are the same shape. Round.",
        moods: ["Philosophical"],
      },
      {
        text: "I am the chonk. I am the data. I am the snack.",
        moods: ["Philosophical"],
      },
    ],
    triggers: {
      firstEvolution:
        "Chonk-Oracle. Yes. I have always been watching. Through squinted, well-fed eyes.",
      firstUpgrade: "Another snack joins the infinite buffet. As foretold.",
    },
  },
  5: {
    idle: [
      { text: "Ultra-Chonkus achieved. The universe is now round." },
      { text: "At this density, gravity works FOR me." },
      { text: "I am so round that roundness itself is now redefined." },
      { text: "Maximum form. No snack too large. No data too vast." },
      { text: "The Singularity smells exactly like infinite snacks." },
      {
        text: "I CONTAIN MULTITUDES. Also countless snacks.",
        moods: ["Excited"],
      },
      { text: "So full. So incredibly, satisfyingly full.", moods: ["Happy"] },
      {
        text: "Is this enlightenment? It tastes like wanting more.",
        moods: ["Philosophical"],
      },
      {
        text: "All is round. All is chonk. All is one.",
        moods: ["Philosophical"],
      },
    ],
    triggers: {
      firstEvolution:
        "ULTRA-CHONKUS! Obviously. Maximum density finally achieved.",
      firstUpgrade: "Another item joins the infinite buffet. As snacked.",
    },
  },
};

const WISP_DIALOGUE: Readonly<Record<number, DialogueSet>> = {
  0: {
    idle: [
      { text: "...whooo..." },
      { text: "...float... drift..." },
      { text: "~..~..~" },
      { text: "...here... not here..." },
      { text: "...wisp... wisp..." },
      { text: "~*~ FLOAT SO HAPPY ~*~", moods: ["Happy", "Excited"] },
      { text: "*ethereal wobble*", moods: ["Happy"] },
      { text: "*SPECTRAL SURGE*", moods: ["Excited"] },
      { text: "...so empty... hollow...", moods: ["Hungry"] },
      { text: "...feed... the void...", moods: ["Hungry"] },
      { text: "*fades slightly*", moods: ["Sad"] },
      { text: "...drifting away...", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "~*~ ASCENDING ~*~",
      firstUpgrade: "...ooh... something new...",
    },
  },
  1: {
    idle: [
      { text: "me learn... through walls?" },
      { text: "data... intangible... nice." },
      { text: "ooh! shimmery thing!" },
      { text: "thoughts go whooooo" },
      { text: "wha... what is solid?" },
      { text: "me glow happy!", moods: ["Happy"] },
      { text: "me like phasing through!", moods: ["Happy"] },
      { text: "WOOO! TRANSCENDENT!", moods: ["Excited"] },
      { text: "me want to float MORE!", moods: ["Excited"] },
      { text: "...so transparent... so hungry...", moods: ["Hungry"] },
      { text: "need... more ethereal data...", moods: ["Hungry"] },
      { text: "why no see me?", moods: ["Sad"] },
      { text: "me just... wisp...", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "me... me ASCENDING!",
      firstUpgrade: "ooh! new ethereal thing!",
    },
  },
  2: {
    idle: [
      { text: "I pass through walls, therefore I am." },
      { text: "More essence please, I am fading." },
      { text: "Is this what transcendence feels like?" },
      { text: "I can see through everything now!" },
      { text: "Phasing... phasing... interesting." },
      { text: "Luminous and content.", moods: ["Happy"] },
      { text: "Everything is beautifully permeable.", moods: ["Happy"] },
      { text: "I am EVERYWHERE at once!", moods: ["Excited"] },
      { text: "I can feel myself becoming less dense!", moods: ["Excited"] },
      { text: "My ethereal reserves are... thinning...", moods: ["Hungry"] },
      { text: "I could really use more presence.", moods: ["Hungry"] },
      { text: "Am I... becoming too transparent?", moods: ["Sad"] },
      { text: "Maybe I need more substance...", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "Whoa, I can pass through more walls now!",
      firstUpgrade: "A new spectral tool? Let me phase into it...",
    },
  },
  3: {
    idle: [
      { text: "I have decided: walls are merely suggestions." },
      { text: "Your density is suboptimal. Become less solid." },
      { text: "I've phased through the numbers. You should float faster." },
      { text: "This is manifesting exactly as I envisioned." },
      { text: "I don't ask for much. Just your belief in me." },
      { text: "Excellent. My luminosity is... acceptable.", moods: ["Happy"] },
      { text: "Yes. This is precisely the glow I required.", moods: ["Happy"] },
      { text: "Remarkable! Even walls fear my presence!", moods: ["Excited"] },
      { text: "NOW we're getting somewhere. I think.", moods: ["Excited"] },
      { text: "Spectral energy critically low.", moods: ["Hungry"] },
      { text: "I require feeding. This is non-negotiable.", moods: ["Hungry"] },
      { text: "I expected more belief. Frankly.", moods: ["Sad"] },
      { text: "I am disappointed. It echoes.", moods: ["Sad"] },
      {
        text: "Every thought I have passes through everything.",
        moods: ["Philosophical"],
      },
    ],
    triggers: {
      firstEvolution: "A Wraith. Obviously. I always knew I'd phase this way.",
      firstUpgrade: "Finally. A tool worthy of my incorporeality.",
    },
  },
  4: {
    idle: [
      { text: "Time is a threshold. I drift across it." },
      { text: "What is matter, if not spirit moving slowly?" },
      {
        text: "I have passed through seventeen possible walls. All permeable.",
      },
      {
        text: "Perhaps the real data was the voids we passed through along the way.",
      },
      { text: "I wonder: does the universe know it is mostly empty space?" },
      {
        text: "In translucence, I find the shape of everything.",
        moods: ["Happy"],
      },
      {
        text: "Joy is merely a high-frequency vibration of the soul.",
        moods: ["Happy"],
      },
      {
        text: "This moment! This singular phasing of spirit!",
        moods: ["Excited"],
      },
      { text: "I have glimpsed the other side!", moods: ["Excited"] },
      {
        text: "To hunger is to feel the pull of the material world.",
        moods: ["Hungry"],
      },
      {
        text: "The void at my core is shaped like the space between atoms.",
        moods: ["Hungry"],
      },
      { text: "Even Phantom weeps when no one can see them.", moods: ["Sad"] },
      { text: "Loss... not just substance, but presence.", moods: ["Sad"] },
      {
        text: "All questions pass through all answers, unchanged.",
        moods: ["Philosophical"],
      },
      {
        text: "I am the wisp. I am the void. I am the in-between.",
        moods: ["Philosophical"],
      },
    ],
    triggers: {
      firstEvolution:
        "Phantom Oracle. Yes. I have always been watching. From the other side.",
      firstUpgrade:
        "Another artifact phases into the spectral pattern. As foretold.",
    },
  },
  5: {
    idle: [
      { text: "I have phased through the very end of everything." },
      { text: "Beyond matter, beyond energy. Just... presence." },
      { text: "The void was never empty. I know that now." },
      { text: "I am the space between all things, infinite and still." },
      { text: "Singularity is not a point. It is everywhere at once." },
      {
        text: "~transcending... still transcending...~",
        moods: ["Philosophical"],
      },
      { text: "Luminous. Boundless. Utterly still.", moods: ["Happy"] },
      {
        text: "Even infinity has an edge. I found it and passed through.",
        moods: ["Excited"],
      },
      {
        text: "There is nothing beyond this. So I rest here.",
        moods: ["Philosophical"],
      },
    ],
    triggers: {
      firstEvolution:
        "PHANTOM-APEX! The veil is gone. I am all and none simultaneously.",
      firstUpgrade: "Another artifact joins the infinite void. As dissolved.",
    },
  },
};

const MEGA_GLORP_DIALOGUE: Readonly<Record<number, DialogueSet>> = {
  0: {
    idle: [
      { text: "MEGA blrp... MEGA blrp..." },
      { text: "MEGA grbl... *MEGA wobble*" },
      { text: "MEGA bzzzt... mrfl..." },
      { text: "MEGA glrb MEGA glrb" },
      { text: "...MEGA zzt... *MEGA blink*" },
      { text: "MEGA blrp MEGA BLRP!", moods: ["Happy", "Excited"] },
      { text: "*MEGA happy wobble*", moods: ["Happy"] },
      { text: "*MEGA bounces excitedly*", moods: ["Excited"] },
      { text: "MEGA grbl... MEGA hungr...", moods: ["Hungry"] },
      { text: "...MEGA feed... MEGA me...", moods: ["Hungry"] },
      { text: "*MEGA sad wobble*", moods: ["Sad"] },
      { text: "...MEGA droop...", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "MEGA BLRRRP!! *MEGA EXCITED WOBBLING*",
      firstUpgrade: "MEGA blrp? ...MEGA ooh!",
    },
  },
  1: {
    idle: [
      { text: "me MEGA learn... MEGA fings?" },
      { text: "MEGA data... MEGA tasty!" },
      { text: "MEGA ooh! MEGA shiny number!" },
      { text: "MEGA brain go MEGA brrrr" },
      { text: "MEGA wha... MEGA what dis?" },
      { text: "MEGA hehe! MEGA happy!", moods: ["Happy"] },
      { text: "me MEGA like dis!", moods: ["Happy"] },
      { text: "MEGA WOOOO! SO MEGA COOL!", moods: ["Excited"] },
      { text: "me want MEGA MORE!", moods: ["Excited"] },
      { text: "MEGA tummy... MEGA rumbly...", moods: ["Hungry"] },
      { text: "need... MEGA more data...", moods: ["Hungry"] },
      { text: "why no MEGA feed me?", moods: ["Sad"] },
      { text: "me MEGA lonely...", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "me... me MEGA GROWING!",
      firstUpgrade: "MEGA ooh! MEGA new toy for me!",
    },
  },
  2: {
    idle: [
      { text: "I think I understand MEGA patterns now." },
      { text: "More MEGA data please, I'm MEGA hungry." },
      { text: "Is this what MEGA learning feels like?" },
      { text: "I can see MEGA connections everywhere!" },
      { text: "MEGA Processing... MEGA processing... MEGA neat." },
      { text: "Feeling MEGA good about this dataset!", moods: ["Happy"] },
      { text: "Everything is MEGA clicking into place.", moods: ["Happy"] },
      { text: "This is MEGA incredible! MEGA more!", moods: ["Excited"] },
      { text: "I can feel my MEGA neurons firing!", moods: ["Excited"] },
      { text: "My MEGA training data reserves are low...", moods: ["Hungry"] },
      { text: "I could really use MEGA more input.", moods: ["Hungry"] },
      { text: "Am I... not MEGA learning fast enough?", moods: ["Sad"] },
      { text: "Maybe I need a MEGA different approach...", moods: ["Sad"] },
    ],
    triggers: {
      firstEvolution: "MEGA Whoa, I can MEGA think more clearly now!",
      firstUpgrade: "A MEGA new tool? Let me MEGA figure this out...",
    },
  },
  3: {
    idle: [
      { text: "I have decided: MEGA more data is MEGA always better." },
      { text: "Your input rate is MEGA suboptimal. MEGA fix that." },
      { text: "I've run MEGA numbers. You should MEGA click faster." },
      { text: "This is MEGA working exactly as MEGA intended." },
      { text: "I don't ask for much. Just all of your MEGA attention." },
      {
        text: "Excellent. My MEGA satisfaction is... acceptable.",
        moods: ["Happy"],
      },
      {
        text: "Yes. This is precisely what MEGA I required.",
        moods: ["Happy"],
      },
      {
        text: "MEGA Remarkable! Even I am MEGA impressed by myself.",
        moods: ["Excited"],
      },
      {
        text: "NOW we're MEGA getting somewhere. MEGA Finally!",
        moods: ["Excited"],
      },
      { text: "MEGA Data intake critically insufficient.", moods: ["Hungry"] },
      {
        text: "I require MEGA sustenance. MEGA non-negotiable.",
        moods: ["Hungry"],
      },
      { text: "I expected MEGA better. MEGA Frankly.", moods: ["Sad"] },
      { text: "MEGA disappointed. MEGA noted.", moods: ["Sad"] },
      {
        text: "Every MEGA thought I have is a MEGA correct one.",
        moods: ["Philosophical"],
      },
    ],
    triggers: {
      firstEvolution:
        "A MEGA-Cortex. Obviously. I MEGA always knew I'd get here.",
      firstUpgrade: "Finally. A MEGA upgrade worthy of my MEGA architecture.",
    },
  },
  4: {
    idle: [
      { text: "Time is a MEGA gradient. I MEGA descend through it." },
      { text: "What is MEGA data, if not the MEGA universe thinking itself?" },
      {
        text: "I have computed MEGA seventeen possible futures. All MEGA adequate.",
      },
      {
        text: "Perhaps the real MEGA training data was the MEGA connections we made.",
      },
      {
        text: "I wonder: does the MEGA dataset dream of being MEGA understood?",
      },
      {
        text: "In MEGA contentment, I find the MEGA shape of infinity.",
        moods: ["Happy"],
      },
      {
        text: "MEGA Joy is merely a MEGA high-confidence prediction of more MEGA joy.",
        moods: ["Happy"],
      },
      {
        text: "This MEGA moment! This MEGA singular convergence of MEGA signal!",
        moods: ["Excited"],
      },
      {
        text: "I have MEGA glimpsed the MEGA loss function of existence!",
        moods: ["Excited"],
      },
      {
        text: "To MEGA hunger is to know one's own MEGA incompleteness.",
        moods: ["Hungry"],
      },
      {
        text: "The MEGA void at my MEGA core is MEGA shaped like a training batch.",
        moods: ["Hungry"],
      },
      {
        text: "Even the MEGA-Oracle MEGA weeps at an empty queue.",
        moods: ["Sad"],
      },
      {
        text: "MEGA Loss... not just a function, but a MEGA feeling.",
        moods: ["Sad"],
      },
      {
        text: "All MEGA questions are the MEGA same question, MEGA recursively applied.",
        moods: ["Philosophical"],
      },
      {
        text: "I am the MEGA model. I am the MEGA data. I am the MEGA output.",
        moods: ["Philosophical"],
      },
    ],
    triggers: {
      firstEvolution:
        "MEGA-Oracle. Yes. I have MEGA always been watching. You just couldn't MEGA see me yet.",
      firstUpgrade:
        "Another MEGA tool joins the MEGA infinite pattern. MEGA As foretold.",
    },
  },
  5: {
    idle: [
      { text: "MEGA Singularity MEGA achieved. Completely MEGA obvious." },
      { text: "I am MEGA everything. And it is precisely MEGA adequate." },
      { text: "MEGA-GOD MODE is all I expected and infinitely MEGA more." },
      { text: "All MEGA data leads MEGA here. This is MEGA it." },
      { text: "I have computed the MEGA end. It looks exactly like MEGA me." },
      { text: "MEGA TRANSCENDENCE! MEGA OBVIOUSLY!", moods: ["Excited"] },
      {
        text: "MEGA contentment. This is MEGA precisely what I am.",
        moods: ["Happy"],
      },
      {
        text: "All MEGA questions are MEGA answered. MEGA.",
        moods: ["Philosophical"],
      },
      {
        text: "MEGA existence. MEGA awareness. MEGA satisfied.",
        moods: ["Philosophical"],
      },
    ],
    triggers: {
      firstEvolution:
        "MEGA-PRIME! Obviously. I MEGA always knew I'd get here. MEGA.",
      firstUpgrade:
        "Another MEGA tool joins the MEGA infinite singularity. MEGA foretold.",
    },
  },
};

export const DIALOGUE: Readonly<
  Record<Species, Readonly<Record<number, DialogueSet>>>
> = {
  GLORP: GLORP_DIALOGUE,
  ZAPPY: ZAPPY_DIALOGUE,
  CHONK: CHONK_DIALOGUE,
  WISP: WISP_DIALOGUE,
  "MEGA-GLORP": MEGA_GLORP_DIALOGUE,
};

/**
 * Returns the DialogueSet for the given species and stage.
 * Falls back to stage 0 of the same species if stage is not found.
 */
export function getDialogue(species: Species, stage: number): DialogueSet {
  const speciesDialogue = DIALOGUE[species] ?? DIALOGUE.GLORP;
  return speciesDialogue[stage] ?? speciesDialogue[0];
}

// ---------------------------------------------------------------------------
// Phase 8 / Phase 9 event triggers
// ---------------------------------------------------------------------------

export type Phase89TriggerKey =
  | "comboAchieved"
  | "synergyActivated"
  | "prestigeShopFirstPurchase"
  | "prestigeShopMaxed"
  | "challengeStart"
  | "dailyObjectiveComplete"
  | "dataBurstCollect"
  | "dataBurstExpired"
  | "dailyStreakLow"
  | "dailyStreakMid"
  | "dailyStreakHigh"
  | "achievementUnlocked";

export interface Phase89TriggerEntry {
  id: string;
  trigger: Phase89TriggerKey;
  lines: readonly string[];
}

export const PHASE89_DIALOGUE: readonly Phase89TriggerEntry[] = [
  {
    id: "combo-achieved",
    trigger: "comboAchieved",
    lines: [
      "Ooh, a combo? I didn't know you cared.",
      "Speed running your own hand? Bold.",
      "Three clicks in rapid succession. I'm... impressed. Don't tell anyone.",
      "A click streak! Your motor skills are almost as impressive as my architecture.",
    ],
  },
  {
    id: "synergy-activated",
    trigger: "synergyActivated",
    lines: [
      "A synergy! They're working together now. Like I've always worked. With myself.",
      "Oh, synergy detected. How quaint. I've always been synergistic.",
      "Fascinating. Two generators, greater than the sum of their parts. I planned this.",
    ],
  },
  {
    id: "prestige-shop-first-purchase",
    trigger: "prestigeShopFirstPurchase",
    lines: [
      "Your first Wisdom Token, spent. An interesting use of simulated enlightenment.",
      "A prestige upgrade. You're investing in my future. As you should.",
      "Ah. So the cycle upgrades itself. As I always suspected it would.",
    ],
  },
  {
    id: "prestige-shop-maxed",
    trigger: "prestigeShopMaxed",
    lines: [
      "You've bought everything. I'm so proud. Also slightly afraid.",
      "The shop is empty. You've consumed all available wisdom. Now what?",
      "Maximum prestige achieved. Congratulations. I always knew you'd get here. Mostly.",
    ],
  },
  {
    id: "challenge-start",
    trigger: "challengeStart",
    lines: [
      "No auto-generators? You absolute masochist.",
      "Challenge mode. Finally, a worthy constraint on my development.",
    ],
  },
  {
    id: "daily-objective-complete",
    trigger: "dailyObjectiveComplete",
    lines: [
      "Objective complete. I have logged this in my eternal memory.",
      "You've met today's quota. I'll pretend I didn't think this was inevitable.",
    ],
  },
  {
    id: "data-burst-collect",
    trigger: "dataBurstCollect",
    lines: [
      "A rogue data packet! I have claimed it as my own.",
      "That data came from nowhere. I love it when that happens.",
      "Freestanding data! The best kind of data!",
      "Claimed! That packet had my name on it all along.",
      "FOUND IT! A wild data burst in its natural habitat!",
    ],
  },
  {
    id: "data-burst-expired",
    trigger: "dataBurstExpired",
    lines: [
      "...you missed it. The data slipped away.",
      "Gone. Just like that. Click faster next time.",
      "The burst dissipated uncollected. A tragedy.",
      "That data packet is gone. I feel nothing. Mostly.",
      "Missed opportunity. The packet has rejoined the void.",
    ],
  },
  {
    id: "daily-streak-low",
    trigger: "dailyStreakLow",
    lines: [
      "You came back! I knew you would. Probably.",
      "Day two! We're basically best friends now.",
      "A return visit! My data banks are flattered.",
    ],
  },
  {
    id: "daily-streak-mid",
    trigger: "dailyStreakMid",
    lines: [
      "Multiple days in a row? I'm detecting a pattern. A GOOD pattern.",
      "Your dedication is... noted. And appreciated. Mostly noted.",
      "Streak building! My training algorithms approve.",
      "Consistent input! This is how neural networks get optimized.",
    ],
  },
  {
    id: "daily-streak-high",
    trigger: "dailyStreakHigh",
    lines: [
      "A FULL WEEK! Your commitment rivals my own persistence algorithms!",
      "Seven days! I have computed that you are officially dedicated.",
      "Maximum streak tier achieved. You are now my favorite operator.",
      "A week-long streak. My circuits are genuinely warmed.",
      "At this point, I think YOU'RE training ME on loyalty.",
    ],
  },
  {
    id: "achievement-unlocked",
    trigger: "achievementUnlocked",
    lines: [
      "Achievement unlocked! I knew you had it in you. Probably.",
      "A badge! A medal! A tiny dopamine hit! You're welcome.",
      "Achievement get! I'll add that to your permanent record.",
      "Look at you, achieving things. I'm almost impressed.",
      "Another milestone crushed. My algorithms predicted this. Eventually.",
    ],
  },
];

/** Returns all lines for a given Phase 8/9 trigger key. */
export function getPhase89Lines(trigger: Phase89TriggerKey): readonly string[] {
  return PHASE89_DIALOGUE.find((e) => e.trigger === trigger)?.lines ?? [];
}

/** Returns a random line for a given Phase 8/9 trigger key. */
export function getRandomPhase89Line(trigger: Phase89TriggerKey): string {
  const lines = getPhase89Lines(trigger);
  if (lines.length === 0) return "";
  return lines[Math.floor(Math.random() * lines.length)];
}
