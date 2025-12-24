import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        setAuthenticated(!!token)
    }, [])

    const login = (token) => {
        localStorage.setItem('token', token)
        setAuthenticated(true)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setAuthenticated(false)
    }

    const isAuthenticated = () => authenticated

    return (
        <AuthContext.Provider value={{ authenticated, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}
