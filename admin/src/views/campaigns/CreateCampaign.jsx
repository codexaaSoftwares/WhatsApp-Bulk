import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Table } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBullhorn,
  faArrowLeft,
  faSpinner,
  faCheckCircle,
  faUsers,
  faFileAlt,
  faPhone,
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../components'
import whatsappNumberService from '../../services/whatsappNumberService'
import templateService from '../../services/templateService'
import contactService from '../../services/contactService'
import campaignService from '../../services/campaignService'

// Keep mock data for initial state (will be replaced by API)
const mockWhatsAppNumbers = [
  {
    id: 1,
    phone_number_id: '1234567890',
    phone_number: '+1234567890',
    display_name: 'Main Business Number',
    is_active: true,
  },
  {
    id: 2,
    phone_number_id: '0987654321',
    phone_number: '+0987654321',
    display_name: 'Support Number',
    is_active: true,
  },
]

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
  },
  {
    id: 2,
    name: 'Order Confirmation',
    language: 'en',
    category: 'UTILITY',
    body: 'Your order #{{order_id}} has been confirmed. Total: {{amount}}',
    header_type: null,
    header_content: null,
    footer: null,
    buttons: null,
    status: 'APPROVED',
    variables: ['order_id', 'amount'],
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
    status: 'APPROVED',
    variables: ['otp'],
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
  },
]

const mockContacts = [
  {
    id: 1,
    name: 'John Doe',
    mobile_number: '+1234567890',
    email: 'john@example.com',
    is_active: true,
  },
  {
    id: 2,
    name: 'Jane Smith',
    mobile_number: '+0987654321',
    email: 'jane@example.com',
    is_active: true,
  },
  {
    id: 3,
    name: 'Bob Johnson',
    mobile_number: '+1122334455',
    email: null,
    is_active: true,
  },
  {
    id: 4,
    name: 'Alice Williams',
    mobile_number: '+5566778899',
    email: 'alice@example.com',
    is_active: true,
  },
  {
    id: 5,
    name: 'Charlie Brown',
    mobile_number: '+9988776655',
    email: null,
    is_active: true,
  },
]

