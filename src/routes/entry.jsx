/* eslint-disable no-unused-vars */
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import ProtectedRoute from "./protectedRoutes";
import 'primereact/resources/themes/lara-light-indigo/theme.css'; //theme
import 'primereact/resources/primereact.min.css'; //core css
import 'primeicons/primeicons.css'; //icons
import { AdminRoutes } from "./adminRoutes";
import { EmployeeRoutes } from "./employeeRoutes";
//import 'primeflex/primeflex.css'; // flex
function RouteComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [isRefresh, setIsRefresh] = useState(false);
  const [userRoleRoutes, setUserRoleRoutes] = useState(localStorage.getItem("mkddr"));  //mkddr named for user Roles
  const newRole={
    admin:"Zp4N8x3Lk7Tv",
    employee:"B9Qr6MtP2XaF",
    manager:"J3xWp4Yn7XqZ",
    hr:"L8Tx2VaF6Qr9M",
    //partner:"P7Xk9Mz2Fa4JQ",
  }
  // const [userRoleRoutes, setUserRoleRoutes] = useState("owner");  //mkddr named for user Roles
  useEffect(() => {
    console.log(userRoleRoutes);
    console.log("executing");
    if(userRoleRoutes=="admin" || userRoleRoutes==null || userRoleRoutes==newRole.admin)
    {
      localStorage.setItem('mkddr',newRole.admin);
    }
    if(userRoleRoutes=="employee" || userRoleRoutes==newRole.employee)
    {
      localStorage.setItem('mkddr',newRole.employee);
    }
    if(userRoleRoutes=="manager" || userRoleRoutes==newRole.manager)
    {
      localStorage.setItem('mkddr',newRole.manager);
    }
    if(userRoleRoutes=="hr" || userRoleRoutes==newRole.hr)
    {
      localStorage.setItem('mkddr',newRole.hr);
    }
    // if(userRoleRoutes=="partner" || userRoleRoutes==newRole.partner)
    // {
    //   localStorage.setItem('mkddr',newRole.partner);
    // }
    // localStorage.setItem('mkddr',userRoleRoutes==null?"owner":userRoleRoutes);
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated,userRoleRoutes]);

  return (
    <>
      {
        // setIsAuthenticated,isAuthenticated,isRefresh,setIsRefresh
        (userRoleRoutes == 'admin' || userRoleRoutes=="Zp4N8x3Lk7Tv") && (
          <AdminRoutes
          setUserRoleRoutes={setUserRoleRoutes}
            setIsAuthenticated={setIsAuthenticated}
            isAuthenticated={isAuthenticated}
            isRefresh={isRefresh}
            setIsRefresh={setIsRefresh}
          />
        )
      }
      {
        // setIsAuthenticated,isAuthenticated,isRefresh,setIsRefresh
        (userRoleRoutes == null) && (
          <AdminRoutes
          setUserRoleRoutes={setUserRoleRoutes}
            setIsAuthenticated={setIsAuthenticated}
            isAuthenticated={isAuthenticated}
            isRefresh={isRefresh}
            setIsRefresh={setIsRefresh}
          />
        )
      }
      {
        // setIsAuthenticated,isAuthenticated,isRefresh,setIsRefresh
        (userRoleRoutes == 'employee' || userRoleRoutes == "B9Qr6MtP2XaF") && (
          <EmployeeRoutes
          setUserRoleRoutes={setUserRoleRoutes}
            setIsAuthenticated={setIsAuthenticated}
            isAuthenticated={isAuthenticated}
            isRefresh={isRefresh}
            setIsRefresh={setIsRefresh}
          />
        )
      }
      {/* {
        // setIsAuthenticated,isAuthenticated,isRefresh,setIsRefresh
        (userRoleRoutes == 'hr' || userRoleRoutes== "L8Tx2VaF6Qr9M") && (
          <AdminRoutes
            setIsAuthenticated={setIsAuthenticated}
            isAuthenticated={isAuthenticated}
            isRefresh={isRefresh}
            setIsRefresh={setIsRefresh}
          />
        )
      }
      {
        // setIsAuthenticated,isAuthenticated,isRefresh,setIsRefresh
        (userRoleRoutes == 'manager' || userRoleRoutes=="J3xWp4Yn7XqZ") && (
          <ManagerRoutes
            setIsAuthenticated={setIsAuthenticated}
            isAuthenticated={isAuthenticated}
            isRefresh={isRefresh}
            setIsRefresh={setIsRefresh}
          />
        )
      }
      {
        // setIsAuthenticated,isAuthenticated,isRefresh,setIsRefresh
        (userRoleRoutes == 'employee' || userRoleRoutes == "B9Qr6MtP2XaF") && (
          <EmployeeRoutes
          setUserRoleRoutes={setUserRoleRoutes}
            setIsAuthenticated={setIsAuthenticated}
            isAuthenticated={isAuthenticated}
            isRefresh={isRefresh}
            setIsRefresh={setIsRefresh}
          />
        )
      }
       */}
    </>
  );
}

export default RouteComponent;
