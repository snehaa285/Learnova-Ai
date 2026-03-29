import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles, Target, ArrowRight, CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import { generateQuiz } from '../services/aiService';

export default function MockTests() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  
  // App States: 'setup' | 'loading' | 'testing' | 'results'
  const [appState, setAppState] = useState('setup');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleGenerateTest = async () => {
    if (!topic.trim()) return;
    setAppState('loading');
    
    try {
      // Calls your Gemini Backend!
      const data = await generateQuiz(topic, difficulty);
      // Assuming your backend returns { questions: [...] } or just an array [...]
      setQuestions(data.questions || data); 
      setAppState('testing');
      setCurrentQ(0);
      setScore(0);
    } catch (error) {
      alert("AI Engine failed to generate the test. Check backend connection.");
      setAppState('setup');
    }
  };

  const handleAnswer = (option) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    
    if (option === questions[currentQ].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setAppState('results');
    }
  };

  const resetTest = () => {
    setAppState('setup');
    setTopic('');
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-6 lg:p-10 flex items-center justify-center font-sans">
      <div className="max-w-3xl w-full">
        
        <AnimatePresence mode="wait">
          
          {/* --- SETUP STATE --- */}
          {appState === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-brand-card/40 backdrop-blur-xl border border-brand-surface p-10 rounded-[2.5rem] shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-purple-500/10 p-4 rounded-2xl text-purple-500">
                  <BrainCircuit size={40} />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tighter">AI Test Generator</h1>
                  <p className="text-brand-muted font-medium">Deploy the Gemini engine to synthesize custom mock exams.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 block">Target Subject / Topic</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Semiconductor Physics, React Hooks, World War II..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-brand-bg border-2 border-brand-surface rounded-2xl p-5 text-brand-text font-bold outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 block">Cognitive Difficulty</label>
                  <div className="flex gap-4">
                    {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                      <button 
                        key={lvl} onClick={() => setDifficulty(lvl)}
                        className={`flex-1 py-4 rounded-xl text-sm font-black transition-all ${
                          difficulty === lvl 
                          ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                          : 'bg-brand-bg border border-brand-surface text-brand-muted hover:border-purple-500/50 hover:text-brand-text'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleGenerateTest}
                  disabled={!topic.trim()}
                  className="w-full bg-brand-text text-brand-bg hover:bg-purple-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-black py-5 rounded-2xl mt-4 flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-sm"
                >
                  <Sparkles size={20} /> Synthesize Exam
                </button>
              </div>
            </motion.div>
          )}

          {/* --- LOADING STATE --- */}
          {appState === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="animate-spin text-purple-500 mb-6" size={60} />
              <h2 className="text-2xl font-black text-brand-text animate-pulse">Gemini Engine Synthesizing...</h2>
              <p className="text-brand-muted mt-2 font-medium">Scouring neural net for '{topic}'</p>
            </motion.div>
          )}

          {/* --- TESTING STATE --- */}
          {appState === 'testing' && questions.length > 0 && (
            <motion.div key="testing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-brand-card/40 backdrop-blur-xl border border-brand-surface p-10 rounded-[2.5rem] shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-brand-surface pb-6">
                <span className="text-xs font-black text-purple-500 bg-purple-500/10 px-4 py-2 rounded-full uppercase tracking-widest">
                  Question {currentQ + 1} / {questions.length}
                </span>
                <span className="text-xs font-black text-brand-muted uppercase tracking-widest">
                  Score: {score}
                </span>
              </div>

              <h2 className="text-2xl font-bold mb-8 leading-relaxed">
                {questions[currentQ].question}
              </h2>

              <div className="space-y-4">
                {questions[currentQ].options.map((opt, i) => {
                  const isSelected = selectedAnswer === opt;
                  const isCorrect = opt === questions[currentQ].correctAnswer;
                  
                  let btnStyle = "bg-brand-bg border-brand-surface text-brand-text hover:border-purple-500/50";
                  if (isAnswered) {
                    if (isCorrect) btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-500";
                    else if (isSelected && !isCorrect) btnStyle = "bg-red-500/10 border-red-500 text-red-500";
                    else btnStyle = "bg-brand-bg border-brand-surface opacity-50";
                  }

                  return (
                    <button 
                      key={i}
                      disabled={isAnswered}
                      onClick={() => handleAnswer(opt)}
                      className={`w-full text-left p-5 rounded-2xl border-2 font-medium transition-all flex justify-between items-center group ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrect && <CheckCircle2 className="text-emerald-500" size={20} />}
                      {isAnswered && isSelected && !isCorrect && <XCircle className="text-red-500" size={20} />}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <motion.button 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  onClick={nextQuestion}
                  className="w-full mt-8 bg-brand-text text-brand-bg hover:bg-purple-500 hover:text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-sm"
                >
                  {currentQ < questions.length - 1 ? 'Next Question' : 'Complete Exam'} <ArrowRight size={18} />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* --- RESULTS STATE --- */}
          {appState === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-brand-card/40 backdrop-blur-xl border border-brand-surface p-10 rounded-[2.5rem] shadow-2xl text-center">
              <div className="inline-flex bg-purple-500/10 p-6 rounded-full text-purple-500 mb-6">
                <Target size={60} />
              </div>
              <h1 className="text-5xl font-black mb-2">Exam Complete</h1>
              <p className="text-brand-muted font-medium mb-10">Mission objective '{topic}' evaluated.</p>
              
              <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-purple-600 mb-10 drop-shadow-lg">
                {Math.round((score / questions.length) * 100)}%
              </div>

              <div className="flex gap-4">
                <button onClick={() => navigate('/dashboard')} className="flex-1 bg-brand-bg border-2 border-brand-surface hover:text-brand-text font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm">
                  Exit to HUD
                </button>
                <button onClick={resetTest} className="flex-1 bg-purple-500 text-white hover:bg-purple-600 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] uppercase tracking-widest text-sm">
                  <RefreshCw size={18} /> New Exam
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}