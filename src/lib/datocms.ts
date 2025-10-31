import { GraphQLClient } from "graphql-request";

import type {
  User,
  Course,
  Section,
  Module,
  Lesson,
  Day as DayType,
  CoursesGrouped,
  DatoCmsLessonBlock,
  ExtraResourceBlock,
} from "@/types";

// ───────────────────────────────────────────────────────────────────────────────
// GraphQL client
// ───────────────────────────────────────────────────────────────────────────────
const API_TOKEN = process.env.DATOCMS_API_KEY;
const API_URL = "https://graphql.datocms.com/";

const client = new GraphQLClient(API_URL, {
  headers: { authorization: `Bearer ${API_TOKEN}` },
  fetch: (url, options = {}) => {
    return fetch(url, {
      ...options,
      cache: "no-cache",
    });
  },
});

// Small helper: non-mutating sort by `order` (undefined/null => last)
function sortByOrder<T extends { order?: number | null }>(arr: ReadonlyArray<T> | T[] = []): T[] {
  return [...arr].sort((a, b) => {
    const ao = a.order ?? Number.MAX_SAFE_INTEGER;
    const bo = b.order ?? Number.MAX_SAFE_INTEGER;
    return ao - bo;
  });
}

// ───────────────────────────────────────────────────────────────────────────────
// User
// ───────────────────────────────────────────────────────────────────────────────
export async function getUser(userId: string): Promise<User | null> {
  try {
    const query = /* GraphQL */ `
      query GetUser($userId: ItemId) {
        user(filter: { id: { eq: $userId } }) {
          id
          name
          last_name
          email
          password
          language
          profile_picture {
            url
          }
          github
          linkedin
          personal_website
          purchasedCourses {
            id
            name
            slug
            enabled
            language
          }
        }
      }
    `;
    const data = await client.request<{ user: User | null }>(query, { userId });
    return data.user || null;
  } catch (error) {
    console.error("Failed to fetch user from DatoCMS:", error);
    return null;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Courses list split into purchased / nonPurchased (stubbed for now)
// ───────────────────────────────────────────────────────────────────────────────
export async function getAllCourses(): Promise<Course[]> {
  const query = /* GraphQL */ `
    query getAllCourses {
      allCourses(first: 200, orderBy: _createdAt_ASC) {
        id
        name
        slug
        enabled
        language
        covermage {
          url
        }
        url
      }
    }
  `;
  const { allCourses } = await client.request<{ allCourses: Course[] }>(query);
  return allCourses;
}

// ───────────────────────────────────────────────────────────────────────────────
// Full course (deep) — includes sections/modules/weeks/days/lessons
// ───────────────────────────────────────────────────────────────────────────────
export async function getCourse(slug: string): Promise<Course | null> {
  const sortByOrder = <T extends { order?: number | null }>(arr: T[] = []) =>
    [...arr].sort(
      (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
    );

  // 1️⃣ Get course by slug
  const qCourse = /* GraphQL */ `
    query CourseBySlug($slug: String!) {
      course(filter: { slug: { eq: $slug } }) {
        id
        name
        slug
        enabled
        language
      }
    }
  `;
  const rCourse = await client.request<{
    course: { id: string; name: string; slug: string; enabled: boolean; language: string } | null;
  }>(qCourse, { slug });

  const base = rCourse.course;
  if (!base) return null;

  // 2️⃣ Fetch all sections linked to this course
  const qSections = /* GraphQL */ `
    query SectionsByCourse($courseId: ItemId) {
      allSections(filter: { course: { eq: $courseId } }, orderBy: order_ASC) {
        id
        title
        slug
        order
      }
    }
  `;
  const rSections = await client.request<{ allSections: any[] }>(qSections, {
    courseId: base.id,
  });
  const sectionsSorted = sortByOrder(rSections.allSections);

  // 3️⃣ Fetch all modules linked to those sections
  const sectionIds = sectionsSorted.map((s) => s.id);
  const qModules = /* GraphQL */ `
    query ModulesBySections($sectionIds: [ItemId]) {
      allModules(filter: { section: { in: $sectionIds } }) {
        id
        title
        slug
        order
        section {
          id
        }
      }
    }
  `;
  const rModules = await client.request<{ allModules: any[] }>(qModules, { sectionIds });
  const modulesBySection: Record<string, any[]> = {};
  for (const m of rModules.allModules) {
    const sid = m.section?.id;
    if (!sid) continue;
    if (!modulesBySection[sid]) modulesBySection[sid] = [];
    modulesBySection[sid].push(m);
  }

  // 4️⃣ Fetch all weeks linked to modules
  const moduleIds = rModules.allModules.map((m) => m.id);
  const qWeeks = /* GraphQL */ `
    query WeeksByModules($moduleIds: [ItemId]) {
      allWeeks(filter: { module: { in: $moduleIds } }) {
        id
        title
        slug
        order
        module {
          id
        }
      }
    }
  `;
  const rWeeks = await client.request<{ allWeeks: any[] }>(qWeeks, { moduleIds });
  const weeksByModule: Record<string, any[]> = {};
  for (const w of rWeeks.allWeeks) {
    const mid = w.module?.id;
    if (!mid) continue;
    if (!weeksByModule[mid]) weeksByModule[mid] = [];
    weeksByModule[mid].push(w);
  }

  // 5️⃣ Fetch all days linked to weeks
  const weekIds = rWeeks.allWeeks.map((w) => w.id);
  const qDays = /* GraphQL */ `
    query DaysByWeeks($weekIds: [ItemId]) {
      allDays(filter: { week: { in: $weekIds } }) {
        id
        title
        slug
        order
        week {
          id
        }
      }
    }
  `;
  const rDays = await client.request<{ allDays: any[] }>(qDays, { weekIds });
  const daysByWeek: Record<string, any[]> = {};
  for (const d of rDays.allDays) {
    const wid = d.week?.id;
    if (!wid) continue;
    if (!daysByWeek[wid]) daysByWeek[wid] = [];
    daysByWeek[wid].push(d);
  }

  // 6️⃣ Fetch all lessons linked to days
  const dayIds = rDays.allDays.map((d) => d.id);
  const qLessons = /* GraphQL */ `
    query LessonsByDays($dayIds: [ItemId]) {
      allLessons(filter: { day: { in: $dayIds } }) {
        id
        title
        slug
        lessonType
        isMandatory
        day {
          id
        }
      }
    }
  `;
  const rLessons = await client.request<{ allLessons: any[] }>(qLessons, { dayIds });
  const lessonsByDay: Record<string, any[]> = {};
  for (const l of rLessons.allLessons) {
    const did = l.day?.id;
    if (!did) continue;
    if (!lessonsByDay[did]) lessonsByDay[did] = [];
    lessonsByDay[did].push(l);
  }

  // 7️⃣ Merge everything together
  const sectionsWithModules = sectionsSorted.map((s) => ({
    ...s,
    modules: sortByOrder(modulesBySection[s.id] ?? []).map((m) => ({
      ...m,
      weeks: sortByOrder(weeksByModule[m.id] ?? []).map((w) => ({
        ...w,
        days: sortByOrder(daysByWeek[w.id] ?? []).map((d) => ({
          ...d,
          lessons: sortByOrder(lessonsByDay[d.id] ?? []),
        })),
      })),
    })),
  }));

  // 8️⃣ Final Course object
  const course: Course = {
    id: base.id,
    name: base.name,
    slug: base.slug,
    enabled: base.enabled,
    language: base.language,
    sections: sectionsWithModules.map((s) => ({
      ...s,
      parentCourse: {
        id: base.id,
        name: base.name,
        slug: base.slug,
        enabled: base.enabled,
        language: base.language,
      } as Course,
    })),
  };

  return course;
}
// ───────────────────────────────────────────────────────────────────────────────
// Sections by course slug (sorted by order)
// ───────────────────────────────────────────────────────────────────────────────
export async function getSections(slug: string): Promise<Section[]> {
  try {
    const query = /* GraphQL */ `
      query getSections($slug: String!) {
        allSections(filter: { course: { slug: { eq: $slug } } }) {
          id
          title
          slug
          order
          course {
            id
          }
        }
      }
    `;
    const data = await client.request<{ allSections: Section[] }>(query, { slug });
    return sortByOrder(data.allSections);
  } catch (error) {
    console.error("❌ Failed to fetch sections from DatoCMS:", error);
    return [];
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Section deep: modules → weeks → days → lessons (assembled in code)
// ───────────────────────────────────────────────────────────────────────────────
type SectionDeepResult = {
  course: { id: string; name: string; slug: string };
  section: {
    id: string;
    title: string;
    slug: string;
    order: number | null;
    // keep your Section shape expectations:
    parentCourse: { id: string; name: string; slug: string };
    modules: {
      id: string;
      title: string;
      slug: string;
      order: number | null;
      weeks: {
        id: string;
        title: string;
        slug: string;
        order: number | null;
        days: {
          id: string;
          title: string;
          slug: string;
          order: number | null;
          lessons: {
            id: string;
            title: string;
            slug: string;
            lessonType: any; // or Lesson["lessonType"]
            isMandatory: boolean;
            order: number | null;
            weight: number | null;
          }[];
        }[];
      }[];
    }[];
  };
};

export async function getSectionDeep(
  courseSlug: string,
  sectionSlug: string
): Promise<SectionDeepResult | null> {
  try {
    // 1) Section by slug (and read its parent course)
    const qSection = /* GraphQL */ `
      query SectionBySlug($sectionSlug: String!) {
        section(filter: { slug: { eq: $sectionSlug } }) {
          id
          title
          slug
          order
          course {
            id
            name
            slug
          }
        }
      }
    `;
    const dSection = await client.request<{
      section: {
        id: string;
        title: string;
        slug: string;
        order?: number | null;
        course: { id: string; name: string; slug: string } | null;
      } | null;
    }>(qSection, { sectionSlug });

    const sec = dSection.section;
    if (!sec || !sec.course) return null;

    // Guard: ensure route courseSlug matches section’s course
    if (sec.course.slug !== courseSlug) return null;

    const sectionId = sec.id;

    // 2) Modules for section
    const qModules = /* GraphQL */ `
      query ModulesBySection($sectionId: ItemId!) {
        allModules(filter: { section: { eq: $sectionId } }) {
          id
          title
          slug
          order
        }
      }
    `;
    const dModules = await client.request<{
      allModules: {
        id: string;
        title: string;
        slug: string;
        order?: number | null;
      }[];
    }>(qModules, { sectionId });

    const modules = sortByOrder(dModules.allModules);

    // If no modules, return the minimal section
    if (modules.length === 0) {
      return {
        course: sec.course,
        section: {
          id: sec.id,
          title: sec.title,
          slug: sec.slug,
          order: sec.order ?? null,
          parentCourse: sec.course,
          modules: [],
        },
      };
    }

    // 3) Weeks for all modules
    const moduleIds = modules.map((m) => m.id);
    const qWeeks = /* GraphQL */ `
      query WeeksByModules($moduleIds: [ItemId]) {
        allWeeks(filter: { module: { in: $moduleIds } }) {
          id
          title
          slug
          order
          module {
            id
          }
        }
      }
    `;
    const dWeeks = await client.request<{
      allWeeks: {
        id: string;
        title: string;
        slug: string;
        order?: number | null;
        module: { id: string };
      }[];
    }>(qWeeks, { moduleIds });

    // 4) Days for all weeks
    const weeksByModule: Record<
      string,
      {
        id: string;
        title: string;
        slug: string;
        order: number | null;
        moduleId: string;
      }[]
    > = {};
    const weeks = sortByOrder(dWeeks.allWeeks).map((w) => {
      const wk = {
        id: w.id,
        title: w.title,
        slug: w.slug,
        order: w.order ?? null,
        moduleId: w.module.id,
      };
      if (!weeksByModule[w.module.id]) weeksByModule[w.module.id] = [];
      weeksByModule[w.module.id].push(wk);
      return wk;
    });

    const weekIds = weeks.map((w) => w.id);
    let days: { id: string; title: string; slug: string; order: number | null; weekId: string }[] =
      [];
    if (weekIds.length > 0) {
      const qDays = /* GraphQL */ `
        query DaysByWeeks($weekIds: [ItemId]) {
          allDays(filter: { week: { in: $weekIds } }) {
            id
            title
            slug
            order
            week {
              id
            }
          }
        }
      `;
      const dDays = await client.request<{
        allDays: {
          id: string;
          title: string;
          slug: string;
          order?: number | null;
          week: { id: string };
        }[];
      }>(qDays, { weekIds });

      days = sortByOrder(dDays.allDays).map((d) => ({
        id: d.id,
        title: d.title,
        slug: d.slug,
        order: d.order ?? null,
        weekId: d.week.id,
      }));
    }

    // 5) Lessons for all days
    const dayIds = days.map((d) => d.id);
    let lessons: {
      id: string;
      title: string;
      slug: string;
      lessonType: any;
      isMandatory: boolean;
      order: number | null;
      weight: number | null;
      dayId: string;
    }[] = [];

    if (dayIds.length > 0) {
      const qLessons = /* GraphQL */ `
        query LessonsByDays($dayIds: [ItemId]) {
          allLessons(
            filter: { day: { in: $dayIds } }
            first: 100 
          ) {
            id
            title
            slug
            lessonType
            isMandatory
            order
            weight
            day {
              id
            }
          }
        }
      `;
      const dLessons = await client.request<{
        allLessons: {
          id: string;
          title: string;
          slug: string;
          lessonType: any;
          isMandatory: boolean;
          order?: number | null;
          weight?: number | null;
          day: { id: string };
        }[];
      }>(qLessons, { dayIds });

      lessons = sortByOrder(dLessons.allLessons).map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        lessonType: l.lessonType,
        isMandatory: !!l.isMandatory,
        order: l.order ?? null,
        weight: l.weight ?? null,
        dayId: l.day.id,
      }));
    }
    // Build maps for quick grouping
    const daysByWeek: Record<
      string,
      {
        id: string;
        title: string;
        slug: string;
        order: number | null;
        lessons: any[];
      }[]
    > = {};
    const lessonsByDay: Record<string, any[]> = {};

    for (const l of lessons) {
      if (!lessonsByDay[l.dayId]) lessonsByDay[l.dayId] = [];
      lessonsByDay[l.dayId].push({
        id: l.id,
        title: l.title,
        slug: l.slug,
        lessonType: l.lessonType,
        isMandatory: l.isMandatory,
        order: l.order,
        weight: l.weight,
      });
    }

    for (const d of days) {
      const dWithLessons = {
        id: d.id,
        title: d.title,
        slug: d.slug,
        order: d.order,
        lessons: sortByOrder(lessonsByDay[d.id] ?? []),
      };
      if (!daysByWeek[d.weekId]) daysByWeek[d.weekId] = [];
      daysByWeek[d.weekId].push(dWithLessons);
    }

    // Stitch weeks into modules
    const moduleBlocks = modules.map((m) => {
      const ws = sortByOrder(weeksByModule[m.id] ?? []).map((w) => ({
        id: w.id,
        title: w.title,
        slug: w.slug,
        order: w.order,
        days: sortByOrder(daysByWeek[w.id] ?? []),
      }));
      return {
        id: m.id,
        title: m.title,
        slug: m.slug,
        order: m.order ?? null,
        weeks: ws,
      };
    });

    return {
      course: sec.course,
      section: {
        id: sec.id,
        title: sec.title,
        slug: sec.slug,
        order: sec.order ?? null,
        parentCourse: sec.course,
        modules: moduleBlocks,
      },
    };
  } catch (err) {
    console.error("❌ getSectionDeep failed:", err);
    return null;
  }
}
// ───────────────────────────────────────────────────────────────────────────────
// Modules tabs (sorted locally)
// ───────────────────────────────────────────────────────────────────────────────
export async function getModulesForTabs(
  sectionId: string
): Promise<Pick<Module, "id" | "title" | "slug" | "order">[]> {
  try {
    const query = /* GraphQL */ `
      query getModulesForTabs($sectionId: ItemId) {
        allModules(filter: { section: { eq: $sectionId } }) {
          id
          title
          slug
          order
        }
      }
    `;
    const data = await client.request<{ allModules: (Module & { order?: number | null })[] }>(
      query,
      { sectionId }
    );
    return sortByOrder<Module & { order?: number | null }>(data.allModules).map((m) => ({
      id: m.id,
      title: m.title,
      slug: m.slug,
      order: m.order ?? null,
    }));
  } catch (error) {
    console.error("❌ Failed to fetch module tabs:", error);
    return [];
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Module structure (weeks/days/lessons) — sort defensively
// ───────────────────────────────────────────────────────────────────────────────
export async function getModuleStructure(moduleId: string): Promise<Module | null> {
  try {
    const query = /* GraphQL */ `
      query getModuleStructure($moduleId: ItemId) {
        module(filter: { id: { eq: $moduleId } }) {
          id
          title
          slug
          order
          weeks {
            id
            title
            slug
            order
            days {
              id
              title
              slug
              order
              lessons {
                id
                title
                slug
                lessonType
                isMandatory
                order
                weight
              }
            }
          }
        }
      }
    `;

    const data = await client.request<{ module: Module | null }>(query, { moduleId });
    const mod = data.module;
    if (!mod) return null;

    mod.weeks = sortByOrder(mod.weeks).map((w) => ({
      ...w,
      days: sortByOrder<DayType>(w.days as DayType[]).map((d) => ({
        ...d,
        lessons: sortByOrder<Lesson>(d.lessons as Lesson[]),
      })),
    }));

    return mod;
  } catch (error: any) {
    console.error("❌ Failed to fetch full module structure:", error?.response || error);
    return null;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Course + section + modules minimal bundle for a section page
// ───────────────────────────────────────────────────────────────────────────────
export async function getSectionData(
  courseSlug: string,
  sectionSlug: string
): Promise<{
  course: Course;
  section: Section;
  modules: Pick<Module, "id" | "title" | "slug" | "order">[];
} | null> {
  try {
    const course = await getCourse(courseSlug);
    if (!course) return null;

    const section = course.sections.find((s) => s.slug === sectionSlug);
    if (!section) return null;

    const modules = await getModulesForTabs(section.id);
    return { course, section, modules: sortByOrder(modules) };
  } catch (error) {
    console.error("❌ Failed to fetch section page data:", error);
    return null;
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Lesson by slug (with content + day lessons for sidebar/nav)
// ───────────────────────────────────────────────────────────────────────────────
// --- helper types for this function only ---
type GqlLessonResp = {
  lesson: {
    id: string;
    title: string;
    slug: string;
    lessonType: Lesson["lessonType"];
    isMandatory: boolean;
    order?: number | null;
    weight?: number | null;
    content: any[];
    extraResources?: { title: string; url?: string | null }[] | null;
    day: {
      id: string;
      title: string;
      slug: string;
      order: number;
      week: {
        id: string;
        title: string;
        slug: string;
        module: {
          id: string;
          title: string;
          slug: string;
          section: {
            id: string;
            title: string;
            slug: string;
            course: { id: string; name: string; slug: string };
          };
        };
      };
    } | null;
  } | null;
};

type GqlDayLessonsResp = {
  allLessons: {
    id: string;
    title: string;
    slug: string;
    lessonType: Lesson["lessonType"];
    isMandatory: boolean;
    order?: number | null;
  }[];
};

export async function getLessonBySlug(lessonSlug: string): Promise<{
  lesson: {
    id: string;
    title: string;
    slug: string;
    lessonType: Lesson["lessonType"];
    isMandatory: boolean;
    order?: number | null;
    weight?: number | null;
    content: DatoCmsLessonBlock[];
    extraResources?: ExtraResourceBlock[];
  } | null;
  day: {
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
  } | null;
  courseId: string | null;
  courseTitle: string | null;
  courseSlug: string | null;
  sectionTitle: string | null;
  sectionSlug: string | null;
} | null> {
  try {
    // 1) fetch the lesson + day->week->module->section->course chain + blocks
    const LESSON_QUERY = /* GraphQL */ `
      query GetLessonBySlug($lessonSlug: String!) {
        lesson(filter: { slug: { eq: $lessonSlug } }) {
          id
          title
          slug
          lessonType
          isMandatory
          order
          weight
          labDescription

          content {
            __typename

            ... on TextBlockRecord {
              id
              title
              content
              subsections {
                ... on SubsectionRecord {
                  id
                  title
                  text
                }
              }
            }

            ... on ImageBlockRecord {
              id
              title
              imageContent {
                url
              }
            }

            ... on VideoBlockRecord {
              id
              title
              videoUrl {
                url
                provider
                thumbnailUrl
              }
            }

            ... on PresentationBlockRecord {
              id
              title
              code
            }

            ... on AlertBlockRecord {
              id
              text
              backgroundColor
              textColor
            }
          }

          extraResources {
            ... on ExtraResourceItemRecord {
              title
              url
            }
          }

          day {
            id
            title
            slug
            order
            week {
              id
              title
              slug
              module {
                id
                title
                slug
                section {
                  id
                  title
                  slug
                  course {
                    id
                    name
                    slug
                  }
                }
              }
            }
          }
        }
      }
    `;

    const { lesson: l } = await client.request<GqlLessonResp>(LESSON_QUERY, { lessonSlug });

    if (!l || !l.day) {
      return {
        lesson: null,
        day: null,
        courseId: null,
        courseTitle: null,
        courseSlug: null,
        sectionTitle: null,
        sectionSlug: null,
      };
    }

    // 2) fetch all lessons for that same day (left sidebar + nav buttons)
    const DAY_LESSONS_QUERY = /* GraphQL */ `
      query DayLessons($dayId: ItemId) {
        allLessons(filter: { day: { eq: $dayId } }) {
          id
          title
          slug
          lessonType
          isMandatory
          order
        }
      }
    `;
    const { allLessons } = await client.request<GqlDayLessonsResp>(DAY_LESSONS_QUERY, {
      dayId: l.day.id,
    });

    // sort the sidebar lessons by order (nulls last), then by title
    const sortedDayLessons = [...allLessons].sort((a, b) => {
      const ao = a.order ?? Number.MAX_SAFE_INTEGER;
      const bo = b.order ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.title.localeCompare(b.title);
    });

    const section = l.day.week.module.section;
    const course = section.course;

    return {
      // main content for LessonBlockRenderer (also used by LessonTopicsSidebar)
      lesson: {
        id: l.id,
        title: l.title,
        slug: l.slug,
        lessonType: l.lessonType,
        isMandatory: !!l.isMandatory,
        order: l.order ?? null,
        weight: l.weight ?? null,
        content: (l.content ?? []) as DatoCmsLessonBlock[],
        extraResources: (l.extraResources ?? []) as ExtraResourceBlock[],
        labDescription: l.labDescription ?? null,
      },

      // left sidebar: all lessons in the same day (sorted)
      day: {
        id: l.day.id,
        title: l.day.title,
        slug: l.day.slug,
        order: l.day.order,
        lessons: sortedDayLessons.map((x) => ({
          id: x.id,
          title: x.title,
          slug: x.slug,
          lessonType: x.lessonType,
          isMandatory: x.isMandatory,
          order: x.order ?? null,
        })),
      },

      // breadcrumb bits
      courseId: course?.id ?? null,
      courseTitle: course?.name ?? null,
      courseSlug: course?.slug ?? null,
      sectionTitle: section?.title ?? null,
      sectionSlug: section?.slug ?? null,
    };
  } catch (err) {
    console.error("❌ getLessonBySlug failed:", err);
    return null;
  }
}
