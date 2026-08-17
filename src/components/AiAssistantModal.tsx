import React, { useState } from "react";
import { Sparkles, X, Check, Copy, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../types";
import { aiEnhanceBio, aiEnhanceBullet, aiSuggestSkills } from "../services/api";

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: UserProfile;
  onApplyBio: (newBio: string) => void;
  onApplySkills: (newSkills: string[]) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  onApplyBio,
  onApplySkills,
}) => {
  const [activeMode, setActiveMode] = useState<"bio" | "bullet" | "skills">("bio");
  const [tone, setTone] = useState("Executive & Prestigious");
  const [keyHighlights, setKeyHighlights] = useState("");
  const [generatedBio, setGeneratedBio] = useState("");
  const [rawBullet, setRawBullet] = useState("Responsible for managing resort staff and handling daily guest operations.");
  const [generatedBullets, setGeneratedBullets] = useState<string[]>([]);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Run Bio Generation
  const handleGenerateBio = async () => {
    setLoading(true);
    try {
      const bio = await aiEnhanceBio({
        fullName: activeProfile.fullName,
        currentTitle: activeProfile.title,
        industry: activeProfile.industry,
        atoll: activeProfile.atoll,
        rawBio: activeProfile.bio,
        keyStrengths: keyHighlights,
        tone: tone,
      });
      setGeneratedBio(bio);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Run Bullet Point Polish
  const handleEnhanceBullet = async () => {
    setLoading(true);
    try {
      const results = await aiEnhanceBullet({
        role: activeProfile.title,
        company: activeProfile.experiences[0]?.company || "Maldives Luxury Resort",
        industry: activeProfile.industry,
        rawBullet: rawBullet,
      });
      setGeneratedBullets(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Run Skill Suggestions
  const handleGetSkills = async () => {
    setLoading(true);
    try {
      const res = await aiSuggestSkills({
        title: activeProfile.title,
        industry: activeProfile.industry,
      });
      setSuggestedSkills(res.skills || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ai-advisor-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-[#1C1917]/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            key="ai-advisor-dialog"
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#FAF9F6] rounded-xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-[#E7E2DA] relative max-h-[90vh] overflow-y-auto text-[#2A2A2A]"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-md hover:bg-[#F2ECE4] text-[#78716C] hover:text-[#1C1917] transition-colors border border-transparent hover:border-[#E7E2DA]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3 mb-5 border-b border-[#E7E2DA] pb-4">
              <div className="w-10 h-10 rounded-lg bg-[#8B4513]/10 text-[#8B4513] border border-[#8B4513]/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8B4513] block">AI Editorial Assistant</span>
                <h3 className="text-lg font-black text-[#1C1917] font-display">
                  Maldives Career AI Advisor
                </h3>
                <p className="text-xs font-mono text-[#78716C]">
                  Gemini 3.7 • Specialized for Maldivian hospitality, marine, & island commerce.
                </p>
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex rounded-lg bg-[#F2ECE4] p-1 mb-5 text-xs font-mono font-bold text-[#57534E] border border-[#E7E2DA]">
              <button
                onClick={() => setActiveMode("bio")}
                className={`flex-1 py-2 rounded-md transition-colors ${
                  activeMode === "bio" ? "bg-[#FAF9F6] text-[#8B4513] shadow-2xs border border-[#E7E2DA]" : "hover:text-[#1C1917]"
                }`}
              >
                Bio Polisher
              </button>
              <button
                onClick={() => setActiveMode("bullet")}
                className={`flex-1 py-2 rounded-md transition-colors ${
                  activeMode === "bullet" ? "bg-[#FAF9F6] text-[#8B4513] shadow-2xs border border-[#E7E2DA]" : "hover:text-[#1C1917]"
                }`}
              >
                Achievement Enhancer
              </button>
              <button
                onClick={() => {
                  setActiveMode("skills");
                  if (suggestedSkills.length === 0) handleGetSkills();
                }}
                className={`flex-1 py-2 rounded-md transition-colors ${
                  activeMode === "skills" ? "bg-[#FAF9F6] text-[#8B4513] shadow-2xs border border-[#E7E2DA]" : "hover:text-[#1C1917]"
                }`}
              >
                In-Demand Skills
              </button>
            </div>

            {/* MODE 1: BIO POLISHER */}
            {activeMode === "bio" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                      Target Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono font-semibold text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                    >
                      <option value="Executive & Prestigious">Executive & Prestigious</option>
                      <option value="Luxury Hospitality & High-Touch">Luxury Hospitality & High-Touch</option>
                      <option value="Innovative Tech & Cloud Leader">Innovative Tech & Cloud Leader</option>
                      <option value="Marine Science & Conservation">Marine Science & Conservation</option>
                      <option value="Modern Creative & Visionary">Modern Creative & Visionary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                      Key Strengths / Island Highlights
                    </label>
                    <input
                      type="text"
                      value={keyHighlights}
                      onChange={(e) => setKeyHighlights(e.target.value)}
                      placeholder="e.g. 10+ years at Soneva, resort openings"
                      className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateBio}
                  disabled={loading}
                  className="w-full py-2.5 bg-[#8B4513] hover:bg-[#73380F] text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider shadow-2xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  <span>{loading ? "Generating Executive Bio with Gemini..." : "Generate Polished Bio"}</span>
                </button>

                {generatedBio && (
                  <div className="mt-4 p-4 rounded-lg bg-[#F2ECE4] border border-[#E7E2DA] space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono font-bold text-[#8B4513]">
                      <span>Gemini Suggested Bio:</span>
                      <button
                        onClick={() => handleCopy(generatedBio)}
                        className="text-[#8B4513] hover:text-[#73380F] flex items-center gap-1 font-semibold"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-[#2A2A2A] font-serif italic leading-relaxed">
                      "{generatedBio}"
                    </p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          onApplyBio(generatedBio);
                          onClose();
                        }}
                        className="px-4 py-1.5 bg-[#8B4513] hover:bg-[#73380F] text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                      >
                        Apply to My Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: BULLET ENHANCER */}
            {activeMode === "bullet" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-[#57534E] mb-1">
                    Paste a Simple Job Task or Draft Bullet:
                  </label>
                  <input
                    type="text"
                    value={rawBullet}
                    onChange={(e) => setRawBullet(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs font-mono text-[#1C1917] focus:outline-hidden focus:border-[#8B4513]"
                  />
                </div>

                <button
                  onClick={handleEnhanceBullet}
                  disabled={loading}
                  className="w-full py-2.5 bg-[#8B4513] hover:bg-[#73380F] text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{loading ? "Optimizing..." : "Turn into High-Impact Achievement"}</span>
                </button>

                {generatedBullets.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <span className="text-xs font-mono font-bold text-[#57534E] block">High-Impact Alternatives:</span>
                    {generatedBullets.map((bullet, i) => (
                      <div
                        key={i}
                        className="p-3 bg-[#FFFFFF] border border-[#E7E2DA] rounded-md text-xs text-[#2A2A2A] flex justify-between items-start gap-2"
                      >
                        <p className="flex-1 leading-relaxed">▪ {bullet}</p>
                        <button
                          onClick={() => handleCopy(bullet)}
                          className="p-1 text-[#78716C] hover:text-[#1C1917] shrink-0"
                          title="Copy to Clipboard"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MODE 3: IN-DEMAND SKILLS */}
            {activeMode === "skills" && (
              <div className="space-y-4">
                <p className="text-xs font-mono text-[#57534E]">
                  Curated competencies for a <strong>{activeProfile.title}</strong> in the Maldives' <strong>{activeProfile.industry}</strong> sector:
                </p>

                <div className="flex flex-wrap gap-2">
                  {suggestedSkills.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-[#FFFFFF] text-[#8B4513] border border-[#E7E2DA] rounded-md text-xs font-mono font-bold"
                    >
                      + {s}
                    </span>
                  ))}
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-[#E7E2DA]">
                  <button
                    onClick={handleGetSkills}
                    disabled={loading}
                    className="text-xs font-mono font-bold text-[#8B4513] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    <span>Refresh Suggestions</span>
                  </button>

                  <button
                    onClick={() => {
                      onApplySkills(suggestedSkills);
                      onClose();
                    }}
                    className="px-4 py-2 bg-[#8B4513] hover:bg-[#73380F] text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider"
                  >
                    Add to Profile
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
