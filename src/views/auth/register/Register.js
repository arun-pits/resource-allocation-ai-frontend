import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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

const Register = () => {

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        confirm_password: ''
    })

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        if (errors[id]) {
            setErrors({ ...errors, [id]: '' });
        }
    }

    const validateForm = () => {
        const newErrors = {};
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        }
        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
        }
        if (!formData.username.trim()) {
            newErrors.username = 'User name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // ✅ Password validation
        if (!passwordRegex.test(formData.password)) {
            newErrors.password =
                'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
        }

        // ✅ Confirm password validation
        if (!formData.confirm_password) {
            newErrors.confirm_password = 'Please confirm your password';
        } else if (formData.password !== formData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            const response = await fetch('http://localhost:8000/api/auth/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors(data); // DRF validation errors
                return;
            }

            alert('Account created successfully!');
            setFormData({
                first_name: '',
                last_name: '',
                username: '',
                email: '',
                password: '',
                confirm_password: ''
            });

        } catch (err) {
            alert('Server connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
            <CContainer>
                <CRow className="justify-content-center">
                    <CCol md={8}>
                        <CCardGroup>
                            <CCard className="p-4">
                                <CCardBody>
                                    <CForm onSubmit={handleSubmit}>
                                        <h1>Register</h1>
                                        <p className="text-body-secondary">Create new account</p>

                                        <div className="mb-3">
                                            <CInputGroup>
                                                <CInputGroupText>
                                                    <CIcon icon={cilUser} />
                                                </CInputGroupText>
                                                <CFormInput placeholder="Firstname" value={formData.first_name} id="first_name" onChange={handleChange} />
                                            </CInputGroup>
                                            {errors.first_name && (
                                                <div className="text-danger small mt-1">{errors.first_name}</div>
                                            )}

                                        </div>

                                        <div className="mb-3">
                                            <CInputGroup>
                                                <CInputGroupText>
                                                    <CIcon icon={cilUser} />
                                                </CInputGroupText>
                                                <CFormInput placeholder="Lastname" value={formData.last_name} id="last_name" onChange={handleChange} />
                                            </CInputGroup>
                                            {errors.last_name && (
                                                <div className="text-danger small mt-1">{errors.last_name}</div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <CInputGroup>
                                                <CInputGroupText>
                                                    <CIcon icon={cilUser} />
                                                </CInputGroupText>
                                                <CFormInput placeholder="Username" value={formData.username} id="username" onChange={handleChange} />
                                            </CInputGroup>
                                            {errors.username && (
                                                <div className="text-danger small mt-1">{errors.username}</div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <CInputGroup>
                                                <CInputGroupText>@</CInputGroupText>
                                                <CFormInput placeholder="Email" value={formData.email} id="email" autoComplete="email" onChange={handleChange} />
                                            </CInputGroup>
                                            {errors.email && (
                                                <div className="text-danger small mt-1">{errors.email}</div>
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
                                                    value={formData.password}
                                                    autoComplete="new-password"
                                                    id="password"
                                                    onChange={handleChange}
                                                />
                                            </CInputGroup>
                                            {errors.password && (
                                                <div className="text-danger small mt-1">{errors.password}</div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <CInputGroup>
                                                <CInputGroupText>
                                                    <CIcon icon={cilLockLocked} />
                                                </CInputGroupText>
                                                <CFormInput
                                                    type="password"
                                                    placeholder="Repeat password"
                                                    value={formData.confirm_password}
                                                    autoComplete="new-password"
                                                    id="confirm_password"
                                                    onChange={handleChange}
                                                />
                                            </CInputGroup>
                                            {errors.confirm_password && (
                                                <div className="text-danger small mt-1">{errors.confirm_password}</div>
                                            )}
                                        </div>

                                        <CRow>
                                            <CCol xs={6}>
                                                <CButton color="primary" type="submit">Create Account</CButton>
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
                                        <h2>Sign In</h2>
                                        <p>
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                                            tempor incididunt ut labore et dolore magna aliqua.
                                        </p>
                                        <Link to="/login">
                                            <CButton color="primary" className="mt-3" active tabIndex={-1}>
                                                Sign In Now!
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

export default Register
