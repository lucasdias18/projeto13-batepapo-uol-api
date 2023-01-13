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

try {
    await mongoClient.connect()
    db = mongoClient.db()
  } catch (error) {
    console.log('deu péssimo')
  }

// const participant = []

// - [ ]  Validar: (caso algum erro seja encontrado, retornar **status 422**)
//     - [ ]  **name** deve ser string não vazio

app.post('/participants', async (req, res) => {

    const name = req.body.name

    const schema = joi.object({
        name: joi.string().min(1).required()
    });

    try {
        // const value = await schema.validateAsync({name: nome})

        const { error, value } = schema.validate({ name });
        console.log(value)

        if (error) return res.status(422).send("Insira um formato válido!");

        const existsUser = await db.collection("participants").findOne({ name });

        if (existsUser) return res.status(409).send("Usuário já cadastrado!");    
  
        // await db.collection("participants").insertOne({ name, lastStatus: Date.now() });
        await db.collection("participants").insertOne({ ...value, lastStatus: Date.now() });
        // {...a, avatar: userAvatar.avatar}
        res.send('Ok!')
    }
    catch(err) {
        res.send('deu erro')
    }
    

})

app.get('/participants', (req, res) => {

    // const participants = db.collection('participants').find()
    db.collection("participants").find().toArray().then(participants => {
        return res.send(participants)
      }).catch(() => {
        res.status(500).send("Deu zica no servidor de banco de dados")
      })
    

    // res.send(participants)
})

const PORT = 5000

app.listen(PORT, () => console.log('subiu!!'))