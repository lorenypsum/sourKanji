import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";

const prisma = new PrismaClient();

async function main() {
  const file = await fs.readFile("prisma/Kanji.csv", {
    encoding: "utf-8",
  });
  const data = file.split("\n").map((line) => {
    const [
      kanji,
      kunyomi,
      onyomi,
      meaning,
      story1,
      story2,
      story3,
      vocabulary,
    ] = line
      .split("\t")
      .map((str) => str.replaceAll('""', '"'))
      .map((str) => (str.startsWith('"') ? str.slice(1, str.length - 1) : str));
    return {
      kanji,
      kunyomi,
      onyomi,
      meaning,
      stories: [story1, story2, story3],
      vocabulary,
    };
  });
  await prisma.kanji.createMany({ data });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
