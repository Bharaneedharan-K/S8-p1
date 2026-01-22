import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Desktop Nav Link Component
  const NavLink = ({ to, children, mobile = false }) => {
    const active = isActive(to);

    if (mobile) {
      return (
        <Link
          to={to}
          className={`block px-4 py-3 rounded-xl text-base font-bold transition-all ${active
            ? 'bg-[#AEB877] text-white'
            : 'text-[#4A5532] hover:bg-[#FFFBB1] hover:text-[#2C3318]'
            }`}
        >
          {children}
        </Link>
      );
    }

    return (
      <Link
        to={to}
        className={`relative px-4 py-2 text-sm font-bold rounded-lg transition-all ${active ? 'text-white' : 'text-[#D8E983] hover:text-white hover:bg-white/10'
          }`}
      >
        {children}
        {active && (
          <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#FFFBB1] rounded-full"></span>
        )}
      </Link>
    );
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${scrolled || mobileMenuOpen
          ? 'bg-[#2C3318] shadow-lg border-b border-[#AEB877]/20 py-2'
          : 'bg-[#2C3318] py-3'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 sm:h-auto items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-[#AEB877] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-black/20 group-hover:scale-105 transition-transform text-white border border-white/10">
                  🌾
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold text-white tracking-tight leading-none group-hover:text-[#AEB877] transition-colors">
                    Farmer Portal
                  </span>
                  <span className="text-[10px] font-bold text-[#A5C89E] uppercase tracking-widest">
                    Government of India
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex md:items-center md:space-x-2">
              {!isAuthenticated ? (
                <>
                  <NavLink to="/login">Login</NavLink>
                  <Link
                    to="/register"
                    className="ml-4 bg-[#AEB877] hover:bg-[#8B9850] text-[#2C3318] font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-black/10 transition-all active:scale-95"
                  >
                    Register Farmer
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex bg-[#1e2411] rounded-xl px-1 py-1 mr-4 border border-white/5">
                    {user?.role === 'FARMER' && (
                      <>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                        {user?.status === 'FARMER_PENDING_VERIFICATION' && (
                          <NavLink to="/farmer/verify">Verify ID</NavLink>
                        )}
                        <NavLink to="/farmer/lands">My Land</NavLink>
                        <NavLink to="/farmer/schemes">Schemes</NavLink>
                        <NavLink to="/farmer/applications">My Applications</NavLink>
                        <NavLink to="/farmer/profile">Profile</NavLink>
                      </>
                    )}

                    {user?.role === 'OFFICER' && (
                      <>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                        <NavLink to="/officer/farmers">Verifications</NavLink>
                        <NavLink to="/officer/lands">Land Records</NavLink>
                      </>
                    )}

                    {user?.role === 'ADMIN' && (
                      <>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                        <NavLink to="/admin/farmers">Farmers</NavLink>
                        <NavLink to="/admin/officers">Officers</NavLink>
                        <NavLink to="/admin/verify-land">Verify Land</NavLink>
                        <NavLink to="/admin/schemes">Schemes</NavLink>
                        <NavLink to="/admin/applications">Applications</NavLink>
                      </>
                    )}
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-3 p-1.5 pl-3 pr-2 rounded-full border border-white/10 hover:border-[#AEB877] hover:bg-white/5 transition-all group"
                    >
                      <div className="text-right hidden lg:block">
                        <p className="text-xs font-bold text-white group-hover:text-[#AEB877]">{user?.name}</p>
                        <p className="text-[10px] text-[#A5C89E] uppercase">{user?.role}</p>
                      </div>
                      <div className="w-9 h-9 bg-[#AEB877] text-[#2C3318] rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                        {user?.name?.charAt(0)}
                      </div>
                      <span className="text-[#A5C89E] text-xs">▼</span>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl shadow-black/20 border border-[#AEB877]/20 py-2 animate-fadeIn origin-top-right ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="px-4 py-3 border-b border-gray-50 lg:hidden">
                          <p className="text-sm font-semibold text-[#2C3318]">{user?.name}</p>
                          <p className="text-xs text-[#5C6642]">{user?.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors flex items-center gap-2"
                        >
                          <span>🚪</span> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? (
                  <span className="text-2xl">✕</span>
                ) : (
                  <span className="text-2xl">☰</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FCFDF5] border-t border-[#AEB877]/20 min-h-screen animate-fadeIn absolute w-full top-full left-0 z-40">
            <div className="px-4 pt-6 pb-24 space-y-4">
              {!isAuthenticated ? (
                <>
                  <NavLink to="/login" mobile>Login</NavLink>
                  <div className="pt-4">
                    <Link
                      to="/register"
                      className="block w-full py-3.5 text-center btn-primary text-base font-bold shadow-lg"
                    >
                      Register New Account
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-4 py-4 bg-white rounded-xl mb-6 flex items-center gap-4 border border-[#AEB877]/20 shadow-sm">
                    <div className="w-12 h-12 bg-[#AEB877] text-[#2C3318] rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                      {user?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#2C3318] text-lg">{user?.name}</p>
                      <p className="text-sm text-[#5C6642]">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-[#F2F5E6] border border-[#AEB877]/30 rounded-md text-xs font-bold text-[#4A5532]">
                        {user?.role}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {user?.role === 'FARMER' && (
                      <>
                        <NavLink to="/dashboard" mobile>Dashboard</NavLink>
                        {user?.status === 'FARMER_PENDING_VERIFICATION' && (
                          <NavLink to="/farmer/verify" mobile>Verify Identity</NavLink>
                        )}
                        <NavLink to="/farmer/profile" mobile>My Profile</NavLink>
                      </>
                    )}

                    {user?.role === 'OFFICER' && (
                      <>
                        <NavLink to="/dashboard" mobile>Dashboard</NavLink>
                        <NavLink to="/officer/farmers" mobile>Verify Farmers</NavLink>
                        <NavLink to="/officer/lands" mobile>Land Records</NavLink>
                      </>
                    )}

                    {user?.role === 'ADMIN' && (
                      <>
                        <NavLink to="/dashboard" mobile>Dashboard</NavLink>
                        <NavLink to="/admin/farmers" mobile>Manage Farmers</NavLink>
                        <NavLink to="/admin/officers" mobile>Manage Officers</NavLink>
                        <NavLink to="/admin/verify-land" mobile>Verify Land</NavLink>
                        <NavLink to="/admin/schemes" mobile>Schemes</NavLink>
                        <NavLink to="/admin/applications" mobile>Applications</NavLink>
                      </>
                    )}
                  </div>

                  <div className="pt-8 mt-8 border-t border-[#AEB877]/20">
                    <button
                      onClick={handleLogout}
                      className="w-full py-4 text-center text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition-colors shadow-sm"
                    >
                      🚪 Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* Spacer for fixed navbar */}
      <div className="h-[72px] bg-[#2C3318]"></div>
    </>
  );
};
