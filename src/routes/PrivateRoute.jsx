import React from 'react'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('access_token')
    // ⛔ No token → redirect to login
    if (!token) {
        return <Navigate to="/login" replace />
    }

    // ✅ Logged in → show the page
    return children
}

export default PrivateRoute
