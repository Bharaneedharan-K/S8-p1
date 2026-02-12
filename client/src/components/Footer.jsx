import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebook, FaInstagram, FaLeaf, FaArrowRight } from 'react-icons/fa';

export const Footer = () => {
    return (
        <footer className="bg-[#0B3D91] text-white pt-16 pb-8 border-t border-[#1E40AF]/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center">
                                {/* Custom Logo: Simple White Leaf */}
                                <FaLeaf className="w-8 h-8 text-white transition-opacity hover:opacity-90" />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tight">WELFORA</span>
                        </div>
                        <p className="text-[#D1E9FF] text-sm leading-relaxed max-w-xs">
                            Empowering Indian agriculture with blockchain transparency and efficient welfare distribution.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <SocialIcon icon={<FaTwitter />} />
                            <SocialIcon icon={<FaFacebook />} />
                            <SocialIcon icon={<FaInstagram />} />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><FooterLink to="/login">Farmer Login</FooterLink></li>
                            <li><FooterLink to="/register">New Registration</FooterLink></li>
                            <li><FooterLink to="/verify-land">Public Verification</FooterLink></li>
                            <li><FooterLink to="/schemes">Government Schemes</FooterLink></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Resources</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-[#D1E9FF] hover:text-white transition-colors text-sm font-medium">Help Center</a></li>
                            <li><a href="#" className="text-[#D1E9FF] hover:text-white transition-colors text-sm font-medium">Privacy Policy</a></li>
                            <li><a href="#" className="text-[#D1E9FF] hover:text-white transition-colors text-sm font-medium">Terms of Service</a></li>
                            <li><a href="#" className="text-[#D1E9FF] hover:text-white transition-colors text-sm font-medium">Contact Support</a></li>
                        </ul>
                    </div>

                    {/* Newsletter or Contact */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Stay Updated</h4>
                        <p className="text-[#D1E9FF] text-xs mb-4">Subscribe for latest scheme updates.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-[#D1E9FF]/50 focus:outline-none focus:border-white/40"
                            />
                            <button className="px-4 py-2 bg-white text-[#0B3D91] font-bold rounded-lg hover:bg-[#F4F6F9] transition-colors flex items-center justify-center">
                                <FaArrowRight />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[#D1E9FF] text-xs font-semibold">
                        © 2026 WELFORA (Government of India). All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-[#D1E9FF] text-xs font-bold uppercase tracking-wider">Secured by Blockchain</span>
                        <div className="h-4 w-px bg-white/10"></div>
                        <span className="text-[#D1E9FF] text-xs font-bold uppercase tracking-wider">Powered by Ethereum</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ to, children }) => (
    <Link to={to} className="text-[#D1E9FF] hover:text-white transition-colors text-sm font-medium flex items-center gap-2 group">
        <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
        {children}
    </Link>
);

const SocialIcon = ({ icon }) => (
    <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm hover:bg-white hover:text-[#0B3D91] transition-colors border border-white/10">
        {icon}
    </a>
);
