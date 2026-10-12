import React, { useState } from 'react';
import { contactService } from '../services/contactService';
import { useToast } from '../context/ToastContext';
import {
  Mail, Phone, MapPin, Clock, Send, AlertCircle, Loader2, MessageSquare
} from 'lucide-react';

function ContactPage() {
  const { success, error: toastError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await contactService.submitContact(formData);
      success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClasses = "w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all duration-300 border bg-cream text-[#3D1A00] placeholder-[#A8998A]";

    if (errors[fieldName]) {
      return `${baseClasses} border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20`;
    }

    if (focusedField === fieldName) {
      return `${baseClasses} border-orange-400 ring-2 ring-orange-400/30`;
    }

    return `${baseClasses} border-orange-100 hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20`;
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email us',
      value: 'prashamsalamsal2061@gmail.com',
      href: 'mailto:prashamsalamsal2061@gmail.com'
    },
    {
      icon: Phone,
      label: 'Call us',
      value: '+977 9846611018',
      href: 'tel:+9779846611018'
    },
    {
      icon: MapPin,
      label: 'Visit us',
      value: 'Hall Chowk, Kawasoti-7, Nawalpur, Nepal',
      href: null
    }
  ];

  return (
    <div className="min-h-screen bg-cream py-10 md:py-14 px-4 sm:px-6 lg:px-10 xl:px-16">
      <div className="w-full max-w-6xl mx-auto">

        {/* ═══ Header ═══ */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-orange-100 rounded-full mb-5 shadow-soft">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-xs text-[#3D1A00] font-bold uppercase tracking-widest">Contact Us</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#3D1A00] mb-4 leading-tight">
            Get in <span className="text-orange-600">touch</span>
          </h1>
          <p className="text-[#7A6A5A] text-sm md:text-base max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Our team is here to help.
          </p>
        </div>

        {/* ═══ Two-column ═══ */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* ═══ Contact Form (3/5 width) ═══ */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-orange-600" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-[#3D1A00]">Send us a message</h2>
                <p className="text-[#7A6A5A] text-xs">Fill out the form and we'll get back to you</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#A8998A] uppercase tracking-widest mb-2">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="John Doe"
                    className={getInputClassName('name')}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" strokeWidth={2.5} />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A8998A] uppercase tracking-widest mb-2">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="john@example.com"
                    className={getInputClassName('email')}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" strokeWidth={2.5} />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A8998A] uppercase tracking-widest mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('subject')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="What's this about?"
                  className={getInputClassName('subject')}
                />
                {errors.subject && (
                  <p className="mt-1.5 text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" strokeWidth={2.5} />
                    {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A8998A] uppercase tracking-widest mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Your message here... (minimum 10 characters)"
                  rows="5"
                  className={`${getInputClassName('message')} resize-none`}
                />
                {errors.message && (
                  <p className="mt-1.5 text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" strokeWidth={2.5} />
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-full transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" strokeWidth={2.2} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ═══ Right Column: Info + Hours (2/5 width) ═══ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Contact Info */}
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-orange-100 shadow-soft">
              <h2 className="text-lg font-bold text-[#3D1A00] mb-5">Contact information</h2>

              <div className="space-y-2">
                {contactInfo.map((item, i) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-orange-50 transition-all duration-300">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-orange-600" strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[#A8998A] text-[10px] uppercase tracking-widest font-bold mb-1">
                          {item.label}
                        </p>
                        <p className="text-[#3D1A00] text-sm font-medium break-words">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );

                  return item.href ? (
                    <a key={i} href={item.href} className="block">
                      {content}
                    </a>
                  ) : (
                    <div key={i}>{content}</div>
                  );
                })}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-soft">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-orange-600" strokeWidth={2.2} />
                </div>
                <h3 className="text-[#3D1A00] font-bold text-base">Business hours</h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2.5 border-b border-orange-100">
                  <span className="text-[#7A6A5A]">Monday – Friday</span>
                  <span className="text-[#3D1A00] font-semibold">10:00 AM – 7:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-orange-100">
                  <span className="text-[#7A6A5A]">Saturday</span>
                  <span className="text-[#3D1A00] font-semibold">11:00 AM – 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[#7A6A5A]">Sunday</span>
                  <span className="text-red-500 font-semibold">Closed</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ═══ Map ═══ */}
        <div className="mt-6 bg-white rounded-3xl p-4 sm:p-5 border border-orange-100 shadow-soft overflow-hidden">
          <div className="flex items-center gap-2.5 mb-4 px-1">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-orange-600" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-[#3D1A00] font-bold text-base">Our location</h3>
              <p className="text-[#7A6A5A] text-xs">Come visit us in person</p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-orange-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1767.2323808906417!2d84.12138538848436!3d27.64108895483565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3994503f3dc7db93%3A0x4364ac945539a147!2sHall%20Chok%2C%20Kawasoti%2033000!5e0!3m2!1sen!2snp!4v1780650078620!5m2!1sen!2snp"
              width="100%"
              height="360"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="MeroGadget Location Map"
              className="w-full rounded-2xl block"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default ContactPage;