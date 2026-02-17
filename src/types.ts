export interface Section {
  header: string;
  points: string[];
}

export interface Chapter {
  title: string;
  sections: Section[];
}

export interface Outline {
  title: string;
  chapters: Chapter[];
}
