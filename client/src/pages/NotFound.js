import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="bg-gradient-to-r from-green-400 to-blue-500 min-h-screen">
            <div className="px-4 py-4 grid place-content-center min-h-screen">
                <div className="w-64 rounded shadow-lg grid bg-white p-4 gap-2">
                    <h1>Page Not Found</h1>
                    <p>Oops! The page you are looking for does not exist.</p>

                    <a href="/"
                  className="text-center hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">Got to Homepage</a>
                </div>
            </div>
        </div>
    )
}

export default NotFound;