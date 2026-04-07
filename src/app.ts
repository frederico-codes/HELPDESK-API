import express from "express"
import "express-async-errors"
import { errorHandling } from "./middlewares/error-handing"
import { routes } from "./routes"
import cors from "cors"
import path from "node:path";


const app = express()
app.use(cors())
app.use(express.json())
app.use(routes)
app.use("/uploads", express.static(path.resolve("uploads")));
app.use(errorHandling)

export { app }