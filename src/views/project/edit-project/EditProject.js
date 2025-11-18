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
    CForm,
    CFormInput,
    CFormLabel,
    CFormTextarea,
    CFormSelect
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import {
    cilBriefcase,
    cilUser,
    cilLink,
    cilCalendar,
    cilPlus,
    cilTrash,
    cilArrowLeft,
    cilPencil
} from '@coreui/icons'

const EditProject = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        project_id: '',
        project_name: '',
        description: '',
        project_manager: '',
        department: '',
        url: '',
        devops_url: '',
        start_date: '',
        end_date: ''
    });

    const [employees, setEmployees] = useState([
        { employee_id: '', allocation: '' }
    ]);

    const [allEmployees, setAllEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [projectLoading, setProjectLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });

    // Fetch project data
    useEffect(() => {
        const fetchProject = async () => {
            try {
                setProjectLoading(true);
                const response = await fetch(`http://localhost:8000/api/projects/${id}/`);

                if (!response.ok) {
                    throw new Error('Project not found');
                }

                const projectData = await response.json();

                // Set form data
                setFormData({
                    project_id: projectData.project_id || '',
                    project_name: projectData.project_name || '',
                    description: projectData.description || '',
                    project_manager: projectData.project_manager || '',
                    department: projectData.department || '',
                    url: projectData.url || '',
                    devops_url: projectData.devops_url || '',
                    start_date: projectData.start_date || '',
                    end_date: projectData.end_date || ''
                });                // Fetch project allocations
                const allocationsResponse = await fetch(`http://localhost:8000/api/projects/${id}/allocations/`);
                if (allocationsResponse.ok) {
                    const allocationsData = await allocationsResponse.json();
                    console.log('Allocations data received:', allocationsData);

                    if (allocationsData.allocations && allocationsData.allocations.length > 0) {
                        setEmployees(allocationsData.allocations.map(allocation => ({
                            employee_id: allocation.employee.id.toString(),
                            allocation: allocation.allocation.toString()
                        })));
                    } else {
                        // If no allocations, ensure at least one empty row
                        setEmployees([{ employee_id: '', allocation: '' }]);
                    }
                } else {
                    console.error('Failed to fetch allocations');
                    setEmployees([{ employee_id: '', allocation: '' }]);
                }

            } catch (error) {
                console.error('Error fetching project:', error);
                showAlert('Error loading project data. Project may not exist.', 'danger');
            } finally {
                setProjectLoading(false);
            }
        };

        if (id) {
            fetchProject();
        }
    }, [id]);

    // Fetch all employees from database
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setFetchLoading(true);
                const response = await fetch('http://localhost:8000/api/employees/');

                if (response.ok) {
                    const data = await response.json();
                    setAllEmployees(Array.isArray(data) ? data : data.employees || []);
                } else {
                    console.error('Failed to fetch employees');
                    showAlert('Failed to load employees list', 'warning');
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
                showAlert('Error loading employees list', 'danger');
            } finally {
                setFetchLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    // Handle main form changes
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        if (errors[id]) {
            setErrors({ ...errors, [id]: '' });
        }
    }

    // Handle employee field changes
    const handleEmployeeChange = (index, field, value) => {
        const updatedEmployees = [...employees];
        updatedEmployees[index][field] = value;

        // If employee is selected, you can auto-fill other details if needed
        if (field === 'employee_id' && value) {
            const selectedEmployee = allEmployees.find(emp => emp.id === parseInt(value));
            if (selectedEmployee) {
                // Could add auto-fill logic here if needed
                console.log('Selected employee:', selectedEmployee);
            }
        }

        setEmployees(updatedEmployees);

        // Clear errors for this field
        const errorKey = `employees_${index}_${field}`;
        if (errors[errorKey]) {
            const newErrors = { ...errors };
            delete newErrors[errorKey];
            setErrors(newErrors);
        }
    }

    // Add new employee field
    const addEmployeeField = () => {
        setEmployees([...employees, { employee_id: '', allocation: '' }]);
    }

    // Remove employee field
    const removeEmployeeField = (index) => {
        if (employees.length > 1) {
            const updatedEmployees = employees.filter((_, i) => i !== index);
            setEmployees(updatedEmployees);

            // Remove related errors
            const newErrors = { ...errors };
            Object.keys(newErrors).forEach(key => {
                if (key.startsWith(`employees_${index}_`)) {
                    delete newErrors[key];
                }
            });
            setErrors(newErrors);
        }
    }

    const showAlert = (message, type) => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
    }

    const validateForm = () => {
        const newErrors = {};

        // Validate main form fields
        if (!formData.project_id.trim()) {
            newErrors.project_id = 'Project ID is required';
        }
        if (!formData.project_name.trim()) {
            newErrors.project_name = 'Project Name is required';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!formData.project_manager.trim()) {
            newErrors.project_manager = 'Project Manager is required';
        }
        if (!formData.department.trim()) {
            newErrors.department = 'Department is required';
        }
        if (!formData.start_date) {
            newErrors.start_date = 'Start Date is required';
        }
        if (!formData.end_date) {
            newErrors.end_date = 'End Date is required';
        }
        if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
            newErrors.end_date = 'End Date cannot be before Start Date';
        }

        // Validate URL format if provided
        if (formData.url && !isValidUrl(formData.url)) {
            newErrors.url = 'Please enter a valid URL';
        }
        if (formData.devops_url && !isValidUrl(formData.devops_url)) {
            newErrors.devops_url = 'Please enter a valid URL';
        }

        // Validate employee fields
        const usedEmployeeIds = new Set();
        let totalAllocation = 0;

        employees.forEach((employee, index) => {
            if (!employee.employee_id) {
                newErrors[`employees_${index}_employee_id`] = 'Please select an employee';
            } else {
                if (usedEmployeeIds.has(employee.employee_id)) {
                    newErrors[`employees_${index}_employee_id`] = 'This employee is already assigned to this project';
                }
                usedEmployeeIds.add(employee.employee_id);
            }

            if (!employee.allocation) {
                newErrors[`employees_${index}_allocation`] = 'Allocation percentage is required';
            } else {
                const allocation = parseFloat(employee.allocation);
                if (isNaN(allocation) || allocation <= 0 || allocation > 100) {
                    newErrors[`employees_${index}_allocation`] = 'Allocation must be between 0.1 and 100';
                } else {
                    totalAllocation += allocation;
                }
            }
        });

        // Validate total allocation
        if (totalAllocation > 100) {
            newErrors.allocation_total = `Total allocation cannot exceed 100%. Current total: ${totalAllocation.toFixed(1)}%`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    const calculateTotalAllocation = () => {
        return employees.reduce((total, employee) => {
            const allocation = parseFloat(employee.allocation) || 0;
            return total + allocation;
        }, 0);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showAlert('Please fix the form errors before submitting.', 'warning');
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const payload = {
                ...formData,
                allocations: employees.map(emp => ({
                    employee_id: parseInt(emp.employee_id),
                    allocation: parseFloat(emp.allocation)
                }))
            };

            console.log('Updating project data:', payload);

            const response = await fetch(`http://localhost:8000/api/projects/${id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Project updated successfully:', result);
                showAlert('Project updated successfully!', 'success');

                // Navigate back to project details after a delay
                setTimeout(() => {
                    navigate(`/view-project/${id}`);
                }, 2000);
            } else {
                const errorData = await response.json();
                console.error('Server validation errors:', errorData);

                if (errorData.errors) {
                    setErrors(errorData.errors);
                }

                showAlert(
                    errorData.message || 'Failed to update project. Please check the form for errors.',
                    'danger'
                );
            }
        } catch (error) {
            console.error('Error updating project:', error);
            showAlert('Network error occurred. Please try again.', 'danger');
        } finally {
            setLoading(false);
        }
    }

    const getSelectedEmployeeName = (employeeId) => {
        const employee = allEmployees.find(emp => emp.id === parseInt(employeeId));
        return employee ? `${employee.first_name} ${employee.last_name} (${employee.designation})` : '';
    }

    // Show loading state while fetching project
    if (projectLoading) {
        return (
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardBody className="text-center py-5">
                            <CSpinner color="primary" size="lg" />
                            <div className="mt-3">
                                <h5>Loading Project Details...</h5>
                                <p className="text-muted">Please wait while we fetch the project information</p>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        );
    }

    const totalAllocation = calculateTotalAllocation();

    return (
        <CRow>
            <CCol xs={12}>
                {/* Header Actions */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <CButton
                            color="secondary"
                            variant="outline"
                            onClick={() => navigate('/projects')}
                            className="mb-2"
                        >
                            <CIcon icon={cilArrowLeft} className="me-2" />
                            Back to Projects
                        </CButton>
                        <h2 className="mb-0">Edit Project</h2>
                    </div>
                </div>

                <CCard className="mb-4">
                    <CCardHeader>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>
                                    <CIcon icon={cilPencil} className="me-2" />
                                    Edit Project Details
                                </strong>
                                <small className="d-block mt-1">Update project information and team allocations</small>
                            </div>
                        </div>
                    </CCardHeader>
                    <CCardBody>
                        {alert.show && (
                            <CAlert color={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: '' })}>
                                {alert.message}
                            </CAlert>
                        )}

                        <p className="text-body-secondary small mb-4">
                            Update the project details below. All fields marked with <span className="text-danger">*</span> are required.
                        </p>

                        <CForm className="row g-3" onSubmit={handleSubmit}>
                            {/* Basic Project Information */}
                            <CCol xs={12}>
                                <h6 className="border-bottom pb-2 mb-3">
                                    <CIcon icon={cilBriefcase} className="me-2" />
                                    Basic Project Information
                                </h6>
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel htmlFor="project_id">
                                    Project ID <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="project_id"
                                    value={formData.project_id}
                                    onChange={handleChange}
                                    placeholder="e.g., PROJ-001"
                                    invalid={!!errors.project_id}
                                />
                                {errors.project_id && (
                                    <div className="text-danger small mt-1">{errors.project_id}</div>
                                )}
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel htmlFor="project_name">
                                    Project Name <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="project_name"
                                    value={formData.project_name}
                                    onChange={handleChange}
                                    placeholder="Enter project name"
                                    invalid={!!errors.project_name}
                                />
                                {errors.project_name && (
                                    <div className="text-danger small mt-1">{errors.project_name}</div>
                                )}
                            </CCol>

                            <CCol xs={12}>
                                <CFormLabel htmlFor="description">
                                    Description <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormTextarea
                                    id="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the project scope, objectives, and key details..."
                                    rows="4"
                                    invalid={!!errors.description}
                                />
                                {errors.description && (
                                    <div className="text-danger small mt-1">{errors.description}</div>
                                )}
                            </CCol>

                            {/* Project Team */}
                            <CCol xs={12}>
                                <h6 className="border-bottom pb-2 mb-3">
                                    <CIcon icon={cilUser} className="me-2" />
                                    Project Team & Resources
                                </h6>
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel htmlFor="project_manager">
                                    Project Manager <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="project_manager"
                                    value={formData.project_manager}
                                    onChange={handleChange}
                                    placeholder="Enter project manager name"
                                    invalid={!!errors.project_manager}
                                />
                                {errors.project_manager && (
                                    <div className="text-danger small mt-1">{errors.project_manager}</div>
                                )}
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel htmlFor="department">
                                    Department <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="e.g., Engineering, Marketing"
                                    invalid={!!errors.department}
                                />
                                {errors.department && (
                                    <div className="text-danger small mt-1">{errors.department}</div>
                                )}
                            </CCol>

                            {/* Employees/Resources - Updated Repeatable Field */}
                            <CCol xs={12}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <CFormLabel className="mb-0">
                                        Team Members <span className="text-danger">*</span>
                                    </CFormLabel>
                                    <div className="d-flex align-items-center gap-3">
                                        {/* Total Allocation Display */}
                                        <div className="text-center">
                                            <small className="text-muted d-block">Total Allocation</small>
                                            <CBadge color={totalAllocation > 100 ? 'danger' : totalAllocation === 100 ? 'success' : 'warning'}>
                                                {totalAllocation.toFixed(1)}%
                                            </CBadge>
                                        </div>
                                        <CButton
                                            color="primary"
                                            size="sm"
                                            variant="outline"
                                            onClick={addEmployeeField}
                                            type="button"
                                            disabled={fetchLoading}
                                        >
                                            <CIcon icon={cilPlus} className="me-1" />
                                            Add Team Member
                                        </CButton>
                                    </div>
                                </div>

                                {errors.allocation_total && (
                                    <CAlert color="danger" className="py-2">
                                        <small>{errors.allocation_total}</small>
                                    </CAlert>
                                )}

                                {fetchLoading ? (
                                    <div className="text-center py-4">
                                        <CSpinner size="sm" />
                                        <div className="mt-2 small text-muted">Loading employees...</div>
                                    </div>
                                ) : (
                                    <CListGroup>
                                        {employees.map((employee, index) => (
                                            <CListGroupItem key={index} className="p-3 mb-3 border rounded">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <CBadge color="primary">Team Member {index + 1}</CBadge>
                                                    {employees.length > 1 && (
                                                        <CButton
                                                            color="danger"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => removeEmployeeField(index)}
                                                            type="button"
                                                            title="Remove team member"
                                                        >
                                                            <CIcon icon={cilTrash} />
                                                        </CButton>
                                                    )}
                                                </div>

                                                <CRow className="g-3">
                                                    <CCol md={8}>
                                                        <CFormLabel htmlFor={`employee_id_${index}`} className="small mb-1">
                                                            Select Employee <span className="text-danger">*</span>
                                                        </CFormLabel>
                                                        <CFormSelect
                                                            id={`employee_id_${index}`}
                                                            value={employee.employee_id}
                                                            onChange={(e) => handleEmployeeChange(index, 'employee_id', e.target.value)}
                                                            size="sm"
                                                            invalid={!!errors[`employees_${index}_employee_id`]}
                                                        >
                                                            <option value="">Choose an employee...</option>
                                                            {allEmployees.map(emp => (
                                                                <option
                                                                    key={emp.id}
                                                                    value={emp.id}
                                                                    disabled={employees.some(e => e.employee_id === emp.id.toString() && e !== employee)}
                                                                >
                                                                    {emp.first_name} {emp.last_name} - {emp.designation} ({emp.employee_id})
                                                                </option>
                                                            ))}
                                                        </CFormSelect>
                                                        {errors[`employees_${index}_employee_id`] && (
                                                            <div className="text-danger small mt-1">{errors[`employees_${index}_employee_id`]}</div>
                                                        )}
                                                        {employee.employee_id && (
                                                            <div className="mt-1">
                                                                <small className="text-muted">
                                                                    Selected: {getSelectedEmployeeName(employee.employee_id)}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </CCol>
                                                    <CCol md={4}>
                                                        <CFormLabel htmlFor={`allocation_${index}`} className="small mb-1">
                                                            Allocation (%) <span className="text-danger">*</span>
                                                        </CFormLabel>
                                                        <CFormInput
                                                            type="number"
                                                            id={`allocation_${index}`}
                                                            value={employee.allocation}
                                                            onChange={(e) => handleEmployeeChange(index, 'allocation', e.target.value)}
                                                            placeholder="0-100"
                                                            min="0"
                                                            max="100"
                                                            step="0.5"
                                                            size="sm"
                                                            invalid={!!errors[`employees_${index}_allocation`]}
                                                        />
                                                        {errors[`employees_${index}_allocation`] && (
                                                            <div className="text-danger small mt-1">{errors[`employees_${index}_allocation`]}</div>
                                                        )}
                                                        <div className="mt-2">
                                                            <CProgress
                                                                value={parseFloat(employee.allocation) || 0}
                                                                color={
                                                                    (parseFloat(employee.allocation) || 0) > 100 ? 'danger' :
                                                                        (parseFloat(employee.allocation) || 0) >= 80 ? 'warning' : 'success'
                                                                }
                                                                size="sm"
                                                            />
                                                        </div>
                                                    </CCol>
                                                </CRow>
                                            </CListGroupItem>
                                        ))}
                                    </CListGroup>
                                )}

                            </CCol>

                            {/* Project URLs */}
                            <CCol xs={12}>
                                <h6 className="border-bottom pb-2 mb-3">
                                    <CIcon icon={cilLink} className="me-2" />
                                    Project URLs
                                </h6>
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel htmlFor="url">Project URL</CFormLabel>
                                <CFormInput
                                    type="url"
                                    id="url"
                                    value={formData.url}
                                    onChange={handleChange}
                                    placeholder="https://project.company.com"
                                    invalid={!!errors.url}
                                />
                                {errors.url && (
                                    <div className="text-danger small mt-1">{errors.url}</div>
                                )}
                                <div className="form-text">Optional: Link to project documentation or live site</div>
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel htmlFor="devops_url">DevOps URL</CFormLabel>
                                <CFormInput
                                    type="url"
                                    id="devops_url"
                                    value={formData.devops_url}
                                    onChange={handleChange}
                                    placeholder="https://devops.company.com/project"
                                    invalid={!!errors.devops_url}
                                />
                                {errors.devops_url && (
                                    <div className="text-danger small mt-1">{errors.devops_url}</div>
                                )}
                                <div className="form-text">Optional: Link to CI/CD pipeline or repository</div>
                            </CCol>

                            {/* Project Timeline */}
                            <CCol xs={12}>
                                <h6 className="border-bottom pb-2 mb-3">
                                    <CIcon icon={cilCalendar} className="me-2" />
                                    Project Timeline
                                </h6>
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel htmlFor="start_date">
                                    Start Date <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    type="date"
                                    id="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    invalid={!!errors.start_date}
                                />
                                {errors.start_date && (
                                    <div className="text-danger small mt-1">{errors.start_date}</div>
                                )}
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel htmlFor="end_date">
                                    End Date <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    type="date"
                                    id="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    invalid={!!errors.end_date}
                                />
                                {errors.end_date && (
                                    <div className="text-danger small mt-1">{errors.end_date}</div>
                                )}
                            </CCol>

                            {/* Action Buttons */}
                            <CCol xs={12}>
                                <div className="d-flex gap-2 pt-3 border-top">
                                    <CButton
                                        type="submit"
                                        color="primary"
                                        disabled={loading || fetchLoading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Updating Project...
                                            </>
                                        ) : (
                                            'Update Project'
                                        )}
                                    </CButton>
                                    <CButton
                                        type="button"
                                        color="secondary"
                                        variant="outline"
                                        onClick={() => navigate(`/view-project/${id}`)}
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

export default EditProject