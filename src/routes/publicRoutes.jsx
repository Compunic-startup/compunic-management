// PublicRoutes.js
import { Route } from "react-router-dom";
import LoginScreen from "../page/loginRegister";

const PublicRoutes = ({ name,setAuth,setUserRoleRoutes }) => {
    return (
        <>
            <LoginScreen setUserRoleRoutes={setUserRoleRoutes} setAuth={setAuth}></LoginScreen>
        </>
    )
};

export default PublicRoutes;