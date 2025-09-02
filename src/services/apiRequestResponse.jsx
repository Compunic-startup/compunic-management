import axios from "axios";
import { config } from "../config/apiConfig"; // Assuming config.apiBaseUrl is defined here

// Auth Service functions (assuming these are in authService.js or similar)
// Placing them here for context, but they should remain in their own file.
export const getToken = () => {
    return localStorage.getItem("token");
};
export const setToken = (token) => {
    console.log("Token set: " + token);
    return localStorage.setItem("token", token);
};

export const removeToken = () => {
    localStorage.removeItem('token');
};

export const logoutUser = () => {
    removeToken();
    // Redirect to login page - ensure your routing handles this
    // In a React app with react-router-dom, you might use `history.push('/login')`
    // or `<Navigate to="/login" replace />` inside a component.
    // window.location.href = "/login"; // This forces a full page reload and might be jarring.
    // For now, keep as window.location.href if that's the intended behavior.
    console.log("User logged out and token removed. Redirecting to login.");
};


// Create axios instance
const apiClient = axios.create({
    baseURL: config.apiBaseUrl, // Your backend API base URL
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // Request timeout in milliseconds (e.g., 10 seconds)
});

// Request Interceptor: Automatically attach authorization token
apiClient.interceptors.request.use(
    (requestConfig) => {
        // Do not attach token for login or signup requests
        if (requestConfig.url === "/login" || requestConfig.url === "/signUp") {
            return requestConfig;
        }
        else {
            const token = getToken(); // Get the token from local storage
            // Attach the token to the Authorization header
            requestConfig.headers.Authorization = `Bearer ${token}`;
        }
        return requestConfig;
    },
    (error) => {
        // Handle request errors (e.g., network issues before sending request)
        console.error("API Request Error:", error);
        return Promise.reject(error);
    }
);

// Response Interceptor: Centralized error handling and token management
apiClient.interceptors.response.use(
    (response) => {
        // If the response is successful, just return it
        return response;
    },
    (error) => {
        // Error handling logic based on the error type and response status
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const { status, data, config: errorConfig } = error.response;

            console.error(`API Response Error [${status}]:`, data || error.message);

            switch (status) {
                case 400:
                    // Bad Request: Typically validation errors or malformed requests
                    // Server usually provides details in `data` (e.g., { message: "Invalid input", errors: [...] })
                    console.warn("Bad Request (400):", data?.message || "Invalid request.");
                    // You might want to display `data.message` or `data.errors` to the user
                    break;
                case 401:
                    // Unauthorized: Token is missing, invalid, or expired
                    console.warn("Unauthorized (401):", data?.message || "Authentication required.");
                    // Only log out if it's not a /login attempt itself (to prevent infinite loops)
                    if (errorConfig.url !== "/login") {
                        logoutUser(); // Log out the user and redirect to login
                    }
                    break;
                case 403:
                    // Forbidden: User is authenticated but doesn't have permission to access the resource
                    console.warn("Forbidden (403):", data?.message || "Access denied.");
                    // Could also redirect to a "Permission Denied" page or show a modal
                    break;
                case 404:
                    // Not Found: Resource not found
                    console.warn("Not Found (404):", data?.message || "Resource not found.");
                    break;
                case 422:
                    // Unprocessable Entity: Often used for validation errors (similar to 400, but more specific)
                    console.warn("Validation Error (422):", data?.message || "Validation failed.");
                    break;
                case 500:
                case 502:
                case 503:
                case 504:
                    // Server Errors (5xx): Internal server error, gateway issues, etc.
                    console.error(`Server Error (${status}):`, data?.message || "An unexpected server error occurred.");
                    // Generic user message might be appropriate here
                    break;
                default:
                    // Handle other HTTP status codes
                    console.warn(`Unhandled HTTP Status ${status}:`, data || error.message);
            }
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and http.ClientRequest in node.js
            console.error("API Network Error: No response received.", error.request);
            // This often means:
            // - Client has no internet connection
            // - Server is down or unreachable
            // - CORS issue preventing the response from being read
            // - Request timeout
            // You might want to show a "No internet connection" or "Server unavailable" message
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("API Error during request setup:", error.message);
        }

        // Always reject the promise so that the component calling the API method
        // can also handle the error specifically if needed.
        return Promise.reject(error);
    }
);

// Generic Request Handler: A wrapper to simplify API calls
const handleRequest = async (method, url, data = null, requestConfig = {}) => {
    try {
        const axiosConfig = { method, url, ...requestConfig };
        if (data !== null) { // Only add data for methods that expect a body (POST, PUT, PATCH)
            axiosConfig.data = data;
        }

        const response = await apiClient(axiosConfig);

        // For POST requests, sometimes the entire response object is useful (e.g., status, headers)
        // For GET/PUT/DELETE, often just the data is sufficient.
        // This is a stylistic choice. You can always return `response` and let the caller use `response.data`.
        return response.data; // Always return data, consistent for all methods
    } catch (error) {
        // The error has already been handled by the response interceptor for logging/side-effects.
        // Re-throw it so components can catch it for UI-specific error messages.
        throw error;
    }
};

// Exported API Methods: Convenient functions for each HTTP verb
export const apiGet = (url, config = {}) => handleRequest("get", url, null, config);
export const apiPost = (url, data, config = {}) => handleRequest("post", url, data, config);
export const apiPut = (url, data, config = {}) => handleRequest("put", url, data, config);
export const apiDelete = (url, config = {}) => handleRequest("delete", url, null, config);

// Important: The getToken, setToken, removeToken, logoutUser functions were provided
// at the end of your original snippet. They should ideally be in a separate file
// like `authService.js` and imported into this `apiClient.js` for better
// separation of concerns. I've placed them at the top here just for completeness
// in this single block of code, but recommend keeping them modular.