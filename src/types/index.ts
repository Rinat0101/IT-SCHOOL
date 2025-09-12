// ==============================
// Domain types (app-level model)
// ==============================

export type LanguageCode = "en" | "ru" | string;

export type User = {
  id: string;
  name: string;
  last_name: string;
  email: string;
  password: string;
  language: LanguageCode;
  profile_picture?: { url: string } | null;
  github?: string | null;
  linkedin?: string | null;
  personal_website?: string | null;

  // Business note: purchases/enrollments should live in your own DB; this remains for convenience
  purchasedCourses: Course[];
};

// ---------- Course hierarchy ----------

export type Course = {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  language: LanguageCode;
  coverImage?: { url: string } | null;

  sections: Section[];
};

export type Section = {
  id: string;
  title: string;
  slug: string;
  order: number;
  enabled?: boolean | null;
  shortDescription?: string | null;
  coverImage?: { url: string } | null;

  modules: Module[];

  // pointer up for convenience in UI (breadcrumb, back links)
  parentCourse: Pick<Course, "id" | "name" | "slug">;
};

// Page-scoped slimmer shapes
export type CourseHeader = {
  id: string;
  name: string;
  slug: string;
};

export type SectionDeepForPage = {
  id: string;
  title: string;
  slug: string;
  order?: number | null;
  // Optional: light link back to course if you want it on the section object too
  parentCourse?: CourseHeader;

  modules: {
    id: string;
    title: string;
    slug: string;
    order?: number | null;
    weeks: {
      id: string;
      title: string;
      slug: string;
      order?: number | null;
      days: {
        id: string;
        title: string;
        slug: string;
        order?: number | null;
        lessons: {
          id: string;
          title: string;
          slug: string;
          lessonType: "Lesson" | "Lab" | "Assessment" | "Class Recording" | "Extra";
          isMandatory: boolean;
          order?: number | null;
          weight?: number | null;
        }[];
      }[];
    }[];
  }[];
};

export type Module = {
  id: string;
  title: string;
  slug: string;
  order: number;

  weeks: Week[];

  parentSection: Pick<Section, "id" | "title" | "slug">;
};

export type Week = {
  id: string;
  title: string;
  slug: string;
  order: number;
  enabled?: boolean | null;

  days: Day[];

  parentModule: Pick<Module, "id" | "title" | "slug">;
};

export type Day = {
  id: string;
  title: string;
  slug: string;
  order: number;
  enabled?: boolean | null;

  lessons: Lesson[];

  parentWeek: Pick<Week, "id" | "title" | "slug">;
};

// Lightweight “day” used where we don’t need parent pointers
export type DayLite = {
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

export type TextSubsection = { id: string; title?: string | null; text?: string | null };

export type TextBlockRecord = {
  __typename: "TextBlockRecord";
  id: string;
  title?: string | null;
  content: string;
  subsections?: TextSubsection[] | null;
};

export type ImageBlockRecord = {
  __typename: "ImageBlockRecord";
  id: string;
  title?: string | null;
  imageContent?: { url: string } | null; // GraphQL field name
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
// Lessons
// ==============================

export type Lesson = {
  id: string;
  title: string;
  slug: string;
  lessonType: "Lesson" | "Lab" | "Assessment" | "Class Recording" | "Extra";
  order: number;                 // required in your model
  isMandatory: boolean;
  weight: number;                // required in your model

  content: DatoCmsLessonBlock[];
  extraResources?: ExtraResourceBlock[] | null;

  parentDay: Pick<Day, "id" | "title" | "slug">;
};

// Minimal lesson used in lists/nav
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