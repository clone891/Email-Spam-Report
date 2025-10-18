const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { ImapFlow } = require("imapflow");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);
app.use(express.json());

// ====================== MongoDB Setup ======================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (err) => console.error("MongoDB connection error:", err));
db.once("open", () => console.log("✓ Connected to MongoDB"));

// ====================== Schemas ======================
const resultSchema = new mongoose.Schema({
  inbox: String,
  provider: String,
  received: Boolean,
  folder: String,
  messageCount: { type: Number, default: 0 },
  checkedAt: { type: Date, default: Date.now },
});

const testSchema = new mongoose.Schema({
  testCode: { type: String, unique: true, required: true, index: true },
  userEmail: { type: String, required: true, index: true },
  testInboxes: [String],
  results: [resultSchema],
  status: {
    type: String,
    enum: ["pending", "checking", "complete", "error"],
    default: "pending",
  },
  deliveryScore: { type: Number, default: 0 },
  shareLink: String,
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

testSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  if (this.results && this.results.length > 0) {
    const received = this.results.filter((r) => r.received).length;
    this.deliveryScore = Math.round((received / this.results.length) * 100);
  }
  next();
});

const Test = mongoose.model("Test", testSchema);

// ====================== Gmail Config ======================
const GMAIL_CONFIG = {
  email: process.env.GMAIL_TEST_EMAIL,
  imap: "imap.gmail.com",
  user: process.env.GMAIL_USER,
  pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ""),
};

// ====================== Nodemailer Setup ======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_CONFIG.user,
    pass: GMAIL_CONFIG.pass,
  },
});

// ====================== Inbox Check Logic ======================
const checkInbox = async (config, testCode) => {
  try {
    const client = new ImapFlow({
      host: config.imap,
      port: 993,
      secure: true,
      auth: { user: config.user, pass: config.pass },
      logger: false,
    });

    await client.connect();
    const folders = await client.list();
    console.log(`Checking folders for ${config.email}:`, folders.map(f => f.path));

    let received = false;
    let folder = "Not Found";
    let messageCount = 0;

    for (const folderObj of folders) {
      const folderName = folderObj.path;
      try {
        await client.mailboxOpen(folderName);
        const messages = await client.search({ text: testCode });
        console.log(`Checked folder ${folderName}: Found ${messages.length} messages`);

        if (messages.length > 0) {
          received = true;
          folder = folderName;
          messageCount = messages.length;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    await client.logout();
    return { received, folder, messageCount };
  } catch (err) {
    console.error(`Error checking ${config.email}:`, err.message);
    return { received: false, folder: "Error" };
  }
};

// ====================== Routes ======================

// 1️⃣ Create Test + Send Email
app.post("/api/tests/create", async (req, res) => {
  try {
    const { userEmail } = req.body;
    if (!userEmail || !/^\S+@\S+\.\S+$/.test(userEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const testCode = uuidv4().split("-")[0].toUpperCase();
    const testInbox = GMAIL_CONFIG.email;

    const test = new Test({
      testCode,
      userEmail,
      testInboxes: [testInbox],
      shareLink: `${process.env.FRONTEND_URL || "http://localhost:3000"}/report/${testCode}`,
    });
    await test.save();

    // Send test email
    const mailOptions = {
      from: `"Email Spam Report Tool" <${GMAIL_CONFIG.user}>`,
      to: testInbox,
      subject: `Deliverability Test - ${testCode}`,
      text: `This is a deliverability test email.\n\nTest Code: ${testCode}\nSent from: ${userEmail}`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Test email sent to ${testInbox}`);

    res.json({ message: "Test created and email sent successfully", testCode, testInbox });
  } catch (err) {
    console.error("Error creating/sending test:", err.message);
    res.status(500).json({ message: "Error creating test" });
  }
});

// 2️⃣ Check Results
app.post("/api/tests/check", async (req, res) => {
  try {
    const { testCode } = req.body;
    if (!testCode) return res.status(400).json({ message: "Test code required" });

    const test = await Test.findOne({ testCode });
    if (!test) return res.status(404).json({ message: "Test not found" });

    test.status = "checking";
    await test.save();

    const result = await checkInbox(GMAIL_CONFIG, testCode);

    test.results = [{ inbox: GMAIL_CONFIG.email, provider: "GMAIL", ...result }];
    test.status = "complete";
    await test.save();

    res.json({
      testCode,
      results: test.results,
      deliveryScore: test.deliveryScore,
      status: "complete",
      shareLink: test.shareLink,
    });
  } catch (err) {
    console.error("Error checking results:", err.message);
    res.status(500).json({ message: "Error checking results" });
  }
});

// 3️⃣ Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`✓ Mongo URI loaded: ${process.env.MONGO_URI ? "Yes" : "No"}`);
});

module.exports = app;
