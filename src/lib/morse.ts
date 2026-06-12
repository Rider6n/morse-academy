export type MorseChar = {
  char: string;
  code: string; // "." and "-"
  pronunciation: string;
  mnemonic: string;
};

export const MORSE: MorseChar[] = [
  { char: "A", code: ".-",   pronunciation: "Di-Dah",            mnemonic: "An Apple — short bite, long crunch." },
  { char: "B", code: "-...", pronunciation: "Dah-di-di-dit",     mnemonic: "Big Bouncing Baby Bear." },
  { char: "C", code: "-.-.", pronunciation: "Dah-di-Dah-dit",    mnemonic: "Coca-Cola Coca-Cola." },
  { char: "D", code: "-..",  pronunciation: "Dah-di-dit",        mnemonic: "Dog Did It." },
  { char: "E", code: ".",    pronunciation: "Dit",               mnemonic: "Easiest letter — a single dot." },
  { char: "F", code: "..-.", pronunciation: "Di-di-Dah-dit",     mnemonic: "Fish-and-Chip-Fish." },
  { char: "G", code: "--.",  pronunciation: "Dah-Dah-dit",       mnemonic: "Good Gravy now." },
  { char: "H", code: "....", pronunciation: "Di-di-di-dit",      mnemonic: "Hippity-hoppity-hippity-hop." },
  { char: "I", code: "..",   pronunciation: "Di-dit",            mnemonic: "I see (two short eyes)." },
  { char: "J", code: ".---", pronunciation: "Di-Dah-Dah-Dah",    mnemonic: "Jamaica — one short, three long." },
  { char: "K", code: "-.-",  pronunciation: "Dah-di-Dah",        mnemonic: "Kan-ga-Roo." },
  { char: "L", code: ".-..", pronunciation: "Di-Dah-di-dit",     mnemonic: "Los Angeles loves it." },
  { char: "M", code: "--",   pronunciation: "Dah-Dah",           mnemonic: "Mmm-Mmm good." },
  { char: "N", code: "-.",   pronunciation: "Dah-dit",           mnemonic: "Navy — opposite of A." },
  { char: "O", code: "---",  pronunciation: "Dah-Dah-Dah",       mnemonic: "Oh-Oh-Oh, three long calls." },
  { char: "P", code: ".--.", pronunciation: "Di-Dah-Dah-dit",    mnemonic: "A Poo-Poo-Pa-Doo." },
  { char: "Q", code: "--.-", pronunciation: "Dah-Dah-di-Dah",    mnemonic: "God Save the Queen." },
  { char: "R", code: ".-.",  pronunciation: "Di-Dah-dit",        mnemonic: "Ro-Tat-Or — palindrome." },
  { char: "S", code: "...",  pronunciation: "Di-di-dit",         mnemonic: "Sa-Sa-Sa — three quick dots." },
  { char: "T", code: "-",    pronunciation: "Dah",               mnemonic: "Tall — one long dash." },
  { char: "U", code: "..-",  pronunciation: "Di-di-Dah",         mnemonic: "Under-the-sea." },
  { char: "V", code: "...-", pronunciation: "Di-di-di-Dah",      mnemonic: "Beethoven's Fifth: ta-ta-ta-DAH." },
  { char: "W", code: ".--",  pronunciation: "Di-Dah-Dah",        mnemonic: "Wah-Hoo-Hoo." },
  { char: "X", code: "-..-", pronunciation: "Dah-di-di-Dah",     mnemonic: "X marks an exit-exit." },
  { char: "Y", code: "-.--", pronunciation: "Dah-di-Dah-Dah",    mnemonic: "Yo-da-Yo-Yo." },
  { char: "Z", code: "--..", pronunciation: "Dah-Dah-di-dit",    mnemonic: "Zinc-Zinc-zip-zip." },
];

export const MORSE_MAP: Record<string, string> = Object.fromEntries(
  MORSE.map((m) => [m.char, m.code]),
);
export const CODE_TO_CHAR: Record<string, string> = Object.fromEntries(
  MORSE.map((m) => [m.code, m.char]),
);

export const prettyCode = (code: string) =>
  code.replace(/\./g, "·").replace(/-/g, "—").split("").join(" ");

export function encodeWord(word: string): string {
  return word
    .toUpperCase()
    .split("")
    .map((c) => (c === " " ? "/" : MORSE_MAP[c] ?? ""))
    .filter(Boolean)
    .join(" ");
}

export const WORDS = {
  beginner: ["SOS", "CAT", "DOG", "SUN", "HAT", "TEA", "RUN", "OWL", "ICE", "MAP"],
  intermediate: ["HELLO", "WORLD", "MORSE", "RADIO", "SIGNAL", "LEARN", "QUICK", "BRAVE"],
  advanced: ["FREQUENCY", "TELEGRAPH", "ENCRYPTION", "BROADCAST", "ANTENNA", "OSCILLATOR"],
};

export const MESSAGES = [
  "HELLO WORLD",
  "SEND HELP",
  "GOOD MORNING",
  "MEET AT NOON",
  "STAY SAFE",
  "OVER AND OUT",
];
