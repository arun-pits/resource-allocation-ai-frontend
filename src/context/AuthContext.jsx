import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        setAuthenticated(!!token)
    }, [])

    const login = (token) => {
        localStorage.setItem('access_token', token)
        setAuthenticated(true)
    }

    const logout = () => {
        localStorage.removeItem('access_token')
        setAuthenticated(false)
    }

    const isAuthenticated = () => authenticated

    return (
        <AuthContext.Provider value={{ authenticated, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}
