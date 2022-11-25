const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
require("colors");
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

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const dbConnect = async () => {
  try {
    await client.connect();
    console.log("Database connected".bgGreen.bold);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
};

dbConnect();
// Database Collection
const categoryBrandCollection = client
  .db("nextCar")
  .collection("categoryBrand");
const categoryCarList = client.db("nextCar").collection("categoryCarList");
const userDetailsCollection = client.db("nextCar").collection("userDetails");
const carDetailsCollection = client.db("nextCar").collection("carDetails");

//

app.get("/category-brand", async (req, res) => {
  try {
    const query = {};
    const result = await categoryBrandCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});
app.get("/category-car", async (req, res) => {
  try {
    const brand = req.query.brand;
    const query = { brand: brand };
    const result = await categoryCarList.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});
// POSTing car in category
app.post("/category-car", async (req, res) => {
  try {
    const body = req.body;
    const result = await categoryCarList.insertOne(body);
    console.log(result);
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});

// Deleteing car form seller
app.delete("/add-a-car/:id", async (req, res) => {
  try {
    const id = req.params.id
    const query = {_id: ObjectId(id)}
    const result = await carDetailsCollection.deleteOne(query)
    console.log(result)
    res.send(result)
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});

// Sending user data on server
app.post("/user-details", async (req, res) => {
  try {
    const body = req.body;
    const result = await userDetailsCollection.insertOne(body);
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});
// Getting user data
app.get("/user-details", async (req, res) => {
  try {
    const email = req.query.email;
    const query = { email: email };
    const result = await userDetailsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});

// POSTing car data form seller
app.post("/add-a-car", async (req, res) => {
  try {
    const body = req.body;
    const result = await carDetailsCollection.insertOne(body);
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});
app.get("/add-a-car", async (req, res) => {
  try {
    const query = {}
    const result = await carDetailsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});
// Car details data
app.get("/car-details", async (req, res) => {
  try {
    const email = req.query.email;
    const query = { email: email };
    const result = await carDetailsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});

// Server listing
app.listen(port, () => {
  console.log(`server is running on port ${port}`.bgBlue.bold);
});
