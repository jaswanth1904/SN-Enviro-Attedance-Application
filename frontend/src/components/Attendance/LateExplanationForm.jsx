import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Send, CheckCircle, Clock } from 'lucide-react';
import { useParams } from 'react-router-dom';

const LateExplanationForm = () => {
  const { token } = useParams(); // Simulate reading token from email link
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const response = await fetch('http://localhost:5002/api/escalations/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, reason: explanation })
        });
        const data = await response.json();
        
        if (data.success) {
            setSubmitted(true);
        } else {
            alert(data.error || 'Failed to submit explanation.');
        }
    } catch (err) {
        alert('Server error while submitting explanation.');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="m3-card-elevated max-w-md w-full p-10 text-center"
        >
          <div className="w-20 h-20 bg-brand-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-brand-accent" />
          </div>
          <h2 className="text-2xl font-bold text-md-on-surface mb-2">Explanation Submitted</h2>
          <p className="text-md-on-surface-variant">
            Your response has been logged and forwarded to the Managing Director. Please ensure future logins are before 11:00 AM.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="m3-card-elevated max-w-lg w-full overflow-hidden"
      >
        <div className="bg-md-error/10 border-b border-md-error/20 p-6 flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-md-error shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-md-error uppercase tracking-wider mb-1">
              Escalation Notice
            </h2>
            <p className="text-sm text-md-on-surface-variant">
              Our records indicate you failed to log your attendance by the 11:00 AM deadline today. 
              As per company policy, an explanation is required.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-mono uppercase text-md-on-surface-variant mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Reason for Delay
            </label>
            <textarea
              required
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full h-32 bg-md-surface-variant/50 border border-md-outline/50 rounded-xl p-4 text-md-on-surface focus:outline-none focus:border-md-error/70 focus:bg-md-surface-variant/80 transition-all placeholder:text-md-on-surface-variant/40"
              placeholder="Please provide a detailed explanation..."
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || explanation.trim() === ''}
            className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 uppercase tracking-wider transition-all
              ${isSubmitting || explanation.trim() === '' 
                ? 'bg-md-surface-variant text-md-on-surface-variant opacity-50 cursor-not-allowed' 
                : 'bg-md-error text-white shadow-[0_0_20px_rgba(255,77,77,0.4)] hover:shadow-[0_0_30px_rgba(255,77,77,0.6)]'
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Explanation
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LateExplanationForm;
