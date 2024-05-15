const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const auth = require("./middleware/auth");
const cors = require("cors");

const app = express();
const port = 3000;
const secret = "fullstack";

// Middleware to parse JSON
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://nicekrubma123:kulab12345@atlascluster.rieucoy.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// User registration
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(400).send("Invalid email or password");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid email or password");
    }
    // Record login time
    const session = { loginTime: new Date() };
    user.sessions.push(session);
    await user.save();

    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "1h" });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// User logout
app.post("/logout", auth, async (req, res) => {
  try {
    const user = req.user;
    const lastSession = user.sessions[user.sessions.length - 1];
    if (lastSession) {
      lastSession.logoutTime = new Date();
      await user.save();
    }
    res.send("User logged out successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/profile", auth, (req, res) => {
  res.send(req.user);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
