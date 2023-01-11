import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb";

const app = express()
app.use(cors())
app.use(express.json())

const participant = []

app.post('/participants', (req, res) => {

    const nome = req.body.name
    participant.push({name: nome})

    res.send('Ok!')

})

app.listen(5000, () => console.log('subiu!!'))