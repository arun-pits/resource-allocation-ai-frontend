import React, { useState } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CForm,
    CFormCheck,
    CFormInput,
    CFormLabel,
    CFormSelect,
    CInputGroup,
    CInputGroupText,
    CRow,
} from '@coreui/react'
import { DocsComponents, DocsExample } from 'src/components'

const AddEmployee = () => {

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        employeeEmail: '',
        employeePhNo: '',
        designation: '',
        employeeID: '',
        department: '',
        manager: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // Adjust the URL to your Django endpoint
        const response = await fetch('http://localhost:8000/api/employees/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })

        if (response.ok) {
            alert('Employee added!')
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                designation: '',
                employeeId: '',
                department: '',
                manager: '',
            })
        } else {
            alert('Error adding employee')
        }
    }

    return (
        <CRow>

            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Layout</strong> <small>Gutters</small>
                    </CCardHeader>
                    <CCardBody>

                        <p className="text-body-secondary small">
                            You can add Employee details through this form. Fill in the required fields and click on "Save" to submit the form.
                        </p>
                        <DocsExample>
                            <CForm className="row g-3">
                                <CCol md={6}>
                                    <CFormLabel htmlFor="firstName">First Name</CFormLabel>
                                    <CFormInput id="firstName" />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel htmlFor="lastName">Last Name</CFormLabel>
                                    <CFormInput id="lastName" />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel htmlFor="employeeEmail">Email</CFormLabel>
                                    <CFormInput type="email" id="employeeEmail" />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel htmlFor="employeePhNo">Phone Number</CFormLabel>
                                    <CFormInput id="employeePhNo" />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel htmlFor="designation">Designation</CFormLabel>
                                    <CFormInput id="designation" />
                                </CCol>
                                <CCol md={2}>
                                    <CFormLabel htmlFor="employeeID">Employee ID</CFormLabel>
                                    <CFormInput id="employeeID" />
                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="department">Department</CFormLabel>
                                    <CFormInput id="department" />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel htmlFor="manager">Manager</CFormLabel>
                                    <CFormInput id="manager" />
                                </CCol>

                                {/*                                 
                                <CCol xs={12}>
                                    <CFormLabel htmlFor="inputAddress">Address</CFormLabel>
                                    <CFormInput id="inputAddress" placeholder="1234 Main St" />
                                </CCol>
                                <CCol xs={12}>
                                    <CFormLabel htmlFor="inputAddress2">Address 2</CFormLabel>
                                    <CFormInput id="inputAddress2" placeholder="Apartment, studio, or floor" />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel htmlFor="inputCity">City</CFormLabel>
                                    <CFormInput id="inputCity" />
                                </CCol>
                                <CCol md={4}>
                                    <CFormLabel htmlFor="inputState">State</CFormLabel>
                                    <CFormSelect id="inputState">
                                        <option>Choose...</option>
                                        <option>...</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={2}>
                                    <CFormLabel htmlFor="inputZip">Zip</CFormLabel>
                                    <CFormInput id="inputZip" />
                                </CCol>
                                <CCol xs={12}>
                                    <CFormCheck type="checkbox" id="gridCheck" label="Check me out" />
                                </CCol> */}
                                <CCol xs={12}>
                                    <CButton color="primary">
                                        Save
                                    </CButton>
                                </CCol>
                            </CForm>
                        </DocsExample>
                    </CCardBody>
                </CCard>
            </CCol>



        </CRow>
    )
}

export default AddEmployee
