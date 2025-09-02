import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavigation from './navigation/adminNavigation';
import { IoIosLogOut } from "react-icons/io";
import logo from '../assets/carouselLoad/favicon.png'
import EmployeeNavigation from './navigation/employeeNavigation';
import { apiGet, removeToken, setToken } from '../services/apiRequestResponse';
export default function Header() {
    const [role,setRole]=useState('');
    const navigate = useNavigate();
    const handleLogout = () => {
        removeToken();
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('mkddr');
        navigate('/');
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('userRole')
        window.location.reload();
    };
    useEffect(()=>{
        const fetchUserRole = async () => {
            try {
              const res = await apiGet('/role');
              //console.log(res);
              //console.log(res.data);
              //console.log(typeof setUserRoleRoutes);
             // console.log(res.data[0].employee_role);
             setRole((res.data).toLowerCase());
            } catch (err) {
              //console.log(err);
              setRole('admin');
            }
          };
          fetchUserRole();
    })
    return (
        <>
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className=" mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <img src={logo} className='rounded-2xl' width={35} alt="" />
                    <h1 className="text-2xl font-bold text-gray-900">Compunic LMS</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="font-semibold">{sessionStorage.getItem('userName')}</p>
                        <p className="text-sm text-gray-500">{sessionStorage.getItem('userRole')}</p>
                    </div>
                    <button onClick={handleLogout} className="px-3 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 transition">
                        <span className='font-bold'>Logout </span><IoIosLogOut className='inline-block' />
                    </button>
                </div>
            </div>
        </header>
        {
            role=='admin' && (
                 <AdminNavigation/>
            )
        }
        {
            role=='employee' && (
                <EmployeeNavigation/>
            )
        }
        </>
    );
}