const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
app.use(express.json());
app.use(cors());
const port = 3100;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const JWKS = createRemoteJWKSet(new URL("http://localhost:3000/api/auth/jwks"));

const authenticate = async (req, res, next) => {
  const header = req?.headers.authorization;
  const auth = header.split(" ")[1];

  console.log(auth, "header and auth info");
  next();

  if (!header) {
    res.status(401).send({ message: "unauthorized access" });
  }
  if (!auth) {
    res.status(401).send({ message: "unauthorized access" });
  }

  try {
    const { playload } = await jwtVerify(auth, JWKS);
    next();
  } catch (error) {
    res.status(401).send({ message: "unauthorized access" });
  }
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("rentCar");
    const carCollections = db.collection("addedCar");
    const myBookings = db.collection("myBookings");

    app.post("/carlisted", async (req, res) => {
      const carData = req.body;
      console.log(carData, "cardata info");
      s;
      const result = await carCollections.insertOne(carData);
      console.log(result, "car data result info");
      res.send(result);
    });
    app.get("/carlisted", async (req, res) => {
      const result = await carCollections.find().toArray();

      res.send(result);
    });
    app.get("/carlisted/:id", async (req, res) => {
      const id = req.params.id;

      const result = await carCollections.findOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });
    app.post("/bookings", async (req, res) => {
      const cursor = req.body;
      console.log(cursor);
      const result = await myBookings.insertOne(cursor);

      res.send(result);
    });
    app.get("/bookings", authenticate, async (req, res) => {
      const result = await myBookings.find().toArray();

      res.send(result);
    });
    app.delete("/carlisted/:id", authenticate, async (req, res) => {
      const id = req.params.id;

      const result = await carCollections.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });
    app.patch("/carlisted/:id", async (req, res) => {
      const id = req.params.id;
      const updateCar = req.body;
      console.log(id, updateCar, "updated cars");
      const result = await carCollections.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateCar },
      );

      console.log(result);

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );

    app.post("/cars", (req, res) => {
      // const db =
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`Server is running ${port}`);
});
