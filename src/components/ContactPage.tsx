/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ContactPage.tsx
 * A luxury contact and support portal with interactive states and custom FAQ accordion.
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ChevronDown, HelpCircle, LifeBuoy } from 'lucide-react';

interface ContactPageProps {
  onBackToHome?: () => void;
}

export default function ContactPage({ onBackToHome }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('concierge');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Custom Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How are delivery services handled?',
      a: 'We operate carbon-neutral express courier networks. Packages bound for standard domestic sites are delivered within 3-5 business days. International dispatches are consolidated and shipped via premium couriers (DHL/FedEx Express).'
    },
    {
      q: 'Can I apply custom promo codes?',
      a: 'Yes, promotional coupon codes can be easily applied within the client’s shopping bag drawer before proceeding to checkout. Only one promo code can be active per order transaction.'
    },
    {
      q: 'What is your refund & returns guarantee?',
      a: 'We offer a complimentary 14-day return window. All returned goods must be in their original state, complete with secure tags and ecological wraps. Return labels can be instantly printed in the Tracking section.'
    },
    {
      q: 'How can I list my portfolio as a Creator?',
      a: 'Progressive creators and artisans can register using our Creator & Seller Hub. Simply describe your pieces, configure inventory quantities, specify materials sourcing, and upload them to the global DreamShelf directory.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    setIsSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Back Navigation */}
      <button 
        onClick={onBackToHome}
        className="group flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-slate-950 font-bold uppercase tracking-wider transition-all cursor-pointer"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
        <span>Back to Home</span>
      </button>

      {/* Editorial Header */}
      <div className="border-b border-slate-100 pb-6 text-center">
        <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest block">CLIENT CONCIERGE</span>
        <h1 className="font-sans text-3xl md:text-5xl font-extrabold text-slate-950 tracking-tight mt-1">
          Connect With DreamShelf
        </h1>
        <p className="text-slate-500 text-xs md:text-sm font-sans mt-2 max-w-xl mx-auto leading-relaxed">
          Our global concierge services are available 24/7 to answer custom product specifications, shipping milestones, and creator integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info (Left column, 4 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-50 pb-3">
              <LifeBuoy className="w-4 h-4 text-blue-600" /> Concierge Services
            </h3>

            <div className="space-y-4 text-xs font-sans text-slate-600">
              <div className="flex gap-3.5 items-start">
                <div className="p-2.5 rounded-xl bg-slate-50 text-blue-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-wider font-bold">Inquiries Email</span>
                  <a href="mailto:concierge@dreamshelf.com" className="text-slate-900 font-bold hover:text-blue-600 transition-colors">concierge@dreamshelf.com</a>
                  <p className="text-[10px] text-slate-400 mt-0.5">Average response: &lt; 2 hours</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="p-2.5 rounded-xl bg-slate-50 text-blue-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-wider font-bold">Concierge Hotline</span>
                  <span className="text-slate-900 font-bold block">+1 (800) 555-0190</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toll-free, Monday to Friday (9am - 6pm EST)</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="p-2.5 rounded-xl bg-slate-50 text-blue-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-wider font-bold">Atelier Office</span>
                  <span className="text-slate-900 font-bold block">742 Bellevue Avenue, Apt 4B</span>
                  <span className="text-slate-500 block">Seattle, WA 98102</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ Section */}
          <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-6 space-y-4">
            <h4 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" /> Service FAQs
            </h4>
            
            <div className="space-y-2.5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={idx} className="border-b border-slate-200/60 pb-2.5 last:border-0 last:pb-0">
                    <button 
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full text-left font-sans font-bold text-slate-800 text-xs flex justify-between items-center gap-2 hover:text-blue-600 transition-colors focus:outline-none"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <p className="mt-1.5 text-slate-500 text-[11px] font-sans leading-relaxed animate-fadeIn">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Message Form (Right column, 7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="font-sans font-extrabold text-slate-950 text-lg tracking-tight mb-1">
            Dispatch Concierge Transmission
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            Input your details below to speak with an assistant regarding orders, listings, or partnerships.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Your Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Aria Malik"
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Your Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="sarah@jenkins.com"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Query Classification</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50 font-sans"
              >
                <option value="concierge">Premium Concierge Services</option>
                <option value="transit">Order & Transit Support</option>
                <option value="seller">Creator Studio Partnership</option>
                <option value="custom">Other Requests</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Message Content</label>
              <textarea 
                required 
                rows={5}
                placeholder="How may our concierge assistants coordinate your portfolio experience?"
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50 resize-none leading-relaxed"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-sans text-xs font-bold rounded-xl transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" /> TRANSMIT MESSAGE TO ATELIER
            </button>
          </form>

          {isSubmitted && (
            <div className="mt-4 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 text-blue-800 text-xs animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Concierge Transmission Success!</span>
                <p className="mt-1 font-sans text-[11px] leading-relaxed text-blue-700">
                  Your communication has been processed and routed securely to our Seattle headquarters. An assistant will contact you at <strong>{email}</strong> shortly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
