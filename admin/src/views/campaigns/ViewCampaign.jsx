import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Table, ProgressBar, Alert } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBullhorn,
  faArrowLeft,
  faPlay,
  faStop,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faEnvelope,
  faEye,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../../components'

// Mock data - This would come from API in real app
const mockCampaign = {
  id: 1,
  name: 'Welcome Campaign',
  whatsapp_number: {
    id: 1,
    phone_number: '+1234567890',
    display_name: 'Main Business Number',
  },
  template: {
    id: 1,
    name: 'Welcome Message',
    body: 'Hello {{name}}, welcome to our service!',
    variables: ['name'],
  },
  total_messages: 100,
  sent_count: 100,
  delivered_count: 95,
  read_count: 80,
  failed_count: 5,
  status: 'COMPLETED',
  delivery_percentage: 95,
  failure_percentage: 5,
  started_at: '2024-01-15T10:00:00Z',
  completed_at: '2024-01-15T10:30:00Z',
  created_at: '2024-01-15T09:00:00Z',
}

const mockMessageLogs = [
  {
    id: 1,
    contact: { name: 'John Doe', mobile_number: '+1234567890' },
    status: 'DELIVERED',
    wa_message_id: 'wamid.123456',
    sent_at: '2024-01-15T10:00:05Z',
    delivered_at: '2024-01-15T10:00:10Z',
    read_at: '2024-01-15T10:05:00Z',
    error_message: null,
  },
  {
    id: 2,
    contact: { name: 'Jane Smith', mobile_number: '+0987654321' },
    status: 'READ',
    wa_message_id: 'wamid.123457',
    sent_at: '2024-01-15T10:00:06Z',
    delivered_at: '2024-01-15T10:00:11Z',
    read_at: '2024-01-15T10:03:00Z',
    error_message: null,
  },
  {
    id: 3,
    contact: { name: 'Bob Johnson', mobile_number: '+1122334455' },
    status: 'FAILED',
    wa_message_id: null,
    sent_at: '2024-01-15T10:00:07Z',
    delivered_at: null,
    read_at: null,
    error_message: 'Invalid phone number format',
  },
  {
    id: 4,
    contact: { name: 'Alice Williams', mobile_number: '+5566778899' },
    status: 'DELIVERED',
    wa_message_id: 'wamid.123458',
    sent_at: '2024-01-15T10:00:08Z',
    delivered_at: '2024-01-15T10:00:13Z',
    read_at: null,
    error_message: null,
  },
  {
    id: 5,
    contact: { name: 'Charlie Brown', mobile_number: '+9988776655' },
    status: 'SENT',
    wa_message_id: 'wamid.123459',
    sent_at: '2024-01-15T10:00:09Z',
    delivered_at: null,
    read_at: null,
    error_message: null,
  },
]

