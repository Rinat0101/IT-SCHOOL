// src/lib/mock-db.ts
export const mockUsers = [
    {
      id: "1",
      name: "Student",
      lastName: "Tester",
      email: "student1@procoding.com",
      password: "123456", // plain for mock
      role: "student",
      language: "en",
    },
    {
      id: "2",
      name: "Admin",
      lastName: "User",
      email: "admin@procoding.com",
      password: "admin123",
      role: "admin",
      language: "en",
    },
  ];
  
  // 🧪 Fake "connect" function
  export async function connectDBMock() {
    console.log("🧪 Using mock DB connection (MongoDB disabled).");
    return true;
  }
  
  // 🧪 Mocked User Model (replaces mongoose model)
  export const UserMock = {
    async findOne(filter: { email: string }) {
      const user = mockUsers.find((u) => u.email === filter.email);
      return user || null;
    },
  };