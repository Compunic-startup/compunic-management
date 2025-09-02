import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, LayoutDashboard, User, Shield } from 'lucide-react';
export default function EmployeeNavigation() {
     const activeLinkStyle = {
        color: '#2563EB', // blue-600
        borderBottom: '2px solid #2563EB',
        backgroundColor: '#EFF6FF' // blue-50
    };
     const navLinkClass = "flex items-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150";
    return (
        <nav className="bg-white border-b p-4">
            <div className="mx-auto px-4 flex">
                    <NavLink
                            to='/dashboard'
                            className={navLinkClass}
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            <LayoutDashboard size={16} className="mr-2" />
                            Dashboard
                        </NavLink>
                    {/* <NavLink
                        className="nav-tab m-1 px-4 py-2 text-sm font-medium"
                    >
                        Manager View
                    </NavLink>
                    <NavLink
                        className="nav-tab m-1 px-4 py-2 text-sm font-medium"
                    >
                        Admin Panel
                    </NavLink> */}
            </div>
        </nav>
    );
}