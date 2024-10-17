const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

//POST route to add a user
router.post("/signup", async (req, res) => {
  try {
    const data = req.body; //assuming that the body contains the person data

    //create a new User document using the Mongoose model
    const newUser = new User(data);

    //save the new User in the database
    const response = await newUser.save();
    console.log("Data Saved");

    //generate token
    const payload = {
      id: response.id,
    };

    const token = generateToken(payload);
    console.log("Token is : ", token);

    res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    //Extract the aadharCardNumber and password from request body
    const { aadharCardNumber, password } = req.body;

    //find the user by aadharCardNumber
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    //If the user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ error: "Invalid aadharCardNumber or password" });
    }

    //sab shi hai, ab generate token
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);

    //return token as response
    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Invalid server error" });
  }
});

//Profile Route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//PUT Method to change the password
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user; //extract the id from the request body
    const { currentPassword, newPassword } = req.body; // get the old and new password

    //find the user by userID
    const user = await User.findById(userId);

    //If password does not match, return error
    if (!(await user.comparePassword(currentPassword))) {
      return res
        .status(401)
        .json({ error: "Invalid aadharCardNumber or password" });
    }

    //If current password is correct then we will allow the change in the password
    user.password = newPassword;
    await user.save();

    console.log("Password Updated");
    res.status(200).json({ message: "Password Updated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
