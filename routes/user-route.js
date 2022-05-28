const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");


const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const { email, username, newsletter, password } = req.fields;
    if (username && email && password && newsletter) {
      const user = await User.findOne({ email: email });
      if (!user) {
        const token = uid2(64);
        const salt = uid2(16);
        const hash = SHA256(salt + password).toString(encBase64);

        const newUser = new User({
          email,
          account: {
            username,
          },
          newsletter,
          token,
          salt,
          hash,
        });

        await newUser.save();
        return res.json({
          _id: newUser._id,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        return res.status(409).json({ message: "This email already has an account" });
      }
    } else {
      return res.status(400).json({ message: "Missing parameters" });
    }
  } catch {
    return res.status(400).json({ message: error.message });
  }  
});


router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.fields;
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      const newHash = SHA256(userExist.salt + password).toString(encBase64);
      if (newHash === userExist.hash) {
        return res.status(200).json({
          _id: userExist._id,
          token: userExist.token,
          account: userExist.account,
        });
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    return res.status(400).json({ messsage: error.message });
  }
});

module.exports = router;