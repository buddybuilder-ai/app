// Use a simple in-memory map to store upload data by session ID.
// In a production environment, you would use a more robust solution like Redis or a database.

const uploadStore = new Map<string, any>();

export default uploadStore;
