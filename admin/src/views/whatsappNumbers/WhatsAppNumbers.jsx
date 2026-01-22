import React, { useState } from 'react'
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
} from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../components'

// Mock data
const mockNumbers = [
  {
    id: 1,
    phone_number_id: '1234567890',
    phone_number: '+1234567890',
    display_name: 'Main Business Number',
    is_active: true,
    verified_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    phone_number_id: '0987654321',
    phone_number: '+0987654321',
    display_name: 'Support Number',
    is_active: false,
    verified_at: null,
  },
]

const WhatsAppNumbers = () => {
  const { success: showSuccess, error: showError } = useToast()
  const [numbers, setNumbers] = useState(mockNumbers)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone_number_id: '',
    phone_number: '',
    display_name: '',
    access_token: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const newNumber = {
        id: numbers.length + 1,
        ...formData,
        is_active: true,
        verified_at: new Date().toISOString(),
      }
      setNumbers([...numbers, newNumber])
      setShowModal(false)
      setFormData({ phone_number_id: '', phone_number: '', display_name: '', access_token: '' })
      showSuccess('WhatsApp number added successfully')
      setLoading(false)
    }, 1000)
  }

  const handleToggleStatus = (id) => {
    setNumbers(numbers.map(num => 
      num.id === id ? { ...num, is_active: !num.is_active } : num
    ))
    showSuccess('Status updated successfully')
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this number?')) {
      setNumbers(numbers.filter(num => num.id !== id))
      showSuccess('Number deleted successfully')
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
              {numbers.length === 0 ? (
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
                              variant="outline-primary"
                              onClick={() => handleToggleStatus(number.id)}
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

