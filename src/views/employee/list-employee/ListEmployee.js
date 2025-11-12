import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CBadge,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CPagination,
    CPaginationItem,
    CSpinner,
    CAlert,
    CTooltip
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilSearch,
    cilPlus,
    cilPencil,
    cilTrash,
    cilMagnifyingGlass,
    cilUser,
} from '@coreui/icons'

const ListEmployee = () => {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Fetch employees from API
    const fetchEmployees = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:8000/api/employees/')

            if (!response.ok) {
                throw new Error('Failed to fetch employees')
            }

            const data = await response.json()
            setEmployees(data.employees || data)
            setError('')
        } catch (err) {
            console.error('Error fetching employees:', err)
            setError('Failed to load employees. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmployees()
    }, [])

    // Action handlers
    const handleViewDetails = (employeeId) => {
        // Navigate to employee details page
        window.location.href = `/#/employee/view-employee/${employeeId}`
    }

    const handleEdit = (employeeId) => {
        // Navigate to edit employee page
        window.location.href = `/#/employee/edit-employee/${employeeId}`
    }

    const handleDelete = async (employeeId) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) {
            return
        }

        try {
            const response = await fetch(`http://localhost:8000/api/employees/${employeeId}/`, {
                method: 'DELETE',
            })

            if (response.ok) {
                alert('Employee deleted successfully!')
                fetchEmployees()
            } else {
                alert('Error deleting employee')
            }
        } catch (error) {
            console.error('Error deleting employee:', error)
            alert('Network error: Could not delete employee')
        }
    }

    // Filter employees based on search term
    const filteredEmployees = employees.filter(employee =>
        employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    // Get badge color based on department
    const getDepartmentBadge = (department) => {
        const departmentColors = {
            'Engineering': 'primary',
            'HR': 'success',
            'Sales': 'warning',
            'Marketing': 'info',
            'Finance': 'secondary',
            'Operations': 'dark',
            'IT': 'danger'
        }
        return departmentColors[department] || 'primary'
    }

    if (loading) {
        return (
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardBody className="text-center py-5">
                            <CSpinner color="primary" />
                            <div className="mt-3">Loading employees...</div>
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
                                <strong>Employee Management</strong>
                                <small> View and manage employees</small>
                            </div>
                            <CButton
                                color="primary"
                                size="sm"
                                onClick={() => window.location.href = '/#/add-employee'}
                            >
                                <CIcon icon={cilPlus} className="me-2" />
                                Add New Employee
                            </CButton>
                        </div>
                    </CCardHeader>
                    <CCardBody>
                        {error && (
                            <CAlert color="danger" dismissible onClose={() => setError('')}>
                                {error}
                            </CAlert>
                        )}

                        {/* Search and Filters */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <CInputGroup style={{ width: '300px' }}>
                                <CInputGroupText>
                                    <CIcon icon={cilSearch} />
                                </CInputGroupText>
                                <CFormInput
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </CInputGroup>

                            <div className="d-flex align-items-center">
                                <small className="text-muted me-3">
                                    Showing {currentEmployees.length} of {filteredEmployees.length} employees
                                </small>
                            </div>
                        </div>

                        {/* Employees Table */}
                        <CTable responsive striped hover className="align-middle">
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Employee ID</CTableHeaderCell>
                                    <CTableHeaderCell>Name</CTableHeaderCell>
                                    <CTableHeaderCell>Email</CTableHeaderCell>
                                    <CTableHeaderCell>Designation</CTableHeaderCell>
                                    <CTableHeaderCell>Department</CTableHeaderCell>
                                    <CTableHeaderCell>Manager</CTableHeaderCell>
                                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {currentEmployees.length > 0 ? (
                                    currentEmployees.map((employee) => (
                                        <CTableRow key={employee.id}>
                                            <CTableDataCell>
                                                <div className="d-flex align-items-center">
                                                    <CIcon icon={cilUser} className="text-primary me-2" />
                                                    <strong>{employee.employee_id}</strong>
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <strong>{employee.first_name} {employee.last_name}</strong>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <a
                                                    href={`mailto:${employee.employee_email}`}
                                                    className="text-decoration-none"
                                                >
                                                    {employee.employee_email}
                                                </a>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                {employee.designation}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge color={getDepartmentBadge(employee.department)}>
                                                    {employee.department}
                                                </CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                {employee.manager || 'N/A'}
                                            </CTableDataCell>
                                            <CTableDataCell className="text-center">
                                                <div className="d-flex justify-content-center align-items-center gap-2">
                                                    {/* View Details Button */}
                                                    <CTooltip content="View Details" placement="top">
                                                        <CButton
                                                            color="primary"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="action-btn rounded-circle"
                                                            onClick={() => handleViewDetails(employee.id)}
                                                        >
                                                            <CIcon icon={cilMagnifyingGlass} />
                                                        </CButton>
                                                    </CTooltip>

                                                    {/* Edit Button */}
                                                    <CTooltip content="Edit Employee" placement="top">
                                                        <CButton
                                                            color="warning"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="action-btn rounded-circle"
                                                            onClick={() => handleEdit(employee.id)}
                                                        >
                                                            <CIcon icon={cilPencil} />
                                                        </CButton>
                                                    </CTooltip>

                                                    {/* Delete Button */}
                                                    <CTooltip content="Delete Employee" placement="top">
                                                        <CButton
                                                            color="danger"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="action-btn rounded-circle"
                                                            onClick={() => handleDelete(employee.id)}
                                                        >
                                                            <CIcon icon={cilTrash} />
                                                        </CButton>
                                                    </CTooltip>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))
                                ) : (
                                    <CTableRow>
                                        <CTableDataCell colSpan="9" className="text-center py-4">
                                            {searchTerm ? (
                                                <div>
                                                    <p>No employees found matching "{searchTerm}"</p>
                                                    <CButton
                                                        color="primary"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSearchTerm('')}
                                                    >
                                                        Clear Search
                                                    </CButton>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p>No employees found</p>
                                                    <CButton
                                                        color="primary"
                                                        size="sm"
                                                        onClick={() => window.location.href = '/#/add-employee'}
                                                    >
                                                        <CIcon icon={cilPlus} className="me-2" />
                                                        Add First Employee
                                                    </CButton>
                                                </div>
                                            )}
                                        </CTableDataCell>
                                    </CTableRow>
                                )}
                            </CTableBody>
                        </CTable>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <small className="text-muted">
                                    Page {currentPage} of {totalPages}
                                </small>
                                <CPagination>
                                    <CPaginationItem
                                        aria-label="Previous"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                    >
                                        <span aria-hidden="true">&laquo;</span>
                                    </CPaginationItem>

                                    {[...Array(totalPages)].map((_, index) => (
                                        <CPaginationItem
                                            key={index + 1}
                                            active={currentPage === index + 1}
                                            onClick={() => setCurrentPage(index + 1)}
                                        >
                                            {index + 1}
                                        </CPaginationItem>
                                    ))}

                                    <CPaginationItem
                                        aria-label="Next"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                    >
                                        <span aria-hidden="true">&raquo;</span>
                                    </CPaginationItem>
                                </CPagination>
                            </div>
                        )}
                    </CCardBody>
                </CCard>
            </CCol>

            {/* Add custom CSS for better styling */}
            <style>{`
                .action-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    border: 1px solid transparent;
                }
                
                .action-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .rounded-circle {
                    border-radius: 50% !important;
                }
            `}</style>
        </CRow>
    )
}

export default ListEmployee