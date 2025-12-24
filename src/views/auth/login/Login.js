import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    CButton,
    CCard,
    CCardBody,
    CCardGroup,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { AuthContext } from '../../../context/AuthContext'

const Login = () => {
    const navigate = useNavigate();
    const { setIsAuthenticated, setToken } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    })

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData({ ...formData, [id]: value })

        if (errors[id] || errors.detail) {
            setErrors({})
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required'
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        setErrors({})

        try {
            const response = await fetch('http://localhost:8000/api/auth/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                // DRF returns { detail: "Invalid username or password" }
                setErrors(data)
                return
            }

            setIsAuthenticated(true);
            setToken(data.token);

            localStorage.setItem("token", data.token);
            localStorage.setItem("auth", "true");

            // ✅ Save tokens
            localStorage.setItem('access_token', data.access)
            localStorage.setItem('refresh_token', data.refresh)
            localStorage.setItem('user', JSON.stringify(data.user))

            // ✅ Redirect after login
            navigate('/dashboard')

        } catch (err) {
            setErrors({ detail: 'Unable to connect to server' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
            <CContainer>
                <CRow className="justify-content-center">
                    <CCol md={8}>
                        <CCardGroup>
                            <CCard className="p-4">
                                <CCardBody>
                                    <CForm onSubmit={handleSubmit}>
                                        <h1>Login</h1>
                                        <p className="text-body-secondary">Sign in to your account</p>

                                        {errors.detail && (
                                            <div className="text-danger small mb-3">
                                                {errors.detail}
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <CInputGroup>
                                                <CInputGroupText>
                                                    <CIcon icon={cilUser} />
                                                </CInputGroupText>
                                                <CFormInput
                                                    placeholder="Username"
                                                    autoComplete="username"
                                                    id="username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                />
                                            </CInputGroup>
                                            {errors.username && (
                                                <div className="text-danger small mt-1">
                                                    {errors.username}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <CInputGroup>
                                                <CInputGroupText>
                                                    <CIcon icon={cilLockLocked} />
                                                </CInputGroupText>
                                                <CFormInput
                                                    type="password"
                                                    placeholder="Password"
                                                    autoComplete="current-password"
                                                    id="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                />
                                            </CInputGroup>
                                            {errors.password && (
                                                <div className="text-danger small mt-1">
                                                    {errors.password}
                                                </div>
                                            )}
                                        </div>

                                        <CRow>
                                            <CCol xs={6}>
                                                <CButton
                                                    color="primary"
                                                    className="px-4"
                                                    type="submit"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Logging in...' : 'Login'}
                                                </CButton>
                                            </CCol>
                                            <CCol xs={6} className="text-right">
                                                <CButton color="link" className="px-0">
                                                    Forgot password?
                                                </CButton>
                                            </CCol>
                                        </CRow>
                                    </CForm>
                                </CCardBody>
                            </CCard>

                            <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                                <CCardBody className="text-center">
                                    <div>
                                        <h2>Sign up</h2>
                                        <p>Create an account to get started</p>
                                        <Link to="/register">
                                            <CButton color="primary" className="mt-3">
                                                Register Now!
                                            </CButton>
                                        </Link>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CCardGroup>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    )
}

export default Login
