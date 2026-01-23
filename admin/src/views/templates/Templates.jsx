import React, { useState, useEffect } from 'react'
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
import templateService from '../../services/templateService'

// Keep mock data for initial state
const mockTemplates = [
  {
    id: 1,
    name: 'Welcome Message',
    language: 'en',
    category: 'MARKETING',
    body: 'Hello {{name}}, welcome to our service!',
    header_type: null,
    header_content: null,
    footer: null,
    buttons: null,
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
    header_type: null,
    header_content: null,
    footer: null,
    buttons: null,
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
    header_type: null,
    header_content: null,
    footer: null,
    buttons: null,
    status: 'DRAFT',
    variables: ['otp'],
    created_at: '2024-01-13T10:00:00Z',
  },
  {
    id: 4,
    name: 'Redmi Smartphone Mega Offer',
    language: 'en',
    category: 'MARKETING',
    header_type: 'IMAGE',
    header_content: 'https://rukminim2.flixcart.com/image/480/640/xif0q/mobile/i/g/x/note-14-5g-24094rad4i-mzb0i1pin-redmi-original-imahjpfhzeyawjw4.jpeg?q=90',
    body: `✨ Limited Time Deal on Redmi Smartphones! ✨

Upgrade your phone today with powerful performance + stylish design at an unbeatable price 💥

✅ Latest Redmi Models Available
✅ High Battery Backup 🔋
✅ Fast Processor ⚡
✅ Best Camera Quality 📸

🎁 Special Offer Price – Today Only!
💰 Easy EMI Available
🎉 Free Gifts on Selected Models

📍 Visit our shop or
📞 Call / WhatsApp us now: 9XXXXXXXXX

⏳ Hurry! Stock is limited`,
    footer: '---------------------------',
    buttons: [
      { type: 'URL', text: 'Visit Shop', url: 'https://example.com/shop' },
      { type: 'QUICK_REPLY', text: 'Interested' },
    ],
    status: 'APPROVED',
    variables: [],
    created_at: '2024-01-16T10:00:00Z',
  },
]

