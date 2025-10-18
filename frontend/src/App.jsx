import React, { useState } from "react";
import axios from "axios";
import { CheckCircle, AlertCircle, Clock, Copy, Download, MailOpen } from "lucide-react";

const API_BASE = "http://localhost:5000";

export default function App() {
  const [step, setStep] = useState("landing");
  const [testCode, setTestCode] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [testInboxes, setTestInboxes] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  // Create Test
  const startTest = async () => {
    if (!userEmail || !/^\S+@\S+\.\S+$/.test(userEmail)) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/tests/create`, { userEmail });
      setTestCode(res.data.testCode);
      setTestInboxes(res.data.testInboxes);
      setStep("setup");
    } catch (err) {
      setError(err.response?.data?.message || "Error creating test");
    } finally {
      setLoading(false);
    }
  };

  // Check Results with polling
  const checkResults = async () => {
    setLoading(true);
    setPollCount(0);

    const poll = async () => {
      try {
        const res = await axios.post(`${API_BASE}/api/tests/check`, { testCode });
        if (res.data.status === "complete" || res.data.results.length > 0) {
          setResults(res.data);
          setStep("results");
          setLoading(false);
        } else if (pollCount < 12) {
          setPollCount(pollCount + 1);
          setTimeout(poll, 5000);
        } else {
          setError("Timeout: Email not found after 1 minute");
          setLoading(false);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error checking results");
        setLoading(false);
      }
    };

    poll();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetTest = () => {
    setStep("landing");
    setTestCode("");
    setUserEmail("");
    setResults(null);
    setError("");
  };

  // PDF Export
  const exportPDF = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/tests/${testCode}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${testCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Error exporting PDF");
      console.error(err);
    }
  };

  // ================== LANDING STEP ==================
  if (step === "landing") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-8 rounded-2xl shadow-2xl max-w-md w-full border-2 border-amber-200 transform transition-all duration-500 hover:scale-105">
          <div className="flex justify-center mb-6 animate-bounce">
            <MailOpen size={48} className="text-amber-800" />
          </div>

          <h1 className="text-4xl font-bold mb-2 text-center text-amber-900">Inbox Checker</h1>
          <p className="text-center text-amber-700 mb-6 text-sm">Test your email deliverability</p>

          <input
            type="email"
            placeholder="your@email.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full mb-4 px-4 py-3 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 bg-white text-amber-900 placeholder-amber-500 transition-all"
          />

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg text-red-700 text-sm animate-fadeIn">
              {error}
            </div>
          )}

          <button
            onClick={startTest}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 disabled:from-amber-400 disabled:to-amber-300 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:shadow-md disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Clock size={18} className="animate-spin" />
                Creating Test...
              </span>
            ) : (
              "Start Test"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ================== SETUP STEP ==================
  if (step === "setup") {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-8 rounded-2xl shadow-2xl max-w-md w-full border-2 border-amber-200 transform transition-all duration-500 hover:scale-105">
          <h2 className="text-2xl font-bold mb-2 text-amber-900">Send Test Email</h2>
          <p className="text-amber-700 mb-6 text-sm">
            Send an email to the inbox below with this code:{" "}
            <span className="font-mono font-bold text-amber-900 bg-yellow-100 px-2 py-1 rounded">{testCode}</span>
          </p>

          <div className="space-y-3 mb-6">
            {testInboxes.map((inbox, idx) => (
              <div
                key={inbox}
                className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-amber-300 p-3 rounded-lg flex justify-between items-center transition-all duration-300 hover:scale-105 hover:border-amber-600 hover:shadow-md"
                style={{ animation: `fadeInUp 0.6s ease-out forwards`, animationDelay: `${idx * 0.1}s` }}
              >
                <span className="text-amber-900 font-medium text-sm truncate">{inbox}</span>
                <button
                  onClick={() => copyToClipboard(inbox)}
                  className="ml-2 bg-amber-600 hover:bg-amber-700 text-white p-2 rounded transition-transform transform hover:scale-110 active:scale-95"
                >
                  <Copy size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={checkResults}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:shadow-md disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Clock size={18} className="animate-spin" />
                Checking Results...
              </span>
            ) : (
              "Check Results"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ================== RESULTS STEP ==================
  if (step === "results" && results) {
    const score = results.deliveryScore;

    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-8 rounded-2xl shadow-2xl max-w-md w-full border-2 border-amber-200 transform transition-all duration-500 hover:scale-105">
          <h2 className="text-2xl font-bold mb-6 text-amber-900 text-center">Deliverability Report</h2>

          <div className="mb-6 p-4 bg-gradient-to-r from-amber-200 to-yellow-100 rounded-lg border-2 border-amber-400">
            <p className="text-center text-amber-900 text-sm font-semibold">Inbox Delivery Rate</p>
            <p className="text-4xl font-bold text-center text-amber-900">{score}%</p>
          </div>

          <div className="space-y-3 mb-6">
            {results.results.map((r, idx) => (
              <div
                key={r.inbox}
                className={`p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                  r.received
                    ? "bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-400 hover:shadow-lg"
                    : "bg-gradient-to-r from-red-100 to-pink-100 border-red-400 hover:shadow-lg"
                }`}
                style={{ animation: `slideInDown 0.6s ease-out forwards`, animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${r.received ? "text-emerald-900" : "text-red-900"}`}>
                    {r.inbox}
                  </span>
                  {r.received ? (
                    <CheckCircle size={20} className="text-emerald-600 animate-pulse" />
                  ) : (
                    <AlertCircle size={20} className="text-red-600 animate-pulse" />
                  )}
                </div>
                <p className={`text-xs mt-2 ${r.received ? "text-emerald-700" : "text-red-700"}`}>
                  {r.received ? `📁 Folder: ${r.folder}` : "❌ Email not found"}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportPDF}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download PDF
            </button>
            <button
              onClick={resetTest}
              className="flex-1 bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              New Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================== LOADING STATE ==================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex-col gap-4">
      <Clock className="animate-spin text-amber-700" size={48} />
      <p className="text-amber-900 font-semibold text-lg">Loading...</p>
    </div>
  );
}
