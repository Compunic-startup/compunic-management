// import { Navigate } from "react-router-dom";
// import Header from "../layouts/header";

// const ProtectedRoute = ({ isAuthenticated,element,...rest }) => {
//         return isAuthenticated?<><Header/>{element}</>:<Navigate to="/"></Navigate>;
// };

// export default ProtectedRoute; 

import { Navigate } from "react-router-dom";
import Header from "../layouts/header"; // Assuming you have a Header component

const ProtectedRoute = ({ isAuthenticated, element }) => {
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return (
        <>
            <Header /> {/* You'll need a way to sign out from the header */}
            {element}
        </>
    );
};

export default ProtectedRoute;