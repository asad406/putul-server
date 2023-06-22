const express = require('express');
const cors = require('cors');
require('dotenv').config()

const app = express();

const port = process.env.PORT || 5000;

//Middleware
// app.use(cors());
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.n1ha416.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const toyCollections = client.db('putulDB').collection('toys');
    
    const indexKeys = { toyName: 1 };
    const indexOptions = { name: "toyNameCategory" };
    const result = await toyCollections.createIndex(indexKeys, indexOptions);
    console.log(result);

    app.get('/allToys', async (req, res) => {
      const result = await toyCollections.find().limit(20).toArray()
      res.send(result)
    })

    //Searching form allToys 
    app.get("/toySearch/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyCollections
        .find({
          toyName: { $regex: text, $options: "i" },
        })
        .toArray();
      res.send(result);
    });

    app.get('/myToys/:email', async (req, res) => {
      const mail = req.params.email;
      const toys = await toyCollections.find({
        email: mail
      }).toArray();
      res.send(toys)
    })
    //ascending order search
    app.get('/ascending/:email', async (req, res) => {
      const mail = req.params.email;
      const toys = await toyCollections.find({
        email: mail
      }).sort({ price: 1 }).toArray();
      res.send(toys)
    })
    //descending order search
    app.get('/descending/:email', async (req, res) => {
      const mail = req.params.email;
      const toys = await toyCollections.find({
        email: mail
      }).sort({ price: -1 }).toArray();
      res.send(toys)
    })

    app.post('/addAToy', async (req, res) => {
      const toyInfo = req.body;
      const result = await toyCollections.insertOne(toyInfo);
      res.send(result)
      console.log(result);
    })
    app.delete('/myToy/:id', async (req, res) => {
      const id = req.params.id;
      const result = await toyCollections.deleteOne({
        _id: new ObjectId(id)
      });
      res.send(result)
    })

    //Database update
    app.get('/update/:id', async (req, res) => {
      const id = req.params.id;
      const result = await toyCollections.findOne({ _id: new ObjectId(id) })

      res.send(result)
    })


    app.put('/update/:id', async (req, res) => {
      const id = req.params.id;
      const toy = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true }
      const updatedToy = {
        $set: {
          price: toy?.price,
          quantity: toy?.quantity,
          details: toy?.details
        }
      }
      const result = await toyCollections.updateOne(filter, updatedToy, options)
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Putul server on fire');
})

app.listen(port, () => {
  console.log(`Server is running at ${port} port`)
})