const CreateCampaign = () => {
  const navigate = useNavigate()
  const { success: showSuccess, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [step, setStep] = useState(1) // 1: Basic Info, 2: Select Contacts, 3: Variables, 4: Review
  const [formData, setFormData] = useState({
    name: '',
    whatsapp_number_id: '',
    template_id: '',
    contact_ids: [],
    variable_values: {}, // { contact_id: { variable_name: value } }
  })
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [whatsappNumbers, setWhatsappNumbers] = useState([])
  const [templates, setTemplates] = useState([])
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setFetching(true)
      
      // Fetch WhatsApp numbers
      const numbersResponse = await whatsappNumberService.getNumbers({ is_active: true })
      if (numbersResponse.success) {
        setWhatsappNumbers(numbersResponse.data.data || numbersResponse.data || [])
      }

      // Fetch approved templates only
      const templatesResponse = await templateService.getTemplates({ status: 'APPROVED', approved_only: true })
      if (templatesResponse.success) {
        setTemplates(templatesResponse.data.data || templatesResponse.data || [])
      }

      // Fetch active contacts
      const contactsResponse = await contactService.getContacts({ is_active: true })
      if (contactsResponse.success) {
        setContacts(contactsResponse.data.data || contactsResponse.data || [])
      }
    } catch (error) {
      showError('Failed to load data. Please refresh the page.')
    } finally {
      setFetching(false)
    }
  }

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.mobile_number.includes(searchTerm)
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // When template is selected, update selectedTemplate
    if (name === 'template_id') {
      const template = templates.find(t => t.id === parseInt(value))
      setSelectedTemplate(template || null)
      // Initialize variable values for all selected contacts
      if (template && formData.contact_ids.length > 0) {
        const newVariableValues = {}
        formData.contact_ids.forEach(contactId => {
          newVariableValues[contactId] = {}
          if (template.variables && Array.isArray(template.variables)) {
            template.variables.forEach(variable => {
              newVariableValues[contactId][variable] = ''
            })
          }
        })
        setFormData(prev => ({ ...prev, variable_values: newVariableValues }))
      }
    }
  }

  const handleContactToggle = (contactId) => {
    setFormData(prev => {
      const isSelected = prev.contact_ids.includes(contactId)
      let newContactIds
      let newVariableValues = { ...prev.variable_values }

      if (isSelected) {
        // Remove contact
        newContactIds = prev.contact_ids.filter(id => id !== contactId)
        delete newVariableValues[contactId]
      } else {
        // Add contact
        newContactIds = [...prev.contact_ids, contactId]
        // Initialize variable values for this contact
        if (selectedTemplate && selectedTemplate.variables && Array.isArray(selectedTemplate.variables)) {
          newVariableValues[contactId] = {}
          selectedTemplate.variables.forEach(variable => {
            newVariableValues[contactId][variable] = ''
          })
        }
      }

      return {
        ...prev,
        contact_ids: newContactIds,
        variable_values: newVariableValues,
      }
    })
  }

  const handleVariableChange = (contactId, variableName, value) => {
    setFormData(prev => ({
      ...prev,
      variable_values: {
        ...prev.variable_values,
        [contactId]: {
          ...prev.variable_values[contactId],
          [variableName]: value,
        },
      },
    }))
  }

  const handleSelectAll = () => {
    const allIds = filteredContacts.map(c => c.id)
    const allSelected = allIds.every(id => formData.contact_ids.includes(id))
    
    if (allSelected) {
      // Deselect all
      setFormData(prev => ({
        ...prev,
        contact_ids: [],
        variable_values: {},
      }))
    } else {
      // Select all filtered
      const newVariableValues = {}
      allIds.forEach(contactId => {
        if (selectedTemplate) {
          newVariableValues[contactId] = {}
          selectedTemplate.variables.forEach(variable => {
            newVariableValues[contactId][variable] = ''
          })
        }
      })
      setFormData(prev => ({
        ...prev,
        contact_ids: allIds,
        variable_values: newVariableValues,
      }))
    }
  }

  const validateStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.whatsapp_number_id || !formData.template_id) {
        showError('Please fill in all required fields')
        return false
      }
      if (!selectedTemplate || selectedTemplate.status !== 'APPROVED') {
        showError('Please select an approved template')
        return false
      }
    } else if (step === 2) {
      if (formData.contact_ids.length === 0) {
        showError('Please select at least one contact')
        return false
      }
    } else if (step === 3) {
      // Validate all variable values are filled
      if (selectedTemplate && selectedTemplate.variables && Array.isArray(selectedTemplate.variables)) {
        for (const contactId of formData.contact_ids) {
          const contact = contacts.find(c => c.id === contactId)
          if (!contact) continue
          
          for (const variable of selectedTemplate.variables) {
            const value = formData.variable_values[contactId]?.[variable]
            if (!value || value.trim() === '') {
              showError(`Please fill in ${variable} for ${contact.name}`)
              return false
            }
          }
        }
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      if (step < 4) {
        setStep(step + 1)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep()) return

    setLoading(true)
    
    try {
      const campaignData = {
        name: formData.name,
        whatsapp_number_id: parseInt(formData.whatsapp_number_id),
        template_id: parseInt(formData.template_id),
        contact_ids: formData.contact_ids.map(id => parseInt(id)),
        variable_values: formData.variable_values,
      }

      const response = await campaignService.createCampaign(campaignData)
      if (response.success) {
        showSuccess('Campaign created successfully!')
        navigate('/campaigns')
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-bottom">
        <h5 className="mb-0">Basic Information</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={12} className="mb-3">
            <Form.Group>
              <Form.Label>Campaign Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter campaign name"
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>
                <FontAwesomeIcon icon={faPhone} className="me-2" />
                WhatsApp Number <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="whatsapp_number_id"
                value={formData.whatsapp_number_id}
                onChange={handleChange}
                required
                disabled={fetching}
              >
                <option value="">Select WhatsApp Number</option>
                {whatsappNumbers.map(number => (
                  <option key={number.id} value={number.id}>
                    {number.display_name || number.phone_number} ({number.phone_number})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>
                <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                Template <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="template_id"
                value={formData.template_id}
                onChange={handleChange}
                required
                disabled={fetching}
              >
                <option value="">Select Template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </option>
                ))}
              </Form.Select>
              {templates.length === 0 && !fetching && (
                <Form.Text className="text-danger">
                  No approved templates available. Please create and approve a template first.
                </Form.Text>
              )}
            </Form.Group>
          </Col>

          {selectedTemplate && (
            <Col md={12} className="mb-3">
              <Alert variant="info">
                <div className="mb-2">
                  <strong>Selected Template:</strong> {selectedTemplate.name}
                </div>
                
                {/* Header Preview */}
                {selectedTemplate.header_type && (
                  <div className="mb-2">
                    <strong>Header ({selectedTemplate.header_type}):</strong>
                    {selectedTemplate.header_type === 'IMAGE' || selectedTemplate.header_type === 'VIDEO' ? (
                      <div className="mt-1">
                        <img
                          src={selectedTemplate.header_content || 'https://via.placeholder.com/400x200?text=Header+Image'}
                          alt="Header"
                          className="img-fluid rounded"
                          style={{ maxHeight: '150px' }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available'
                          }}
                        />
                      </div>
                    ) : selectedTemplate.header_type === 'TEXT' ? (
                      <div className="p-2 bg-white rounded mt-1">
                        {selectedTemplate.header_content}
                      </div>
                    ) : (
                      <div className="p-2 bg-white rounded mt-1">
                        <small>Document: {selectedTemplate.header_content}</small>
                      </div>
                    )}
                  </div>
                )}

                {/* Body Preview */}
                <div className="mb-2">
                  <strong>Body:</strong>
                  <div className="p-2 bg-white rounded mt-1" style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
                    {selectedTemplate.body}
                  </div>
                </div>

                {/* Footer Preview */}
                {selectedTemplate.footer && (
                  <div className="mb-2">
                    <strong>Footer:</strong>
                    <div className="p-2 bg-white rounded mt-1">
                      {selectedTemplate.footer}
                    </div>
                  </div>
                )}

                {/* Buttons Preview */}
                {selectedTemplate.buttons && selectedTemplate.buttons.length > 0 && (
                  <div className="mb-2">
                    <strong>Buttons:</strong>
                    <div className="d-flex gap-1 flex-wrap mt-1">
                      {selectedTemplate.buttons.map((button, idx) => (
                        <Badge key={idx} bg="primary">
                          {button.text}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variables */}
                {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                  <div>
                    <strong>Variables:</strong>{' '}
                    {selectedTemplate.variables.map((v, idx) => (
                      <Badge key={idx} bg="secondary" className="me-1">
                        {v}
                      </Badge>
                    ))}
                  </div>
                )}
              </Alert>
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  )

  const renderStep2 = () => (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Select Contacts ({formData.contact_ids.length} selected)
          </h5>
          <Button variant="outline-primary" size="sm" onClick={handleSelectAll}>
            {filteredContacts.every(c => formData.contact_ids.includes(c.id)) ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search contacts by name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>

        <Table responsive hover>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>
                <Form.Check
                  checked={filteredContacts.length > 0 && filteredContacts.every(c => formData.contact_ids.includes(c.id))}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Name</th>
              <th>Mobile Number</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-primary me-2" />
                  Loading contacts...
                </td>
              </tr>
            ) : filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted py-4">
                  {searchTerm ? 'No contacts found matching your search' : 'No contacts available. Please add contacts first.'}
                </td>
              </tr>
            ) : (
              filteredContacts.map(contact => (
                <tr key={contact.id}>
                  <td>
                    <Form.Check
                      checked={formData.contact_ids.includes(contact.id)}
                      onChange={() => handleContactToggle(contact.id)}
                    />
                  </td>
                  <td>{contact.name}</td>
                  <td>{contact.mobile_number}</td>
                  <td>{contact.email || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )

  const renderStep3 = () => {
    if (!selectedTemplate || !selectedTemplate.variables || selectedTemplate.variables.length === 0) {
      return (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <p className="text-muted">No variables to fill. You can proceed to review.</p>
          </Card.Body>
        </Card>
      )
    }

    return (
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0">Fill Template Variables</h5>
        </Card.Header>
        <Card.Body>
            {formData.contact_ids.map(contactId => {
            const contact = contacts.find(c => c.id === contactId)
            if (!contact) return null

            return (
              <Card key={contactId} className="mb-3 border">
                <Card.Header className="bg-light">
                  <strong>{contact.name}</strong> ({contact.mobile_number})
                </Card.Header>
                <Card.Body>
                  <Row>
                    {selectedTemplate.variables && Array.isArray(selectedTemplate.variables) && selectedTemplate.variables.map(variable => (
                      <Col md={6} key={variable} className="mb-3">
                        <Form.Group>
                          <Form.Label>
                            {variable} <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.variable_values[contactId]?.[variable] || ''}
                            onChange={(e) => handleVariableChange(contactId, variable, e.target.value)}
                            required
                            placeholder={`Enter ${variable}`}
                          />
                        </Form.Group>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            )
          })}
        </Card.Body>
      </Card>
    )
  }

  const renderStep4 = () => {
    const selectedNumber = whatsappNumbers.find(n => n.id === parseInt(formData.whatsapp_number_id))
    const selectedContacts = contacts.filter(c => formData.contact_ids.includes(c.id))

    return (
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0">Review Campaign</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3">
              <strong>Campaign Name:</strong>
              <p>{formData.name}</p>
            </Col>
            <Col md={6} className="mb-3">
              <strong>WhatsApp Number:</strong>
              <p>{selectedNumber?.display_name} ({selectedNumber?.phone_number})</p>
            </Col>
            <Col md={6} className="mb-3">
              <strong>Template:</strong>
              <p>{selectedTemplate?.name}</p>
            </Col>
            <Col md={6} className="mb-3">
              <strong>Total Recipients:</strong>
              <p>{formData.contact_ids.length} contacts</p>
            </Col>
            <Col md={12} className="mb-3">
              <strong>Template Preview:</strong>
              <div className="p-3 bg-light rounded border">
                {/* Header */}
                {selectedTemplate?.header_type && (
                  <div className="mb-3">
                    {selectedTemplate.header_type === 'IMAGE' || selectedTemplate.header_type === 'VIDEO' ? (
                      <img
                        src={selectedTemplate.header_content || 'https://via.placeholder.com/400x200?text=Header+Image'}
                        alt="Header"
                        className="img-fluid rounded"
                        style={{ maxHeight: '200px' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available'
                        }}
                      />
                    ) : selectedTemplate.header_type === 'TEXT' ? (
                      <div className="p-2 bg-white rounded">
                        <strong>{selectedTemplate.header_content}</strong>
                      </div>
                    ) : (
                      <div className="p-2 bg-white rounded">
                        <small>📄 Document: {selectedTemplate.header_content}</small>
                      </div>
                    )}
                  </div>
                )}

                {/* Body */}
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedTemplate?.body}
                </div>

                {/* Footer */}
                {selectedTemplate?.footer && (
                  <div className="mt-3 pt-3 border-top">
                    <small className="text-muted">{selectedTemplate.footer}</small>
                  </div>
                )}

                {/* Buttons */}
                {selectedTemplate?.buttons && selectedTemplate.buttons.length > 0 && (
                  <div className="mt-3 pt-3 border-top">
                    <div className="d-flex gap-2 flex-wrap">
                      {selectedTemplate.buttons.map((button, idx) => (
                        <Button key={idx} variant="outline-primary" size="sm">
                          {button.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Col>
            <Col md={12} className="mb-3">
              <strong>Selected Contacts:</strong>
              <Table responsive size="sm" className="mt-2">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    {selectedTemplate?.variables && Array.isArray(selectedTemplate.variables) && selectedTemplate.variables.map(v => (
                      <th key={v}>{v}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedContacts.map(contact => (
                    <tr key={contact.id}>
                      <td>{contact.name}</td>
                      <td>{contact.mobile_number}</td>
                      {selectedTemplate?.variables && Array.isArray(selectedTemplate.variables) && selectedTemplate.variables.map(variable => (
                        <td key={variable}>
                          {formData.variable_values[contact.id]?.[variable] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card.Body>
      </Card>
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
            Create Campaign
          </h2>
          <p className="text-muted mb-0">Create a new WhatsApp messaging campaign</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="d-flex align-items-center flex-fill">
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center ${
                    step >= s ? 'bg-primary text-white' : 'bg-light text-muted'
                  }`}
                  style={{ width: '40px', height: '40px', fontWeight: 'bold' }}
                >
                  {step > s ? <FontAwesomeIcon icon={faCheckCircle} /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-fill mx-2 ${
                      step > s ? 'border-top border-primary' : 'border-top border-light'
                    }`}
                    style={{ height: '2px' }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-between mt-2">
            <small className="text-muted">Basic Info</small>
            <small className="text-muted">Select Contacts</small>
            <small className="text-muted">Variables</small>
            <small className="text-muted">Review</small>
          </div>
        </Col>
      </Row>

      {/* Step Content */}
      <Row>
        <Col xs={12}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </Col>
      </Row>

      {/* Navigation Buttons */}
      <Row className="mt-4">
        <Col xs={12} className="d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>
          {step < 4 ? (
            <Button variant="primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                  Creating...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Create Campaign
                </>
              )}
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default CreateCampaign