const ViewCampaign = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success: showSuccess, error: showError } = useToast()
  const [campaign, setCampaign] = useState(null)
  const [messageLogs, setMessageLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCampaign(mockCampaign)
      setMessageLogs(mockMessageLogs)
      setLoading(false)
    }, 500)
  }, [id])

  const handleStart = () => {
    setCampaign(prev => ({
      ...prev,
      status: 'PROCESSING',
      started_at: new Date().toISOString(),
    }))
    showSuccess('Campaign started successfully')
  }

  const handleStop = () => {
    setCampaign(prev => ({
      ...prev,
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
    }))
    showSuccess('Campaign stopped')
  }

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { variant: 'warning', text: 'Pending', icon: faSpinner },
      PROCESSING: { variant: 'info', text: 'Processing', icon: faSpinner },
      COMPLETED: { variant: 'success', text: 'Completed', icon: faCheckCircle },
      FAILED: { variant: 'danger', text: 'Failed', icon: faTimesCircle },
    }
    const badge = badges[status] || { variant: 'secondary', text: status, icon: faSpinner }
    return (
      <Badge bg={badge.variant}>
        <FontAwesomeIcon icon={badge.icon} className="me-1" />
        {badge.text}
      </Badge>
    )
  }

  const getMessageStatusBadge = (status) => {
    const badges = {
      PENDING: { variant: 'secondary', text: 'Pending', icon: faSpinner },
      SENT: { variant: 'info', text: 'Sent', icon: faEnvelope },
      DELIVERED: { variant: 'success', text: 'Delivered', icon: faCheckCircle },
      READ: { variant: 'primary', text: 'Read', icon: faEye },
      FAILED: { variant: 'danger', text: 'Failed', icon: faTimesCircle },
    }
    const badge = badges[status] || { variant: 'secondary', text: status, icon: faSpinner }
    return (
      <Badge bg={badge.variant}>
        <FontAwesomeIcon icon={badge.icon} className="me-1" />
        {badge.text}
      </Badge>
    )
  }

  const getProgress = () => {
    if (!campaign || campaign.total_messages === 0) return 0
    return Math.round((campaign.sent_count / campaign.total_messages) * 100)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  const filteredLogs = filterStatus === 'ALL' 
    ? messageLogs 
    : messageLogs.filter(log => log.status === filterStatus)

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
          <p className="mt-3 text-muted">Loading campaign details...</p>
        </div>
      </Container>
    )
  }

  if (!campaign) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          Campaign not found
        </Alert>
        <Button variant="primary" onClick={() => navigate('/campaigns')}>
          Back to Campaigns
        </Button>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <Button
            variant="link"
            className="p-0 mb-2 text-decoration-none"
            onClick={() => navigate('/campaigns')}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Campaigns
          </Button>
          <h2 className="mb-0 text-dark">
            <FontAwesomeIcon icon={faBullhorn} className="me-2" />
            {campaign.name}
          </h2>
          <p className="text-muted mb-0">Campaign Details</p>
        </div>
        <div className="d-flex gap-2">
          {campaign.status === 'PENDING' && (
            <Button variant="success" onClick={handleStart}>
              <FontAwesomeIcon icon={faPlay} className="me-2" />
              Start Campaign
            </Button>
          )}
          {campaign.status === 'PROCESSING' && (
            <Button variant="danger" onClick={handleStop}>
              <FontAwesomeIcon icon={faStop} className="me-2" />
              Stop Campaign
            </Button>
          )}
        </div>
      </div>

      <Row>
        {/* Campaign Information */}
        <Col md={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Campaign Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Status:</strong>
                <div className="mt-1">{getStatusBadge(campaign.status)}</div>
              </div>
              <div className="mb-3">
                <strong>WhatsApp Number:</strong>
                <p className="mb-0">{campaign.whatsapp_number.display_name}</p>
                <small className="text-muted">{campaign.whatsapp_number.phone_number}</small>
              </div>
              <div className="mb-3">
                <strong>Template:</strong>
                <p className="mb-0">{campaign.template.name}</p>
                <small className="text-muted">{campaign.template.body}</small>
              </div>
              <div className="mb-3">
                <strong>Created:</strong>
                <p className="mb-0">{formatDate(campaign.created_at)}</p>
              </div>
              {campaign.started_at && (
                <div className="mb-3">
                  <strong>Started:</strong>
                  <p className="mb-0">{formatDate(campaign.started_at)}</p>
                </div>
              )}
              {campaign.completed_at && (
                <div className="mb-3">
                  <strong>Completed:</strong>
                  <p className="mb-0">{formatDate(campaign.completed_at)}</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Statistics */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Statistics</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Total Messages</span>
                  <strong>{campaign.total_messages}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Sent</span>
                  <strong className="text-info">{campaign.sent_count}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Delivered</span>
                  <strong className="text-success">{campaign.delivered_count} ({campaign.delivery_percentage}%)</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Read</span>
                  <strong className="text-primary">{campaign.read_count}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Failed</span>
                  <strong className="text-danger">{campaign.failed_count} ({campaign.failure_percentage}%)</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Progress and Message Logs */}
        <Col md={8}>
          {/* Progress */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Progress</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <ProgressBar
                  now={getProgress()}
                  variant={campaign.status === 'COMPLETED' ? 'success' : 'primary'}
                  style={{ height: '25px' }}
                  label={`${getProgress()}%`}
                />
              </div>
              <div className="text-center">
                <small className="text-muted">
                  {campaign.sent_count} of {campaign.total_messages} messages sent
                </small>
              </div>
            </Card.Body>
          </Card>

          {/* Message Logs */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Message Logs</h5>
                <div>
                  <select
                    className="form-select form-select-sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ width: 'auto', display: 'inline-block' }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="SENT">Sent</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="READ">Read</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No messages found
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>Contact</th>
                        <th>Mobile</th>
                        <th>Status</th>
                        <th>Sent At</th>
                        <th>Delivered At</th>
                        <th>Read At</th>
                        <th>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{log.contact.name}</td>
                          <td>{log.contact.mobile_number}</td>
                          <td>{getMessageStatusBadge(log.status)}</td>
                          <td>
                            <small>{formatDate(log.sent_at)}</small>
                          </td>
                          <td>
                            <small>{formatDate(log.delivered_at)}</small>
                          </td>
                          <td>
                            <small>{formatDate(log.read_at)}</small>
                          </td>
                          <td>
                            {log.error_message ? (
                              <small className="text-danger">{log.error_message}</small>
                            ) : (
                              <small className="text-muted">-</small>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ViewCampaign

