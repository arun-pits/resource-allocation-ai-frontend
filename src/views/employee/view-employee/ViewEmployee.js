import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CBadge,
    CSpinner,
    CAlert,
    CListGroup,
    CListGroupItem,
    CProgress,
    CTooltip,
    CProgressBar
} from '@coreui/react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import {
    cilArrowLeft,
    cilPencil,
    cilTrash,
    cilUser,
    cilEnvelopeOpen,
    cilPhone,
    cilBriefcase,
    cilBuilding,
    cilUserFollow,
    cilCalendar,
    cilClock,
    // cilIdBadge,
    cilStar,
    cilChartLine,
    cilChartPie,
    cilTask,
    cilWarning
} from '@coreui/icons'

const ViewEmployee = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [employee, setEmployee] = useState(null)
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deleteLoading, setDeleteLoading] = useState(false)

    // Fetch employee data
    const fetchEmployee = async () => {
        try {
            setLoading(true)
            const response = await fetch(`http://localhost:8000/api/employees/${id}/`)

            if (!response.ok) {
                throw new Error('Employee not found')
            }

            const employeeData = await response.json()
            setEmployee(employeeData)
            setError('')
        } catch (err) {
            console.error('Error fetching employee:', err)
            setError('Employee not found or error loading data.')
        } finally {
            setLoading(false)
        }
    }    // In ViewEmployee.js - Update the fetchEmployeeProjects function
    const fetchEmployeeProjects = async () => {
        try {
            // Using the class-based action endpoint
            const response = await fetch(`http://localhost:8000/api/employees/${id}/projects/`)

            if (response.ok) {
                const projectsData = await response.json()
                setProjects(projectsData.projects || projectsData)
            } else {
                setProjects([])
            }
        } catch (err) {
            console.error('Error fetching employee projects:', err)
            setProjects([])
        }
    }

    useEffect(() => {
        if (id) {
            fetchEmployee()
            fetchEmployeeProjects()
        }
    }, [id])

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
            return
        }

        setDeleteLoading(true)
        try {
            const response = await fetch(`http://localhost:8000/api/employees/${id}/`, {
                method: 'DELETE',
            })

            if (response.ok) {
                alert('Employee deleted successfully!')
                navigate('/employees')
            } else {
                alert('Error deleting employee')
            }
        } catch (error) {
            console.error('Error deleting employee:', error)
            alert('Network error: Could not delete employee')
        } finally {
            setDeleteLoading(false)
        }
    }

    // Calculate allocation statistics
    const calculateAllocationStats = () => {
        if (!projects.length) {
            return {
                totalAllocation: 0,
                projectCount: 0,
                allocationStatus: 'No Projects',
                statusColor: 'secondary',
                overallocated: false,
                underallocated: false,
                perfectlyAllocated: false
            }
        }

        const totalAllocation = projects.reduce((sum, project) => {
            const allocation = project.allocation || project.employee_allocation || 0
            return sum + parseFloat(allocation)
        }, 0)

        const projectCount = projects.length
        const overallocated = totalAllocation > 100
        const underallocated = totalAllocation < 100
        const perfectlyAllocated = totalAllocation === 100

        let allocationStatus, statusColor

        if (perfectlyAllocated) {
            allocationStatus = 'Perfectly Allocated'
            statusColor = 'success'
        } else if (overallocated) {
            allocationStatus = 'Overallocated'
            statusColor = 'danger'
        } else if (underallocated) {
            allocationStatus = 'Underallocated'
            statusColor = 'warning'
        } else {
            allocationStatus = 'No Projects'
            statusColor = 'secondary'
        }

        return {
            totalAllocation: Math.round(totalAllocation * 10) / 10, // Round to 1 decimal
            projectCount,
            allocationStatus,
            statusColor,
            overallocated,
            underallocated,
            perfectlyAllocated
        }
    }

    const getDepartmentBadge = (department) => {
        const departmentColors = {
            'Engineering': 'primary',
            'HR': 'success',
            'Sales': 'warning',
            'Marketing': 'info',
            'Finance': 'secondary',
            'Operations': 'dark',
            'IT': 'danger',
            'Technology': 'primary',
            'Development': 'primary',
            'Design': 'info'
        }
        return departmentColors[department] || 'primary'
    }

    const getDesignationLevel = (designation) => {
        const levels = {
            'Intern': 25,
            'Junior': 40,
            'Senior': 75,
            'Lead': 85,
            'Manager': 90,
            'Director': 95,
            'VP': 100
        }

        for (const [key, value] of Object.entries(levels)) {
            if (designation.toLowerCase().includes(key.toLowerCase())) {
                return value
            }
        }
        return 50
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getTimeSince = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now - date)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) return '1 day'
        if (diffDays < 30) return `${diffDays} days`
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`
        return `${Math.floor(diffDays / 365)} years`
    }

    if (loading) {
        return (
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardBody className="text-center py-5">
                            <CSpinner color="primary" size="lg" />
                            <div className="mt-3">
                                <h5>Loading Employee Details...</h5>
                                <p className="text-muted">Please wait while we fetch the employee information</p>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        )
    }

    if (error || !employee) {
        return (
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardBody className="text-center py-5">
                            <div className="mb-4">
                                <CIcon icon={cilUser} size="4xl" className="text-muted" />
                            </div>
                            <h4 className="text-danger">Employee Not Found</h4>
                            <p className="text-muted mb-4">{error || 'The requested employee could not be found.'}</p>
                            <CButton
                                color="primary"
                                onClick={() => navigate('/employees')}
                            >
                                <CIcon icon={cilArrowLeft} className="me-2" />
                                Back to Employees
                            </CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        )
    }

    const allocationStats = calculateAllocationStats()

    return (
        <CRow>
            <CCol xs={12}>
                {/* Header Actions */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <CButton
                            color="secondary"
                            variant="outline"
                            onClick={() => navigate('/employees')}
                            className="mb-2"
                        >
                            <CIcon icon={cilArrowLeft} className="me-2" />
                            Back to Employees
                        </CButton>
                        <h2 className="mb-0">Employee Details</h2>
                    </div>
                    <div className="d-flex gap-2">
                        <CTooltip content="Edit Employee">
                            <CButton
                                color="warning"
                                variant="outline"
                                as={Link}
                                to={`/edit-employee/${employee.id}`}
                            >
                                <CIcon icon={cilPencil} className="me-2" />
                                Edit
                            </CButton>
                        </CTooltip>
                        <CTooltip content="Delete Employee">
                            <CButton
                                color="danger"
                                variant="outline"
                                onClick={handleDelete}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? (
                                    <CSpinner size="sm" />
                                ) : (
                                    <CIcon icon={cilTrash} className="me-2" />
                                )}
                                Delete
                            </CButton>
                        </CTooltip>
                    </div>
                </div>

                {/* Resource Allocation Summary Section */}
                <CCard className="mb-4 shadow border-0 overflow-hidden rounded">
                    <CCardBody className="p-4 bg-white">
                        {/* Header */}
                        <div className="d-flex align-items-center mb-4">
                            <div className="bg-primary text-white rounded-circle p-3 me-3 d-flex justify-content-center align-items-center" style={{ width: 56, height: 56 }}>
                                <CIcon icon={cilChartPie} size="xl" />
                            </div>
                            <div>
                                <h5 className="mb-1 fw-bold text-dark">Resource Allocation Summary</h5>
                                <p className="mb-0 text-secondary small">
                                    Current workload distribution across all projects
                                </p>
                            </div>
                        </div>

                        <CRow className="g-3 mb-4">
                            {/* Basic color statistic blocks */}
                            <CCol sm={6} md={3}>
                                <div className="text-center p-3 border rounded bg-primary bg-opacity-10">
                                    <div className="h3 fw-bold text-primary">{allocationStats.totalAllocation}%</div>
                                    <small className="text-secondary fw-semibold">Total Allocation</small>
                                </div>
                            </CCol>
                            <CCol sm={6} md={3}>
                                <div className="text-center p-3 border rounded bg-success bg-opacity-10">
                                    <div className="h3 fw-bold text-success">{allocationStats.projectCount}</div>
                                    <small className="text-secondary fw-semibold">Active Projects</small>
                                </div>
                            </CCol>
                            <CCol sm={6} md={3}>
                                <div className="text-center p-3 border rounded bg-warning bg-opacity-10">
                                    <CBadge color={allocationStats.statusColor} className="fw-semibold px-3 py-2">
                                        {allocationStats.allocationStatus}
                                    </CBadge>
                                    <small className="d-block mt-2 text-secondary fw-semibold">Status</small>
                                </div>
                            </CCol>
                            <CCol sm={6} md={3}>
                                <div className="text-center p-3 border rounded bg-info bg-opacity-10">
                                    <div className="h3 fw-bold text-info">{Math.max(0, 100 - allocationStats.totalAllocation)}%</div>
                                    <small className="text-secondary fw-semibold">Available</small>
                                </div>
                            </CCol>
                        </CRow>

                        {/* Circular Progress */}
                        <div className="d-flex justify-content-center mb-4">
                            <div
                                className="rounded-circle d-flex flex-column justify-content-center align-items-center border"
                                style={{ width: 140, height: 140, borderColor: '#888' }}
                            >
                                <div className="h2 fw-bold text-dark">{allocationStats.totalAllocation}%</div>
                                <small className="text-secondary">Allocated</small>
                            </div>
                        </div>

                        <CProgress className="mb-3" >
                            <CProgressBar
                                value={Math.min(allocationStats.totalAllocation, 100)}
                                color={
                                    allocationStats.overallocated ? 'danger' :
                                        allocationStats.perfectlyAllocated ? 'success' : 'warning'
                                }
                                animated={allocationStats.overallocated}
                            />
                            {allocationStats.overallocated && (
                                <CProgressBar
                                    value={allocationStats.totalAllocation - 100}
                                    color="danger"
                                    animated
                                // style={{ opacity: 0.8 }}
                                />
                            )}
                        </CProgress>

                        <div className="text-center mb-4">
                            <small className="text-muted fw-semibold">
                                {allocationStats.overallocated ? (
                                    <>
                                        <CIcon icon={cilWarning} className="me-1 text-danger" />
                                        Overallocated by {(allocationStats.totalAllocation - 100).toFixed(1)}%
                                    </>
                                ) : allocationStats.perfectlyAllocated ? (
                                    <>
                                        <CIcon icon={cilStar} className="me-1 text-success" />
                                        Perfectly allocated
                                    </>
                                ) : (
                                    <>
                                        <CIcon icon={cilChartLine} className="me-1 text-info" />
                                        {(100 - allocationStats.totalAllocation).toFixed(1)}% capacity available
                                    </>
                                )}
                            </small>
                        </div>

                        {/* Project Breakdown */}
                        {allocationStats.projectCount > 0 && (
                            <div>
                                <div className="d-flex align-items-center mb-3">
                                    <CIcon icon={cilTask} size="lg" className="me-2 text-primary" />
                                    <h6 className="fw-bold text-dark mb-0">Project Allocation Breakdown</h6>
                                </div>

                                <CRow className="g-3">
                                    {projects.slice(0, 4).map((project) => (
                                        <CCol key={project.id} sm={6} lg={3}>
                                            <div className="p-3 border rounded h-100 bg-light">
                                                <div className="fw-semibold text-truncate mb-1" title={project.project_name} style={{ fontSize: '0.9rem' }}>
                                                    {project.project_name}
                                                </div>
                                                <small className="text-secondary pe-2">Project #{project.project_id || project.id}</small>

                                                <CBadge color="primary" className="fw-semibold px-3 py-1 mt-2">
                                                    {project.allocation || project.employee_allocation}%
                                                </CBadge>

                                                <CProgress
                                                    height={8}
                                                    className="mt-2"
                                                    value={project.allocation || project.employee_allocation}
                                                    color="primary"
                                                    aria-label={`Progress of ${project.project_name}`}
                                                />
                                            </div>
                                        </CCol>
                                    ))}

                                    {projects.length > 4 && (
                                        <CCol sm={6} lg={3}>
                                            <div className="p-4 border rounded h-100 d-flex flex-column align-items-center justify-content-center bg-light text-primary fw-bold">
                                                +{projects.length - 4}
                                                <small className="mt-1 fw-normal">more projects</small>
                                            </div>
                                        </CCol>
                                    )}
                                </CRow>
                            </div>
                        )}
                    </CCardBody>
                </CCard>


                {/* Employee Profile Card */}
                <CCard className="mb-4">
                    <CCardBody>
                        <CRow>
                            {/* Profile Header */}
                            <CCol xs={12}>
                                <div className="d-flex align-items-start mb-4">
                                    <div className="flex-shrink-0">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white"
                                            style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                            {employee.first_name[0]}{employee.last_name[0]}
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-4">
                                        <h3 className="mb-1">{employee.first_name} {employee.last_name}</h3>
                                        <p className="text-muted mb-2">{employee.designation}</p>
                                        <CBadge color={getDepartmentBadge(employee.department)}>
                                            {employee.department}
                                        </CBadge>
                                    </div>
                                    <div className="flex-shrink-0 text-end">
                                        <h5 className="text-primary">{employee.employee_id}</h5>
                                        <small className="text-muted">Employee ID</small>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>

                        <CRow>
                            {/* Left Column - Personal Info */}
                            <CCol md={6}>
                                <CCard className="h-100">
                                    <CCardHeader className="bg-light">
                                        <h6 className="mb-0">
                                            <CIcon icon={cilUser} className="me-2" />
                                            Personal Information
                                        </h6>
                                    </CCardHeader>
                                    <CCardBody>
                                        <CListGroup flush>
                                            <CListGroupItem className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    {/* <CIcon icon={cilIdBadge} className="text-primary me-3" /> */}
                                                    <div>
                                                        <strong>Employee ID</strong>
                                                        <div className="text-muted small">{employee.employee_id}</div>
                                                    </div>
                                                </div>
                                                <CBadge color="primary">Unique</CBadge>
                                            </CListGroupItem>

                                            <CListGroupItem className="d-flex align-items-center">
                                                <CIcon icon={cilEnvelopeOpen} className="text-primary me-3" />
                                                <div>
                                                    <strong>Email Address</strong>
                                                    <div>
                                                        <a href={`mailto:${employee.employee_email}`} className="text-decoration-none">
                                                            {employee.employee_email}
                                                        </a>
                                                    </div>
                                                </div>
                                            </CListGroupItem>

                                            <CListGroupItem className="d-flex align-items-center">
                                                <CIcon icon={cilPhone} className="text-primary me-3" />
                                                <div>
                                                    <strong>Phone Number</strong>
                                                    <div className="text-muted">{employee.employee_ph_no}</div>
                                                </div>
                                            </CListGroupItem>
                                        </CListGroup>
                                    </CCardBody>
                                </CCard>
                            </CCol>

                            {/* Right Column - Professional Info */}
                            <CCol md={6}>
                                <CCard className="h-100">
                                    <CCardHeader className="bg-light">
                                        <h6 className="mb-0">
                                            <CIcon icon={cilBriefcase} className="me-2" />
                                            Professional Information
                                        </h6>
                                    </CCardHeader>
                                    <CCardBody>
                                        <CListGroup flush>
                                            <CListGroupItem className="d-flex align-items-center">
                                                <CIcon icon={cilStar} className="text-warning me-3" />
                                                <div>
                                                    <strong>Designation</strong>
                                                    <div className="text-muted">{employee.designation}</div>
                                                </div>
                                            </CListGroupItem>

                                            <CListGroupItem className="d-flex align-items-center">
                                                <CIcon icon={cilBuilding} className="text-info me-3" />
                                                <div>
                                                    <strong>Department</strong>
                                                    <div>
                                                        <CBadge color={getDepartmentBadge(employee.department)}>
                                                            {employee.department}
                                                        </CBadge>
                                                    </div>
                                                </div>
                                            </CListGroupItem>

                                            <CListGroupItem className="d-flex align-items-center">
                                                <CIcon icon={cilUserFollow} className="text-success me-3" />
                                                <div>
                                                    <strong>Reporting Manager</strong>
                                                    <div className="text-muted">{employee.manager || 'Not Assigned'}</div>
                                                </div>
                                            </CListGroupItem>
                                        </CListGroup>
                                    </CCardBody>
                                </CCard>
                            </CCol>
                        </CRow>

                        {/* Additional Information Row */}
                        <CRow className="mt-4">
                            <CCol md={6}>
                                <CCard>
                                    <CCardHeader className="bg-light">
                                        <h6 className="mb-0">
                                            <CIcon icon={cilCalendar} className="me-2" />
                                            Employment Timeline
                                        </h6>
                                    </CCardHeader>
                                    <CCardBody>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <strong>Joined Date</strong>
                                                <div className="text-muted">{formatDate(employee.created_at)}</div>
                                            </div>
                                            <CBadge color="success">
                                                <CIcon icon={cilClock} className="me-1" />
                                                {getTimeSince(employee.created_at)}
                                            </CBadge>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>Last Updated</strong>
                                                <div className="text-muted">{formatDate(employee.updated_at)}</div>
                                            </div>
                                        </div>
                                    </CCardBody>
                                </CCard>
                            </CCol>

                            <CCol md={6}>
                                <CCard>
                                    <CCardHeader className="bg-light">
                                        <h6 className="mb-0">
                                            <CIcon icon={cilChartLine} className="me-2" />
                                            Career Level
                                        </h6>
                                    </CCardHeader>
                                    <CCardBody>
                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Experience Level</span>
                                                <span className="text-muted">{getDesignationLevel(employee.designation)}%</span>
                                            </div>
                                            <CProgress
                                                value={getDesignationLevel(employee.designation)}
                                                color="primary"
                                                className="mb-3"
                                            />
                                        </div>
                                        <small className="text-muted">
                                            Based on designation hierarchy and responsibilities
                                        </small>
                                    </CCardBody>
                                </CCard>
                            </CCol>
                        </CRow>

                        {/* Quick Actions */}
                        <CRow className="mt-4">
                            <CCol xs={12}>
                                <CCard>
                                    <CCardHeader className="bg-light">
                                        <h6 className="mb-0">Quick Actions</h6>
                                    </CCardHeader>
                                    <CCardBody>
                                        <div className="d-flex gap-2 flex-wrap">
                                            <CButton color="primary" variant="outline" as={Link} to={`/edit-employee/${employee.id}`}>
                                                <CIcon icon={cilPencil} className="me-2" />
                                                Edit Profile
                                            </CButton>
                                            <CButton color="success" variant="outline">
                                                <CIcon icon={cilEnvelopeOpen} className="me-2" />
                                                Send Email
                                            </CButton>
                                            <CButton color="info" variant="outline">
                                                <CIcon icon={cilPhone} className="me-2" />
                                                Call Employee
                                            </CButton>
                                            <CButton color="warning" variant="outline">
                                                <CIcon icon={cilBriefcase} className="me-2" />
                                                View Projects
                                            </CButton>
                                        </div>
                                    </CCardBody>
                                </CCard>
                            </CCol>
                        </CRow>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default ViewEmployee