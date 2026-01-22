import React, { useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEnvelope,
  faSearch,
  faFilter,
  faDownload,
} from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../components'

// Mock data
const mockLogs = [
  {
    id: 1,
    campaign_id: 1,
    campaign_name: 'Welcome Campaign',
    contact_name: 'John Doe',
    mobile_number: '+1234567890',
    message_content: 'Hello John, welcome to our service!',
    status: 'READ',
    sent_at: '2024-01-15T10:00:00Z',
    delivered_at: '2024-01-15T10:00:05Z',
    read_at: '2024-01-15T10:05:00Z',
    error_message: null,
  },
  {
    id: 2,
    campaign_id: 1,
    campaign_name: 'Welcome Campaign',
    contact_name: 'Jane Smith',
    mobile_number: '+0987654321',
    message_content: 'Hello Jane, welcome to our service!',
    status: 'DELIVERED',
    sent_at: '2024-01-15T10:00:01Z',
    delivered_at: '2024-01-15T10:00:06Z',
    read_at: null,
    error_message: null,
  },
  {
    id: 3,
    campaign_id: 2,
    campaign_name: 'Promotional Campaign',
    contact_name: 'Bob Johnson',
    mobile_number: '+1122334455',
    message_content: 'Check out our new products!',
    status: 'FAILED',
    sent_at: '2024-01-16T10:00:00Z',
    delivered_at: null,
    read_at: null,
    error_message: 'Invalid phone number',
  },
  {
    id: 4,
    campaign_id: 1,
    campaign_name: 'Welcome Campaign',
    contact_name: 'Alice Brown',
    mobile_number: '+5566778899',
    message_content: 'Hello Alice, welcome to our service!',
    status: 'SENT',
    sent_at: '2024-01-15T10:00:02Z',
    delivered_at: null,
    read_at: null,
    error_message: null,
  },
]

const MessageLogs = () => {
  const { success: showSuccess, error: showError } = useToast()
  const [logs, setLogs] = useState(mockLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { variant: 'warning', text: 'Pending' },
      SENT: { variant: 'info', text: 'Sent' },
      DELIVERED: { variant: 'success', text: 'Delivered' },
      READ: { variant: 'primary', text: 'Read' },
      FAILED: { variant: 'danger', text: 'Failed' },
    }
    const badge = badges[status] || { variant: 'secondary', text: status }
    return <Badge bg={badge.variant}>{badge.text}</Badge>
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.mobile_number.includes(searchTerm) ||
      log.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message_content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <h2 className="mb-0 text-dark">
            <FontAwesomeIcon icon={faEnvelope} className="me-2" />
            Message Logs
          </h2>
          <p className="text-muted mb-0">View and track all sent messages</p>
        </div>
        <Button variant="outline-primary">
          <FontAwesomeIcon icon={faDownload} className="me-2" />
          Export Logs
        </Button>
      </div>

      <Row>
        <Col xs={12}>
          <Card className="border-2 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <Row className="align-items-center">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by contact, number, campaign, or message..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="SENT">Sent</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="READ">Read</option>
                    <option value="FAILED">Failed</option>
                  </Form.Select>
                </Col>
                <Col md={3} className="text-end">
                  <small className="text-muted">
                    Showing {filteredLogs.length} of {logs.length} messages
                  </small>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faEnvelope} className="text-muted mb-3" size="3x" />
                  <p className="text-muted">No messages found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Campaign</th>
                        <th>Contact</th>
                        <th>Mobile Number</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Timestamps</th>
                        <th>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id}>
                          <td>
                            <strong>{log.campaign_name}</strong>
                          </td>
                          <td>{log.contact_name}</td>
                          <td>
                            <code className="small">{log.mobile_number}</code>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '200px' }}>
                              {log.message_content}
                            </div>
                          </td>
                          <td>{getStatusBadge(log.status)}</td>
                          <td>
                            <div className="small">
                              {log.sent_at && (
                                <div className="text-muted">
                                  Sent: {new Date(log.sent_at).toLocaleString()}
                                </div>
                              )}
                              {log.delivered_at && (
                                <div className="text-success">
                                  Delivered: {new Date(log.delivered_at).toLocaleString()}
                                </div>
                              )}
                              {log.read_at && (
                                <div className="text-primary">
                                  Read: {new Date(log.read_at).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {log.error_message ? (
                              <span className="text-danger small">{log.error_message}</span>
                            ) : (
                              <span className="text-muted">-</span>
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

export default MessageLogs

