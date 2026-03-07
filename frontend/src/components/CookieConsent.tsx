'use client';

import { useState, useEffect } from 'react';
import { Shield, Cookie, X, Check, Settings, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consents, setConsents] = useState({
    essential: true,
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('nex_cookie_consent');
    if (!savedConsent) {
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleAcceptAll = async () => {
    const allConsents = { essential: true, analytics: true, marketing: true };
    saveConsent(allConsents, true);
  };

  const handleSaveSettings = () => {
    saveConsent(consents, false);
  };

  const saveConsent = async (consentData: typeof consents, acceptedAll: boolean) => {
    localStorage.setItem('nex_cookie_consent', JSON.stringify(consentData));
    setIsVisible(false);

    // Record to backend
    try {
      const visitorId = localStorage.getItem('visitor_id') || Math.random().toString(36).substring(2, 11);
      if (!localStorage.getItem('visitor_id')) localStorage.setItem('visitor_id', visitorId);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      
      await fetch(`${API_URL}/public/pdpa/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: visitorId,
          accepted_all: acceptedAll,
          consents: consentData,
        }),
      });
    } catch (err) {
      console.error('Failed to log consent:', err);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-6 right-6 z-[9999] max-w-4xl mx-auto"
      >
        <div className="bg-background/80 backdrop-blur-xl border border-foreground/10 shadow-2xl rounded-3xl overflow-hidden p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold font-display">การจัดการความเป็นส่วนตัว (PDPA)</h3>
            </div>
            <p className="text-foreground/70 text-sm leading-relaxed">
              เราใช้คุกกี้เพื่อเพิ่มประสิทธิภาพและประสบการณ์การใช้งานที่ดีที่สุดให้กับคุณ 
              คุณสามารถเลือกตั้งค่าความยินยอมตามวัตถุประสงค์โดยกด "ตั้งค่า" หรือกด "ยอมรับทั้งหมด" เพื่อใช้งานต่อ
              <a href="/privacy" className="text-primary hover:underline ml-1 inline-flex items-center gap-1">
                <Info size={12} /> นโยบายความเป็นส่วนตัว
              </a>
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => setShowSettings(true)}
              className="px-6 py-3 rounded-2xl border border-foreground/10 hover:bg-foreground/5 transition-all text-sm font-medium flex items-center gap-2"
            >
              <Settings size={16} /> ตั้งค่า
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-8 py-3 rounded-2xl bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-bold shadow-lg shadow-foreground/10"
            >
              ยอมรับทั้งหมด
            </button>
          </div>
        </div>

        {/* Modal Settings */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-background/60 backdrop-blur-md"
            >
              <div className="bg-background border border-foreground/10 w-full max-w-lg rounded-[2rem] shadow-3xl p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold font-display">ตั้งค่าคุกกี้</h3>
                  <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-foreground/5 rounded-full">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6 mb-8">
                  {/* Essential */}
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <h4 className="font-bold flex items-center gap-2">
                        คุกกี้ที่จำเป็น <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">บังคับ</span>
                      </h4>
                      <p className="text-xs text-foreground/50">ช่วยให้เว็บไซต์ทำงานได้อย่างถูกต้อง เช่น การเข้าสู่ระบบ</p>
                    </div>
                    <div className="w-12 h-6 bg-primary/20 rounded-full flex items-center px-1">
                      <div className="w-4 h-4 bg-primary rounded-full transform translate-x-6" />
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <h4 className="font-bold">คุกกี้เพื่อการวิเคราะห์</h4>
                      <p className="text-xs text-foreground/50">ช่วยให้เราเข้าใจการใช้งานของผู้ชมเพื่อปรับปรุงระบบให้ดีขึ้น</p>
                    </div>
                    <button
                      onClick={() => setConsents(prev => ({ ...prev, analytics: !prev.analytics }))}
                      className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${consents.analytics ? 'bg-primary' : 'bg-foreground/20'}`}
                    >
                      <motion.div
                        animate={{ x: consents.analytics ? 24 : 0 }}
                        className="w-4 h-4 bg-background rounded-full"
                      />
                    </button>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <h4 className="font-bold">คุกกี้เพื่อการตลาด</h4>
                      <p className="text-xs text-foreground/50">ใช้เพื่อนำเสนอโฆษณาและสิทธิพิเศษที่ตรงใจคุณ</p>
                    </div>
                    <button
                      onClick={() => setConsents(prev => ({ ...prev, marketing: !prev.marketing }))}
                      className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${consents.marketing ? 'bg-primary' : 'bg-foreground/20'}`}
                    >
                      <motion.div
                        animate={{ x: consents.marketing ? 24 : 0 }}
                        className="w-4 h-4 bg-background rounded-full"
                      />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full py-4 rounded-2xl bg-foreground text-background font-bold hover:bg-foreground/90 transition-all"
                >
                  บันทึกการตั้งค่า
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
