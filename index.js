const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("rentCar");
    const carCollections = db.collection("addedCar");

    app.post("/carlisted", async (req, res) => {
      const carData = req.body;

      const result = await carCollections.insertOne(carData);
      res.send(result);
    });
    app.get("/carlisted", async (req, res) => {
      const result = await carCollections.find().toArray();

      res.send(result);
    });
    app.get("/carlisted/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id, "id has dep");
      const result = await carCollections.findOne({
        _id: new ObjectId(id),
      });
      console.log(result, "result this is");

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
