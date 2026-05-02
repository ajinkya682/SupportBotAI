import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, FileText, Bot, HelpCircle, Save, Loader2, Sparkles, 
  CheckCircle2, Globe, Scan, Layout, ChevronDown, ChevronUp, AlertCircle, 
  Search, ExternalLink, RefreshCw, X, MessageSquare, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { scrapeWebsite } from "../../state/businessSlice";

const FAQItem = ({ faq, index, onUpdate, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      layout
      className="card faq-card" 
      style={{ padding: 0, marginBottom: '12px', overflow: 'hidden' }}
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`faq-header ${isOpen ? 'open' : ''}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="faq-icon-wrapper">
            <MessageSquare size={16} />
          </div>
          <span style={{ fontWeight: 600, color: faq.question ? 'var(--on-surface)' : 'var(--outline)' }}>
            {faq.question || "Untitled Question"}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(index); }}
            className="faq-delete-btn"
          >
            <Trash2 size={16} />
          </button>
          {isOpen ? <ChevronUp size={20} color="var(--outline)" /> : <ChevronDown size={20} color="var(--outline)" />}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="faq-body">
              <div className="form-group">
                <label>Question</label>
                <input 
                  placeholder="e.g. What is your refund policy?" 
                  value={faq.question} 
                  onChange={(e) => onUpdate(index, 'question', e.target.value)} 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Answer</label>
                <textarea 
                  placeholder="Provide a detailed answer for the AI to learn..." 
                  value={faq.answer} 
                  onChange={(e) => onUpdate(index, 'answer', e.target.value)} 
                  rows="4"
                ></textarea>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function Training({ formData, setFormData, onSave, isLoading, business, onUpgrade }) {
  const dispatch = useDispatch();
  
  const [trainingMode, setTrainingMode] = useState('url'); 
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const stages = [
    { message: "Establishing secure connection...", target: 10, duration: 2000 },
    { message: "Scanning site architecture...", target: 25, duration: 4000 },
    { message: "Crawling internal links...", target: 45, duration: 6000 },
    { message: "Extracting rich content...", target: 70, duration: 8000 },
    { message: "Normalizing text data...", target: 85, duration: 4000 },
    { message: "Finalizing training set...", target: 95, duration: 3000 },
  ];

  const handleScan = async () => {
    if (!url) {
      setError("Please provide a website URL to scan.");
      return;
    }

    setIsScanning(true);
    setError(null);
    setResult(null);
    setProgress(0);
    
    let currentStage = 0;
    const runStages = async () => {
      while (currentStage < stages.length && isScanning) {
        const stage = stages[currentStage];
        setScanStage(stage.message);
        const startProgress = progress;
        const diff = stage.target - startProgress;
        const steps = 30;
        const stepTime = stage.duration / steps;
        for (let i = 1; i <= steps; i++) {
          if (!isScanning) break;
          setProgress(startProgress + (diff * (i / steps)));
          await new Promise(r => setTimeout(r, stepTime));
        }
        currentStage++;
      }
    };

    const simulationPromise = runStages();

    try {
      const response = await dispatch(scrapeWebsite(url)).unwrap();
      setIsScanning(false);
      setScanStage("Knowledge update complete!");
      setProgress(100);
      setResult(response);
      if (response.business?.knowledge) {
        setFormData(prev => ({ ...prev, knowledge: response.business.knowledge }));
      }
    } catch (err) {
      setIsScanning(false);
      setScanStage("");
      setProgress(0);
      setError(err || "Scan failed. The website might be blocking scrapers or too slow.");
    }
  };

  const addFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [{ question: '', answer: '' }, ...prev.faqs]
    }));
  };

  const updateFaq = (index, field, value) => {
    const newFaqs = [...formData.faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFormData(prev => ({ ...prev, faqs: newFaqs }));
  };

  const removeFaq = (index) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="animate-fade-in training-container">
      <div className="training-header">
        <div className="page-title">
          <h1>AI Intelligence Center</h1>
          <p>Teach your assistant about your products, services, and policies.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={onSave} 
          disabled={isLoading || isScanning}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Deploy Knowledge</>}
        </button>
      </div>

      <div className="training-tabs">
        <button 
          className={`tab-btn ${trainingMode === 'url' ? 'active' : ''}`} 
          onClick={() => setTrainingMode('url')}
        >
          <Globe size={18} /> Automated Scan
        </button>
        <button 
          className={`tab-btn ${trainingMode === 'manual' ? 'active' : ''}`} 
          onClick={() => setTrainingMode('manual')}
        >
          <Layout size={18} /> Manual Expert Mode
        </button>
      </div>

      {trainingMode === 'url' ? (
        <div className="automated-scan-view">
          {business?.plan === 'free' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pro-lock-overlay">
              <div className="lock-icon-wrapper">
                <Lock size={32} />
              </div>
              <h3>Pro Feature: <span style={{ color: 'var(--primary)' }}>Intelligent Scanner</span></h3>
              <p>Automatically train your AI by scanning your entire website in seconds. Upgrade to Pro to unlock our deep-learning crawler.</p>
              <div className="pro-actions">
                <button className="btn btn-outline" onClick={() => setTrainingMode('manual')}>Use Manual Mode</button>
                <button className="btn btn-primary" onClick={onUpgrade}><Sparkles size={18} /> Upgrade to Pro</button>
              </div>
            </motion.div>
          )}
          
          <motion.div 
            className="card scan-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ filter: business?.plan === 'free' ? 'blur(4px)' : 'none' }}
          >
            {!result ? (
              <>
                <div className="scan-hero">
                  <div className="scan-icon-wrapper">
                    <Scan size={40} />
                  </div>
                  <h2>Intelligent Website Crawler</h2>
                  <p>Provide your website URL and our engine will perform a deep crawl to extract business intelligence.</p>
                </div>

                <div className="scan-input-wrapper">
                  <div className="url-input-container">
                    <Search size={22} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="https://www.yourdomain.com" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isScanning}
                    />
                    <button className="btn btn-primary" onClick={handleScan} disabled={isScanning || !url}>
                      {isScanning ? <Loader2 size={20} className="animate-spin" /> : 'Start Deep Scan'}
                    </button>
                  </div>
                  
                  {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="scan-error">
                      <AlertCircle size={22} />
                      <span>{error}</span>
                      <button onClick={() => setError(null)}><X size={18} /></button>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {isScanning && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="scan-progress-container">
                        <div className="progress-header">
                          <div className="status">
                            <RefreshCw size={18} className="animate-spin" />
                            <span>{scanStage}</span>
                          </div>
                          <span className="percent">{Math.round(progress)}%</span>
                        </div>
                        <div className="progress-bar">
                          <motion.div className="progress-fill" animate={{ width: `${progress}%` }} />
                        </div>
                        <p className="scan-note">Processing React components and server-side assets. This depth-scan may take up to 2 minutes.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="scan-results">
                <div className="success-icon-wrapper">
                  <CheckCircle2 size={60} />
                </div>
                <h2>Intelligence Harvested</h2>
                <p>Knowledge base has been populated with high-fidelity content from your domain.</p>

                <div className="results-grid">
                  <div className="result-stat">
                    <div className="value">{result.pagesScanned}</div>
                    <div className="label">Pages Scanned</div>
                  </div>
                  <div className="result-stat">
                    <div className="value">{(result.totalChars / 1000).toFixed(1)}k</div>
                    <div className="label">Chars Extracted</div>
                  </div>
                  <div className="result-stat">
                    <div className="value" style={{ color: '#10b981' }}>High</div>
                    <div className="label">Quality Score</div>
                  </div>
                </div>

                <div className="result-actions">
                  <button className="btn btn-secondary" onClick={() => { setResult(null); setUrl(''); }}>New Scan</button>
                  <button className="btn btn-primary" onClick={() => setTrainingMode('manual')}>Review Knowledge</button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      ) : (
        <div className="manual-mode-view">
          <div className="manual-main">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
              <div className="section-header">
                <div className="section-icon"><FileText size={24} /></div>
                <div>
                  <h3>Knowledge Base</h3>
                  <p>The core library of facts your AI uses to reply.</p>
                </div>
              </div>
              
              <div className="form-group">
                <textarea 
                  name="knowledge"
                  value={formData.knowledge}
                  onChange={(e) => setFormData(prev => ({ ...prev, knowledge: e.target.value }))}
                  rows="18"
                  placeholder="Paste manuals, documentation, or company wikis..."
                ></textarea>
                <div className="textarea-footer">
                  <span>Characters: {formData.knowledge.length.toLocaleString()} / 15,000</span>
                  <span className={formData.knowledge.length > 2000 ? 'status-good' : 'status-warn'}>
                    {formData.knowledge.length > 2000 ? '✓ Sufficient Depth' : 'Suggest adding more content'}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card">
              <div className="section-header-flex">
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className="section-icon"><HelpCircle size={24} /></div>
                  <div>
                    <h3>Expert Q&A</h3>
                    <p>Define specific answers for common customer queries.</p>
                  </div>
                </div>
                <button className="btn btn-secondary" onClick={addFaq}>
                  <Plus size={18} /> New FAQ
                </button>
              </div>

              <div className="faq-list">
                {formData.faqs.map((faq, i) => (
                  <FAQItem key={i} faq={faq} index={i} onUpdate={updateFaq} onRemove={removeFaq} />
                ))}
                
                {formData.faqs.length === 0 && (
                  <div className="empty-faqs">
                    <HelpCircle size={48} />
                    <p>No FAQs configured yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="manual-sidebar">
            <div className="card health-card">
              <h4>AI Context Health</h4>
              <div className="health-row">
                <span>Knowledge Depth</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Optimal</span>
              </div>
              <div className="health-progress-bar">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((formData.knowledge.length / 8000) * 100, 100)}%` }} />
              </div>
              
              <div className="health-details">
                <div className="detail-item">
                  <div className="dot" />
                  <span>Model: GPT-4o</span>
                </div>
                <div className="detail-item">
                  <div className="dot" />
                  <span>Last Trained: {business?.lastTrainedAt ? new Date(business.lastTrainedAt).toLocaleDateString() : 'Initial'}</span>
                </div>
              </div>
            </div>

            <div className="card tips-card">
              <h4>Pro Training Tips</h4>
              <ul className="tips-list">
                <li>Use Manual mode for private company policies.</li>
                <li>Auto-scan works best for public pricing pages.</li>
                <li>Keep FAQs concise for higher accuracy.</li>
                <li>Deploy knowledge after every major change.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .training-container { padding-bottom: 80px; }
        .training-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .training-tabs { display: flex; gap: 12px; background: var(--surface-container-low); padding: 6px; border-radius: 16px; width: fit-content; margin-bottom: 40px; border: 1px solid var(--outline-variant); }
        .tab-btn { display: flex; align-items: center; gap: 10px; padding: 10px 24px; border-radius: 12px; border: none; background: transparent; color: var(--on-surface-variant); font-weight: 600; cursor: pointer; transition: 0.2s; }
        .tab-btn.active { background: var(--primary); color: var(--on-primary); box-shadow: var(--shadow-2); }
        
        .automated-scan-view { position: relative; max-width: 900px; margin: 0 auto; }
        .pro-lock-overlay { position: absolute; inset: 0; z-index: 10; background: rgba(255,255,255,0.4); backdrop-filter: blur(8px); border-radius: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; border: 1px solid var(--primary-fixed); }
        .lock-icon-wrapper { width: 64px; height: 64px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: var(--shadow-3); }
        .pro-actions { display: flex; gap: 16px; margin-top: 32px; }
        
        .scan-card { padding: 60px 40px; text-align: center; }
        .scan-hero { margin-bottom: 48px; }
        .scan-icon-wrapper { width: 80px; height: 80px; background: var(--primary-fixed); color: var(--primary); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .url-input-container { display: flex; gap: 16px; background: var(--surface-container-low); padding: 10px; border-radius: 20px; border: 1.5px solid var(--outline-variant); max-width: 700px; margin: 0 auto; }
        .url-input-container input { flex: 1; background: transparent; border: none; font-size: 1.1rem; padding: 0 16px; }
        .url-input-container input:focus { box-shadow: none; }
        .scan-error { margin-top: 24px; background: var(--error-container); color: var(--error); padding: 16px; border-radius: 12px; display: flex; align-items: center; gap: 12px; }
        
        .scan-progress-container { margin-top: 48px; text-align: left; }
        .progress-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .progress-header .status { display: flex; gap: 10px; align-items: center; font-weight: 700; color: var(--on-surface); }
        .progress-bar { height: 10px; background: var(--surface-container-high); border-radius: 5px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--primary); }
        
        .manual-mode-view { display: grid; grid-template-columns: 1fr 340px; gap: 40px; }
        .manual-main { display: flex; flex-direction: column; gap: 40px; }
        .section-header { display: flex; gap: 16px; align-items: center; margin-bottom: 32px; }
        .section-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .section-icon { width: 48px; height: 48px; background: var(--primary-fixed); color: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .textarea-footer { display: flex; justify-content: space-between; margin-top: 12px; font-size: 0.8rem; color: var(--on-surface-variant); }
        .status-good { color: #10b981; font-weight: 600; }
        .status-warn { color: var(--tertiary); font-weight: 600; }
        
        .faq-header { padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: 0.2s; }
        .faq-header.open { background: var(--surface-container-low); }
        .faq-icon-wrapper { width: 32px; height: 32px; background: var(--surface-container-high); color: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .faq-body { padding: 24px; border-top: 1px solid var(--outline-variant); }
        
        .health-card h4 { margin-bottom: 24px; }
        .health-row { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 12px; }
        .health-progress-bar { height: 8px; background: var(--outline-variant); border-radius: 4px; overflow: hidden; margin-bottom: 24px; }
        .health-progress-bar div { height: 100%; background: var(--primary); }
        .health-details { display: flex; flex-direction: column; gap: 12px; }
        .detail-item { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: var(--on-surface-variant); }
        .detail-item .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; }
        
        .tips-list { padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
        .tips-list li { font-size: 0.85rem; color: var(--on-surface-variant); position: relative; padding-left: 24px; line-height: 1.5; }
        .tips-list li::before { content: '✓'; position: absolute; left: 0; color: var(--primary); font-weight: 900; }
      `}</style>
    </div>
  );
}
