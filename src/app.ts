import express from "express"
import "express-async-errors"
import { errorHandling } from "./middlewares/error-handing"
import { routes } from "./routes"
import cors from "cors"


const app = express()
app.use(cors())
app.use(express.json())
app.use(routes)
app.use(errorHandling)

export { app }