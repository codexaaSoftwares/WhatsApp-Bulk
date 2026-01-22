import React, { useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, ProgressBar } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBullhorn,
  faPlus,
  faEye,
  faPlay,
  faStop,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../components'

// Mock data
const mockCampaigns = [
  {
    id: 1,
    name: 'Welcome Campaign',
    whatsapp_number: { phone_number: '+1234567890', display_name: 'Main Business' },
    template: { name: 'Welcome Message' },
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
  },
  {
    id: 2,
    name: 'Promotional Campaign',
    whatsapp_number: { phone_number: '+1234567890', display_name: 'Main Business' },
    template: { name: 'Promo Message' },
    total_messages: 200,
    sent_count: 150,
    delivered_count: 140,
    read_count: 100,
    failed_count: 10,
    status: 'PROCESSING',
    delivery_percentage: 93.3,
    failure_percentage: 6.7,
    started_at: '2024-01-16T10:00:00Z',
    completed_at: null,
  },
  {
    id: 3,
    name: 'Newsletter Campaign',
    whatsapp_number: { phone_number: '+0987654321', display_name: 'Support Number' },
    template: { name: 'Newsletter' },
    total_messages: 50,
    sent_count: 0,
    delivered_count: 0,
    read_count: 0,
    failed_count: 0,
    status: 'PENDING',
    delivery_percentage: 0,
    failure_percentage: 0,
    started_at: null,
    completed_at: null,
  },
]

const Campaigns = () => {
  const navigate = useNavigate()
  const { success: showSuccess, error: showError } = useToast()
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleStart = (id) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === id 
        ? { ...campaign, status: 'PROCESSING', started_at: new Date().toISOString() }
        : campaign
    ))
    showSuccess('Campaign started successfully')
  }

  const handleStop = (id) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === id ? { ...campaign, status: 'COMPLETED' } : campaign
    ))
    showSuccess('Campaign stopped')
  }

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { variant: 'warning', text: 'Pending' },
      PROCESSING: { variant: 'info', text: 'Processing' },
      COMPLETED: { variant: 'success', text: 'Completed' },
      FAILED: { variant: 'danger', text: 'Failed' },
    }
    const badge = badges[status] || { variant: 'secondary', text: status }
    return <Badge bg={badge.variant}>{badge.text}</Badge>
  }

  const getProgress = (campaign) => {
    if (campaign.total_messages === 0) return 0
    return Math.round((campaign.sent_count / campaign.total_messages) * 100)
  }

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <h2 className="mb-0 text-dark">
            <FontAwesomeIcon icon={faBullhorn} className="me-2" />
            Campaigns
          </h2>
          <p className="text-muted mb-0">Manage your WhatsApp messaging campaigns</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/compose')}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Create Campaign
        </Button>
      </div>

      <Row>
        <Col xs={12}>
          <Card className="border-2 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">All Campaigns</h5>
            </Card.Header>
            <Card.Body>
              {campaigns.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faBullhorn} className="text-muted mb-3" size="3x" />
                  <p className="text-muted">No campaigns created yet</p>
                  <Button variant="primary" onClick={() => navigate('/compose')}>
                    Create Your First Campaign
                  </Button>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Campaign Name</th>
                      <th>Template</th>
                      <th>WhatsApp Number</th>
                      <th>Progress</th>
                      <th>Status</th>
                      <th>Statistics</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id}>
                        <td>
                          <div>
                            <strong>{campaign.name}</strong>
                            <div className="small text-muted">
                              Total: {campaign.total_messages} messages
                            </div>
                          </div>
                        </td>
                        <td>{campaign.template?.name || '-'}</td>
                        <td>
                          <div>
                            <div>{campaign.whatsapp_number?.display_name || '-'}</div>
                            <small className="text-muted">{campaign.whatsapp_number?.phone_number}</small>
                          </div>
                        </td>
                        <td>
                          <div className="mb-1">
                            <ProgressBar 
                              now={getProgress(campaign)} 
                              variant={campaign.status === 'COMPLETED' ? 'success' : 'primary'}
                              style={{ height: '8px' }}
                            />
                          </div>
                          <small className="text-muted">
                            {campaign.sent_count} / {campaign.total_messages} sent
                          </small>
                        </td>
                        <td>{getStatusBadge(campaign.status)}</td>
                        <td>
                          <div className="small">
                            <div className="text-success">
                              ✓ Delivered: {campaign.delivered_count} ({campaign.delivery_percentage}%)
                            </div>
                            <div className="text-danger">
                              ✗ Failed: {campaign.failed_count} ({campaign.failure_percentage}%)
                            </div>
                            <div className="text-info">
                              👁 Read: {campaign.read_count}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => navigate(`/campaigns/${campaign.id}`)}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </Button>
                            {campaign.status === 'PENDING' && (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleStart(campaign.id)}
                              >
                                <FontAwesomeIcon icon={faPlay} />
                              </Button>
                            )}
                            {campaign.status === 'PROCESSING' && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleStop(campaign.id)}
                              >
                                <FontAwesomeIcon icon={faStop} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Campaigns

