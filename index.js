const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require('dotenv').config()
require('colors')
const cors = require("cors");
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// 
app.get("/", (req, res) => {
  res.send("server is running");
});


// Database conection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1ivadd4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const dbConnect = async () => {
    try{
        await client.connect()
        console.log('Database connected'.bgGreen.bold)
    }
    catch(error){
        console.log(error.name.bgRed.bold, error.message.bold);
    }
}


dbConnect()
// Database Collection
const categoryBrandCollection = client.db('nextCar').collection('categoryBrand')

// 

app.get('/category-brand', async(req, res) => {
  try {
    const query = {}
    const result = await categoryBrandCollection.find(query).toArray()
    res.send(result)
  }
  catch(error){
    console.log(error.name.bgRed.bold, error.message.bold);
}
})

// Server listing
app.listen(port, () => {
  console.log(`server is running on port ${port}`.bgBlue.bold);
});