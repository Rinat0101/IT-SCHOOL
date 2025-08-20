import { GraphQLClient } from "graphql-request";

import type {
  User,
  Course,
  Section,
  Module,
  Lesson,
  DayLite,
  CoursesGrouped,
  DatoCmsLessonBlock,
  ExtraResourceBlock,
} from "@/types";

// Настройки клиента GraphQL
const API_TOKEN = process.env.DATOCMS_API_KEY;
const API_URL = "https://graphql.datocms.com/";

const client = new GraphQLClient(API_URL, {
  headers: {
    authorization: `Bearer ${API_TOKEN}`,
  },
});

// Get User by ID
export async function getUser(userId: string): Promise<User | null> {
  try {
    const query = `
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
            url
            enabled
            language
            startDate
            endDate
          }
        }
      }
    `;
    const variables = { userId };
    const data = await client.request<{ user: User | null }>(query, variables);
    return data.user || null;
  } catch (error) {
    console.error("Failed to fetch user from DatoCMS:", error);
    return null;
  }
}

// Get All Courses, Purchased Courses and Nonpurchased Courses

export async function getGroupedCourses(userId: string): Promise<CoursesGrouped> {
  try {
    const query = `
      query getCoursesAndUserPurchases($userId: ItemId) {
        allCourses(filter: { enabled: { eq: true } }) {
          id
          name
          slug
          enabled
          language
          startDate
          endDate
        }
        allUsers(filter: { id: { eq: $userId } }) {
          id
          purchasedCourses {
            id
          }
        }
      }
    `;

    const variables = { userId };

    const data = await client.request<{
      allCourses: Course[];
      allUsers: { id: string; purchasedCourses: { id: string }[] }[];
    }>(query, variables);

    const user = data.allUsers[0];

    if (!user) {
      console.warn("⚠️ No user found for this ID in DatoCMS.");
      return { purchased: [], nonPurchased: data.allCourses };
    }

    const purchasedIds = new Set(user.purchasedCourses.map((c) => c.id));
    const purchased = data.allCourses.filter((course) => purchasedIds.has(course.id));
    const nonPurchased = data.allCourses.filter((course) => !purchasedIds.has(course.id));

    return { purchased, nonPurchased };
  } catch (error) {
    console.error("❌ Failed to fetch grouped courses from DatoCMS:", error);
    return { purchased: [], nonPurchased: [] };
  }
}

