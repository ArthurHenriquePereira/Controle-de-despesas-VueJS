import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in the environment variables')
    process.exit(1)
}

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
})

.then(() => console.log('Connected to MongoDB'))
.catch(err => {
    console.error('Could not connect to MongoDB:')
    console.error('Error name:', err.name)
    console.error('Error message:', err.message)
    if (err.reason) console.error('Error reason:', err.reason)
    if (err.code) console.error('Error code:', err.code)
    if (err.stack) console.error('Error stack:', err.stack)
    process.exit(1)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})