import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, Mail, ArrowRight, Lock, User,
  ShieldCheck, Loader2, AlertCircle
} from 'lucide-react';

// 🚀 REAL FIREBASE IMPORTS 
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';

export default function Auth() {
  const navigate = useNavigate();
  
  // UI States
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Data States
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null); 
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState(null);

  // --- REAL MONGODB LOGIC ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? { email: formData.email, password: formData.password } : formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Success! Save real token and route to dashboard
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgotpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setResetMessage(`System Override Link: ${data.demo_reset_link}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- REAL GOOGLE OAUTH LOGIC ---
  const handleOAuthLogin = async (providerName) => {
    if (providerName === 'google') {
      setLoadingProvider('google');
      setError('');
      
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // 🚀 Use Firebase UID as a stable password for this user
        const googlePassword = `google_${user.uid}`;

        const googleResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName || 'Student',
            uid: user.uid
          })
        });

        let backendData = await googleResponse.json();

        // If google endpoint fails, fallback to login/register path for compatibility
        if (!googleResponse.ok) {
          const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              password: googlePassword
            })
          });

          backendData = await loginResponse.json();

          if (!loginResponse.ok) {
            const registerResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: user.displayName || 'Student',
                email: user.email,
                password: googlePassword
              })
            });

            backendData = await registerResponse.json();

            if (!registerResponse.ok) {
              throw new Error(backendData.message || 'Authentication failed');
            }
          }
        }

        // Success! Save token and user data
        localStorage.setItem('token', backendData.token);
        localStorage.setItem('user', JSON.stringify(backendData.user || {
          name: user.displayName || 'Student',
          email: user.email
        }));

        setLoadingProvider(null);
        navigate('/dashboard');
        
      } catch (err) {
        console.error("🔥 Google Login Failed:", err);
        setError(err.message || "Google authentication was cancelled or failed. Please try again.");
        setLoadingProvider(null);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg p-4 relative overflow-hidden transition-colors duration-500 selection:bg-brand-primary/30">
      
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[420px] relative z-10">
        
        {/* LOGO HEADER */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-[2rem] mb-6 shadow-[0_0_30px_var(--primary-color)] shadow-brand-primary/20">
            <BrainCircuit className="text-brand-primary" size={40} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-brand-text mb-2">Welcome to Learnova</h1>
          <p className="text-brand-muted font-medium text-sm flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" /> Secure Terminal Access
          </p>
        </motion.div>

        {/* AUTH CARD */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-brand-card/60 backdrop-blur-2xl border border-brand-surface p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col gap-4">
          
          {/* ERROR NOTIFICATION */}
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          {/* GOOGLE OAUTH */}
          {!isForgotPassword && !resetMessage && (
            <>
              <button onClick={() => handleOAuthLogin('google')} disabled={loadingProvider !== null || isLoading} className="w-full flex items-center justify-center gap-3 bg-brand-bg border border-brand-surface hover:border-brand-primary/50 hover:bg-brand-surface/50 text-brand-text font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50">
                {loadingProvider === 'google' ? <Loader2 size={18} className="animate-spin text-brand-primary" /> : (
                  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-2 opacity-60">
                <div className="h-px bg-brand-surface flex-1"></div>
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Or</span>
                <div className="h-px bg-brand-surface flex-1"></div>
              </div>
            </>
          )}

          {/* REAL MONGODB EMAIL/PASSWORD FORM */}
          {resetMessage ? (
            <div className="text-center space-y-4 py-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <p className="text-emerald-500 font-bold mb-2">Override Link Generated</p>
                <a href={resetMessage.replace('System Override Link: ', '')} className="text-xs text-brand-text hover:text-brand-primary underline break-all">
                  Click here to initiate password reset
                </a>
              </div>
              <button onClick={() => { setIsForgotPassword(false); setIsLogin(true); setResetMessage(null); }} className="text-brand-muted hover:text-brand-text text-sm font-bold">Return to Login</button>
            </div>
          ) : (
            <form onSubmit={isForgotPassword ? handleForgotPassword : handleEmailSubmit} className="space-y-4">
              
              <AnimatePresence mode="wait">
                {!isLogin && !isForgotPassword && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest pl-1">Full Name</label>
                    <div className="flex items-center bg-brand-bg border border-brand-surface rounded-xl px-4 py-2.5 focus-within:border-brand-primary transition-colors">
                      <User size={16} className="text-brand-muted mr-3" />
                      <input type="text" name="name" required={!isLogin} placeholder="John Doe" value={formData.name} onChange={handleInputChange} className="w-full bg-transparent border-none outline-none text-brand-text text-sm font-medium placeholder:text-brand-muted/50" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest pl-1">Email Address</label>
                <div className="flex items-center bg-brand-bg border border-brand-surface rounded-xl px-4 py-2.5 focus-within:border-brand-primary transition-colors">
                  <Mail size={16} className="text-brand-muted mr-3" />
                  <input type="email" name="email" required placeholder="operative@learnova.ai" value={formData.email} onChange={handleInputChange} className="w-full bg-transparent border-none outline-none text-brand-text text-sm font-medium placeholder:text-brand-muted/50" />
                </div>
              </div>

              {!isForgotPassword && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center pr-1">
                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest pl-1">Password</label>
                    {isLogin && <button type="button" onClick={() => {setIsForgotPassword(true); setError('');}} className="text-[10px] font-bold text-brand-primary hover:underline">Forgot?</button>}
                  </div>
                  <div className="flex items-center bg-brand-bg border border-brand-surface rounded-xl px-4 py-2.5 focus-within:border-brand-primary transition-colors">
                    <Lock size={16} className="text-brand-muted mr-3" />
                    <input type="password" name="password" required placeholder="••••••••" value={formData.password} onChange={handleInputChange} className="w-full bg-transparent border-none outline-none text-brand-text text-sm font-medium placeholder:text-brand-muted/50 tracking-widest" />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading || loadingProvider !== null || !formData.email || (!isForgotPassword && !formData.password)}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-brand-text text-brand-bg hover:bg-brand-primary hover:text-white font-black py-3.5 rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                  <>{isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

        </motion.div>
        
        {/* FOOTER TOGGLES */}
        {!resetMessage && (
          <div className="mt-8 text-center px-4">
            <p className="text-sm text-brand-muted font-medium mb-4">
              {isForgotPassword ? "Remembered your password? " : isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => { setIsForgotPassword(false); setIsLogin(!isLogin); setError(''); }} 
                className="text-brand-text font-bold hover:text-brand-primary transition-colors underline decoration-brand-surface underline-offset-4"
              >
                {isForgotPassword ? 'Log in' : isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
            <p className="text-xs text-brand-muted/70 font-medium">
              By continuing, you agree to Learnova's <span className="hover:text-brand-primary cursor-pointer underline decoration-brand-surface">Terms of Service</span>.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}