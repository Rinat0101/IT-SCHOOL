import { GraphQLClient } from "graphql-request";

const API_TOKEN = process.env.DATOCMS_API_KEY;
const API_URL = "https://graphql.datocms.com/";

const client = new GraphQLClient(API_URL, {
  headers: {
    authorization: `Bearer ${API_TOKEN}`,
  },
});

export async function getCourses(userId) {
    try {
      if (!userId) throw new Error("userId обязателен");
  
      const query = `
        query getUserCourses($userId: String!) {
          allCourses(filter: { users: { eq: $userId } }) {
            id
            name
            url
          }
        }
      `;
  
      const variables = { userId }; // Передаем userId в GraphQL-запрос
  
      const data = await client.request(query, variables);
      return data.allCourses;
    } catch (error) {
      console.error("Ошибка загрузки курсов из DatoCMS:", error);
      return [];
    }
  }