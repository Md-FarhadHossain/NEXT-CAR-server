const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
require("colors");
const stripe = require('stripe')(process.env.STRIPE_SK)
const jwt = require("jsonwebtoken");
const cors = require("cors");
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
const verifyJWT = (req, res, next) => {
  const authHeaders = req.headers.authorization;
  if (!authHeaders) {
    res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeaders.split(" ")[1];
  console.log(token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).send({ message: "Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

// Verify Seller
const verifySeller = async (req, res, next) => {
  console.log("verify admin", req.decoded.email);
  const decodedEmail = req.decoded.email;
  const query = { email: decodedEmail };
  const user = await userDetailsCollection.findOne(query);

  if (user?.accountType !== "Seller") {
    return res.status(403).send({ message: "forbidden access" });
  }

  next();
};
// Verify Admin
const verifyAdmin = async (req, res, next) => {
  console.log("verify admin", req.decoded.email);
  const decodedEmail = req.decoded.email;
  const query = { email: decodedEmail };
  const user = await userDetailsCollection.findOne(query);

  if (user?.accountType !== "Admin") {
    return res.status(403).send({ message: "forbidden access" });
  }

  next();
};
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


// Stripe payment
app.post("/create-payment-intent", async (req, res) => {
  try{
    const body = req.body
    const price = parseInt(body.price)
    const amount = price * 100

    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'usd',
      amount: amount,
      "payment_method_types": [
        "card"
      ],
    })
    console.log(body)
    res.send({
      clientSecret: paymentIntent.client_secret,
    });

  }
  catch (error) {
    console.log(error.name.bgRed, error.message.bold);
    // console.log(error)
  }
})

//
app.post("/jwt", (req, res) => {
  try {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.send({ token });
    // console.log(result)
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
});

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
    let query = {};
    if (req.query.email) {
      query = { email: req.query.email };
    }
    if (req.query.brand) {
      query = { brand: req.query.brand };
    }
    if (req.query.advertise) {
      query = { advertise: req.query.advertise };
    }
    if (req.query.wishList) {
      query = { wishList: req.query.wishList };
    }
    const sort = { _id: -1 };
    const cursor = categoryCarList.find(query).sort(sort);

    // const cursor = categoryCarList.find(query).sort(sort);

    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});

// get cagegory car by id
app.get("/category-car/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: ObjectId(id) };
    const result = await categoryCarList.findOne(query);
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
    console.log(body);
    console.log(result);
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});
// update seller
app.put("/category-car", async (req, res) => {
  try {
    const email = req.query.email;
    const query = { email: email };
    console.log(query);
    const updateDoc = {
      $set: {
        status: "verified",
      },
    };
    const result = await categoryCarList.updateMany(query, updateDoc);

    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});
// Update boots button
app.patch("/category-car/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: req.body,
    };
    const result = await categoryCarList.updateOne(query, updateDoc, options);
    console.log(req.body);
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});
// Deleteing car form seller
app.delete("/category-car/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await categoryCarList.deleteOne(query);
    console.log(result);
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});
// Deleteing car form seller
app.delete("/add-a-car/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await carDetailsCollection.deleteOne(query);
    console.log(result);
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});
// Deleteing user form Admin
app.delete("/user-details/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await userDetailsCollection.deleteOne(query);
    console.log(result);
    res.send(result);
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
    let query = {};
    if (req.query.email) {
      query = { email: req.query.email };
    }
    if (req.query.accountType) {
      query = { accountType: req.query.accountType };
    }

    const result = await userDetailsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed.bold, error.message.bold);
  }
});
// Update user status
app.patch("/user-details/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await userDetailsCollection.updateOne(
      { _id: ObjectId(id) },
      { $set: req.body }
    );
    res.send(result);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
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
    const query = {};
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
