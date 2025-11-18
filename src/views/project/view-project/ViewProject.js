import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    CAlert,
    CBadge,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CSpinner,
    CProgress,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CListGroup,
    CListGroupItem,
    CTooltip,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilArrowLeft,
    cilPencil,
    cilTrash,
    cilBriefcase,
    cilCalendar,
    cilPeople,
    cilChartPie,
    cilUser,
    cilBuilding,
    cilClock,
    // cilGlobe,
    cilLink,
    cilCheckCircle,
    cilXCircle,
    cilWarning,
    cilInfo,
    cilChart
} from '@coreui/icons'

const ViewProject = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [project, setProject] = useState(null)
    const [allocations, setAllocations] = useState([])
    const [loading, setLoading] = useState(true)
    const [allocationsLoading, setAllocationsLoading] = useState(true)
    const [error, setError] = useState('')
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Fetch project data
    const fetchProject = async () => {
        try {
            setLoading(true)
            const response = await fetch(`http://localhost:8000/api/projects/${id}/`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            setProject(data)
        } catch (err) {
            console.error('Error fetching project:', err)
            setError('Failed to fetch project details. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Fetch project allocations
    const fetchProjectAllocations = async () => {
        try {
            setAllocationsLoading(true)
            const response = await fetch(`http://localhost:8000/api/projects/${id}/allocations/`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            setAllocations(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Error fetching project allocations:', err)
            setAllocations([])
        } finally {
            setAllocationsLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchProject()
            fetchProjectAllocations()
        }
    }, [id])

    const handleEdit = () => {
        navigate(`/projects/edit/${id}`)
    }

    const handleDelete = async () => {
        try {
            setDeleteLoading(true)
            const response = await fetch(`http://localhost:8000/api/projects/${id}/`, {
                method: 'DELETE'
            })

            if (response.ok) {
                navigate('/projects', {
                    state: { message: 'Project deleted successfully!', type: 'success' }
                })
            } else {
                throw new Error('Failed to delete project')
            }
        } catch (err) {
            console.error('Error deleting project:', err)
            setError('Failed to delete project. Please try again.')
        } finally {
            setDeleteLoading(false)
            setShowDeleteModal(false)
        }
    }

    // Calculate project statistics
    const calculateProjectStats = () => {
        if (!allocations.length) {
            return {
                totalEmployees: 0,
                totalAllocation: 0,
                avgAllocation: 0,
                departments: []
            }
        }

        const totalEmployees = allocations.length
        const totalAllocation = allocations.reduce((sum, allocation) => sum + parseFloat(allocation.allocation || 0), 0)
        const avgAllocation = totalAllocation / totalEmployees
        const departments = [...new Set(allocations.map(allocation => allocation.employee?.department).filter(Boolean))]

        return {
            totalEmployees,
            totalAllocation,
            avgAllocation,
            departments
        }
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            'active': { color: 'success', icon: cilCheckCircle },
            'inactive': { color: 'secondary', icon: cilXCircle },
            'completed': { color: 'primary', icon: cilCheckCircle },
            'on-hold': { color: 'warning', icon: cilWarning },
            'cancelled': { color: 'danger', icon: cilXCircle }
        }

        const statusInfo = statusMap[status?.toLowerCase()] || { color: 'secondary', icon: cilInfo }

        return (
            <CBadge color={statusInfo.color} className="d-flex align-items-center gap-1">
                <CIcon icon={statusInfo.icon} size="sm" />
                {formatStatus(status)}
            </CBadge>
        )
    }

    const formatStatus = (status) => {
        if (!status) return 'Unknown'
        return status.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
    }

    const getDepartmentBadge = (department) => {
        const departmentColors = {
            'Engineering': 'primary',
            'Design': 'info',
            'Product': 'success',
            'Marketing': 'warning',
            'Sales': 'danger',
            'HR': 'secondary'
        }

        const color = departmentColors[department] || 'light'

        return (
            <CBadge color={color} className="me-1">
                {department}
            </CBadge>
        )
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const calculateProgress = (startDate, endDate) => {
        if (!startDate || !endDate) return 0

        const start = new Date(startDate)
        const end = new Date(endDate)
        const now = new Date()

        if (now < start) return 0
        if (now > end) return 100

        const totalDuration = end.getTime() - start.getTime()
        const elapsed = now.getTime() - start.getTime()

        return Math.round((elapsed / totalDuration) * 100)
    }

    const getProgressColor = (progress) => {
        if (progress < 30) return 'danger'
        if (progress < 70) return 'warning'
        return 'success'
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <CSpinner color="primary" size="lg" />
                    <p className="mt-3 text-muted">Loading project details...</p>
                </div>
            </div>
        )
    }

    if (error || !project) {
        return (
            <CRow className="justify-content-center">
                <CCol md={8}>
                    <CAlert color="danger" className="d-flex align-items-center">
                        <CIcon icon={cilWarning} className="me-2" />
                        <div>
                            <h5 className="alert-heading">Error Loading Project</h5>
                            <p className="mb-0">
                                {error || 'Project not found. The project may have been deleted or you may not have permission to view it.'}
                            </p>
                            <hr />
                            <div className="d-flex gap-2">
                                <CButton
                                    color="outline-danger"
                                    size="sm"
                                    onClick={() => navigate('/projects')}
                                >
                                    <CIcon icon={cilArrowLeft} className="me-1" />
                                    Back to Projects
                                </CButton>
                                <CButton
                                    color="danger"
                                    size="sm"
                                    onClick={() => window.location.reload()}
                                >
                                    Try Again
                                </CButton>
                            </div>
                        </div>
                    </CAlert>
                </CCol>
            </CRow>
        )
    }

    const projectStats = calculateProjectStats()
    const progress = calculateProgress(project.start_date, project.end_date)

    return (
        <>
            <CRow className="mb-3">
                <CCol>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <CButton
                                color="light"
                                variant="outline"
                                onClick={() => navigate('/projects')}
                                className="d-flex align-items-center"
                            >
                                <CIcon icon={cilArrowLeft} className="me-2" />
                                Back to Projects
                            </CButton>
                            <div>
                                <h2 className="mb-1 text-truncate" style={{ maxWidth: '400px' }}>
                                    {project.project_name}
                                </h2>
                                <div className="d-flex align-items-center gap-2">
                                    <CBadge color="light" className="text-dark">
                                        ID: {project.project_id}
                                    </CBadge>
                                    {getStatusBadge(project.status)}
                                </div>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <CTooltip content="Edit Project">
                                <CButton
                                    color="primary"
                                    variant="outline"
                                    onClick={handleEdit}
                                    className="d-flex align-items-center"
                                >
                                    <CIcon icon={cilPencil} />
                                </CButton>
                            </CTooltip>
                            <CTooltip content="Delete Project">
                                <CButton
                                    color="danger"
                                    variant="outline"
                                    onClick={() => setShowDeleteModal(true)}
                                    className="d-flex align-items-center"
                                >
                                    <CIcon icon={cilTrash} />
                                </CButton>
                            </CTooltip>
                        </div>
                    </div>
                </CCol>
            </CRow>

            <CRow className="g-4">
                {/* Project Overview */}
                <CCol lg={8}>
                    <CCard className="h-100">
                        <CCardHeader className="d-flex align-items-center">
                            <CIcon icon={cilBriefcase} className="me-2" />
                            <strong>Project Overview</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CRow className="g-4">
                                <CCol md={6}>
                                    <div className="border-start border-4 border-primary ps-3">
                                        <h6 className="text-muted mb-1">Project Manager</h6>
                                        <div className="d-flex align-items-center">
                                            <CIcon icon={cilUser} className="me-2 text-muted" />
                                            <span className="fw-medium">
                                                {project.project_manager || 'Not assigned'}
                                            </span>
                                        </div>
                                    </div>
                                </CCol>
                                <CCol md={6}>
                                    <div className="border-start border-4 border-info ps-3">
                                        <h6 className="text-muted mb-1">Department</h6>
                                        <div className="d-flex align-items-center">
                                            <CIcon icon={cilBuilding} className="me-2 text-muted" />
                                            {project.department ? (
                                                getDepartmentBadge(project.department)
                                            ) : (
                                                <span className="text-muted">Not specified</span>
                                            )}
                                        </div>
                                    </div>
                                </CCol>
                                <CCol md={6}>
                                    <div className="border-start border-4 border-success ps-3">
                                        <h6 className="text-muted mb-1">Start Date</h6>
                                        <div className="d-flex align-items-center">
                                            <CIcon icon={cilCalendar} className="me-2 text-muted" />
                                            <span>{formatDate(project.start_date)}</span>
                                        </div>
                                    </div>
                                </CCol>
                                <CCol md={6}>
                                    <div className="border-start border-4 border-warning ps-3">
                                        <h6 className="text-muted mb-1">End Date</h6>
                                        <div className="d-flex align-items-center">
                                            <CIcon icon={cilClock} className="me-2 text-muted" />
                                            <span>{formatDate(project.end_date)}</span>
                                        </div>
                                    </div>
                                </CCol>
                            </CRow>

                            {project.description && (
                                <div className="mt-4">
                                    <h6 className="text-muted mb-2">Description</h6>
                                    <p className="mb-0 text-break">{project.description}</p>
                                </div>
                            )}

                            {(project.url || project.devops_url) && (
                                <div className="mt-4">
                                    <h6 className="text-muted mb-2">Links</h6>
                                    <div className="d-flex gap-3 flex-wrap">
                                        {project.url && (
                                            <a
                                                href={project.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-decoration-none"
                                            >
                                                <CBadge color="primary" className="d-flex align-items-center gap-1">
                                                    <CIcon icon={cilLink} size="sm" />
                                                    Project URL
                                                </CBadge>
                                            </a>
                                        )}
                                        {project.devops_url && (
                                            <a
                                                href={project.devops_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-decoration-none"
                                            >
                                                <CBadge color="info" className="d-flex align-items-center gap-1">
                                                    <CIcon icon={cilLink} size="sm" />
                                                    DevOps URL
                                                </CBadge>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>

                {/* Project Statistics */}
                <CCol lg={4}>
                    <CCard className="h-100">
                        <CCardHeader className="d-flex align-items-center">
                            <CIcon icon={cilChart} className="me-2" />
                            <strong>Project Statistics</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CListGroup flush>
                                <CListGroupItem className="d-flex justify-content-between align-items-center px-0 py-3">
                                    <div className="d-flex align-items-center">
                                        <CIcon icon={cilPeople} className="me-2 text-primary" />
                                        <span>Total Employees</span>
                                    </div>
                                    <CBadge color="primary" pill>
                                        {projectStats.totalEmployees}
                                    </CBadge>
                                </CListGroupItem>

                                <CListGroupItem className="d-flex justify-content-between align-items-center px-0 py-3">
                                    <div className="d-flex align-items-center">
                                        <CIcon icon={cilChartPie} className="me-2 text-success" />
                                        <span>Total Allocation</span>
                                    </div>
                                    <CBadge color="success" pill>
                                        {projectStats.totalAllocation.toFixed(1)}%
                                    </CBadge>
                                </CListGroupItem>

                                <CListGroupItem className="d-flex justify-content-between align-items-center px-0 py-3">
                                    <div className="d-flex align-items-center">
                                        <CIcon icon={cilChart} className="me-2 text-info" />
                                        <span>Avg Allocation</span>
                                    </div>
                                    <CBadge color="info" pill>
                                        {projectStats.avgAllocation.toFixed(1)}%
                                    </CBadge>
                                </CListGroupItem>

                                <CListGroupItem className="d-flex justify-content-between align-items-start px-0 py-3">
                                    <div className="d-flex align-items-center">
                                        <CIcon icon={cilBuilding} className="me-2 text-warning" />
                                        <span>Departments</span>
                                    </div>
                                    <div className="text-end">
                                        {projectStats.departments.length > 0 ? (
                                            <div>
                                                {projectStats.departments.map((dept, index) => (
                                                    <div key={index} className="mb-1">
                                                        {getDepartmentBadge(dept)}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <CBadge color="light" className="text-dark">
                                                None
                                            </CBadge>
                                        )}
                                    </div>
                                </CListGroupItem>
                            </CListGroup>

                            {/* Project Progress */}
                            <div className="mt-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Project Progress</span>
                                    <span className="fw-medium">{progress}%</span>
                                </div>
                                <CProgress
                                    value={progress}
                                    color={getProgressColor(progress)}
                                    height={8}
                                    className="mb-2"
                                />
                                <small className="text-muted">
                                    Based on project timeline
                                </small>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>

                {/* Employee Allocations */}
                <CCol xs={12}>
                    <CCard>
                        <CCardHeader className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <CIcon icon={cilPeople} className="me-2" />
                                <strong>Employee Allocations</strong>
                                <CBadge color="primary" className="ms-2">
                                    {allocations.length}
                                </CBadge>
                            </div>
                        </CCardHeader>
                        <CCardBody className="p-0">
                            {allocationsLoading ? (
                                <div className="text-center py-5">
                                    <CSpinner color="primary" />
                                    <p className="mt-2 text-muted">Loading allocations...</p>
                                </div>
                            ) : allocations.length > 0 ? (
                                <CTable hover responsive>
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>Employee</CTableHeaderCell>
                                            <CTableHeaderCell>Employee ID</CTableHeaderCell>
                                            <CTableHeaderCell>Department</CTableHeaderCell>
                                            <CTableHeaderCell>Designation</CTableHeaderCell>
                                            <CTableHeaderCell>Allocation</CTableHeaderCell>
                                            <CTableHeaderCell>Actions</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {allocations.map((allocation, index) => (
                                            <CTableRow key={index}>
                                                <CTableDataCell>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-sm bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center">
                                                            {allocation.employee?.first_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="fw-medium">
                                                                {allocation.employee?.first_name} {allocation.employee?.last_name}
                                                            </div>
                                                            <small className="text-muted">
                                                                {allocation.employee?.email}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color="light" className="text-dark">
                                                        {allocation.employee?.employee_id || 'N/A'}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {allocation.employee?.department ? (
                                                        getDepartmentBadge(allocation.employee.department)
                                                    ) : (
                                                        <span className="text-muted">Not specified</span>
                                                    )}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {allocation.employee?.designation || 'Not specified'}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge
                                                        color={parseFloat(allocation.allocation) > 80 ? 'danger' :
                                                            parseFloat(allocation.allocation) > 60 ? 'warning' : 'success'}
                                                        className="d-flex align-items-center gap-1"
                                                        style={{ width: 'fit-content' }}
                                                    >
                                                        <CIcon icon={cilChartPie} size="sm" />
                                                        {allocation.allocation}%
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex gap-2">
                                                        <CTooltip content="View Employee">
                                                            <CButton
                                                                color="primary"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => navigate(`/employees/${allocation.employee?.id}`)}
                                                            >
                                                                <CIcon icon={cilUser} />
                                                            </CButton>
                                                        </CTooltip>
                                                    </div>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>
                            ) : (
                                <div className="text-center py-5">
                                    <CIcon icon={cilPeople} size="3xl" className="text-muted mb-3" />
                                    <h5 className="text-muted">No Employee Allocations</h5>
                                    <p className="text-muted">No employees have been allocated to this project yet.</p>
                                </div>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* Delete Confirmation Modal */}
            <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <CModalHeader onClose={() => setShowDeleteModal(false)}>
                    <CModalTitle>Confirm Delete</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <div className="d-flex align-items-center mb-3">
                        <CIcon icon={cilWarning} className="text-warning me-2" size="lg" />
                        <span>Are you sure you want to delete this project?</span>
                    </div>
                    <p className="mb-0">
                        <strong>Project:</strong> {project?.project_name} <br />
                        <strong>ID:</strong> {project?.project_id}
                    </p>
                    <div className="alert alert-warning mt-3 mb-0">
                        <small>
                            <strong>Warning:</strong> This action cannot be undone. All project data and employee allocations will be permanently deleted.
                        </small>
                    </div>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="secondary"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={deleteLoading}
                    >
                        Cancel
                    </CButton>
                    <CButton
                        color="danger"
                        onClick={handleDelete}
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? (
                            <>
                                <CSpinner size="sm" className="me-2" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <CIcon icon={cilTrash} className="me-2" />
                                Delete Project
                            </>
                        )}
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}
export default ViewProject