// Get Course by slug
export async function getCourse(slug: string): Promise<Course | null> {
  console.log("📡 getCourse called with slug:", slug);

  try {
    const query = `
      query getCourseDeep($slug: String!) {
        course(filter: { slug: { eq: $slug } }) {
          id
          name
          slug
          enabled
          language
          startDate
          endDate
          sections {
            id
            title
            slug
            order
            modules {
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
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await client.request<{ course: Course | null }>(query, { slug });
    return data.course;
    console.dir(data.course, { depth: null });
  } catch (error: any) {
    console.error("❌ Error fetching course deep structure:");
    if (error.response?.errors) {
      console.table(error.response.errors);
    } else {
      console.error(error);
    }
    return null;
  }
}

// Get Sections by Course Slug
export async function getSections(slug: string): Promise<Section[]> {
  try {
    const query = `
      query getSections($slug: String) {
        allSections(
          filter: { course: { slug: { eq: $slug } } }
          orderBy: order_ASC
        ) {
          id
          title
          slug
          order
          course { id }
        }
      }
    `;
    const variables = { slug };
    const data = await client.request<{ allSections: Section[] }>(query, variables);
    return data.allSections;
  } catch (error) {
    console.error("❌ Failed to fetch sections from DatoCMS:", error);
    return [];
  }
}

// Get Modules For Tabs
export async function getModulesForTabs(
  sectionId: string
): Promise<Pick<Module, "id" | "title" | "slug">[]> {
  try {
    const query = `
      query getModulesForTabs($sectionId: ItemId) {
        allModules(
          filter: { section: { eq: $sectionId } }
          orderBy: order_ASC
        ) {
          id
          title
          slug
        }
      }
    `;
    const variables = { sectionId };
    const data = await client.request<{ allModules: Module[] }>(query, variables);
    return data.allModules;
  } catch (error) {
    console.error("❌ Failed to fetch module tabs:", error);
    return [];
  }
}

// Get Module's Structure by ModuleId
export async function getModuleStructure(moduleId: string): Promise<Module | null> {
  console.log("📡 getModuleStructure called with moduleId:", moduleId);
  console.log("🔐 Using API key:", process.env.DATOCMS_API_KEY?.slice(0, 6) + "...");

  try {
    const query = `
      query getModuleStructure($moduleId: ItemId) {
        module(filter: { id: { eq: $moduleId } }) {
          id
          title
          slug
          weeks(orderBy: order_ASC) {
            id
            title
            slug
            order
            days(orderBy: order_ASC) {
              id
              title
              slug
              order
              lessons(orderBy: order_ASC) {
                id
                title
                slug
                lessonType
                isMandatory
              }
            }
          }
        }
      }
    `;

    const variables = { moduleId };

    console.log("📤 Sending GraphQL request to DatoCMS with variables:", variables);

    const data = await client.request<{ module: Module | null }>(query, variables);

    console.log("✅ Received module structure from DatoCMS:", data.module);

    return data.module;
  } catch (error: any) {
    console.error("❌ Failed to fetch full module structure:", error?.response || error);
    return null;
  }
}

// Get course, section, and modules in one go
export async function getSectionData(
  courseSlug: string,
  sectionSlug: string
): Promise<{
  course: Course;
  section: Section;
  modules: Pick<Module, "id" | "title" | "slug">[];
} | null> {
  try {
    const course = await getCourse(courseSlug);
    if (!course) return null;

    const section = course.sections.find((s) => s.slug === sectionSlug);
    if (!section) return null;

    const modules = await getModulesForTabs(section.id);

    return { course, section, modules };
  } catch (error) {
    console.error("❌ Failed to fetch section page data:", error);
    return null;
  }
}

// --- Get Lesson by slug ---
type GqlLessonBySlugResp = {
  lesson: {
    id: string;
    title: string;
    slug: string;
    lessonType: Lesson["lessonType"];
    isMandatory: boolean;
    order?: number | null;
    content: any[];
    extraResources?: { title: string; url?: string | null }[] | null;
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
      week?: {
        module?: {
          section?: {
            title: string;
            slug: string;
            course?: { id: string; name: string; slug: string } | null;
          } | null;
        } | null;
      } | null;
    } | null;
  } | null;
};

export async function getLessonBySlug(
  lessonSlug: string
): Promise<{
  lesson:
    | {
        id: string;
        title: string;
        slug: string;
        lessonType: Lesson["lessonType"];
        isMandatory: boolean;
        order?: number | null;
        content: DatoCmsLessonBlock[];
        extraResources?: ExtraResourceBlock[];
      }
    | null;
  day:
    | {
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
      }
    | null;
  courseId: string | null;
  courseTitle: string | null;
  courseSlug: string | null;
  sectionTitle: string | null;
  sectionSlug: string | null;
} | null> {
  try {
    const query = /* GraphQL */ `
      query GetLessonBySlug($lessonSlug: String!) {
        lesson(filter: { slug: { eq: $lessonSlug } }) {
          id
          title
          slug
          lessonType
          isMandatory
          order

          content {
            __typename
            ... on TextBlockRecord {
              id
              title
              content
              subsections { ... on SubsectionRecord { id title text } }
            }
            ... on ImageBlockRecord { id title imageContent { url } }
            ... on VideoBlockRecord { id title videoUrl { url provider thumbnailUrl } }
            ... on PresentationBlockRecord { id title code }
            ... on AlertBlockRecord { id text backgroundColor textColor }
          }

          extraResources {
            ... on ExtraResourceItemRecord { title url }
          }

          day {
            id
            title
            slug
            order
            lessons {   # ⬅️ no orderBy
              id
              title
              slug
              lessonType
              isMandatory
              order
            }
            week {
              module {
                section {
                  title
                  slug
                  course { id name slug }
                }
              }
            }
          }
        }
      }
    `;

    const data = await client.request<GqlLessonBySlugResp>(query, { lessonSlug });
    const l = data.lesson;
    if (!l) {
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

    // --- Normalize & sort ---
    const section = l.day?.week?.module?.section ?? null;
    const course = section?.course ?? null;

    const sortedLessons =
      l.day?.lessons
        ?.slice()
        .sort((a, b) => {
          const ao = a.order ?? 0;
          const bo = b.order ?? 0;
          if (ao !== bo) return ao - bo;
          return a.title.localeCompare(b.title);
        }) ?? [];

    return {
      lesson: {
        id: l.id,
        title: l.title,
        slug: l.slug,
        lessonType: l.lessonType,
        isMandatory: !!l.isMandatory,
        order: l.order ?? null,
        content: (l.content ?? []) as DatoCmsLessonBlock[],
        extraResources: (l.extraResources ?? []) as ExtraResourceBlock[],
      },
      day: l.day
        ? {
            id: l.day.id,
            title: l.day.title,
            slug: l.day.slug,
            order: l.day.order,
            lessons: sortedLessons.map((x) => ({
              id: x.id,
              title: x.title,
              slug: x.slug,
              lessonType: x.lessonType,
              isMandatory: x.isMandatory,
              order: x.order ?? null,
            })),
          }
        : null,
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