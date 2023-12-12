const express = require("express");
const cors = require("cors");

const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const gridfs = require("gridfs-stream");
const Grid = require("gridfs-stream");

require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = 4000;

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const mongooseUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5j7d2x6.mongodb.net/SEOPAGE1?retryWrites=true&w=majority`;
const mongoDBUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5j7d2x6.mongodb.net/?retryWrites=true&w=majority`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

mongoose.connect(mongooseUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

Grid.mongo = mongoose.mongo;
const gfs = Grid(db, mongoose.mongo);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function run() {
  try {
    // const fileCollection = client.db("SEOPAGE1").collection("files");
    const fileCollection = db.collection("files");

    app.post("/upload", upload.single("file"), async (req, res) => {
      try {
        const { originalname, mimetype, buffer } = req.file;

        const result = await fileCollection.insertOne({
          filename: originalname,
          mimetype: mimetype,
          file: buffer,
        });

        console.log("File saved to MongoDB:", result.insertedId);
        res.json({
          message: "File uploaded and saved to MongoDB!",
          fileId: result.insertedId,
        });
      } catch (error) {
        console.error("Error saving file to MongoDB:", error);
        res.status(500).json({ error: "Error saving file to MongoDB." });
      }
    });

    app.get("/totalFiles", async (req, res) => {
      try {
        const totalFiles = await fileCollection.countDocuments();
        res.json({ totalFiles });
      } catch (error) {
        console.error("Error fetching total files:", error);
        res.status(500).json({ error: "Error fetching total files." });
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("SEOPAGE1 Data Server is operating");
});
app.listen(port, () => {
  console.log(`SEOPAGE1 Data Server is operating on port ${port}`);
});
