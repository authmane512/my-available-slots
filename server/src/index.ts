import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { availabilityRouter } from "./routes/availability";

dotenv.config({ path: "../.env" });

const { CAL_API_KEY, CAL_API_VERSION } = process.env;

if (!CAL_API_KEY) {
  console.error("Missing CAL_API_KEY in .env");
  process.exit(1);
}
if (!CAL_API_VERSION) {
  console.error("Missing CAL_API_VERSION in .env");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use("/api/availability", availabilityRouter);

// Only listen when running directly (not on Vercel)
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
