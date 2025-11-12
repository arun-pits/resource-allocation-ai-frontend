import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CForm,
    CFormInput,
    CFormLabel,
    CRow,
    CSpinner,
    CAlert
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilSave } from '@coreui/icons'

const EditEmployee = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        employee_email: '',
        employee_ph_no: '',
        designation: '',
        employee_id: '',
        department: '',
        manager: ''
    });

    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)
    const [errors, setErrors] = useState({})
    const [alert, setAlert] = useState({ show: false, message: '', type: '' })

    // Fetch employee data when component mounts
    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                setFetchLoading(true)
                const response = await fetch(`http://localhost:8000/api/employees/${id}/`)

                if (!response.ok) {
                    throw new Error('Employee not found')
                }

                const employeeData = await response.json()
                setFormData(employeeData)
                setErrors({})
            } catch (error) {
                console.error('Error fetching employee:', error)
                showAlert('Employee not found. Redirecting...', 'danger')
                setTimeout(() => navigate('/employees'), 2000)
            } finally {
                setFetchLoading(false)
            }
        }

        if (id) {
            fetchEmployee()
        }
    }, [id, navigate])

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        // Clear error when user starts typing
        if (errors[id]) {
            setErrors({ ...errors, [id]: '' });
        }
    }

    const validateForm = () => {
        const newErrors = {};

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        }
        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
        }
        if (!formData.employee_email.trim()) {
            newErrors.employee_email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.employee_email)) {
            newErrors.employee_email = 'Email is invalid';
        }
        if (!formData.employee_ph_no.trim()) {
            newErrors.employee_ph_no = 'Phone number is required';
        }
        if (!formData.designation.trim()) {
            newErrors.designation = 'Designation is required';
        }
        if (!formData.employee_id.trim()) {
            newErrors.employee_id = 'Employee ID is required';
        }
        if (!formData.department.trim()) {
            newErrors.department = 'Department is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const showAlert = (message, type) => {
        setAlert({ show: true, message, type })
        setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showAlert('Please fix the form errors before submitting.', 'warning')
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            console.log('Updating employee data:', formData);

            const response = await fetch(`http://localhost:8000/api/employees/${id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const responseData = await response.json();

            if (response.ok) {
                showAlert('Employee updated successfully!', 'success')
                // Optionally redirect back to listing page after success
                setTimeout(() => navigate('/employees'), 1500)
            } else {
                // Handle Django validation errors
                if (responseData.errors) {
                    setErrors(responseData.errors);
                    showAlert('Please fix the form errors.', 'warning')
                } else {
                    showAlert(`Error updating employee: ${responseData.message || 'Unknown error'}`, 'danger')
                }
                console.error('Server error response:', responseData);
            }
        } catch (error) {
            console.error('Network error:', error);
            showAlert('Network error: Could not connect to server.', 'danger')
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            navigate('/employees')
        }
    }

    const resetForm = () => {
        if (window.confirm('Are you sure you want to reset all changes?')) {
            // Refetch original data
            fetch(`http://localhost:8000/api/employees/${id}/`)
                .then(response => response.json())
                .then(employeeData => {
                    setFormData(employeeData)
                    setErrors({})
                    showAlert('Form reset to original values', 'info')
                })
                .catch(error => {
                    console.error('Error resetting form:', error)
                    showAlert('Error resetting form', 'danger')
                })
        }
    }

    if (fetchLoading) {
        return (
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardBody className="text-center py-5">
                            <CSpinner color="primary" />
                            <div className="mt-3">Loading employee data...</div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        )
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Edit Employee</strong>
                                <small> Update employee information</small>
                            </div>
                            <CButton
                                color="secondary"
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/employees')}
                            >
                                <CIcon icon={cilArrowLeft} className="me-2" />
                                Back to List
                            </CButton>
                        </div>
                    </CCardHeader>
                    <CCardBody>
                        {alert.show && (
                            <CAlert color={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: '' })}>
                                {alert.message}
                            </CAlert>
                        )}

                        <p className="text-body-secondary small">
                            Update employee details through this form. Modify the required fields and click on "Update Employee" to save changes.
                        </p>

                        <CForm className="row g-3" onSubmit={handleSubmit}>
                            {/* First Name */}
                            <CCol md={6}>
                                <CFormLabel htmlFor="first_name">
                                    First Name <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                    invalid={!!errors.first_name}
                                />
                                {errors.first_name && (
                                    <div className="text-danger small mt-1">{errors.first_name}</div>
                                )}
                            </CCol>

                            {/* Last Name */}
                            <CCol md={6}>
                                <CFormLabel htmlFor="last_name">
                                    Last Name <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                    invalid={!!errors.last_name}
                                />
                                {errors.last_name && (
                                    <div className="text-danger small mt-1">{errors.last_name}</div>
                                )}
                            </CCol>

                            {/* Email */}
                            <CCol md={6}>
                                <CFormLabel htmlFor="employee_email">
                                    Email <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    type="email"
                                    id="employee_email"
                                    value={formData.employee_email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                    invalid={!!errors.employee_email}
                                />
                                {errors.employee_email && (
                                    <div className="text-danger small mt-1">{errors.employee_email}</div>
                                )}
                            </CCol>

                            {/* Phone Number */}
                            <CCol md={6}>
                                <CFormLabel htmlFor="employee_ph_no">
                                    Phone Number <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="employee_ph_no"
                                    value={formData.employee_ph_no}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    invalid={!!errors.employee_ph_no}
                                />
                                {errors.employee_ph_no && (
                                    <div className="text-danger small mt-1">{errors.employee_ph_no}</div>
                                )}
                            </CCol>

                            {/* Designation */}
                            <CCol md={6}>
                                <CFormLabel htmlFor="designation">
                                    Designation <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="Enter designation"
                                    invalid={!!errors.designation}
                                />
                                {errors.designation && (
                                    <div className="text-danger small mt-1">{errors.designation}</div>
                                )}
                            </CCol>

                            {/* Employee ID */}
                            <CCol md={2}>
                                <CFormLabel htmlFor="employee_id">
                                    Employee ID <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="employee_id"
                                    value={formData.employee_id}
                                    onChange={handleChange}
                                    placeholder="EMP001"
                                    invalid={!!errors.employee_id}
                                />
                                {errors.employee_id && (
                                    <div className="text-danger small mt-1">{errors.employee_id}</div>
                                )}
                            </CCol>

                            {/* Department */}
                            <CCol md={4}>
                                <CFormLabel htmlFor="department">
                                    Department <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="Enter department"
                                    invalid={!!errors.department}
                                />
                                {errors.department && (
                                    <div className="text-danger small mt-1">{errors.department}</div>
                                )}
                            </CCol>

                            {/* Manager */}
                            <CCol md={6}>
                                <CFormLabel htmlFor="manager">Manager</CFormLabel>
                                <CFormInput
                                    id="manager"
                                    value={formData.manager}
                                    onChange={handleChange}
                                    placeholder="Enter manager's name"
                                />
                            </CCol>

                            {/* Additional Information */}
                            <CCol xs={12}>
                                <CCard className="bg-light">
                                    <CCardBody>
                                        <h6 className="mb-3">Additional Information</h6>
                                        <CRow>
                                            <CCol md={4}>
                                                <small className="text-muted">Employee ID</small>
                                                <div className="fw-semibold">{formData.employee_id}</div>
                                            </CCol>
                                            <CCol md={4}>
                                                <small className="text-muted">Last Updated</small>
                                                <div className="fw-semibold">
                                                    {formData.updated_at ? new Date(formData.updated_at).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </CCol>
                                            <CCol md={4}>
                                                <small className="text-muted">Created Date</small>
                                                <div className="fw-semibold">
                                                    {formData.created_at ? new Date(formData.created_at).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </CCol>
                                        </CRow>
                                    </CCardBody>
                                </CCard>
                            </CCol>

                            {/* Action Buttons */}
                            <CCol xs={12}>
                                <div className="d-flex gap-2">
                                    <CButton
                                        type="submit"
                                        color="primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <CIcon icon={cilSave} className="me-2" />
                                                Update Employee
                                            </>
                                        )}
                                    </CButton>
                                    <CButton
                                        type="button"
                                        color="secondary"
                                        variant="outline"
                                        onClick={resetForm}
                                        disabled={loading}
                                    >
                                        Reset Changes
                                    </CButton>
                                    <CButton
                                        type="button"
                                        color="danger"
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </CButton>
                                </div>
                            </CCol>
                        </CForm>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default EditEmployee