import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
    const [counters, setCounters] = useState({
        customers: 0,
        products: 0,
        orders: 0,
        rating: 0
    });

    const [statsInView, setStatsInView] = useState(false);

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
        {
            id: 1,
            name: "Ramesh Sharma",
            role: "Tech Enthusiast",
            rating: 5,
            text: "Best electronics store in Nepal! Genuine products and amazing customer service.",
            initial: "R"
        },
        {
            id: 2,
            name: "Sita Gurung",
            role: "Business Owner",
            rating: 5,
            text: "Quick delivery and excellent support. Highly recommended for all gadget lovers!",
            initial: "S"
        },
        {
            id: 3,
            name: "Bikash Thapa",
            role: "Student",
            rating: 4,
            text: "Got my new laptop at a great price. The EMI option made it super easy!",
            initial: "B"
        }
    ];

    const features = [
        { icon: "🔒", title: "100% Genuine Products", desc: "Official warranty on all electronics" },
        { icon: "🚚", title: "Free Express Shipping", desc: "On orders over NPR 5,000" },
        { icon: "💳", title: "Easy EMI Options", desc: "Flexible payment plans available" },
        { icon: "🛡️", title: "7-Day Replacement", desc: "Hassle-free returns & refunds" },
        { icon: "📞", title: "24/7 Customer Support", desc: "Always here to help you" },
        { icon: "⭐", title: "15K+ Happy Customers", desc: "Trusted by thousands" }
    ];

    const offerings = [
        { icon: "📱", title: "Smartphones", desc: "Latest iPhone, Samsung, OnePlus" },
        { icon: "💻", title: "Laptops", desc: "Gaming, Business, Student laptops" },
        { icon: "🎧", title: "Audio Devices", desc: "Headphones, Speakers, Earbuds" },
        { icon: "⌚", title: "Smart Watches", desc: "Fitness & Lifestyle trackers" },
        { icon: "🎮", title: "Gaming Gear", desc: "Consoles, Controllers, Accessories" },
        { icon: "🏠", title: "Smart Home", desc: "IoT devices & home automation" }
    ];

    const teamMembers = [
        { name: "Prashamsa Lamsal", role: "Founder & CEO", initial: "P", bio: "Tech visionary with 10+ years in eCommerce" },
        { name: "Aarav Shrestha", role: "CTO", initial: "A", bio: "Leading tech innovation and product development" },
        { name: "Riya Karki", role: "Head of Operations", initial: "R", bio: "Ensuring smooth delivery and customer satisfaction" }
    ];

    return (
        <div className="overflow-x-hidden bg-cream">

            {/* Company Story Section */}
            <section className="py-16 md:py-24 bg-[#FFF4E6]">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1">
                            <p className="eyebrow mb-4">Our Story</p>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3D1A00] mb-6 leading-tight">
                                From a dream to Nepal's<br />
                                <span className="text-orange-600">leading tech store</span>
                            </h2>
                            <p className="text-[#7A6A5A] mb-4 leading-relaxed">
                                MeroGadget started in 2020 with a simple vision: to make premium technology
                                accessible to every Nepali. We saw a gap in the market where quality electronics
                                were either too expensive or came with questionable authenticity.
                            </p>
                            <p className="text-[#7A6A5A] mb-8 leading-relaxed">
                                Today, we've grown into Nepal's most trusted electronics retailer, serving
                                over 15,000+ happy customers with genuine products, competitive prices,
                                and exceptional after-sales support.
                            </p>
                            <div className="flex items-center gap-6">
                                <div>
                                    <div className="text-3xl font-bold text-[#3D1A00]">2020</div>
                                    <div className="text-sm text-[#7A6A5A]">Founded</div>
                                </div>
                                <div className="w-px h-10 bg-orange-200"></div>
                                <div>
                                    <div className="text-3xl font-bold text-[#3D1A00]">15K+</div>
                                    <div className="text-sm text-[#7A6A5A]">Customers</div>
                                </div>
                                <div className="w-px h-10 bg-orange-200"></div>
                                <div>
                                    <div className="text-3xl font-bold text-[#3D1A00]">500+</div>
                                    <div className="text-sm text-[#7A6A5A]">Products</div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="relative rounded-3xl overflow-hidden shadow-hover border border-orange-100 bg-white p-4">
                                <img
                                    src="/home appliance.png"
                                    alt="MeroGadget Store"
                                    className="w-full h-auto rounded-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 md:py-24 bg-cream">
                <div className="container mx-auto max-w-7xl">
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
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-2xl font-bold text-[#3D1A00] mb-3">Our Mission</h3>
                            <p className="text-[#7A6A5A] leading-relaxed">
                                To empower Nepali consumers with authentic, high-quality technology products
                                at affordable prices while delivering an unmatched shopping experience.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-soft hover:shadow-hover transition-all duration-300 hover:-translate-y-1 border border-orange-100">
                            <div className="text-4xl mb-4">👁️</div>
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
                <div className="container mx-auto max-w-7xl">
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
                        {offerings.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-6 hover:shadow-hover transition-all duration-300 hover:-translate-y-1 border border-orange-100"
                            >
                                <div className="text-3xl mb-4">{item.icon}</div>
                                <h3 className="text-lg font-bold text-[#3D1A00] mb-2">{item.title}</h3>
                                <p className="text-[#7A6A5A] text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 md:py-24 bg-cream">
                <div className="container mx-auto max-w-7xl">
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
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-orange-100 hover:border-orange-300 hover:shadow-card transition-all duration-300"
                            >
                                <div className="text-3xl">{feature.icon}</div>
                                <div>
                                    <h3 className="text-[#3D1A00] font-bold mb-1">{feature.title}</h3>
                                    <p className="text-[#7A6A5A] text-sm">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Statistics */}
            <section id="stats-section" className="py-16 md:py-20 bg-gradient-to-r from-orange-600 to-orange-500">
                <div className="container mx-auto max-w-7xl">
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
                            <div className="text-3xl md:text-5xl font-bold text-white mb-2">{counters.rating}⭐</div>
                            <div className="text-white/85 text-sm font-medium">Customer Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-16 md:py-24 bg-[#FFF4E6]">
                <div className="container mx-auto max-w-7xl">
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
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-5 shadow-lg shadow-orange-500/30">
                                    {member.initial}
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
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-12">
                        <p className="eyebrow mb-3">Testimonials</p>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3D1A00] mb-4">
                            What our customers say
                        </h2>
                        <p className="text-[#7A6A5A] max-w-2xl mx-auto">
                            Trusted by thousands of happy customers across Nepal
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="bg-white rounded-3xl p-6 shadow-soft hover:shadow-hover transition-all duration-300 border border-orange-100"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {testimonial.initial}
                                    </div>
                                    <div>
                                        <h4 className="text-[#3D1A00] font-bold">{testimonial.name}</h4>
                                        <p className="text-[#7A6A5A] text-xs">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="flex mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`text-base ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                                    ))}
                                </div>
                                <p className="text-[#5C4B3A] text-sm leading-relaxed italic">"{testimonial.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16 md:py-24 bg-[#3D1A00]">
                <div className="container mx-auto max-w-4xl text-center">
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