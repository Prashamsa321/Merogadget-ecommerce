import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Truck, CreditCard, Shield, Phone, Star,
  Smartphone, Laptop, Headphones, Watch, Gamepad2, Home,
  Target, Eye, Sparkles, TrendingUp, Users, Heart
} from 'lucide-react';

const AboutPage = () => {
    const [counters, setCounters] = useState({
        customers: 0,
        products: 0,
        orders: 0,
        rating: 0
    });

    const [statsInView, setStatsInView] = useState(false);
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const testimonialTimer = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const statsSection = document.getElementById('stats-section');
            if (statsSection) {
                const rect = statsSection.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0 && !statsInView) {
                    setStatsInView(true);
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [statsInView]);

    useEffect(() => {
        if (statsInView) {
            const animateCounter = (key, target) => {
                let start = 0;
                const duration = 2000;
                const increment = target / (duration / 16);

                const timer = setInterval(() => {
                    start += increment;
                    if (start >= target) {
                        setCounters(prev => ({ ...prev, [key]: target }));
                        clearInterval(timer);
                    } else {
                        setCounters(prev => ({ ...prev, [key]: Math.floor(start) }));
                    }
                }, 16);
            };

            animateCounter('customers', 15000);
            animateCounter('products', 500);
            animateCounter('orders', 25000);
            animateCounter('rating', 5);
        }
    }, [statsInView]);

    const testimonials = [
        { id: 1, name: "Ramesh Sharma", role: "Tech Enthusiast", rating: 5, text: "Best electronics store in Nepal! Genuine products and amazing customer service.", initial: "R", photo: "https://i.pravatar.cc/150?img=12" },
        { id: 2, name: "Sita Gurung", role: "Business Owner", rating: 5, text: "Quick delivery and excellent support. Highly recommended for all gadget lovers!", initial: "S", photo: "https://i.pravatar.cc/150?img=47" },
        { id: 3, name: "Bikash Thapa", role: "Student", rating: 4, text: "Got my new laptop at a great price. The EMI option made it super easy!", initial: "B", photo: "https://i.pravatar.cc/150?img=15" },
        { id: 4, name: "Anjali Rai", role: "Graphic Designer", rating: 5, text: "Ordered a MacBook for my design work. Packaging was perfect and delivery was on time.", initial: "A", photo: "https://i.pravatar.cc/150?img=45" },
        { id: 5, name: "Suman Basnet", role: "Gamer", rating: 5, text: "Bought a gaming console and accessories. Prices are better than local shops in Kathmandu.", initial: "S", photo: "https://i.pravatar.cc/150?img=33" },
        { id: 6, name: "Priya Maharjan", role: "Content Creator", rating: 5, text: "My Sony headphones arrived in 2 days. Authentic product with warranty card included.", initial: "P", photo: "https://i.pravatar.cc/150?img=32" },
        { id: 7, name: "Nabin Adhikari", role: "Software Engineer", rating: 4, text: "Solid experience overall. Customer support helped me pick the right monitor for coding.", initial: "N", photo: "https://i.pravatar.cc/150?img=52" },
        { id: 8, name: "Kritika Shrestha", role: "Fitness Coach", rating: 5, text: "Love my new smartwatch! Tracking is accurate and battery easily lasts a week.", initial: "K", photo: "https://i.pravatar.cc/150?img=49" },
        { id: 9, name: "Dipesh Lama", role: "Photographer", rating: 5, text: "Bought a DSLR lens here. Genuine stock, fair price, and the team actually knows cameras.", initial: "D", photo: "https://i.pravatar.cc/150?img=68" }
    ];

    const features = [
        { icon: ShieldCheck, title: "100% Genuine Products", desc: "Official warranty on all electronics" },
        { icon: Truck, title: "Free Express Shipping", desc: "On orders over NPR 5,000" },
        { icon: CreditCard, title: "Easy EMI Options", desc: "Flexible payment plans available" },
        { icon: Shield, title: "7-Day Replacement", desc: "Hassle-free returns & refunds" },
        { icon: Phone, title: "24/7 Customer Support", desc: "Always here to help you" },
        { icon: Star, title: "15K+ Happy Customers", desc: "Trusted by thousands" }
    ];

    const offerings = [
        { icon: Smartphone, title: "Smartphones", desc: "Latest iPhone, Samsung, OnePlus" },
        { icon: Laptop, title: "Laptops", desc: "Gaming, Business, Student laptops" },
        { icon: Headphones, title: "Audio Devices", desc: "Headphones, Speakers, Earbuds" },
        { icon: Watch, title: "Smart Watches", desc: "Fitness & Lifestyle trackers" },
        { icon: Gamepad2, title: "Gaming Gear", desc: "Consoles, Controllers, Accessories" },
        { icon: Home, title: "Smart Home", desc: "IoT devices & home automation" }
    ];

    const teamMembers = [
        { name: "Prashamsa Lamsal", role: "Founder & CEO", initial: "P", photo: "/prashamsa.jpg", bio: "Leading the vision of MeroGadget to transform the way people discover, explore, and shop for technology through quality products, convenience, and trust." },
        { name: "Aarav Shrestha", role: "Chief Technology Officer", initial: "A", photo: "https://i.pravatar.cc/300?img=12", bio: "Driving digital innovation by building a fast, secure, and seamless shopping platform that connects customers with the latest technology." },
        { name: "Riya Karki", role: "Head of Operations", initial: "R", photo: "https://i.pravatar.cc/300?img=45", bio: "Overseeing every step of the customer journey, from order processing to delivery, with a commitment to reliability, efficiency, and exceptional service." }
    ];

    useEffect(() => {
        if (isPaused) return;
        testimonialTimer.current = setInterval(() => {
            setTestimonialIndex(prev => (prev + 1) % testimonials.length);
        }, 3500);
        return () => clearInterval(testimonialTimer.current);
    }, [isPaused, testimonials.length]);

    const visibleTestimonials = [
        testimonials[testimonialIndex % testimonials.length],
        testimonials[(testimonialIndex + 1) % testimonials.length],
        testimonials[(testimonialIndex + 2) % testimonials.length]
    ];

    return (
        <div className="overflow-x-hidden bg-cream">

            <section className="relative pt-8 pb-16 md:pt-12 md:pb-24 bg-gradient-to-br from-[#FFF4E6] via-cream to-[#FFE8D6] overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16 relative">
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-orange-200 mb-6 shadow-sm">
                                <Sparkles className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
                                <span className="text-xs font-bold uppercase tracking-widest text-orange-700">About MeroGadget</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-bold text-[#3D1A00] mb-4 leading-[1.1]">
                                Technology Made Accessible.{' '}
                                <span className="relative inline-block">
                                    <span className="relative z-10 text-orange-600">Trust Made Essential.</span>
                                    <span className="absolute bottom-1 left-0 right-0 h-3 bg-orange-200/60 -z-0 rounded"></span>
                                </span>
                            </h2>

                            <div className="space-y-4 text-[#5C4B3A] leading-relaxed text-[15px] md:text-base">
                                <p>
                                At MeroGadget, we believe technology should make life simpler, smarter, 
                                and more convenient. Founded in 2020, our mission is to make genuine, 
                                high-quality electronics accessible to everyone across Nepal at competitive prices.
                                </p>
                                <p>
                                We offer a wide range of gadgets and electronics to meet your everyday needs,
                                 combining quality products, reliable service, and a seamless shopping experience. 
                                 Our commitment goes beyond selling products—we aim to build lasting relationships through trust,
                                  transparency, and dependable customer support.
                                </p>
                                <p>
                                At MeroGadget, your satisfaction inspires us to deliver better technology and better experiences every day.
                                </p>
                                
                            </div>

                            <div className="mt-6 mb-8 inline-block bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/20">
                                <p className="text-sm md:text-base font-bold tracking-wide">
                                    MeroGadget — Technology You Trust. Quality You Deserve.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-lg">
                                <div className="bg-white/90 backdrop-blur rounded-2xl p-4 border border-orange-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="w-4 h-4 text-orange-500" strokeWidth={2.5} />
                                        <div className="text-2xl md:text-3xl font-bold text-[#3D1A00]">2020</div>
                                    </div>
                                    <div className="text-xs md:text-sm text-[#7A6A5A] font-medium">Founded</div>
                                </div>
                                <div className="bg-white/90 backdrop-blur rounded-2xl p-4 border border-orange-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users className="w-4 h-4 text-orange-500" strokeWidth={2.5} />
                                        <div className="text-2xl md:text-3xl font-bold text-[#3D1A00]">15K+</div>
                                    </div>
                                    <div className="text-xs md:text-sm text-[#7A6A5A] font-medium">Customers</div>
                                </div>
                                <div className="bg-white/90 backdrop-blur rounded-2xl p-4 border border-orange-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp className="w-4 h-4 text-orange-500" strokeWidth={2.5} />
                                        <div className="text-2xl md:text-3xl font-bold text-[#3D1A00]">500+</div>
                                    </div>
                                    <div className="text-xs md:text-sm text-[#7A6A5A] font-medium">Products</div>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <div className="relative">
                                <div className="absolute -top-4 -left-4 w-24 h-24 bg-orange-200 rounded-3xl -z-0 opacity-60"></div>
                                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-300 rounded-full -z-0 opacity-40"></div>

                                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-orange-500/20 border-4 border-white bg-white">
                                    <img
                                        src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
                                        alt="MeroGadget Store"
                                        className="w-full h-[320px] md:h-[420px] lg:h-[480px] object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#3D1A00]/40 via-transparent to-transparent"></div>

                                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-lg">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0">
                                            <Star className="w-5 h-5 text-white fill-white" strokeWidth={2} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-[#3D1A00]">Trusted by 15,000+ Peoples</div>
                                            <div className="text-xs text-[#7A6A5A]">Rated 4.9/5 across the country</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 md:py-24 bg-cream">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
                    <div className="text-center mb-12">
                        <p className="eyebrow mb-3">Our Purpose</p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3D1A00] mb-4">
                            Mission & Vision
                        </h2>
                        <p className="text-[#7A6A5A] max-w-2xl mx-auto">
                            Guiding our journey to transform tech shopping in Nepal
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        <div className="bg-white rounded-3xl p-8 shadow-soft hover:shadow-hover transition-all duration-300 hover:-translate-y-1 border border-orange-100">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                                <Target className="w-6 h-6 text-orange-600" strokeWidth={2} />
                            </div>
                            <h3 className="text-2xl font-bold text-[#3D1A00] mb-3">Our Mission</h3>
                            <p className="text-[#7A6A5A] leading-relaxed">
                                To empower Nepali consumers with authentic, high-quality technology products
                                at affordable prices while delivering an unmatched shopping experience.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-soft hover:shadow-hover transition-all duration-300 hover:-translate-y-1 border border-orange-100">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                                <Eye className="w-6 h-6 text-orange-600" strokeWidth={2} />
                            </div>
                            <h3 className="text-2xl font-bold text-[#3D1A00] mb-3">Our Vision</h3>
                            <p className="text-[#7A6A5A] leading-relaxed">
                                To become Nepal's most trusted and preferred electronics destination,
                                bridging the gap between global technology and local accessibility.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="py-16 md:py-24 bg-[#FFF4E6]">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
                    <div className="text-center mb-12">
                        <p className="eyebrow mb-3">Our Offerings</p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3D1A00] mb-4">
                            What we offer
                        </h2>
                        <p className="text-[#7A6A5A] max-w-2xl mx-auto">
                            Discover our wide range of premium products and services
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {offerings.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl p-6 hover:shadow-hover transition-all duration-300 hover:-translate-y-1 border border-orange-100"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-orange-600" strokeWidth={2} />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#3D1A00] mb-2">{item.title}</h3>
                                    <p className="text-[#7A6A5A] text-sm">{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 md:py-24 bg-cream">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
                    <div className="text-center mb-12">
                        <p className="eyebrow mb-3">Why Choose Us</p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3D1A00] mb-4">
                            Why MeroGadget?
                        </h2>
                        <p className="text-[#7A6A5A] max-w-2xl mx-auto">
                            Experience the difference with our premium services
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-orange-100 hover:border-orange-300 hover:shadow-card transition-all duration-300"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                                        <Icon className="w-6 h-6 text-orange-600" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="text-[#3D1A00] font-bold mb-1">{feature.title}</h3>
                                        <p className="text-[#7A6A5A] text-sm">{feature.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Statistics */}
            <section id="stats-section" className="py-16 md:py-20 bg-gradient-to-r from-orange-600 to-orange-500">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-3xl md:text-5xl font-bold text-white mb-2">{counters.customers.toLocaleString()}+</div>
                            <div className="text-white/85 text-sm font-medium">Happy Customers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-5xl font-bold text-white mb-2">{counters.products}+</div>
                            <div className="text-white/85 text-sm font-medium">Products</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-5xl font-bold text-white mb-2">{counters.orders.toLocaleString()}+</div>
                            <div className="text-white/85 text-sm font-medium">Orders Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-5xl font-bold text-white mb-2 flex items-center justify-center gap-1">
                                {counters.rating}
                                <Star className="w-6 h-6 md:w-8 md:h-8 fill-yellow-300 text-yellow-300" />
                            </div>
                            <div className="text-white/85 text-sm font-medium">Customer Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-16 md:py-24 bg-[#FFF4E6]">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
                    <div className="text-center mb-12">
                        <p className="eyebrow mb-3">Our Team</p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3D1A00] mb-4">
                            Meet the experts
                        </h2>
                        <p className="text-[#7A6A5A] max-w-2xl mx-auto">
                            Passionate individuals dedicated to serving you better
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="bg-white rounded-3xl p-8 text-center border border-orange-100 hover:border-orange-300 hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
                                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-orange-100 shadow-lg shadow-orange-500/20 mb-5 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                                    {member.photo ? (
                                        <img
                                            src={member.photo}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = `<span class="text-white text-2xl font-bold">${member.initial}</span>`;
                                            }}
                                        />
                                    ) : (
                                        <span className="text-white text-2xl font-bold">{member.initial}</span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-[#3D1A00] mb-1">{member.name}</h3>
                                <p className="text-orange-600 text-sm font-semibold mb-3">{member.role}</p>
                                <p className="text-[#7A6A5A] text-sm leading-relaxed">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 md:py-24 bg-cream">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
                    <div className="text-center mb-12">
                        <p className="eyebrow mb-3">Testimonials</p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3D1A00] mb-4">
                            What our customers say
                        </h2>
                        <p className="text-[#7A6A5A] max-w-2xl mx-auto">
                            Trusted by thousands of happy customers across Nepal
                        </p>
                    </div>

                    <div
                        className="relative overflow-hidden"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        onTouchStart={() => setIsPaused(true)}
                        onTouchEnd={() => setIsPaused(false)}
                    >
                        <div className="grid md:grid-cols-3 gap-6">
                            {visibleTestimonials.map((testimonial, idx) => (
                                <div
                                    key={`${testimonial.id}-${idx}`}
                                    className="bg-white rounded-3xl p-6 shadow-soft hover:shadow-hover transition-all duration-500 border border-orange-100"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-100 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0">
                                            {testimonial.photo ? (
                                                <img
                                                    src={testimonial.photo}
                                                    alt={testimonial.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = `<span class="text-white font-bold">${testimonial.initial}</span>`;
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-white font-bold">{testimonial.initial}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-[#3D1A00] font-bold">{testimonial.name}</h4>
                                            <p className="text-[#7A6A5A] text-xs">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex mb-3 gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${
                                                    i < testimonial.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'fill-gray-200 text-gray-200'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[#5C4B3A] text-sm leading-relaxed italic">"{testimonial.text}"</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center gap-2 mt-8">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setTestimonialIndex(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    i === testimonialIndex
                                        ? 'w-8 bg-orange-600'
                                        : 'w-2 bg-orange-200 hover:bg-orange-300'
                                }`}
                                aria-label={`Go to testimonial ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Commitment */}
            <section className="py-16 md:py-20 bg-gradient-to-br from-[#FFF4E6] via-cream to-[#FFE8D6]">
                <div className="container mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-10 xl:px-16">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
                        <Heart className="w-8 h-8 text-white fill-white" strokeWidth={2} />
                    </div>
                    <p className="eyebrow mb-3">Our Commitment</p>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3D1A00] mb-6">
                        Growing alongside Nepal's digital lifestyle
                    </h2>
                    <p className="text-[#5C4B3A] leading-relaxed text-base md:text-lg max-w-3xl mx-auto">
                        At MeroGadget, we are committed to growing alongside Nepal's evolving digital lifestyle.
                        We continuously strive to improve our products, services, and shopping experience while
                        building a brand our customers can depend on.
                    </p>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16 md:py-24 bg-[#3D1A00]">
                <div className="container mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-10 xl:px-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Ready to upgrade your tech?
                    </h2>
                    <p className="text-[#D4C4B0] text-base md:text-lg mb-8 max-w-2xl mx-auto">
                        Explore our collection of premium gadgets and electronics at unbeatable prices.
                    </p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105"
                    >
                        Shop Now
                        <span>→</span>
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default AboutPage;