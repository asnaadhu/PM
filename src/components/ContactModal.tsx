import React, { useState } from "react";
import { X, Send, CheckCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../types";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderOrg, setSenderOrg] = useState("");
  const [inquiryType, setInquiryType] = useState("Direct Hire / Job Opportunity");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!profile) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setSenderName("");
    setSenderEmail("");
    setSenderOrg("");
    setMessage("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="contact-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-[#1C1917]/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            key="contact-dialog"
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#FAF9F6] rounded-xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E7E2DA] relative text-[#2A2A2A]"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-md hover:bg-[#F2ECE4] text-[#78716C] hover:text-[#1C1917] transition-colors border border-transparent hover:border-[#E7E2DA]"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <div>
                {/* Header & Target Profile */}
                <div className="flex items-center space-x-3 mb-5 border-b border-[#E7E2DA] pb-4">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-12 h-12 rounded-lg object-cover ring-2 ring-[#8B4513]/30"
                  />
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#8B4513] tracking-widest block">Direct Dispatch</span>
                    <h3 className="text-lg font-black text-[#1C1917] font-display">
                      Contact {profile.fullName}
                    </h3>
                    <p className="text-xs font-mono text-[#78716C]">
                      {profile.title} • {profile.island}, {profile.atoll.split(" ")[0]}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="e.g. Mariyam Hassan"
                        className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:bg-[#FFFFFF] focus:outline-hidden focus:border-[#8B4513]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="name@organization.mv"
                        className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:bg-[#FFFFFF] focus:outline-hidden focus:border-[#8B4513]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                      Resort / Organization / Company
                    </label>
                    <input
                      type="text"
                      value={senderOrg}
                      onChange={(e) => setSenderOrg(e.target.value)}
                      placeholder="e.g. Soneva Jani, Ministry of Tourism, Bank of Maldives"
                      className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                      Inquiry Purpose
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono font-medium text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                    >
                      <option value="Direct Hire / Job Opportunity">Direct Hire / Full-time Role</option>
                      <option value="Resort Project / Contract Work">Resort Project / Contract Work</option>
                      <option value="Consultancy / Advisory">Consultancy / Strategic Advisory</option>
                      <option value="Speaking / Media / Workshop">Speaking / Media / Workshop</option>
                      <option value="General Professional Connection">General Professional Connection</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Hello ${profile.fullName}, we were impressed by your portfolio and would like to discuss...`}
                      className="w-full p-3 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs text-[#1C1917] leading-relaxed focus:outline-hidden focus:border-[#8B4513]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#78716C] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8B4513]" />
                      Direct verified delivery
                    </span>

                    <button
                      id="submit-contact-inquiry-btn"
                      type="submit"
                      className="px-5 py-2.5 bg-[#8B4513] hover:bg-[#73380F] text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Submission Success Message */
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-[#8B4513]/10 text-[#8B4513] flex items-center justify-center mx-auto mb-3 border border-[#8B4513]/30">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[#1C1917] font-display">
                  Inquiry Dispatched Successfully!
                </h3>
                <p className="text-xs text-[#57534E] mt-2 max-w-sm mx-auto leading-relaxed">
                  Your inquiry has been routed to <strong>{profile.fullName}</strong>. You will receive a response at <span className="font-mono text-[#8B4513]">{senderEmail}</span>.
                </p>

                <div className="mt-6">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2 bg-[#8B4513] hover:bg-[#73380F] text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
