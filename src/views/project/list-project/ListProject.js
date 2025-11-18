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
    CTooltip,
    CProgress,
    CCollapse
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilSearch,
    cilPlus,
    cilPencil,
    cilTrash,
    cilMagnifyingGlass,
    cilBriefcase,
    cilCalendar,
    cilPeople,
    cilChartPie,
    // cilChevronDown,
    // cilChevronUp
} from '@coreui/icons'

const ListProject = () => {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [expandedRows, setExpandedRows] = useState(new Set())

    // Fetch projects from API
    const fetchProjects = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:8000/api/projects/')

            if (!response.ok) {
                throw new Error('Failed to fetch projects')
            }

            const data = await response.json()
            setProjects(data.projects || data)
            setError('')
        } catch (err) {
            console.error('Error fetching projects:', err)
            setError('Failed to load projects. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    // Action handlers
    const handleViewDetails = (projectId) => {
        // Navigate to project details page
        window.location.href = `/#/project/view-project/${projectId}`
    }

    const handleEdit = (projectId) => {
        // Navigate to edit project page
        window.location.href = `/#/project/edit-project/${projectId}`
    }

    const handleDelete = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated allocations.')) {
            return
        }

        try {
            const response = await fetch(`http://localhost:8000/api/projects/${projectId}/`, {
                method: 'DELETE',
            })

            if (response.ok) {
                alert('Project deleted successfully!')
                fetchProjects()
            } else {
                alert('Error deleting project')
            }
        } catch (error) {
            console.error('Error deleting project:', error)
            alert('Network error: Could not delete project')
        }
    }

    // Toggle row expansion for allocations
    const toggleRowExpansion = (projectId) => {
        const newExpandedRows = new Set(expandedRows)
        if (newExpandedRows.has(projectId)) {
            newExpandedRows.delete(projectId)
        } else {
            newExpandedRows.add(projectId)
        }
        setExpandedRows(newExpandedRows)
    }

    // Filter projects based on search term
    const filteredProjects = projects.filter(project =>
        project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_manager?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.status?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    // Get badge color based on project status
    const getStatusBadge = (status) => {
        const statusColors = {
            'planning': 'secondary',
            'active': 'success',
            'on_hold': 'warning',
            'completed': 'primary',
            'cancelled': 'danger'
        }
        return statusColors[status] || 'secondary'
    }

    // Format status for display
    const formatStatus = (status) => {
        return status?.replace('_', ' ').toUpperCase() || 'Unknown'
    }

    // Calculate project progress based on dates
    const calculateProgress = (startDate, endDate) => {
        if (!startDate || !endDate) return 0

        const start = new Date(startDate)
        const end = new Date(endDate)
        const now = new Date()

        if (now < start) return 0
        if (now > end) return 100

        const total = end - start
        const elapsed = now - start

        return Math.round((elapsed / total) * 100)
    }

    if (loading) {
        return (
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardBody className="text-center py-5">
                            <CSpinner color="primary" />
                            <div className="mt-3">Loading projects...</div>
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
                                <strong>Project Management</strong>
                                <small> View and manage projects</small>
                            </div>
                            <CButton
                                color="primary"
                                size="sm"
                                onClick={() => window.location.href = '/#/project/add-project'}
                            >
                                <CIcon icon={cilPlus} className="me-2" />
                                Add New Project
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
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </CInputGroup>

                            <div className="d-flex align-items-center">
                                <small className="text-muted me-3">
                                    Showing {currentProjects.length} of {filteredProjects.length} projects
                                </small>
                            </div>
                        </div>

                        {/* Projects Table */}
                        <CTable responsive striped hover className="align-middle">
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell></CTableHeaderCell>
                                    <CTableHeaderCell>Project ID</CTableHeaderCell>
                                    <CTableHeaderCell>Project Name</CTableHeaderCell>
                                    <CTableHeaderCell>Manager</CTableHeaderCell>
                                    <CTableHeaderCell>Department</CTableHeaderCell>
                                    <CTableHeaderCell>Status</CTableHeaderCell>
                                    <CTableHeaderCell>Duration</CTableHeaderCell>
                                    <CTableHeaderCell>Team Size</CTableHeaderCell>
                                    <CTableHeaderCell>Allocation</CTableHeaderCell>
                                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {currentProjects.length > 0 ? (
                                    currentProjects.map((project) => (
                                        <React.Fragment key={project.id}>
                                            <CTableRow>
                                                <CTableDataCell style={{ width: '40px' }}>
                                                    <CButton
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleRowExpansion(project.id)}
                                                    >
                                                        <CIcon
                                                            icon={expandedRows.has(project.id) ? cilChartPie : cilChartPie}
                                                            size="sm"
                                                        />
                                                    </CButton>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex align-items-center">
                                                        <CIcon icon={cilBriefcase} className="text-primary me-2" />
                                                        <strong>{project.project_id}</strong>
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div>
                                                        <strong>{project.project_name}</strong>
                                                        {project.description && (
                                                            <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                                                                {project.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {project.project_manager}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {project.department}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color={getStatusBadge(project.status)}>
                                                        {formatStatus(project.status)}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex align-items-center">
                                                        <CIcon icon={cilCalendar} className="text-muted me-2" size="sm" />
                                                        <div>
                                                            <div className="small">{formatDate(project.start_date)}</div>
                                                            <div className="small text-muted">to {formatDate(project.end_date)}</div>
                                                        </div>
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex align-items-center">
                                                        <CIcon icon={cilPeople} className="text-muted me-2" size="sm" />
                                                        <span>{project.team_members?.length || 0} members</span>
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex align-items-center">
                                                        <CIcon icon={cilChartPie} className="text-muted me-2" size="sm" />
                                                        <div>
                                                            <div className="small">
                                                                {project.total_allocated_percentage?.toFixed(1) || '0'}%
                                                            </div>
                                                            <CProgress
                                                                height={4}
                                                                color={project.total_allocated_percentage > 100 ? 'danger' : 'success'}
                                                                value={Math.min(project.total_allocated_percentage || 0, 100)}
                                                                className="mt-1"
                                                                style={{ width: '60px' }}
                                                            />
                                                        </div>
                                                    </div>
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
                                                                onClick={() => handleViewDetails(project.id)}
                                                            >
                                                                <CIcon icon={cilMagnifyingGlass} />
                                                            </CButton>
                                                        </CTooltip>

                                                        {/* Edit Button */}
                                                        <CTooltip content="Edit Project" placement="top">
                                                            <CButton
                                                                color="warning"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="action-btn rounded-circle"
                                                                onClick={() => handleEdit(project.id)}
                                                            >
                                                                <CIcon icon={cilPencil} />
                                                            </CButton>
                                                        </CTooltip>

                                                        {/* Delete Button */}
                                                        <CTooltip content="Delete Project" placement="top">
                                                            <CButton
                                                                color="danger"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="action-btn rounded-circle"
                                                                onClick={() => handleDelete(project.id)}
                                                            >
                                                                <CIcon icon={cilTrash} />
                                                            </CButton>
                                                        </CTooltip>
                                                    </div>
                                                </CTableDataCell>
                                            </CTableRow>
                                            {/* Expanded Row for Team Allocations */}
                                            {expandedRows.has(project.id) && (
                                                <CTableRow className="bg-light">
                                                    <CTableDataCell colSpan="10">
                                                        <CCollapse visible={expandedRows.has(project.id)}>
                                                            <div className="p-3">
                                                                <h6 className="mb-3">Team Allocations</h6>
                                                                {project.team_members && project.team_members.length > 0 ? (
                                                                    <CRow>
                                                                        {project.team_members.map((member) => (
                                                                            <CCol md={6} lg={4} key={member.id} className="mb-3">
                                                                                <div className="border rounded p-3 bg-white">
                                                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                                                        <div>
                                                                                            <strong>
                                                                                                {member.employee_data?.first_name} {member.employee_data?.last_name}
                                                                                            </strong>
                                                                                            <div className="small text-muted">
                                                                                                {member.employee_data?.designation}
                                                                                            </div>
                                                                                            <div className="small text-muted">
                                                                                                {member.employee_data?.employee_id}
                                                                                            </div>
                                                                                        </div>
                                                                                        <CBadge color="primary">
                                                                                            {member.allocation}%
                                                                                        </CBadge>
                                                                                    </div>
                                                                                    <CProgress
                                                                                        height={6}
                                                                                        color="success"
                                                                                        value={member.allocation}
                                                                                        className="mt-2"
                                                                                    />
                                                                                </div>
                                                                            </CCol>
                                                                        ))}
                                                                    </CRow>
                                                                ) : (
                                                                    <div className="text-center text-muted py-3">
                                                                        <CIcon icon={cilPeople} size="lg" className="mb-2" />
                                                                        <div>No team members allocated to this project</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CCollapse>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <CTableRow>
                                        <CTableDataCell colSpan="10" className="text-center py-4">
                                            {searchTerm ? (
                                                <div>
                                                    <p>No projects found matching "{searchTerm}"</p>
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
                                                    <p>No projects found</p>
                                                    <CButton
                                                        color="primary"
                                                        size="sm"
                                                        onClick={() => window.location.href = '/#/project/add-project'}
                                                    >
                                                        <CIcon icon={cilPlus} className="me-2" />
                                                        Add First Project
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

                .text-truncate {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            `}</style>
        </CRow>
    )
}

export default ListProject