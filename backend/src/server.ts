import dotenv from "dotenv";
import express, { Request, Response } from "express";
import stockRoutes from "./routes/stockRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === "development") {
  app.set("json spaces", 2);
}
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});

app.use("/api/stocks", stockRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express!");
});
