import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import joi from "joi"
import dayjs from "dayjs"

dotenv.config()


const app = express()
app.use(cors())
app.use(express.json())

const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db;

try {
    await mongoClient.connect()
    db = mongoClient.db()
  } catch (error) {
    console.log('deu péssimo')
  }

  
app.post('/participants', async (req, res) => {

    const name = req.body.name

    const schema = joi.object({
        name: joi.string().min(1).required()
    });

    try {

        const { error, value } = schema.validate({ name });


        if (error) return res.status(422).send("Insira um formato válido!");

        const existsUser = await db.collection("participants").findOne({ name });

        if (existsUser) return res.status(409).send("Usuário já cadastrado!");    

        await db.collection("participants").insertOne({ ...value, lastStatus: Date.now() });

        res.send('Ok!')
    }
    catch(err) {
        res.send('deu erro')
    }
    
})

app.get('/participants', (req, res) => {

    db.collection("participants").find().toArray().then(participants => {
        return res.send(participants)
    }).catch(() => {
        res.status(500).send("Deu zica no servidor de banco de dados")
    })

})

app.post('/messages', async (req, res) =>{

    const { to, text, type } = req.body
    const from = req.headers.user

    const messageSchema = joi.object({
        to: joi.string().required(),
        text: joi.string().required(),
        type: joi.string().required()
    })

    try {

        const message = { to, text, type }
        const { error, value } = messageSchema.validate(message);

        if (error) return res.status(422).send('foi mal')

        if (type !== 'message' && type !== 'private_message') return res.status(422).send('ruim')

        const validUser = await db.collection("participants").findOne({ name: from })

        if (!validUser) return res.status(422).send('Remetente não encontrado')

        const time = dayjs().format("HH:mm:ss")

        await db.collection("messages").insertOne({ ...message, from, time })

        res.status(201).send({...message, from, time})
    }
    catch {
        res.status(422).send('foi péssimo')
    }

})

app.get('/messages', async (req, res) => {

    const limit = parseInt(req.query.limit)
    const user = req.headers.user

    try {

        const publicMessages = await db.collection("messages").find({ type: 'message' }).toArray()
        const privateMessages = await db.collection("messages").find({ to: user }).toArray()
        
        if (!limit) {
            const showMessages = [...publicMessages, ...privateMessages]
            return res.send(showMessages)
        }

        const showMessages = [...publicMessages, ...privateMessages].slice(-limit)

        res.send(showMessages)
    }
    catch {
        res.status(500).send('zica pura')
    }

})

app.post('/status', async (req, res) => {

    const name = req.headers.user

    try {

        const update = await db.collection("participants").updateOne({ name }, { $set: { lastStatus: Date.now() } })

        if (update.modifiedCount === 0) return res.sendStatus(404)

        res.sendStatus(200)
    }
    catch {
        res.sendStatus(500)
    }

})

const PORT = 5000

app.listen(PORT, () => console.log('subiu!!'))