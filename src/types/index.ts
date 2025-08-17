// ==============================
// Domain types (app-level model)
// ==============================

export type User = {
  id: string;
  name: string;
  last_name: string;
  email: string;
  password: string;
  language: "en" | "ru" | string;
  profile_picture?: { url: string };
  github?: string;
  linkedin?: string;
  personal_website?: string;
  purchasedCourses: Course[];
};

export type Course = {
  id: string;
  name: string;
  slug: string;
  url?: string;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  language: "en" | "ru" | string;
  sections: Section[];
};

export type Section = {
  id: string;
  title: string;
  slug: string;
  order: number;
  modules: Module[];
  parentCourse: Course;
};

export type Module = {
  id: string;
  title: string;
  slug: string;
  order: number;
  weeks: Week[];
  parentSection: Section;
};

export type Week = {
  id: string;
  title: string;
  slug: string;
  order: number;
  days: Day[];
  parentModule: Module;
};

export type Day = {
  id: string;
  title: string;
  slug: string;
  order: number;
  lessons: Lesson[];
  parentWeek: Week; // keep for places that still use Week/Module navigation
};

// Lightweight day used elsewhere in the app (kept for compatibility)
export type DayLite = {
  id: string;
  title: string;
  slug: string;
  order: number;
  parentWeek: {
    id: string;
    title: string;
    slug: string;
  };
  lessons: {
    id: string;
    title: string;
    slug: string;
    lessonType: Lesson["lessonType"];
    isMandatory: boolean;
  }[];
};

// NEW: minimal Day type for the Lesson page breadcrumb needs (no week/module)
export type DayForLessonPage = {
  id: string;
  title: string;
  slug: string;
  order: number;
  lessons: {
    id: string;
    title: string;
    slug: string;
    lessonType: Lesson["lessonType"];
    isMandatory: boolean;
    order?: number | null;
  }[];
  section: {
    id: string;
    title: string;
    slug: string;
    course: {
      id: string;
      name: string;
      slug: string;
    };
  };
};

// ==============================
// DatoCMS content block types
// (match GraphQL exactly)
// ==============================

export type ExtraResourceBlock = {
  title: string;
  url?: string | null;
};

export type ExtraResourceItemRecord = {
  __typename?: "ExtraResourceItemRecord";
  title: string;
  url?: string | null;
};

export type TextBlockRecord = {
  __typename: "TextBlockRecord";
  id: string;
  title?: string | null;
  content: string;
  subsections?: { id: string; text: string }[] | null;
};

export type ImageBlockRecord = {
  __typename: "ImageBlockRecord";
  id: string;
  title?: string | null;
  imageContent?: { url: string } | null; // <-- GraphQL field name
};

export type VideoBlockRecord = {
  __typename: "VideoBlockRecord";
  id: string;
  title?: string | null;
  videoUrl?: { url: string; provider?: string | null; thumbnailUrl?: string | null } | null;
};

export type PresentationBlockRecord = {
  __typename: "PresentationBlockRecord";
  id: string;
  title?: string | null;
  code: string;
};

export type AlertBlockRecord = {
  __typename: "AlertBlockRecord";
  id: string;
  text: string;
  backgroundColor?: string | null;
  textColor?: string | null;
};

export type DatoCmsLessonBlock =
  | TextBlockRecord
  | ImageBlockRecord
  | VideoBlockRecord
  | PresentationBlockRecord
  | AlertBlockRecord;

// ==============================
// Lessons (domain + DatoCMS)
// ==============================

export type Lesson = {
  id: string;
  title: string;
  slug: string;
  lessonType: "Lesson" | "Lab" | "Assessment" | "Class Recording" | "Extra";
  isMandatory: boolean;
  content: DatoCmsLessonBlock[];      // uses the union above
  extraResources?: ExtraResourceBlock[]; // optional
  parentDay: Day;
};

// Lightweight version you often pass around
export type LessonLite = {
  id: string;
  title: string;
  slug: string;
  lessonType: Lesson["lessonType"];
  isMandatory: boolean;
  order?: number | null;
};

// ==============================
// Misc
// ==============================

export type CoursesGrouped = {
  purchased: Course[];
  nonPurchased: Course[];
};

// ==============================
// GraphQL response helpers for getLessonBySlug
// ==============================

export type CourseNode = { id: string; name: string; slug: string };
export type SectionNode = { id: string; title: string; slug: string; course: CourseNode };

export type DayNode = {
  id: string;
  title: string;
  slug: string;
  order: number;
  lessons: LessonLite[];
  section: SectionNode;
};

export type LessonDeepNode = LessonLite & {
  content: DatoCmsLessonBlock[];
  extraResources?: ExtraResourceItemRecord[] | null;
  day: DayNode;
};

export type LessonBySlugResponse = {
  lesson: LessonDeepNode | null;
};