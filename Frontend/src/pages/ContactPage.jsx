import React, { useState } from 'react';
import { contactService } from '../services/contactService';
import { useToast } from '../context/ToastContext';

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
    const baseClasses = "w-full px-4 py-3 rounded-2xl text-base outline-none transition-all duration-300 border bg-cream text-[#3D1A00] placeholder-[#A8998A]";

    if (errors[fieldName]) {
      return `${baseClasses} border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20`;
    }

    if (focusedField === fieldName) {
      return `${baseClasses} border-orange-400 ring-2 ring-orange-400/30 focus:border-orange-400`;
    }

    return `${baseClasses} border-orange-100 hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20`;
  };

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-orange-100 rounded-full mb-5 shadow-soft">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-sm text-[#3D1A00] font-semibold uppercase tracking-widest">Contact Us</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#3D1A00] mb-4">
            Get in <span className="text-orange-600">touch</span>
          </h1>
          <p className="text-[#7A6A5A] text-base md:text-lg max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Our team is here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-soft">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#3D1A00] mb-2">Send us a message</h2>
              <p className="text-[#7A6A5A] text-sm">Fill out the form below and we'll get back to you soon.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name and Email Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div>
                  <label className="block text-[#3D1A00] text-sm font-semibold mb-2">
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
                      <span>⚠️</span> {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-[#3D1A00] text-sm font-semibold mb-2">
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
                      <span>⚠️</span> {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Subject Field */}
              <div>
                <label className="block text-[#3D1A00] text-sm font-semibold mb-2">
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
                    <span>⚠️</span> {errors.subject}
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-[#3D1A00] text-sm font-semibold mb-2">
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
                    <span>⚠️</span> {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-6">
            {/* Contact Info Cards */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-soft">
              <h2 className="text-2xl font-bold text-[#3D1A00] mb-5">Contact information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-orange-50 transition-all duration-300">
                  <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#A8998A] text-xs uppercase tracking-widest font-semibold mb-1">Email us</p>
                    <a href="mailto:support@merogadget.com" className="text-[#3D1A00] text-sm font-medium hover:text-orange-600 transition-colors">
                      support@merogadget.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-orange-50 transition-all duration-300">
                  <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#A8998A] text-xs uppercase tracking-widest font-semibold mb-1">Call us</p>
                    <a href="tel:+9779800000000" className="text-[#3D1A00] text-sm font-medium hover:text-orange-600 transition-colors">
                      +977 9800000000
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-orange-50 transition-all duration-300">
                  <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#A8998A] text-xs uppercase tracking-widest font-semibold mb-1">Visit us</p>
                    <p className="text-[#3D1A00] text-sm font-medium">Hall Chowk, Kawasoti-7, Nawalpur, Nepal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Card */}
            <div className="bg-white rounded-3xl p-4 border border-orange-100 shadow-soft overflow-hidden">
              <div className="flex items-center gap-2 mb-3 px-2">
                <span className="text-orange-600 text-lg">📍</span>
                <h3 className="text-[#3D1A00] font-bold">Our location</h3>
              </div>
              <div className="rounded-2xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1767.2323808906417!2d84.12138538848436!3d27.64108895483565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3994503f3dc7db93%3A0x4364ac945539a147!2sHall%20Chok%2C%20Kawasoti%2033000!5e0!3m2!1sen!2snp!4v1780650078620!5m2!1sen!2snp"
                  width="100%"
                  height="280"
                  style={{ border: 0, borderRadius: '12px' }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="MeroGadget Location Map"
                  className="w-full"
                />
              </div>
              <p className="text-[#7A6A5A] text-xs text-center mt-3">
                Visit our store for in-person shopping and support
              </p>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-orange-600 text-lg">⏰</span>
                <h3 className="text-[#3D1A00] font-bold">Business hours</h3>
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
      </div>
    </div>
  );
}

export default ContactPage;