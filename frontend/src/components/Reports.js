import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Form, Row, Col, Spinner, Table } from 'react-bootstrap';
import { API_ENDPOINTS } from '../config/api';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateUtils';

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [projectList, setProjectList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [filters, setFilters] = useState({
    project_id: '',
    user_id: '',
    start_date: '',
    end_date: ''
  });

  // Fetch available report types
  useEffect(() => {
    const fetchReportTypes = async () => {
      try {
        setLoading(true);
        const response = await api.get(API_ENDPOINTS.reports);
        setReportTypes(response.data.available_reports);
        setLoading(false);
      } catch (err) {
        setError('Failed to load report types. Please try again later.');
        setLoading(false);
        console.error('Error fetching report types:', err);
      }
    };

    fetchReportTypes();
  }, []);

  // Fetch projects for filtering
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.projectList);
        setProjectList(response.data.data || response.data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };

    if (selectedReport) {
      fetchProjects();
    }
  }, [selectedReport]);

  // Fetch users for filtering
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.teamList);
        setUserList(response.data.data || response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    if (selectedReport && selectedReport.key === 'user_performance') {
      fetchUsers();
    }
  }, [selectedReport]);

  const handleSelectReport = (reportKey) => {
    const report = reportTypes[reportKey];
    report.key = reportKey;
    setSelectedReport(report);
    setReportData(null);
    setFilters({
      project_id: '',
      user_id: '',
      start_date: '',
      end_date: ''
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '';
      
      switch (selectedReport.key) {
        case 'project_progress':
          if (!filters.project_id) {
            setError('Please select a project');
            setLoading(false);
            return;
          }
          url = `${API_ENDPOINTS.reports}/project-progress/${filters.project_id}`;
          break;
          
        case 'user_performance':
          if (!filters.user_id) {
            setError('Please select a user');
            setLoading(false);
            return;
          }
          url = `${API_ENDPOINTS.reports}/user-performance/${filters.user_id}`;
          if (filters.start_date && filters.end_date) {
            url += `?start_date=${filters.start_date}&end_date=${filters.end_date}`;
          }
          break;
          
        case 'team_performance':
          if (!filters.project_id) {
            setError('Please select a project');
            setLoading(false);
            return;
          }
          url = `${API_ENDPOINTS.reports}/team-performance/${filters.project_id}`;
          if (filters.start_date && filters.end_date) {
            url += `?start_date=${filters.start_date}&end_date=${filters.end_date}`;
          }
          break;
          
        default:
          setError('Invalid report type');
          setLoading(false);
          return;
      }
      
      const response = await api.get(url);
      setReportData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to generate report. Please try again later.');
      setLoading(false);
      console.error('Error generating report:', err);
    }
  };

  const downloadReport = () => {
    let url = '';
    
    switch (selectedReport.key) {
      case 'project_progress':
        url = `${API_ENDPOINTS.reports}/project-progress/${filters.project_id}?download=true`;
        break;
        
      case 'user_performance':
        url = `${API_ENDPOINTS.reports}/user-performance/${filters.user_id}?download=true`;
        if (filters.start_date && filters.end_date) {
          url += `&start_date=${filters.start_date}&end_date=${filters.end_date}`;
        }
        break;
        
      case 'team_performance':
        url = `${API_ENDPOINTS.reports}/team-performance/${filters.project_id}?download=true`;
        if (filters.start_date && filters.end_date) {
          url += `&start_date=${filters.start_date}&end_date=${filters.end_date}`;
        }
        break;
        
      default:
        setError('Invalid report type');
        return;
    }
    
    // Instead of using window.open which doesn't include auth headers,
    // use api to fetch the file with proper auth and create a download link
    api.get(url, { responseType: 'blob' })
      .then(response => {
        // Create a blob from the response data
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const downloadUrl = window.URL.createObjectURL(blob);
        
        // Create a temporary link and click it to trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Extract filename from Content-Disposition header if available
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'report.pdf';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }
        
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(err => {
        console.error('Error downloading report:', err);
        setError('Failed to download report. Please try again later.');
      });
  };

  const renderFilters = () => {
    if (!selectedReport) return null;

    return (
      <Form className="mb-4">
        <Row>
          {(selectedReport.key === 'project_progress' || selectedReport.key === 'team_performance') && (
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Project</Form.Label>
                <Form.Control
                  as="select"
                  name="project_id"
                  value={filters.project_id}
                  onChange={handleFilterChange}
                >
                  <option value="">Select a project</option>
                  {projectList.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          )}

          {selectedReport.key === 'user_performance' && (
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>User</Form.Label>
                <Form.Control
                  as="select"
                  name="user_id"
                  value={filters.user_id}
                  onChange={handleFilterChange}
                >
                  <option value="">Select a user</option>
                  {userList.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          )}

          {(selectedReport.key === 'user_performance' || selectedReport.key === 'team_performance') && (
            <>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
            </>
          )}
        </Row>

        <Button 
          variant="primary" 
          onClick={generateReport} 
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Generating...</span>
            </>
          ) : 'Generate Report'}
        </Button>
      </Form>
    );
  };

  const renderReportData = () => {
    if (!reportData) return null;

    switch (selectedReport.key) {
      case 'project_progress':
        return (
          <div className="mt-4">
            <h4>Project: {reportData.project.name}</h4>
            
            <div className="my-4">
              <Row>
                <Col md={3}>
                  <Card className="text-center mb-3">
                    <Card.Body>
                      <h3>{reportData.stats.total_tasks}</h3>
                      <Card.Text>Total Tasks</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center mb-3 bg-success text-white">
                    <Card.Body>
                      <h3>{reportData.stats.completed_tasks}</h3>
                      <Card.Text>Completed</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center mb-3 bg-warning">
                    <Card.Body>
                      <h3>{reportData.stats.in_progress_tasks}</h3>
                      <Card.Text>In Progress</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center mb-3 bg-danger text-white">
                    <Card.Body>
                      <h3>{reportData.stats.overdue_tasks}</h3>
                      <Card.Text>Overdue</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
            
            <h5>Task Details</h5>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {reportData.tasks.map(task => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>
                      <span className={
                        task.status === 'completed' ? 'text-success' :
                        task.status === 'in_progress' ? 'text-warning' :
                        'text-muted'
                      }>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td>{formatDate(task.due_date)}</td>
                    <td>{task.assignedTo?.name || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        );
        
      case 'user_performance':
        return (
          <div className="mt-4">
            <h4>User: {reportData.user.name}</h4>
            <p>Period: {formatDate(reportData.period.start)} to {formatDate(reportData.period.end)}</p>
            
            <div className="my-4">
              <Row>
                <Col md={3}>
                  <Card className="text-center mb-3">
                    <Card.Body>
                      <h3>{reportData.stats.total_tasks}</h3>
                      <Card.Text>Total Tasks</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center mb-3 bg-success text-white">
                    <Card.Body>
                      <h3>{reportData.stats.completed_tasks}</h3>
                      <Card.Text>Completed</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center mb-3 bg-info text-white">
                    <Card.Body>
                      <h3>{reportData.stats.on_time_tasks}</h3>
                      <Card.Text>On Time</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center mb-3 bg-danger text-white">
                    <Card.Body>
                      <h3>{reportData.stats.overdue_tasks}</h3>
                      <Card.Text>Overdue</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <Row>
                <Col md={12}>
                  <Card className="text-center mb-3">
                    <Card.Body>
                      <h3>{reportData.stats.completion_rate}%</h3>
                      <Card.Text>Completion Rate</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
            
            <h5>Task Details</h5>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Completed At</th>
                </tr>
              </thead>
              <tbody>
                {reportData.tasks.map(task => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.project?.name || 'N/A'}</td>
                    <td>
                      <span className={
                        task.status === 'completed' ? 'text-success' :
                        task.status === 'in_progress' ? 'text-warning' :
                        'text-muted'
                      }>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td>{formatDate(task.due_date)}</td>
                    <td>{task.completed_at ? formatDate(task.completed_at) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        );
        
      case 'team_performance':
        return (
          <div className="mt-4">
            <h4>Team: {reportData.project.name}</h4>
            <p>Period: {formatDate(reportData.period.start)} to {formatDate(reportData.period.end)}</p>
            
            <div className="my-4">
              <Row>
                <Col md={3}>
                  <Card className="text-center mb-3">
                    <Card.Body>
                      <h3>{reportData.stats.total_members}</h3>
                      <Card.Text>Team Members</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center mb-3">
                    <Card.Body>
                      <h3>{reportData.stats.total_tasks}</h3>
                      <Card.Text>Total Tasks</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center mb-3 bg-success text-white">
                    <Card.Body>
                      <h3>{reportData.stats.completed_tasks}</h3>
                      <Card.Text>Completed Tasks</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center mb-3 bg-info text-white">
                    <Card.Body>
                      <h3>{reportData.stats.average_completion_rate.toFixed(2)}%</h3>
                      <Card.Text>Avg. Completion Rate</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
            
            <h5>Team Member Performance</h5>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Assigned Tasks</th>
                  <th>Completed</th>
                  <th>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {reportData.teamMembers.map(member => {
                  const totalTasks = member.tasks.length;
                  const completedTasks = member.tasks.filter(task => task.status === 'completed').length;
                  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                  
                  return (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{totalTasks}</td>
                      <td>{completedTasks}</td>
                      <td>{completionRate.toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        );
        
      default:
        return <Alert variant="warning">Unknown report type</Alert>;
    }
  };

  if (loading && !reportData) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reports</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {!selectedReport ? (
        <Row>
          {Object.entries(reportTypes).map(([key, report]) => (
            <Col md={4} key={key}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>{report.name}</Card.Title>
                  <Card.Text>{report.description}</Card.Text>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => handleSelectReport(key)}
                  >
                    Select Report
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>{selectedReport.name}</h3>
            <Button 
              variant="outline-secondary" 
              onClick={() => setSelectedReport(null)}
            >
              Back to Reports
            </Button>
          </div>
          
          {renderFilters()}
          
          {reportData && (
            <div className="d-flex justify-content-end mb-3">
              <Button 
                variant="success" 
                onClick={downloadReport}
              >
                Download PDF
              </Button>
            </div>
          )}
          
          {renderReportData()}
        </div>
      )}
    </div>
  );
};

export default Reports; 