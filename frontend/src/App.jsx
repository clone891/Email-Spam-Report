import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, AlertCircle, Clock, Copy, Download, Share2 } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function App() {
  const [step, setStep] = useState('landing');
  const [testCode, setTestCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [testInboxes, setTestInboxes] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const startTest = async () => {
    if (!userEmail || !/^\S+@\S+\.\S+$/.test(userEmail)) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/tests/create`, { userEmail });
      setTestCode(res.data.testCode);
      setTestInboxes(res.data.testInboxes);
      setStep('setup');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating test');
    } finally {
      setLoading(false);
    }
  };

  const checkResults = async () => {
    setLoading(true);
    setPollCount(0);

    const poll = async () => {
      try {
        const res = await axios.post(`${API_BASE}/api/tests/check`, {
          testCode,
          userEmail,
        });
        if (res.data.status === 'complete' || res.data.results.length > 0) {
          setResults(res.data);
          setStep('results');
          setLoading(false);
        } else if (pollCount < 12) {
          setTimeout(() => poll(), 10000);
          setPollCount(pollCount + 1);
        } else {
          setError('Timeout: Email not found after 2 minutes');
          setLoading(false);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error checking results');
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

  const exportPDF = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/tests/${testCode}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${testCode}.pdf`;
      link.click();
    } catch {
      setError('Error exporting PDF');
    }
  };

  const resetTest = () => {
    setStep('landing');
    setTestCode('');
    setUserEmail('');
    setResults(null);
    setError('');
  };

// Landing
if (step === 'landing') {
  const testInboxes = [
    'iamvaibhav192@gmail.com',
    'test2@gmail.com',
    'test3@gmail.com',
    'test4@gmail.com',
    'test5@gmail.com',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Inbox Checker</h1>
        <p className="text-gray-600 mb-6">Test where your emails land</p>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Test Inboxes:</h3>
          <ul className="list-disc list-inside text-gray-700">
            {testInboxes.map((inbox, i) => (
              <li key={i}>{inbox}</li>
            ))}
          </ul>
        </div>

        <input
          type="email"
          placeholder="your@email.com"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={startTest}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Creating Test...' : 'Start Test'}
        </button>
      </div>
    </div>
  );
}


  // Setup
  if (step === 'setup') {
    const copyText = `Send an email to these addresses with the code ${testCode} in the subject or body:\n\n${(testInboxes || []).join('\n')}`;

    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Send Test Email</h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Test Code:</strong> <span className="font-mono text-blue-600">{testCode}</span>
            </p>
            <button
              onClick={() => copyToClipboard(testCode)}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-2"
            >
              <Copy size={16} /> {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Inboxes</h3>
          <div className="space-y-2 mb-6">
            {(testInboxes || []).map((inbox, i) => (
              <div key={i} className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                <span className="font-mono text-sm">{inbox}</span>
                <button
                  onClick={() => copyToClipboard(inbox)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Copy size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 text-sm text-gray-700">
            <p>📧 Send an email to all test addresses with <strong>{testCode}</strong> in the subject or body</p>
          </div>

          <button
            onClick={checkResults}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Checking...' : 'Check Results'}
          </button>
        </div>
      </div>
    );
  }

  // Results
  if (step === 'results' && results) {
    const score = Math.round((results.results.filter(r => r.received).length / results.results.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Deliverability Report</h2>
              <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-8 py-4">
                <p className="text-4xl font-bold">{score}%</p>
                <p className="text-sm">Inbox Delivery Rate</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {results.results.map((result, i) => (
                <div key={i} className={`border-l-4 p-4 rounded-lg ${
                  result.received ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    {result.received ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <AlertCircle className="text-red-600" size={20} />
                    )}
                    <span className="font-semibold text-gray-800">{result.inbox}</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {result.received ? `Folder: ${result.folder}` : 'Email not found'}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={exportPDF}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Download size={18} /> Download PDF
              </button>
              <button
                onClick={resetTest}
                className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                New Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Clock className="animate-spin mx-auto mb-4" size={40} />
        <p className="text-gray-700 font-semibold">Checking emails...</p>
      </div>
    </div>
  );
}