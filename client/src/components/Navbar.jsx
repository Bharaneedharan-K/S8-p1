import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import { FaLeaf, FaSignOutAlt, FaBars, FaTimes, FaChevronDown, FaLock, FaBell, FaCheck, FaInfoCircle, FaTrash } from 'react-icons/fa';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Poll every 60s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const { data } = await apiClient.get('/notifications');
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await apiClient.patch(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark read', error);
      }
    }
    if (notif.link) {
      navigate(notif.link);
      setShowNotifications(false);
    }
  };

  const markAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications', error);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      // Only decrement unread count if the deleted notification was unread
      const deletedNotif = notifications.find(n => n._id === id);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

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
      if (dropdownOpen && !event.target.closest('.user-dropdown')) {
        setDropdownOpen(false);
      }
      if (showNotifications && !event.target.closest('.notif-dropdown')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen, showNotifications]);

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
          className={`block px-4 py-3 rounded-lg text-base font-bold transition-all duration-300 ${active
            ? 'bg-gradient-to-r from-[#0B3D91] to-[#1565C0] text-white shadow-md'
            : 'text-[#555555] hover:bg-gray-100 hover:text-[#0B3D91]'
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
        className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${active
          ? 'text-white bg-white/20 shadow-inner backdrop-blur-sm border border-white/20'
          : 'text-white/80 hover:text-white hover:bg-white/10'
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
        className={`fixed w-full z-50 transition-all duration-500 border-b ${scrolled || mobileMenuOpen
          ? 'bg-[#0B3D91]/95 backdrop-blur-md shadow-xl border-white/10 py-2'
          : 'bg-gradient-to-r from-[#0B3D91] to-[#0D47A1] border-transparent py-4'
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
                  <div className="flex bg-black/20 backdrop-blur-sm rounded-full p-1 border border-white/10 mr-2 shadow-inner">
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
                        <NavLink to="/officer/add-land">Verify Land</NavLink>
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
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Profile Dropdown */}
                    <div className="relative user-dropdown">
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

                    {/* Notification Bell */}
                    <div className="relative notif-dropdown">
                      <button
                        onClick={() => {
                          setShowNotifications(!showNotifications);
                          setDropdownOpen(false);
                        }}
                        className="relative p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 border border-white/20 backdrop-blur-sm hover:scale-105 shadow-lg group flex items-center justify-center"
                      >
                        <FaBell className={`text-lg transition-all duration-300 group-hover:rotate-12 ${unreadCount > 0 ? 'animate-pulse text-yellow-300' : ''}`} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 text-[9px] font-bold text-white items-center justify-center border border-white shadow-sm shadow-red-500/50">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          </span>
                        )}
                      </button>

                      {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 py-2 animate-fadeIn origin-top-right z-50 overflow-hidden ring-1 ring-black/5">
                          <div className="px-5 py-4 border-b border-gray-100/50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-sm font-extrabold text-[#111] tracking-wide">Notifications</h3>
                            {unreadCount > 0 && (
                              <button onClick={markAllAsRead} className="text-xs font-semibold text-[#0B3D91] hover:text-[#1565C0] transition-colors flex items-center gap-1">
                                <FaCheck className="text-[10px]" /> Mark all read
                              </button>
                            )}
                          </div>
                          <div className="max-h-[350px] overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="px-4 py-8 text-center text-[#555] flex flex-col items-center">
                                <FaBell className="text-gray-300 text-3xl mb-2" />
                                <p className="text-sm">You have no new notifications.</p>
                              </div>
                            ) : (
                              notifications.map((notif) => (
                                <div
                                  key={notif._id}
                                  onClick={() => handleNotificationClick(notif)}
                                  className={`px-4 py-3 border-b flex items-start gap-3 cursor-pointer transition-colors ${notif.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                                >
                                  <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${notif.isRead ? 'bg-transparent' : 'bg-[#0B3D91]'}`}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${notif.isRead ? 'text-[#555]' : 'font-bold text-[#222]'}`}>{notif.title}</p>
                                    <p className={`text-xs mt-0.5 line-clamp-2 ${notif.isRead ? 'text-gray-400' : 'text-[#444]'}`}>{notif.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{new Date(notif.createdAt).toLocaleString()}</p>
                                  </div>
                                  <button
                                    onClick={(e) => handleDeleteNotification(e, notif._id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                                    title="Delete notification"
                                  >
                                    <FaTrash className="text-xs" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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
