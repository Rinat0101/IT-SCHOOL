// Simple fallback mock for testing without MongoDB
export async function connectDBMock() {
    console.log("🧪 Using mock DB connection (MongoDB disabled for testing).");
    return true;
  }