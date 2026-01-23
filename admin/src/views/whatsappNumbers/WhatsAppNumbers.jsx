import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faPlus,
  faEdit,
  faTrash,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faPlug,
} from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../components'
import whatsappNumberService from '../../services/whatsappNumberService'

const WhatsAppNumbers = () => {
  const { success: showSuccess, error: showError } = useToast()
  const [numbers, setNumbers] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [testingConnection, setTestingConnection] = useState(null)
  const [formData, setFormData] = useState({
    phone_number_id: '',
    phone_number: '',
    display_name: '',
    access_token: '',
    is_active: true,
  })

  // Fetch numbers on component mount
  useEffect(() => {
    fetchNumbers()
  }, [])

  const fetchNumbers = async () => {
    try {
      setFetching(true)
      const response = await whatsappNumberService.getNumbers()
      if (response.success) {
        setNumbers(response.data.data || response.data || [])
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch WhatsApp numbers')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await whatsappNumberService.createNumber(formData)
      if (response.success) {
        showSuccess('WhatsApp number added successfully')
        setShowModal(false)
        setFormData({ phone_number_id: '', phone_number: '', display_name: '', access_token: '', is_active: true })
        fetchNumbers()
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add WhatsApp number')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await whatsappNumberService.updateNumber(id, {
        is_active: !currentStatus
      })
      if (response.success) {
        showSuccess('Status updated successfully')
        fetchNumbers()
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update status')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this number?')) {
      try {
        const response = await whatsappNumberService.deleteNumber(id)
        if (response.success) {
          showSuccess('Number deleted successfully')
          fetchNumbers()
        }
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to delete number')
      }
    }
  }

  const handleTestConnection = async (id) => {
    setTestingConnection(id)
    try {
      const response = await whatsappNumberService.testConnection(id)
      if (response.success) {
        showSuccess('Connection test successful! WhatsApp number is working.')
        fetchNumbers() // Refresh to update verified_at
      } else {
        showError(response.message || 'Connection test failed')
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Connection test failed')
    } finally {
      setTestingConnection(null)
    }
  }

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <h2 className="mb-0 text-dark">
            <FontAwesomeIcon icon={faPhone} className="me-2" />
            WhatsApp Numbers
          </h2>
          <p className="text-muted mb-0">Manage your WhatsApp phone numbers and access tokens</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Number
        </Button>
      </div>

      <Row>
        <Col xs={12}>
          <Card className="border-2 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Connected Numbers</h5>
            </Card.Header>
            <Card.Body>
              {fetching ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-primary mb-3" size="3x" />
                  <p className="text-muted">Loading WhatsApp numbers...</p>
                </div>
              ) : numbers.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faPhone} className="text-muted mb-3" size="3x" />
                  <p className="text-muted">No WhatsApp numbers configured yet</p>
                  <Button variant="primary" onClick={() => setShowModal(true)}>
                    Add Your First Number
                  </Button>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Phone Number</th>
                      <th>Display Name</th>
                      <th>Phone Number ID</th>
                      <th>Status</th>
                      <th>Verified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {numbers.map((number) => (
                      <tr key={number.id}>
                        <td>
                          <strong>{number.phone_number}</strong>
                        </td>
                        <td>{number.display_name || '-'}</td>
                        <td>
                          <code className="small">{number.phone_number_id}</code>
                        </td>
                        <td>
                          <Badge bg={number.is_active ? 'success' : 'secondary'}>
                            {number.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          {number.verified_at ? (
                            <span className="text-success">
                              <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="text-muted">
                              <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                              Not Verified
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleTestConnection(number.id)}
                              disabled={testingConnection === number.id}
                              title="Test WhatsApp Connection"
                            >
                              {testingConnection === number.id ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faPlug} className="me-1" />
                                  Test
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleToggleStatus(number.id, number.is_active)}
                            >
                              {number.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(number.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
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

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add WhatsApp Number</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Alert variant="warning" className="mb-3">
              <strong>Security Note:</strong> Access tokens are encrypted and stored securely. 
              Never share your access token with anyone.
            </Alert>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Phone Number ID <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="phone_number_id"
                    value={formData.phone_number_id}
                    onChange={handleChange}
                    required
                    placeholder="Enter Phone Number ID"
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Phone Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    placeholder="+1234567890"
                  />
                </Form.Group>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Display Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    placeholder="Enter display name"
                  />
                </Form.Group>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Access Token <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="password"
                    name="access_token"
                    value={formData.access_token}
                    onChange={handleChange}
                    required
                    placeholder="Enter access token"
                  />
                  <Form.Text className="text-muted">
                    Your WhatsApp Cloud API access token
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                  Adding...
                </>
              ) : (
                'Add Number'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}

export default WhatsAppNumbers

