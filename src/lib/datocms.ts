import { GraphQLClient } from "graphql-request";

// Типы моделей
type Course = {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
};

type Module = {
  id: string;
  name: string;
  enabled: boolean;
  orderColumn: number;
  course: { id: string };
};

type Week = {
  id: string;
  name: string;
  orderColumn: number;
  module: { id: string };
};

type Day = {
  id: string;
  name: string;
  orderColumn: number;
  week: { id: string };
};

type Lesson = {
  id: string;
  name: string;
  enabled: boolean;
  content: { __typename: string };
  day: { id: string };
};

type User = {
  id: string;
  email: string;
  password: string;
  courses: { id: string }[];
};

// Настройки клиента GraphQL
const API_TOKEN = process.env.DATOCMS_API_KEY;
const API_URL = "https://graphql.datocms.com/";

const client = new GraphQLClient(API_URL, {
  headers: {
    authorization: `Bearer ${API_TOKEN}`,
  },
});

// Получить пользователя по ID
export async function getUser(userId: string): Promise<User | null> {
  try {
    const query = `
      query getUser($userId: ItemId) {
        user(filter: { id: { eq: $userId } }) {
          id
          email
          password
          courses {
            id
          }
        }
      }
    `;
    const variables = { userId };
    const data = await client.request<{ user: User | null }>(query, variables);
    return data.user || null;
  } catch (error) {
    console.error("Ошибка загрузки пользователя из DatoCMS:", error);
    return null;
  }
}

// Получить активные курсы пользователя
export async function getCourses(userId: string): Promise<Course[]> {
  try {
    const query = `
      query getUserCourses($userId: ItemId) {
        user(filter: { id: { eq: $userId } }) {
          courses {
            id
            name
            url
            enabled
          }
        }
      }
    `;
    const variables = { userId };
    const data = await client.request<{ user: { courses: Course[] } }>(query, variables);
    return data.user?.courses?.filter(course => course.enabled) || [];
  } catch (error) {
    console.error("Ошибка загрузки курсов из DatoCMS:", error);
    return [];
  }
}

// Получить курс по ID
export async function getCourse(courseId: string): Promise<Course | null> {
  try {
    const query = `
      query getCourse($courseId: ItemId) {
        course(filter: { id: { eq: $courseId } }) {
          id
          name
          url
          enabled
        }
      }
    `;
    const variables = { courseId };
    const data = await client.request<{ course: Course | null }>(query, variables);
    return data.course || null;
  } catch (error) {
    console.error("Ошибка загрузки курса из DatoCMS:", error);
    return null;
  }
}

// Получить активные модули курса
export async function getModules(courseId: string): Promise<Module[]> {
  try {
    if (!courseId) throw new Error("courseId обязателен");

    const query = `
      query getModules($courseId: ItemId) {
        allModules(
          filter: {
            course: { eq: $courseId }
            enabled: { eq: true }
          }
          orderBy: orderColumn_ASC
        ) {
          id
          name
          enabled
          orderColumn
          course { id }
        }
      }
    `;
    const variables = { courseId };
    const data = await client.request<{ allModules: Module[] }>(query, variables);
    return data.allModules;
  } catch (error) {
    console.error("Ошибка загрузки модулей из DatoCMS:", error);
    return [];
  }
}

// Получить недели по модулю
export async function getWeeks(moduleId: string): Promise<Week[]> {
  try {
    if (!moduleId) throw new Error("moduleId обязателен");

    const query = `
      query getWeeks($moduleId: ItemId) {
        allWeeks(
          filter: {
            module: { eq: $moduleId }
          }
          orderBy: orderColumn_ASC
        ) {
          id
          name
          orderColumn
          module { id }
        }
      }
    `;
    const variables = { moduleId };
    const data = await client.request<{ allWeeks: Week[] }>(query, variables);
    return data.allWeeks;
  } catch (error) {
    console.error("Ошибка загрузки недель из DatoCMS:", error);
    return [];
  }
}

// Получить дни по неделе
export async function getDays(weekId: string): Promise<Day[]> {
  try {
    if (!weekId) throw new Error("weekId обязателен");

    const query = `
      query getDays($weekId: ItemId) {
        allDays(
          filter: {
            week: { eq: $weekId }
          }
          orderBy: orderColumn_ASC
        ) {
          id
          name
          orderColumn
          week { id }
        }
      }
    `;
    const variables = { weekId };
    const data = await client.request<{ allDays: Day[] }>(query, variables);
    return data.allDays;
  } catch (error) {
    console.error("Ошибка загрузки дней из DatoCMS:", error);
    return [];
  }
}

// Получить активные уроки по дню
export async function getLessons(dayId: string): Promise<Lesson[]> {
  try {
    if (!dayId) throw new Error("dayId обязателен");

    const query = `
      query getLessons($dayId: ItemId) {
        allLessons(
          filter: {
            day: { eq: $dayId }
            enabled: { eq: true }
          }
        ) {
          id
          name
          enabled
          content { __typename }
          day { id }
        }
      }
    `;
    const variables = { dayId };
    const data = await client.request<{ allLessons: Lesson[] }>(query, variables);
    return data.allLessons;
  } catch (error) {
    console.error("Ошибка загрузки уроков из DatoCMS:", error);
    return [];
  }
}