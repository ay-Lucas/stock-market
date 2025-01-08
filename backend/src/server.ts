import dotenv from "dotenv";
import express, { Request, Response } from "express";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express!");
});
