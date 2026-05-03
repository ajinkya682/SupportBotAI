import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, FileText, Bot, HelpCircle, Save, Loader2, Sparkles, 
  CheckCircle2, Globe, Scan, Layout, ChevronDown, ChevronUp, AlertCircle, 
  Search, X, MessageSquare, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { scrapeWebsite } from "../../state/businessSlice";
import ConfirmModal from "../../../../shared/ui/components/ConfirmModal";
import usePlan from "../../../../shared/hooks/usePlan";

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
        <div className="faq-header-content">
          <div className="faq-icon-wrapper">
            <MessageSquare size={16} />
          </div>
          <span className="faq-question-text">
            {faq.question || "Untitled Question"}
          </span>
        </div>
        <div className="faq-header-actions">
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(index); }}
            className="faq-delete-btn"
            aria-label="Delete FAQ"
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
            transition={{ duration: 0.2 }}
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
                  placeholder="Provide a detailed answer..." 
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
  const { isFree, goUpgrade } = usePlan();
  
  const [trainingMode, setTrainingMode] = useState('url'); 
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, index: null });

  const stages = [
    { message: "Establishing connection...", target: 10, duration: 1500 },
    { message: "Scanning site structure...", target: 25, duration: 2500 },
    { message: "Crawling links...", target: 45, duration: 3500 },
    { message: "Extracting content...", target: 70, duration: 4500 },
    { message: "Normalizing data...", target: 85, duration: 2500 },
    { message: "Finalizing...", target: 95, duration: 1500 },
  ];

  const handleScan = async () => {
    if (!url) {
      setError("Please provide a website URL.");
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
        const steps = 20;
        const stepTime = stage.duration / steps;
        for (let i = 1; i <= steps; i++) {
          if (!isScanning) break;
          setProgress(startProgress + (diff * (i / steps)));
          await new Promise(r => setTimeout(r, stepTime));
        }
        currentStage++;
      }
    };

    runStages();

    try {
      const response = await dispatch(scrapeWebsite(url)).unwrap();
      setIsScanning(false);
      setScanStage("Complete!");
      setProgress(100);
      setResult(response);
      if (response.business?.knowledge) {
        setFormData(prev => ({ ...prev, knowledge: response.business.knowledge }));
      }
    } catch (err) {
      setIsScanning(false);
      setProgress(0);
      setError(err || "Scan failed.");
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
    setConfirmModal({ isOpen: false, index: null });
  };

  const openConfirmModal = (index) => {
    setConfirmModal({ isOpen: true, index });
  };

  return (
    <div className="animate-fade-in training-container">
      <div className="training-header">
        <div className="page-title">
          <h1>AI Intelligence</h1>
          <p>Teach your assistant about your business.</p>
        </div>
        <button 
          className="btn btn-primary training-save-btn" 
          onClick={onSave} 
          disabled={isLoading || isScanning}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> <span>Deploy Knowledge</span></>}
        </button>
      </div>

      <div className="training-tabs-wrapper">
        <div className="training-tabs">
          <button 
            className={`tab-btn ${trainingMode === 'url' ? 'active' : ''}`} 
            onClick={() => setTrainingMode('url')}
          >
            <Globe size={18} /> Automated
          </button>
          <button 
            className={`tab-btn ${trainingMode === 'manual' ? 'active' : ''}`} 
            onClick={() => setTrainingMode('manual')}
          >
            <Layout size={18} /> Manual
          </button>
        </div>
      </div>

      {trainingMode === 'url' ? (
        <div className="automated-scan-view">
          {isFree && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pro-lock-overlay">
              <div className="lock-icon-wrapper">
                <Lock size={28} />
              </div>
              <h3>Pro: <span style={{ color: 'var(--primary)' }}>Auto Scanner</span></h3>
              <p>Scan your entire website in seconds. Upgrade to Pro to unlock.</p>
              <div className="pro-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => setTrainingMode('manual')}>Manual Mode</button>
                <button className="btn btn-primary btn-sm" onClick={goUpgrade}><Sparkles size={16} /> Upgrade</button>
              </div>
            </motion.div>
          )}
          
          <motion.div 
            className="card scan-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ filter: isFree ? 'blur(4px)' : 'none' }}
          >
            {!result ? (
              <>
                <div className="scan-hero">
                  <div className="scan-icon-wrapper">
                    <Scan size={32} />
                  </div>
                  <h2>Website Crawler</h2>
                  <p>Deep crawl your domain to extract business intelligence.</p>
                </div>

                <div className="scan-input-wrapper">
                  <div className="url-input-container">
                    <Search size={20} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="https://yourdomain.com" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isScanning}
                    />
                    <button className="btn btn-primary scan-btn" onClick={handleScan} disabled={isScanning || !url}>
                      {isScanning ? <Loader2 size={18} className="animate-spin" /> : 'Scan Site'}
                    </button>
                  </div>
                  
                  {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="scan-error">
                      <AlertCircle size={18} />
                      <span>{error}</span>
                      <button onClick={() => setError(null)}><X size={14} /></button>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {isScanning && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="scan-progress-container">
                        <div className="progress-header">
                          <div className="status">
                            <Loader2 size={16} className="animate-spin" />
                            <span>{scanStage}</span>
                          </div>
                          <span className="percent">{Math.round(progress)}%</span>
                        </div>
                        <div className="progress-bar">
                          <motion.div className="progress-fill" animate={{ width: `${progress}%` }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="scan-results">
                <div className="success-icon-wrapper">
                  <CheckCircle2 size={48} />
                </div>
                <h2>Harvest Complete</h2>
                <div className="results-grid">
                  <div className="result-stat">
                    <div className="value">{result.pagesScanned}</div>
                    <div className="label">Pages</div>
                  </div>
                  <div className="result-stat">
                    <div className="value">{(result.totalChars / 1000).toFixed(1)}k</div>
                    <div className="label">Chars</div>
                  </div>
                  <div className="result-stat">
                    <div className="value" style={{ color: '#10b981' }}>High</div>
                    <div className="label">Quality</div>
                  </div>
                </div>
                <div className="result-actions">
                  <button className="btn btn-secondary" onClick={() => { setResult(null); setUrl(''); }}>New Scan</button>
                  <button className="btn btn-primary" onClick={() => setTrainingMode('manual')}>Review</button>
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
                <div className="section-icon"><FileText size={20} /></div>
                <div>
                  <h3>Knowledge Base</h3>
                  <p>Core facts your AI uses to reply.</p>
                </div>
              </div>
              
              <div className="form-group">
                <textarea 
                  name="knowledge"
                  value={formData.knowledge}
                  onChange={(e) => setFormData(prev => ({ ...prev, knowledge: e.target.value }))}
                  rows="12"
                  placeholder="Paste manuals, wikis, or product descriptions..."
                ></textarea>
                <div className="textarea-footer">
                  <span>{formData.knowledge.length.toLocaleString()} / 15,000 chars</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card">
              <div className="section-header-flex">
                <div className="header-title-group">
                  <div className="section-icon"><HelpCircle size={20} /></div>
                  <div>
                    <h3>Expert Q&A</h3>
                    <p>Specific answers for common queries.</p>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={addFaq}>
                  <Plus size={16} /> <span className="desktop-only">New FAQ</span>
                </button>
              </div>

              <div className="faq-list">
                {formData.faqs.map((faq, i) => (
                  <FAQItem key={i} faq={faq} index={i} onUpdate={updateFaq} onRemove={openConfirmModal} />
                ))}
                
                {formData.faqs.length === 0 && (
                  <div className="empty-faqs">
                    <HelpCircle size={40} style={{ opacity: 0.2 }} />
                    <p>No FAQs configured.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="manual-sidebar">
            <div className="card health-card">
              <h4>AI Context Health</h4>
              <div className="health-row">
                <span>Depth</span>
                <span className="health-status">Optimal</span>
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
                  <span>Last Sync: {business?.lastTrainedAt ? new Date(business.lastTrainedAt).toLocaleDateString() : 'Initial'}</span>
                </div>
              </div>
            </div>

            <div className="card tips-card">
              <h4>Training Tips</h4>
              <ul className="tips-list">
                <li>Use Manual for private policies.</li>
                <li>Keep FAQs concise for accuracy.</li>
                <li>Deploy after every major change.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .training-container { padding-bottom: 40px; }
        
        .training-header { 
          display: flex; 
          flex-direction: column; 
          gap: 20px; 
          margin-bottom: 32px; 
        }

        @media (min-width: 768px) {
          .training-header { flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        }

        .page-title h1 { font-size: 1.5rem; margin-bottom: 4px; }
        .page-title p { color: var(--on-surface-variant); font-size: 0.9rem; }

        .training-save-btn { width: 100%; }
        @media (min-width: 768px) { .training-save-btn { width: auto; } }

        .training-tabs-wrapper { 
          width: 100%; 
          overflow-x: auto; 
          margin-bottom: 32px; 
          padding-bottom: 4px;
        }

        .training-tabs { 
          display: flex; 
          gap: 8px; 
          background: var(--surface-container-low); 
          padding: 4px; 
          border-radius: 12px; 
          width: fit-content; 
          min-width: 100%;
          border: 1px solid var(--outline-variant); 
        }

        @media (min-width: 768px) {
          .training-tabs { min-width: auto; }
        }

        .tab-btn { 
          flex: 1;
          display: flex; 
          align-items: center; 
          justify-content: center;
          gap: 8px; 
          padding: 8px 16px; 
          border-radius: 10px; 
          border: none; 
          background: transparent; 
          color: var(--on-surface-variant); 
          font-weight: 600; 
          font-size: 13px;
          cursor: pointer; 
          white-space: nowrap;
        }

        .tab-btn.active { background: var(--primary); color: var(--on-primary); }
        
        .automated-scan-view { position: relative; width: 100%; }
        .pro-lock-overlay { 
          position: absolute; 
          inset: -12px; 
          z-index: 10; 
          background: rgba(255,255,255,0.6); 
          backdrop-filter: blur(8px); 
          border-radius: 20px; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          padding: 24px; 
          text-align: center; 
          border: 1px solid var(--primary-fixed); 
        }

        .lock-icon-wrapper { width: 48px; height: 48px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .pro-actions { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 280px; }
        @media (min-width: 480px) { .pro-actions { flex-direction: row; justify-content: center; } }
        
        .scan-card { padding: 32px 16px; text-align: center; }
        @media (min-width: 768px) { .scan-card { padding: 60px 40px; } }

        .scan-hero { margin-bottom: 32px; }
        .scan-hero h2 { font-size: 1.25rem; margin-bottom: 8px; }
        .scan-hero p { font-size: 0.9rem; color: var(--on-surface-variant); }
        
        .scan-icon-wrapper { width: 64px; height: 64px; background: var(--primary-fixed); color: var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        
        .url-input-container { 
          display: flex; 
          flex-direction: column;
          gap: 12px; 
          background: transparent;
          width: 100%;
        }

        @media (min-width: 768px) {
          .url-input-container { 
            flex-direction: row; 
            background: var(--surface-container-low); 
            padding: 8px; 
            border-radius: 16px; 
            border: 1.5px solid var(--outline-variant); 
            align-items: center;
          }
          .url-input-container input { flex: 1; background: transparent; border: none; padding: 0 12px; height: auto; }
        }

        .url-input-container input { height: 48px; }

        .scan-btn { width: 100%; }
        @media (min-width: 768px) { .scan-btn { width: auto; } }

        .scan-error { margin-top: 20px; background: var(--error-container); color: var(--error); padding: 12px; border-radius: 10px; display: flex; align-items: center; gap: 8px; font-size: 13px; }
        
        .scan-progress-container { margin-top: 32px; text-align: left; }
        .progress-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .progress-header .status { display: flex; gap: 8px; align-items: center; font-weight: 700; }
        .progress-bar { height: 8px; background: var(--surface-container-high); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--primary); }
        
        .scan-results { padding: 16px 0; }
        .success-icon-wrapper { color: #10b981; margin-bottom: 16px; }
        .results-grid { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 12px; 
          margin: 24px 0;
        }
        .result-stat { background: var(--surface-container-low); padding: 12px; border-radius: 12px; }
        .result-stat .value { font-size: 1.25rem; font-weight: 700; color: var(--on-surface); }
        .result-stat .label { font-size: 11px; text-transform: uppercase; color: var(--outline); font-weight: 600; margin-top: 4px; }

        .result-actions { display: flex; flex-direction: column; gap: 12px; }
        @media (min-width: 480px) { .result-actions { flex-direction: row; justify-content: center; } }
        
        .manual-mode-view { 
          display: flex;
          flex-direction: column;
          gap: 24px; 
        }

        @media (min-width: 1024px) {
          .manual-mode-view { 
            display: grid; 
            grid-template-columns: 1fr 300px; 
            gap: 32px; 
          }
        }

        .manual-main { display: flex; flex-direction: column; gap: 24px; }
        .section-header { display: flex; gap: 12px; align-items: center; margin-bottom: 24px; }
        .section-header h3 { font-size: 1.1rem; }
        .section-header p { font-size: 13px; color: var(--on-surface-variant); }

        .section-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .header-title-group { display: flex; gap: 12px; align-items: center; }

        .section-icon { width: 40px; height: 40px; background: var(--primary-fixed); color: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .textarea-footer { display: flex; justify-content: flex-end; margin-top: 8px; font-size: 12px; color: var(--outline); }
        
        .faq-header { padding: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .faq-header-content { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .faq-question-text { font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .faq-header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .faq-delete-btn { color: var(--outline); padding: 8px; border-radius: 8px; }
        .faq-delete-btn:hover { color: var(--error); background: var(--error-container); }
        .faq-body { padding: 16px; border-top: 1px solid var(--outline-variant); }
        
        .manual-sidebar { display: flex; flex-direction: column; gap: 16px; }
        .health-card h4 { margin-bottom: 16px; }
        .health-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
        .health-status { color: #10b981; font-weight: 700; }
        .health-progress-bar { height: 6px; background: var(--outline-variant); border-radius: 3px; overflow: hidden; margin-bottom: 16px; }
        .health-progress-bar div { height: 100%; background: var(--primary); }
        
        .health-details { display: flex; flex-direction: column; gap: 8px; }
        .detail-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--on-surface-variant); }
        .detail-item .dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; }
        
        .tips-list { padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
        .tips-list li { font-size: 12px; color: var(--on-surface-variant); position: relative; padding-left: 20px; line-height: 1.4; }
        .tips-list li::before { content: '✓'; position: absolute; left: 0; color: var(--primary); font-weight: 900; }

        .empty-faqs { text-align: center; padding: 32px 16px; color: var(--outline); }
        .empty-faqs p { margin-top: 12px; font-size: 14px; }
      `}</style>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => removeFaq(confirmModal.index)}
        title="Remove FAQ?"
        message="Are you sure you want to delete this FAQ? You will need to manually recreate it if you change your mind."
        confirmText="Delete FAQ"
        type="danger"
      />
    </div>
  );
}
