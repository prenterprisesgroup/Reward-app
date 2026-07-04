require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port} and listening on 0.0.0.0`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
