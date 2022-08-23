import { customAlphabet } from "nanoid";

const stringIdGenerator = customAlphabet(
  "abcdefghijklmnopqrstuvwxyz0123456789",
  8
);

export const generateStringId = () => stringIdGenerator();
