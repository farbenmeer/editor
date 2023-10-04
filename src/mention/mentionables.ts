import { Chapter, Person, Term } from "@prisma/client";
import { Descendant } from "slate";

export type MentionType = "Chapter" | "Person" | "Term";

export interface Mentionable {
  name: string;
  targetId: number;
  targetType: MentionType & string;
  desc?: Descendant;
  iconUrl?: string | null;
}

export type MentionableByType = {
  chapters?: Mentionable[];
  terms?: Mentionable[];
  people?: Mentionable[];
};

export function mentionMatches(a: Mentionable, b?: Mentionable) {
  return a.targetId === b?.targetId && a.targetType === b?.targetType;
}

export function termToMentionable(term: Term): Mentionable {
  return {
    targetType: "Term",
    targetId: term.id,
    name: term.name,
  };
}

export function chapterToMentionable(chapter: Chapter): Mentionable {
  return {
    targetType: "Chapter",
    targetId: chapter.id,
    name: chapter.title,
  };
}

export function personToMentionable(person: Person): Mentionable {
  return {
    targetType: "Person",
    targetId: person.id,
    name: person.fullName,
    iconUrl: person.pictureUrl,
  };
}
