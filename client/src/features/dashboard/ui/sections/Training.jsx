import React, { useState } from "react";
import { 
  Plus, Trash2, FileText, Save, Sparkles, 
  CheckCircle2, Globe, Scan, Layout, ChevronDown, ChevronUp, AlertCircle, 
  Search, RefreshCw, MessageSquare, Lock, GraduationCap,
  ArrowRight,HelpCircle, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { scrapeWebsite } from "../../state/businessSlice";

const FAQItem = ({ faq, index, onUpdate, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      layout
      className="card" 
      style={{ 
        padding: 0,
        marginBottom: 'var(--space-4)',
        overflow: 'hidden',
        border: '1px solid var(--color-surface-container-low)',
        background: isOpen ? 'var(--color-surface-container-lowest)' : 'white'
      }}
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          padding: 'var(--space-4) var(--space-5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: isOpen ? 'var(--color-surface-container-low)' : 'transparent',
          transition: 'all var(--duration-base)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: 'var(--radius-md)', 
            background: 'var(--color-primary-light)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)'
          }}>
            <MessageSquare size={14} />
          </div>
          <span style={{ fontWeight: 'var(--weight-semibold)', color: faq.question ? 'var(--color-on-surface)' : 'var(--color-on-surface-muted)', fontSize: 'var(--text-sm)' }}>
            {faq.question || "Untitled Question"}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(index); }}
            style={{ color: 'var(--color-error)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Trash2 size={16} />
          </button>
          {isOpen ? <ChevronUp size={18} style={{ color: 'var(--color-on-surface-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--color-on-surface-muted)' }} />}
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
            <div style={{ padding: 'var(--space-5)', borderTop: '1px solid var(--color-surface-container-low)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-wrapper">
                <label className="input-label">Question</label>
                <input 
                  className="input-field"
                  placeholder="e.g. What is your refund policy?" 
                  value={faq.question} 
                  onChange={(e) => onUpdate(index, 'question', e.target.value)} 
                />
              </div>
              <div className="input-wrapper">
                <label className="input-label">Answer</label>
                <textarea 
                  className="input-field"
                  placeholder="Provide a detailed answer for the AI to learn..." 
                  value={faq.answer} 
                  onChange={(e) => onUpdate(index, 'answer', e.target.value)} 
                  rows="4"
                  style={{ resize: 'vertical' }}
                />
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
    { message: "Establishing secure connection...", target: 15, duration: 1500 },
    { message: "Scanning site architecture...", target: 35, duration: 2500 },
    { message: "Extracting knowledge tokens...", target: 65, duration: 4000 },
    { message: "Optimizing training set...", target: 90, duration: 2000 },
    { message: "Finalizing knowledge base...", target: 98, duration: 1000 },
  ];

  const handleScan = async () => {
    if (!url) { setError("Please provide a website URL."); return; }
    setIsScanning(true); setError(null); setResult(null); setProgress(0);
    
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
      setIsScanning(false); setProgress(100); setResult(response);
      if (response.business?.knowledge) {
        setFormData(prev => ({ ...prev, knowledge: response.business.knowledge }));
      }
    } catch (err) {
      setIsScanning(false); setProgress(0);
      setError(err || "Scan failed. Please check the URL.");
    }
  };

  const addFaq = () => {
    setFormData(prev => ({ ...prev, faqs: [{ question: '', answer: '' }, ...prev.faqs] }));
  };

  const updateFaq = (index, field, value) => {
    const newFaqs = [...formData.faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFormData(prev => ({ ...prev, faqs: newFaqs }));
  };

  const removeFaq = (index) => {
    setFormData(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }));
  };

  return (
    <div style={{ paddingBottom: 'var(--space-12)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-extrabold)', fontSize: 'var(--text-3xl)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-1)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
              <GraduationCap size={24} />
            </div>
            AI Training Center
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)' }}>
            Populate your assistant's knowledge base with high-quality data.
          </p>
        </div>
        <button 
          className={`btn btn-primary${isLoading ? ' btn-loading' : ''}`} 
          onClick={onSave} 
          disabled={isLoading || isScanning}
        >
          {!isLoading && <><Save size={18} /> Deploy Knowledge</>}
        </button>
      </div>

      {/* Mode Switcher */}
      <div style={{ marginBottom: 'var(--space-8)', display: 'flex', background: 'var(--color-surface-container)', padding: '4px', borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
        {[
          { id: 'url', label: 'Automated Scan', icon: Globe },
          { id: 'manual', label: 'Manual Expert Mode', icon: Layout }
        ].map(m => (
          <button 
            key={m.id}
            onClick={() => setTrainingMode(m.id)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-6)', 
              fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', borderRadius: 'var(--radius-md)', 
              border: 'none', cursor: 'pointer', transition: 'all var(--duration-base)',
              background: trainingMode === m.id ? 'white' : 'transparent',
              color: trainingMode === m.id ? 'var(--color-primary)' : 'var(--color-on-surface-muted)',
              boxShadow: trainingMode === m.id ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <m.icon size={16} /> {m.label}
          </button>
        ))}
      </div>

      {trainingMode === 'url' ? (
        <div style={{ position: 'relative' }}>
          {business?.plan === 'free' && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', borderRadius: 'var(--radius-2xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-12)', textAlign: 'center', border: '1px solid var(--color-surface-container)' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--color-primary-gradient)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 'var(--space-6)', boxShadow: 'var(--shadow-lg)' }}>
                <Lock size={28} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-extrabold)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>Intelligent Crawler</h2>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-base)', maxWidth: '480px', marginBottom: 'var(--space-8)', lineHeight: 'var(--leading-body)' }}>
                Automatically extract knowledge from your website. Upgrade to Pro to unlock our deep-learning scraper.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <button className="btn btn-secondary" onClick={() => setTrainingMode('manual')}>Use Manual Mode</button>
                <button className="btn btn-primary" onClick={onUpgrade}><Sparkles size={16} /> Upgrade to Pro</button>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center', background: 'white', border: '1px solid var(--color-surface-container)', filter: business?.plan === 'free' ? 'blur(4px)' : 'none' }}>
            {!result ? (
              <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ width: '72px', height: '72px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', margin: '0 auto var(--space-6)' }}>
                  <Scan size={36} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-extrabold)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>Website Scraper</h2>
                <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-8)' }}>
                  Enter your website URL and we'll extract the core business intelligence automatically.
                </p>

                <div style={{ display: 'flex', gap: 'var(--space-3)', background: 'var(--color-surface-container-low)', padding: 'var(--space-2)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-surface-container)' }}>
                  <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={18} style={{ position: 'absolute', left: 'var(--space-4)', color: 'var(--color-on-surface-muted)' }} />
                    <input 
                      type="text" placeholder="https://www.yourdomain.com" value={url} onChange={e => setUrl(e.target.value)} disabled={isScanning}
                      style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', paddingLeft: 'var(--space-10)', fontSize: 'var(--text-base)', color: 'var(--color-on-surface)' }}
                    />
                  </div>
                  <button className={`btn btn-primary${isScanning ? ' btn-loading' : ''}`} onClick={handleScan} disabled={isScanning || !url}>
                    {!isScanning && 'Start Scan'}
                  </button>
                </div>

                {error && (
                  <div style={{ marginTop: 'var(--space-5)', background: '#fef2f2', border: '1px solid #fee2e2', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-error)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>
                    <AlertCircle size={18} /> {error}
                  </div>
                )}

                <AnimatePresence>
                  {isScanning && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 'var(--space-10)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)', fontSize: 'var(--text-sm)' }}>
                          <RefreshCw size={14} className="spin" /> {scanStage}
                        </div>
                        <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)' }}>{Math.round(progress)}%</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <motion.div 
                          style={{ height: '100%', background: 'var(--color-primary-gradient)', borderRadius: 'var(--radius-full)' }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ width: '72px', height: '72px', background: 'var(--color-secondary-light)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)', margin: '0 auto var(--space-6)' }}>
                  <CheckCircle2 size={40} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-extrabold)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Intelligence Harvested</h2>
                <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-10)' }}>Knowledge base updated with content from your domain.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
                  {[
                    { label: 'Pages Scanned', value: result.pagesScanned },
                    { label: 'Content Size', value: `${(result.totalChars / 1000).toFixed(1)}k chars` },
                    { label: 'Quality Score', value: 'High' }
                  ].map(stat => (
                    <div key={stat.label} style={{ background: 'var(--color-surface-container-low)', padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)' }}>
                      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-1)' }}>{stat.value}</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', fontWeight: 'var(--weight-bold)', letterSpacing: '0.05em' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                  <button className="btn btn-secondary" onClick={() => { setResult(null); setUrl(''); }}>New Scan</button>
                  <button className="btn btn-primary" onClick={() => setTrainingMode('manual')}>Review Knowledge</button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-8)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Knowledge Area */}
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>Knowledge Base</h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)' }}>The core training data for your AI assistant.</p>
                </div>
              </div>
              <textarea 
                className="input-field"
                value={formData.knowledge}
                onChange={e => setFormData(prev => ({ ...prev, knowledge: e.target.value }))}
                rows="16"
                placeholder="Paste company documentation, product lists, or manuals here..."
                style={{ resize: 'vertical', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-body)', padding: 'var(--space-5)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-3)', fontSize: '11px' }}>
                <span style={{ color: 'var(--color-on-surface-muted)' }}>{formData.knowledge.length.toLocaleString()} / 15,000 characters</span>
                <span style={{ fontWeight: 'var(--weight-bold)', color: formData.knowledge.length > 1000 ? 'var(--color-secondary)' : 'var(--color-on-surface-muted)' }}>
                  {formData.knowledge.length > 1000 ? '✓ Ready for deployment' : 'Add more content for better accuracy'}
                </span>
              </div>
            </div>

            {/* FAQ Area */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', background: 'var(--color-secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)' }}>
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>Expert Q&A</h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)' }}>Specific answers for frequently asked questions.</p>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={addFaq}><Plus size={16} /> Add FAQ</button>
              </div>

              {formData.faqs.map((faq, i) => (
                <FAQItem key={i} faq={faq} index={i} onUpdate={updateFaq} onRemove={removeFaq} />
              ))}

              {formData.faqs.length === 0 && (
                <div style={{ padding: 'var(--space-12)', textAlign: 'center', border: '2px dashed var(--color-surface-container)', borderRadius: 'var(--radius-xl)' }}>
                  <HelpCircle size={40} style={{ color: 'var(--color-surface-container-highest)', marginBottom: 'var(--space-3)' }} />
                  <p style={{ color: 'var(--color-on-surface-muted)', fontSize: 'var(--text-sm)' }}>No custom FAQs configured.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Sparkles size={16} style={{ color: 'var(--color-primary)' }} /> Training Status
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)' }}>
                <span style={{ color: 'var(--color-on-surface-muted)' }}>Knowledge Health</span>
                <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-secondary)' }}>Optimal</span>
              </div>
              <div style={{ height: '8px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 'var(--space-5)' }}>
                <div style={{ width: '85%', height: '100%', background: 'var(--color-primary-gradient)' }} />
              </div>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[
                  { icon: CheckCircle2, label: 'Model: SupportBot-v4' },
                  { icon: Clock, label: `Updated: ${business?.lastTrainedAt ? new Date(business.lastTrainedAt).toLocaleDateString() : 'Today'}` }
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-variant)' }}>
                    <item.icon size={14} style={{ color: 'var(--color-secondary)' }} /> {item.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--color-primary-light)', border: 'none' }}>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>Training Tips</h4>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {[
                  "Use Manual mode for internal policies.",
                  "Scanning is best for public pages.",
                  "Deploy after every knowledge change."
                ].map((tip, i) => (
                  <li key={i} style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-variant)', lineHeight: '1.5' }}>
                    <div style={{ color: 'var(--color-primary)', flexShrink: 0 }}><ArrowRight size={14} /></div> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin { animation: spin-anim 0.8s linear infinite; }
        @keyframes spin-anim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
