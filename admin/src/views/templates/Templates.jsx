import React, { useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileAlt,
  faPlus,
  faEdit,
  faTrash,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faEye,
} from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../components'

// Mock data
const mockTemplates = [
  {
    id: 1,
    name: 'Welcome Message',
    language: 'en',
    category: 'MARKETING',
    body: 'Hello {{name}}, welcome to our service!',
    status: 'APPROVED',
    variables: ['name'],
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Order Confirmation',
    language: 'en',
    category: 'UTILITY',
    body: 'Your order #{{order_id}} has been confirmed.',
    status: 'PENDING',
    variables: ['order_id'],
    created_at: '2024-01-14T10:00:00Z',
  },
  {
    id: 3,
    name: 'OTP Verification',
    language: 'en',
    category: 'AUTHENTICATION',
    body: 'Your OTP is {{otp}}. Valid for 5 minutes.',
    status: 'DRAFT',
    variables: ['otp'],
    created_at: '2024-01-13T10:00:00Z',
  },
]

const Templates = () => {
  const { success: showSuccess, error: showError } = useToast()
  const [templates, setTemplates] = useState(mockTemplates)
  const [showModal, setShowModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    language: 'en',
    category: 'MARKETING',
    body: '',
    variables: '',
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
      const variables = formData.variables.split(',').map(v => v.trim()).filter(v => v)
      const newTemplate = {
        id: templates.length + 1,
        name: formData.name,
        language: formData.language,
        category: formData.category,
        body: formData.body,
        status: 'DRAFT',
        variables: variables,
        created_at: new Date().toISOString(),
      }
      setTemplates([...templates, newTemplate])
      setShowModal(false)
      setFormData({ name: '', language: 'en', category: 'MARKETING', body: '', variables: '' })
      showSuccess('Template created successfully')
      setLoading(false)
    }, 1000)
  }

  const handlePreview = (template) => {
    setPreviewTemplate(template)
    setShowPreview(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(template => template.id !== id))
      showSuccess('Template deleted successfully')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: { variant: 'secondary', text: 'Draft' },
      PENDING: { variant: 'warning', text: 'Pending' },
      APPROVED: { variant: 'success', text: 'Approved' },
      REJECTED: { variant: 'danger', text: 'Rejected' },
    }
    const badge = badges[status] || { variant: 'secondary', text: status }
    return <Badge bg={badge.variant}>{badge.text}</Badge>
  }

  const getCategoryBadge = (category) => {
    const badges = {
      MARKETING: { variant: 'primary', text: 'Marketing' },
      UTILITY: { variant: 'info', text: 'Utility' },
      AUTHENTICATION: { variant: 'warning', text: 'Authentication' },
    }
    const badge = badges[category] || { variant: 'secondary', text: category }
    return <Badge bg={badge.variant}>{badge.text}</Badge>
  }

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <h2 className="mb-0 text-dark">
            <FontAwesomeIcon icon={faFileAlt} className="me-2" />
            Templates
          </h2>
          <p className="text-muted mb-0">Manage WhatsApp message templates</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Create Template
        </Button>
      </div>

      <Row>
        <Col xs={12}>
          <Card className="border-2 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Message Templates</h5>
            </Card.Header>
            <Card.Body>
              {templates.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faFileAlt} className="text-muted mb-3" size="3x" />
                  <p className="text-muted">No templates created yet</p>
                  <Button variant="primary" onClick={() => setShowModal(true)}>
                    Create Your First Template
                  </Button>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Language</th>
                      <th>Body Preview</th>
                      <th>Variables</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((template) => (
                      <tr key={template.id}>
                        <td>
                          <strong>{template.name}</strong>
                        </td>
                        <td>{getCategoryBadge(template.category)}</td>
                        <td>
                          <Badge bg="outline-secondary">{template.language.toUpperCase()}</Badge>
                        </td>
                        <td>
                          <small className="text-muted">
                            {template.body.length > 50 
                              ? template.body.substring(0, 50) + '...' 
                              : template.body}
                          </small>
                        </td>
                        <td>
                          {template.variables && template.variables.length > 0 ? (
                            <div className="d-flex gap-1 flex-wrap">
                              {template.variables.map((varName, idx) => (
                                <Badge key={idx} bg="outline-info" className="small">
                                  {varName}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>{getStatusBadge(template.status)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handlePreview(template)}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(template.id)}
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

      {/* Create Template Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Template</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Template Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter template name"
                  />
                </Form.Group>
              </Col>

              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Language <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    required
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3} className="mb-3">
                <Form.Group>
                  <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Message Body <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    required
                    placeholder="Enter message body. Use {{variable_name}} for variables."
                  />
                  <Form.Text className="text-muted">
                    Use double curly braces for variables, e.g., {'{{name}}'}, {'{{order_id}}'}
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Variables (comma-separated)</Form.Label>
                  <Form.Control
                    type="text"
                    name="variables"
                    value={formData.variables}
                    onChange={handleChange}
                    placeholder="name, order_id, otp"
                  />
                  <Form.Text className="text-muted">
                    List all variable names used in the template body
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
                  Creating...
                </>
              ) : (
                'Create Template'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Template Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {previewTemplate && (
            <div>
              <p><strong>Name:</strong> {previewTemplate.name}</p>
              <p><strong>Category:</strong> {getCategoryBadge(previewTemplate.category)}</p>
              <p><strong>Language:</strong> {previewTemplate.language.toUpperCase()}</p>
              <p><strong>Status:</strong> {getStatusBadge(previewTemplate.status)}</p>
              <hr />
              <p><strong>Body:</strong></p>
              <div className="p-3 bg-light rounded">
                {previewTemplate.body}
              </div>
              {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                <>
                  <p className="mt-3"><strong>Variables:</strong></p>
                  <div className="d-flex gap-1 flex-wrap">
                    {previewTemplate.variables.map((varName, idx) => (
                      <Badge key={idx} bg="info">{varName}</Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Templates

