import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import joi from "joi"

dotenv.config()


const app = express()
app.use(cors())
app.use(express.json())

const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db;

mongoClient.connect().then(() => {
	db = mongoClient.db()
}).catch((err) => {
    console.log('Deu ruim!')
})

// const participant = []

app.post('/participants', (req, res) => {

    const nome = req.body.name

    const schema = Joi.object({
        name: Joi.string().alphanum().min(3).required()
    });

    db.collection("participants").insertOne({ name: nome });

    res.send('Ok!')

})

const PORT = 5000

app.listen(PORT, () => console.log('subiu!!'))