const Templates = () => {
  const { success: showSuccess, error: showError } = useToast()
  const [templates, setTemplates] = useState([])
  const [fetching, setFetching] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    language: 'en',
    category: 'MARKETING',
    header_type: '',
    header_content: '',
    body: '',
    footer: '',
    variables: '',
    status: 'DRAFT',
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setFetching(true)
      const response = await templateService.getTemplates()
      if (response.success) {
        setTemplates(response.data.data || response.data || [])
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch templates')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const variables = formData.variables 
        ? formData.variables.split(',').map(v => v.trim()).filter(v => v)
        : []
      
      const templateData = {
        name: formData.name,
        language: formData.language,
        category: formData.category,
        header_type: formData.header_type || null,
        header_content: formData.header_content || null,
        body: formData.body,
        footer: formData.footer || null,
        buttons: null, // Can be added later
        status: formData.status || 'DRAFT',
        variables: variables,
      }

      const response = await templateService.createTemplate(templateData)
      if (response.success) {
        showSuccess('Template created successfully')
        setShowModal(false)
        setFormData({ name: '', language: 'en', category: 'MARKETING', header_type: '', header_content: '', body: '', footer: '', variables: '', status: 'DRAFT' })
        fetchTemplates()
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create template')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = (template) => {
    setPreviewTemplate(template)
    setShowPreview(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        const response = await templateService.deleteTemplate(id)
        if (response.success) {
          showSuccess('Template deleted successfully')
          fetchTemplates()
        }
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to delete template')
      }
    }
  }

  const handleApprove = async (id) => {
    try {
      const response = await templateService.approveTemplate(id)
      if (response.success) {
        showSuccess('Template approved successfully')
        fetchTemplates()
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to approve template')
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
              {fetching ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-primary mb-3" size="3x" />
                  <p className="text-muted">Loading templates...</p>
                </div>
              ) : templates.length === 0 ? (
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
                      <th>Features</th>
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
                          <div className="d-flex gap-1 flex-wrap">
                            {template.header_type && (
                              <Badge bg="outline-primary" className="small" title={`Header: ${template.header_type}`}>
                                📷 {template.header_type}
                              </Badge>
                            )}
                            {template.footer && (
                              <Badge bg="outline-secondary" className="small" title="Has Footer">
                                Footer
                              </Badge>
                            )}
                            {template.buttons && template.buttons.length > 0 && (
                              <Badge bg="outline-success" className="small" title={`${template.buttons.length} button(s)`}>
                                🔘 {template.buttons.length}
                              </Badge>
                            )}
                            {!template.header_type && !template.footer && (!template.buttons || template.buttons.length === 0) && (
                              <span className="text-muted small">-</span>
                            )}
                          </div>
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
                            {template.status === 'DRAFT' || template.status === 'PENDING' ? (
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => handleApprove(template.id)}
                                title="Approve Template"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </Button>
                            ) : null}
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

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Header Type</Form.Label>
                  <Form.Select
                    name="header_type"
                    value={formData.header_type}
                    onChange={handleChange}
                  >
                    <option value="">None</option>
                    <option value="TEXT">Text</option>
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="DOCUMENT">Document</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Optional header for your template
                  </Form.Text>
                </Form.Group>
              </Col>

              {formData.header_type && (
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      Header Content {formData.header_type === 'TEXT' ? '(Text)' : '(URL)'}
                    </Form.Label>
                    <Form.Control
                      type={formData.header_type === 'TEXT' ? 'text' : 'url'}
                      name="header_content"
                      value={formData.header_content}
                      onChange={handleChange}
                      placeholder={
                        formData.header_type === 'TEXT'
                          ? 'Enter header text'
                          : 'Enter image/video/document URL'
                      }
                    />
                  </Form.Group>
                </Col>
              )}

              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Message Body <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    required
                    placeholder="Enter message body. Use {{variable_name}} for variables. Emojis are supported."
                  />
                  <Form.Text className="text-muted">
                    Use double curly braces for variables, e.g., {'{{name}}'}, {'{{order_id}}'}. You can use emojis and formatting.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Footer (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="footer"
                    value={formData.footer}
                    onChange={handleChange}
                    placeholder="Enter footer text (e.g., separator line, contact info)"
                  />
                  <Form.Text className="text-muted">
                    Footer text appears at the bottom of the message
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
              
              {/* Header Preview */}
              {previewTemplate.header_type && (
                <>
                  <p><strong>Header ({previewTemplate.header_type}):</strong></p>
                  {previewTemplate.header_type === 'IMAGE' || previewTemplate.header_type === 'VIDEO' ? (
                    <div className="mb-3">
                      <img
                        src={previewTemplate.header_content || 'https://via.placeholder.com/400x200?text=Header+Image'}
                        alt="Header"
                        className="img-fluid rounded"
                        style={{ maxHeight: '200px' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available'
                        }}
                      />
                      <small className="text-muted d-block mt-1">{previewTemplate.header_content}</small>
                    </div>
                  ) : previewTemplate.header_type === 'TEXT' ? (
                    <div className="p-2 bg-light rounded mb-3">
                      {previewTemplate.header_content}
                    </div>
                  ) : (
                    <div className="p-2 bg-light rounded mb-3">
                      <small>Document: {previewTemplate.header_content}</small>
                    </div>
                  )}
                </>
              )}

              {/* Body Preview */}
              <p><strong>Body:</strong></p>
              <div className="p-3 bg-light rounded mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                {previewTemplate.body}
              </div>

              {/* Footer Preview */}
              {previewTemplate.footer && (
                <>
                  <p><strong>Footer:</strong></p>
                  <div className="p-2 bg-light rounded mb-3">
                    {previewTemplate.footer}
                  </div>
                </>
              )}

              {/* Buttons Preview */}
              {previewTemplate.buttons && previewTemplate.buttons.length > 0 && (
                <>
                  <p><strong>Buttons:</strong></p>
                  <div className="d-flex gap-2 flex-wrap mb-3">
                    {previewTemplate.buttons.map((button, idx) => (
                      <Badge key={idx} bg="secondary">
                        {button.type}: {button.text}
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {/* Variables */}
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

