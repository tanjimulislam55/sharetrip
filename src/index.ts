// package import
import express, { Request, Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import cors from 'cors'
require('dotenv').config()

// moudle import
import searchRoutes from './routes/searchRoutes'
import userRoutes from './routes/userRoutes'

const app = express()

// middlewares
app.use(helmet())
    .use(cors<Request>())
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(
        rateLimit({
            windowMs: 5 * 60 * 1000,
            limit: 100,
            standardHeaders: 'draft-7',
        })
    )

// routes
app.use('/search', searchRoutes)
app.use('/users', userRoutes)

// root
app.get('/', async (_req: Request, res: Response) => {
    res.json({ message: 'welcome!' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
