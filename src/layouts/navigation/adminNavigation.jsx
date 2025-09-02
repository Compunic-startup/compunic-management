import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, LayoutDashboard, User, Shield } from 'lucide-react';

export default function AdminNavigation() {
    const [isOpen, setIsOpen] = useState(false);

    // Style for active NavLink
    const activeLinkStyle = {
        color: '#2563EB', // blue-600
        borderBottom: '2px solid #2563EB',
        backgroundColor: '#EFF6FF' // blue-50
    };

    const navLinkClass = "flex items-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150";

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Desktop Menu */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        <NavLink
                            to='/dashboard'
                            className={navLinkClass}
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            <LayoutDashboard size={16} className="mr-2" />
                            Dashboard
                        </NavLink>
                        <NavLink
                            to='/managerView'
                            className={navLinkClass}
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            <User size={16} className="mr-2" />
                            Manager View
                        </NavLink>
                        <NavLink
                            to='/adminPanel'
                            className={navLinkClass}
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            <Shield size={16} className="mr-2" />
                            Admin Panel
                        </NavLink>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu, show/hide based on state */}
            {isOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLink
                            to='/dashboard'
                            className={navLinkClass}
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                            onClick={() => setIsOpen(false)}
                        >
                            <LayoutDashboard size={16} className="mr-2" />
                            Dashboard
                        </NavLink>
                        <NavLink
                            to='/manager-view'
                            className={navLinkClass}
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                             onClick={() => setIsOpen(false)}
                        >
                            <User size={16} className="mr-2" />
                            Manager View
                        </NavLink>
                        <NavLink
                            to='/adminPanel'
                            className={navLinkClass}
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                             onClick={() => setIsOpen(false)}
                        >
                            <Shield size={16} className="mr-2" />
                            Admin Panel
                        </NavLink>
                    </div>
                </div>
            )}
        </nav>
    );
}
