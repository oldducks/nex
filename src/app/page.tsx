"use client";

import React, { useState } from 'react';
import { Download, BookOpen, Youtube, Send, Code, Briefcase, Award, CheckCircle, ChevronRight, Sparkles, ExternalLink, Phone, Mail, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function LandingPage() {
  const [formData, setFormData] = useState({ name: '', email: '', comment: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', comment: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  } as const;

  const item = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  } as const;

  return (
    <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-white overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-30" />
      <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] opacity-30" />

      {/* Hero Section */}
      <section className="relative mb-32">
        <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative flex-shrink-0"
          >
            <div className="w-64 h-64 md:w-80 md:h-80 relative overflow-hidden rounded-[40px] border-2 border-glass-border float">
              <Image
                src="/profile.png"
                alt="กฤษติพัฒน์ ณัฐวิทย์มงคล"
                fill
                className="object-cover object-top hover:scale-110 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>
            {/* Visual Accents */}
            <div className="absolute -top-8 -right-8 w-28 h-28 flex items-center justify-center z-10">
              <Image
                src="/logo.png"
                alt="DPAT AI Consulting"
                width={100}
                height={100}
                className="object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
          </motion.div>

          <div className="flex-grow">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4 flex items-center gap-2 justify-center md:justify-start">
                <span className="w-8 h-[1px] bg-primary/50" />
                AI Strategy & Systems Architect
              </h2>
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-none">
                <span className="gradient-text uppercase">กฤษติพัฒน์</span><br />
                <span className="text-gray-500">ณัฐวิทย์มงคล</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-xl mx-auto md:mx-0 leading-relaxed font-light mb-8 italic">
                "มุ่งเน้นการวางกลยุทธ์และออกแบบระบบ AI ให้ใช้งานได้จริงในองค์กร"
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium">
                  <Award size={18} className="text-primary" />
                  <span>เกียรตินิยมอันดับ 1 (KMITL)</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium">
                  <CheckCircle size={18} className="text-secondary" />
                  <span>Ex-Project Engineer @ PTTEP</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About & Skills Grid */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid md:grid-cols-2 gap-8 mb-32"
      >
        <motion.div variants={item} className="glass-card glow-hover p-10 group transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors" />
          <Briefcase className="text-primary mb-6 group-hover:scale-110 transition-transform duration-500" size={40} />
          <h3 className="text-3xl font-black mb-6">Who I Am</h3>
          <p className="text-gray-400 leading-relaxed text-lg">
            จากวิศวกรรมเมคคาทรอนิกส์ สู่สายงานกลยุทธ์ AI และ Automation
            ด้วยประสบการณ์จากยักษ์ใหญ่พลังงานอย่าง <span className="text-white font-semibold">PTTEP</span>
            ผมนำความแม่นยำทางวิศวกรรมมาผสมผสานกับเทคโนโลยีสมัยใหม่ เพื่อสร้างความได้เปรียบทางธุรกิจ
          </p>
        </motion.div>

        <motion.div variants={item} className="glass-card glow-hover p-10 group transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-8 -mt-8 group-hover:bg-secondary/10 transition-colors" />
          <Code className="text-secondary mb-6 group-hover:scale-110 transition-transform duration-500" size={40} />
          <h3 className="text-3xl font-black mb-6">What I Can Do</h3>
          <p className="text-gray-400 leading-relaxed text-lg mb-8">
            เราช่วยองค์กรออกแบบการใช้ AI ให้ ‘ตรงกับงานจริง’ พร้อมวาง Workflow อัตโนมัติ เพื่อสร้างประสิทธิภาพสูงสุด
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {["AI Consulting", "Enterprise Training", "Business Automation", "AI Video Production"].map((s) => (
              <div key={s} className="flex items-center gap-2 text-gray-400 border-l border-white/10 pl-3">
                <ChevronRight size={14} className="text-secondary" /> {s}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Action Hub */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mb-32"
      >
        <h2 className="text-center text-gray-500 font-bold uppercase tracking-[0.3em] text-xs mb-12">Action Hub</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.a
            variants={item}
            href="/digital-card.vcf"
            download
            className="glass-card p-8 flex flex-col items-center gap-6 hover:bg-white/5 transition-all group overflow-hidden relative"
          >
            <div className="bg-primary/20 p-5 rounded-[24px] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ring-1 ring-primary/30">
              <Download size={32} className="text-primary" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-xl mb-1">Digital Card</h4>
              <p className="text-xs text-gray-500">บันทึกที่อยู่ติดต่อลงโทรศัพท์</p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink size={14} className="text-gray-600" />
            </div>
          </motion.a>

          <motion.a
            variants={item}
            href="#"
            className="glass-card p-8 flex flex-col items-center gap-6 hover:bg-white/5 transition-all group overflow-hidden relative"
          >
            <div className="bg-secondary/20 p-5 rounded-[24px] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ring-1 ring-secondary/30">
              <BookOpen size={32} className="text-secondary" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-xl mb-1">Catalog</h4>
              <p className="text-xs text-gray-500">ดูแคตตาล็อกบริการทั้งหมด</p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink size={14} className="text-gray-600" />
            </div>
          </motion.a>

          <motion.a
            variants={item}
            href="https://youtube.com/@dpataiconsulting?si=escQF9DSMB1V7kBd"
            target="_blank"
            className="glass-card p-8 flex flex-col items-center gap-6 hover:bg-white/5 transition-all group overflow-hidden relative"
          >
            <div className="bg-accent/20 p-5 rounded-[24px] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ring-1 ring-accent/30">
              <Youtube size={32} className="text-accent" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-xl mb-1">YouTube</h4>
              <p className="text-xs text-gray-500">ติดตามเนื้อหา AI ล่าสุด</p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink size={14} className="text-gray-600" />
            </div>
          </motion.a>
        </div>
      </motion.div>

      {/* Direct Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <a href="tel:062-646-6285" className="glass-card p-6 flex items-center gap-4 hover:bg-white/5 transition-all group">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Phone size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Phone</p>
            <p className="font-medium">062-646-6285</p>
          </div>
        </a>
        <a href="mailto:ai.dpattown.ai@gmail.com" className="glass-card p-6 flex items-center gap-4 hover:bg-white/5 transition-all group">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Mail size={20} className="text-secondary" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Email</p>
            <p className="font-medium truncate text-sm md:text-base">ai.dpattown.ai@gmail.com</p>
          </div>
        </a>
        <a href="https://ai.dpattown.com" target="_blank" className="glass-card p-6 flex items-center gap-4 hover:bg-white/5 transition-all group">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Globe size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Website</p>
            <p className="font-medium">ai.dpattown.com</p>
          </div>
        </a>
      </motion.div>

      {/* Contact Form */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">ร่วมงานกับเรา</h2>
            <p className="text-gray-400 text-lg">หากคุณต้องการยกระดับองค์กรด้วย AI ฝากข้อความไว้ได้เลยครับ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">ชื่อ</label>
                <input
                  required
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all placeholder:text-gray-700"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">อีเมล</label>
                <input
                  required
                  type="email"
                  placeholder="Your Email"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all placeholder:text-gray-700"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">ข้อความ</label>
              <textarea
                required
                rows={5}
                placeholder="เราจะช่วยองค์กรของคุณได้อย่างไรบ้าง?"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all resize-none placeholder:text-gray-700"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              ></textarea>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all border border-white/10"
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    ส่งข้อมูลเรียบร้อยแล้ว! <Sparkles size={20} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    เริ่มปรึกษาโปรเจกต์ <Send size={20} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </div>
      </motion.section>


      <footer className="mt-32 pb-8 text-center border-t border-white/5 pt-8">
        <p className="text-gray-600 text-sm font-medium tracking-wide">
          © {new Date().getFullYear()} MIND KRITTIPAT. ARCHITECTING THE FUTURE WITH AI.
        </p>
      </footer>
    </main >
  );
}
