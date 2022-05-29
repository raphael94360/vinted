require('dotenv').config();
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary =  require("cloudinary").v2;
const cors = require("cors");

const app = express();
app.use(cors());
app.use(formidable());

mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Essai de git


const userRoutes = require("./routes/user-route");
app.use(userRoutes);

const offerRoutes = require("./routes/offer-route");
app.use(offerRoutes);

app.all("*", (req, res) => {
  return res.status(404).json({message: "Cette route n'existe pas"})
})

app.listen(process.env.PORT, () => {
  console.log("Server started");
})

