import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLeaf, FaSignOutAlt, FaBars, FaTimes, FaChevronDown, FaLock } from 'react-icons/fa';

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
    setDropdownOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.relative')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Desktop Nav Link Component
  const NavLink = ({ to, children, mobile = false, locked = false }) => {
    const active = isActive(to);

    if (mobile) {
      if (locked) {
        return (
          <div className="flex justify-between items-center px-4 py-3 rounded-lg text-base font-bold text-gray-400 cursor-not-allowed bg-gray-50 opacity-70">
            <span>{children}</span>
            <FaLock className="text-sm" />
          </div>
        );
      }
      return (
        <Link
          to={to}
          className={`block px-4 py-3 rounded-lg text-base font-bold transition-all ${active
            ? 'bg-[#0B3D91] text-white'
            : 'text-[#555555] hover:bg-gray-100'
            }`}
        >
          {children}
        </Link>
      );
    }

    if (locked) {
      return (
        <span
          className="relative px-4 py-2 text-sm font-bold rounded-lg cursor-not-allowed group overflow-hidden"
          title="Verification Pending"
        >
          <span className="opacity-30 blur-[1px] select-none text-white">{children}</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaLock className="text-white/60 text-xs shadow-sm drop-shadow-md" />
          </div>
        </span>
      );
    }

    return (
      <Link
        to={to}
        className={`relative px-4 py-2 text-sm font-bold rounded-lg transition-all ${active ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
      >
        {children}
      </Link>
    );
  };

  const isFarmerUnverified = user?.role === 'FARMER' && user?.status !== 'FARMER_VERIFIED';

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${scrolled || mobileMenuOpen
          ? 'bg-[#0B3D91] shadow-lg border-b border-white/10 py-2'
          : 'bg-[#0B3D91] py-3'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 sm:h-auto items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 flex items-center justify-center">
                  {/* Custom Logo: Simple White Leaf */}
                  <FaLeaf className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-white tracking-tight leading-none">
                    WELFORA
                  </span>
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
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
                    className="ml-4 bg-white text-[#0B3D91] hover:bg-gray-100 font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all active:scale-95"
                  >
                    Register Farmer
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex bg-[#082A66] rounded-lg px-1 py-1 mr-4 border border-white/5">
                    {user?.role === 'FARMER' && (
                      <>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                        {/* Verify ID link removed as per request */}
                        <NavLink to="/farmer/add-land" locked={isFarmerUnverified}>Book Slot</NavLink>
                        <NavLink to="/farmer/lands" locked={isFarmerUnverified}>My Land</NavLink>
                        <NavLink to="/farmer/schemes" locked={isFarmerUnverified}>Schemes</NavLink>
                        <NavLink to="/transfer-requests" locked={isFarmerUnverified}>Transfers</NavLink>
                        <NavLink to="/farmer/applications" locked={isFarmerUnverified}>My Applications</NavLink>
                        <NavLink to="/farmer/profile">Profile</NavLink>
                      </>
                    )}

                    {user?.role === 'OFFICER' && (
                      <>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                        <NavLink to="/officer/farmers">Verifications</NavLink>
                        <NavLink to="/officer/add-land">Add Land Record</NavLink>
                        <NavLink to="/officer/lands">Land Records</NavLink>
                        <NavLink to="/transfer-requests">Transfers</NavLink>
                      </>
                    )}

                    {user?.role === 'ADMIN' && (
                      <>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                        <NavLink to="/admin/farmers">Farmers</NavLink>
                        <NavLink to="/admin/officers">Officers</NavLink>
                        <NavLink to="/admin/verify-land">Verify Land</NavLink>
                        <NavLink to="/transfer-requests">Transfers</NavLink>
                        <NavLink to="/admin/schemes">Schemes</NavLink>
                        <NavLink to="/admin/applications">Applications</NavLink>
                        <NavLink to="/admin/logs">Audit Logs</NavLink>
                      </>
                    )}
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-3 p-1.5 pl-3 pr-2 rounded-full border border-white/10 hover:bg-white/5 transition-all group"
                    >
                      <div className="text-right hidden lg:block">
                        <p className="text-xs font-bold text-white">{user?.name}</p>
                        <p className="text-[10px] text-white/70 uppercase">{user?.role}</p>
                      </div>
                      <div className="w-9 h-9 bg-white text-[#0B3D91] rounded-full flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                        {user?.name?.charAt(0)}
                      </div>
                      <FaChevronDown className={`text-white/70 text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-[#E0E0E0] py-2 animate-fadeIn origin-top-right z-50">
                        <div className="px-4 py-3 border-b border-gray-100 lg:hidden">
                          <p className="text-sm font-semibold text-[#222222]">{user?.name}</p>
                          <p className="text-xs text-[#555555]">{user?.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#D32F2F] hover:bg-red-50 font-medium transition-colors flex items-center gap-2"
                        >
                          <FaSignOutAlt /> Sign Out
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
                  <FaTimes className="text-2xl" />
                ) : (
                  <FaBars className="text-2xl" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 min-h-screen animate-fadeIn absolute w-full top-full left-0 z-40">
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
                  <div className="px-4 py-4 bg-[#F4F6F9] rounded-xl mb-6 flex items-center gap-4 border border-[#E0E0E0] shadow-sm">
                    <div className="w-12 h-12 bg-[#0B3D91] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                      {user?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#222222] text-lg">{user?.name}</p>
                      <p className="text-sm text-[#555555]">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-white border border-gray-200 rounded-md text-xs font-bold text-[#0B3D91]">
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
                        <NavLink to="/farmer/add-land" mobile locked={isFarmerUnverified}>Book Slot</NavLink>
                        <NavLink to="/farmer/lands" mobile locked={isFarmerUnverified}>My Land</NavLink>
                        <NavLink to="/transfer-requests" mobile locked={isFarmerUnverified}>Transfers</NavLink>
                        <NavLink to="/farmer/schemes" mobile locked={isFarmerUnverified}>Schemes</NavLink>
                        <NavLink to="/farmer/applications" mobile locked={isFarmerUnverified}>My Applications</NavLink>
                        <NavLink to="/farmer/profile" mobile>My Profile</NavLink>
                      </>
                    )}

                    {user?.role === 'OFFICER' && (
                      <>
                        <NavLink to="/dashboard" mobile>Dashboard</NavLink>
                        <NavLink to="/officer/farmers" mobile>Verify Farmers</NavLink>
                        <NavLink to="/officer/add-land" mobile>Add Land Record</NavLink>
                        <NavLink to="/officer/lands" mobile>Land Records</NavLink>
                        <NavLink to="/transfer-requests" mobile>Transfers</NavLink>
                      </>
                    )}

                    {user?.role === 'ADMIN' && (
                      <>
                        <NavLink to="/dashboard" mobile>Dashboard</NavLink>
                        <NavLink to="/admin/farmers" mobile>Manage Farmers</NavLink>
                        <NavLink to="/admin/officers" mobile>Manage Officers</NavLink>
                        <NavLink to="/admin/verify-land" mobile>Verify Land</NavLink>
                        <NavLink to="/transfer-requests" mobile>Transfers</NavLink>
                        <NavLink to="/admin/schemes" mobile>Schemes</NavLink>
                        <NavLink to="/admin/applications" mobile>Applications</NavLink>
                      </>
                    )}
                  </div>

                  <div className="pt-8 mt-8 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full py-4 text-center text-[#D32F2F] font-bold bg-red-50 hover:bg-red-100 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <FaSignOutAlt /> Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* Spacer for fixed navbar */}
      <div className="h-[64px]"></div>
    </>
  );
};
