import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, InputGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUsers,
  faPlus,
  faEdit,
  faTrash,
  faUpload,
  faSearch,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../components'
import contactService from '../../services/contactService'

const Contacts = () => {
  const { success: showSuccess, error: showError } = useToast()
  const [contacts, setContacts] = useState([])
  const [fetching, setFetching] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    email: '',
    notes: '',
    is_active: true,
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setFetching(true)
      const response = await contactService.getContacts({ is_active: true })
      if (response.success) {
        setContacts(response.data.data || response.data || [])
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch contacts')
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
      const response = await contactService.createContact(formData)
      if (response.success) {
        showSuccess('Contact added successfully')
        setShowModal(false)
        setFormData({ name: '', mobile_number: '', email: '', notes: '', is_active: true })
        fetchContacts()
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add contact')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await contactService.updateContact(id, {
        is_active: !currentStatus
      })
      if (response.success) {
        showSuccess('Status updated successfully')
        fetchContacts()
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update status')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const response = await contactService.deleteContact(id)
        if (response.success) {
          showSuccess('Contact deleted successfully')
          fetchContacts()
        }
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to delete contact')
      }
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.mobile_number.includes(searchTerm) ||
    (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <h2 className="mb-0 text-dark">
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Contacts
          </h2>
          <p className="text-muted mb-0">Manage your contact list for bulk messaging</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary">
            <FontAwesomeIcon icon={faUpload} className="me-2" />
            Import CSV
          </Button>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <Row>
        <Col xs={12}>
          <Card className="border-2 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <Row className="align-items-center">
                <Col>
                  <h5 className="mb-0">Contact List</h5>
                </Col>
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              {fetching ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-primary mb-3" size="3x" />
                  <p className="text-muted">Loading contacts...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faUsers} className="text-muted mb-3" size="3x" />
                  <p className="text-muted">
                    {searchTerm ? 'No contacts found matching your search' : 'No contacts added yet'}
                  </p>
                  {!searchTerm && (
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                      Add Your First Contact
                    </Button>
                  )}
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Mobile Number</th>
                      <th>Email</th>
                      <th>Notes</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id}>
                        <td>
                          <strong>{contact.name}</strong>
                        </td>
                        <td>
                          <code>{contact.mobile_number}</code>
                        </td>
                        <td>{contact.email || '-'}</td>
                        <td>
                          <small className="text-muted">{contact.notes || '-'}</small>
                        </td>
                        <td>
                          <Badge bg={contact.is_active ? 'success' : 'secondary'}>
                            {contact.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleToggleStatus(contact.id, contact.is_active)}
                            >
                              {contact.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(contact.id)}
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
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Contact</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter contact name"
                  />
                </Form.Group>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Mobile Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleChange}
                    required
                    placeholder="+1234567890"
                  />
                </Form.Group>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@example.com"
                  />
                </Form.Group>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Additional notes about this contact"
                  />
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
                'Add Contact'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}

export default Contacts

