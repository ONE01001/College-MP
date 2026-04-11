import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import toolsRouter from "./routes/tools.route.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({ path: "./backend/.env" });
import { GoogleGenAI } from "@google/genai";
import path from "path";
const _dirname = path.resolve()
export const gemini = new GoogleGenAI({});
const app = express();
const port = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error(error));


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(path.join(_dirname,'/frontend/dist')))

app.use("/api/auth", authRouter);
app.use("/api/tools", toolsRouter);


app.get('*', (req, res) => {
    res.sendFile(path.join(_dirname, 'frontend/dist/index.html'))
})


app.listen(port, () => console.log(`Server running on port ${port}!`));

