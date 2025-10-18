# 📧 Inbox Checker

> A full-stack web application that allows users to test where their emails land in different inboxes (Inbox, Spam, etc.). The app helps check email deliverability, providing insights into which folders emails appear in and generating a report for analysis.

---

## ✨ Features

<details open>
<summary><b>🧪 Create a Test</b></summary>

Users can start a test by entering their email. The app generates a unique test code and multiple test inboxes for sending emails.

</details>

<details open>
<summary><b>✉️ Send Test Email</b></summary>

Users are instructed to send an email containing the test code to the generated inboxes. This simulates real email sending for deliverability testing.

</details>

<details open>
<summary><b>📋 Check Results</b></summary>

The backend polls the inboxes using IMAP to see if the email has been received and in which folder (Inbox, Spam, etc.).

</details>

<details open>
<summary><b>📊 Deliverability Report</b></summary>

After emails are detected, the app shows a report indicating:
- Which inbox received the email
- The folder it landed in
- Overall inbox delivery rate (%)

</details>

<details open>
<summary><b>📥 Export PDF</b></summary>

Users can download the report as a PDF for offline reference or sharing.

</details>

<details open>
<summary><b>📱 Responsive Frontend</b></summary>

Built using React with a clean, modern UI.

</details>

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js | User interface and interactivity |
| **Styling** | Tailwind CSS | Modern and responsive UI |
| **Icons** | lucide-react | Icons for actions (copy, download, check, alert) |
| **Backend** | Node.js + Express | API endpoints and server logic |
| **Database** | MongoDB | Store test codes, inboxes, and results |
| **Email Protocols** | IMAP & SMTP | Fetch emails from inboxes and send test instructions |
| **PDF Generation** | pdf-lib / jsPDF | Export deliverability reports as PDF |
| **Environment** | dotenv | Store sensitive variables like Mongo URI and API keys |

---

## 🔄 Project Flow

```
User enters email → POST /api/tests/create
    ↓
Generates a test code
    ↓
Generates a list of test inbox addresses
    ↓
User sends email with test code → External email client
    ↓
App polls inboxes → POST /api/tests/check
    ↓
Uses IMAP to fetch messages
    ↓
Marks which inbox received the test email
    ↓
Display results → Frontend shows report
    ├─ Inbox received ✅ / Email missing ❌
    ├─ Folder info (Inbox, Spam, Trash)
    └─ Overall deliverability score
    ↓
Export report → GET /api/tests/:testCode/pdf
    ↓
Generates a PDF with detailed results
```

---

## 📁 Folder Structure

```
inbox-checker/
├── backend/
│   ├── server.js
│   ├── .env
│   ├── package.json
│   └── routes/
│       └── testRoutes.js
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   └── Report.jsx
    │   ├── components/
    │   └── App.jsx
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/inbox-checker.git
   cd inbox-checker/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   nodemon server.js
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start the React app**
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:3000`

---

## 📚 Knowledge Gained

- ✅ Understanding email protocols (IMAP/SMTP) for programmatically fetching emails
- ✅ Full-stack application development using React + Node.js + MongoDB
- ✅ Handling asynchronous operations and polling in React
- ✅ Exporting reports as PDF from a backend service
- ✅ Error handling and safe rendering in React (.map(), .join() fallbacks)

---

## 🔮 Future Improvements

- [ ] Add email sending directly from the app instead of requiring the user to send it manually
- [ ] Add user authentication to track multiple tests per user
- [ ] Implement real-time email updates using WebSockets instead of polling
- [ ] Add analytics dashboard for better insights
- [ ] Multi-language support
- [ ] Advanced email filtering and classification

---

Thank you.

