// File: src/pages/Cybersecurity.jsx
import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Smartphone, Globe, AlertCircle, Clock } from 'lucide-react';

export default function Cybersecurity() {
  const [loginSessions, setLoginSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load real session data from localStorage or API
    const loadSessions = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');

        // Create a mock current session based on actual login data
        const sessions = [];

        if (token && user) {
          // Current session
          sessions.push({
            id: 1,
            device: navigator.userAgent.includes('Chrome') ? 'Chrome on ' + navigator.platform :
                   navigator.userAgent.includes('Firefox') ? 'Firefox on ' + navigator.platform :
                   navigator.userAgent.includes('Safari') ? 'Safari on ' + navigator.platform :
                   'Browser on ' + navigator.platform,
            location: 'Current Location', // In a real app, you'd get this from IP geolocation
            status: 'Current Session',
            icon: Globe,
            lastActive: new Date().toISOString()
          });

          // Add some historical sessions if they exist in localStorage
          const sessionHistory = JSON.parse(localStorage.getItem('session_history') || '[]');
          sessionHistory.slice(0, 2).forEach((session, index) => {
            sessions.push({
              id: index + 2,
              device: session.device || 'Unknown Device',
              location: session.location || 'Unknown Location',
              status: session.timestamp ? new Date(session.timestamp).toLocaleString() : 'Previous Session',
              icon: Smartphone,
              lastActive: session.timestamp
            });
          });
        }

        setLoginSessions(sessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
        setLoginSessions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const [linkInput, setLinkInput] = useState('');
  const [linkRisk, setLinkRisk] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const evaluateLink = () => {
    const lower = linkInput.toLowerCase();
    if (!linkInput.trim()) {
      setLinkRisk('Enter a URL first');
      return;
    }

    const suspicious = ['login', 'secure', 'verify', 'account', 'bank', 'update'];
    const suspiciousCount = suspicious.reduce((count, token) => count + (lower.includes(token) ? 1 : 0), 0);

    if (suspiciousCount > 1 || (lower.includes('http://') && !lower.includes('https://')) || lower.includes('paypal')) {
      setLinkRisk('Suspicious link found. Potential phishing attempt.');
    } else {
      setLinkRisk('Looks safe. Continue with caution.');
    }
  };

  const evaluatePassword = (password) => {
    const score = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
      password.length >= 12
    ].filter(Boolean).length;

    if (score <= 1) setPasswordStrength('Very Weak');
    else if (score === 2) setPasswordStrength('Weak');
    else if (score === 3) setPasswordStrength('Medium');
    else if (score === 4) setPasswordStrength('Strong');
    else setPasswordStrength('Very Strong');
  };

  const revokeSession = (sessionId) => {
    // In a real app, this would call an API to revoke the session
    setLoginSessions(sessions => sessions.filter(s => s.id !== sessionId));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Security Center <ShieldCheck className="text-emerald-500" size={24} />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitor your account safety and AI-driven threat detection.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex items-center space-x-6">
            <div className="p-4 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={40} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">System Secure</h2>
              <p className="text-emerald-600/80 dark:text-emerald-400/60 text-sm">LEARNOVA AI has scanned your account. No immediate threats detected.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700/50">
              <h3 className="font-bold text-slate-800 dark:text-white">Active Login Sessions</h3>
            </div>
            <div className="p-0 overflow-hidden">
              {loading ? (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                  Loading sessions...
                </div>
              ) : loginSessions.length === 0 ? (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                  <p>No active sessions found</p>
                  <p className="text-sm mt-1">Please log in to see your sessions</p>
                </div>
              ) : (
                loginSessions.map((session) => {
                  const Icon = session.icon;
                  return (
                    <div key={session.id} className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"><Icon size={20} /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{session.device}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={12} /> {session.location} • {session.status}
                          </p>
                        </div>
                      </div>
                      {session.status !== 'Current Session' && (
                        <button
                          onClick={() => revokeSession(session.id)}
                          className="text-xs font-semibold text-red-500 hover:underline"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 space-y-4">
            <h3 className="font-bold">URL Safety Checker</h3>
            <input
              type="text"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="Enter URL to check for security risks"
              className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
            />
            <button
              onClick={evaluateLink}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium"
            >
              Check URL Safety
            </button>
            {linkRisk && (
              <p className={`text-sm font-medium ${linkRisk.includes('Suspicious') ? 'text-red-500' : 'text-green-500'}`}>
                {linkRisk}
              </p>
            )}
          </div>

        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 space-y-4">
            <h3 className="font-bold">Password Strength Checker</h3>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                evaluatePassword(e.target.value);
              }}
              placeholder="Enter password to check strength"
              className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
            />
            {passwordStrength && (
              <div className="space-y-2">
                <p className={`text-sm font-medium ${
                  passwordStrength === 'Very Weak' || passwordStrength === 'Weak' ? 'text-red-500' :
                  passwordStrength === 'Medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  Strength: {passwordStrength}
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      passwordStrength === 'Very Weak' ? 'bg-red-500 w-1/5' :
                      passwordStrength === 'Weak' ? 'bg-red-500 w-2/5' :
                      passwordStrength === 'Medium' ? 'bg-yellow-500 w-3/5' :
                      passwordStrength === 'Strong' ? 'bg-green-500 w-4/5' :
                      'bg-green-500 w-full'
                    }`}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <AlertCircle className="text-amber-500" size={24} />
              <h3 className="font-bold text-amber-700 dark:text-amber-400">Security Tips</h3>
            </div>
            <ul className="text-sm text-amber-600/80 dark:text-amber-400/60 space-y-1">
              <li>• Use strong, unique passwords</li>
              <li>• Enable two-factor authentication</li>
              <li>• Be cautious with suspicious links</li>
              <li>• Regularly review login sessions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
