import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../components'
import businessProfileService from '../../services/businessProfileService'

const BusinessProfile = () => {
  const { success: showSuccess, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    business_name: '',
    whatsapp_business_id: '',
    app_id: '',
    phone_number_id: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setFetching(true)
      const response = await businessProfileService.getProfile()
      if (response.success && response.data) {
        setFormData({
          business_name: response.data.business_name || '',
          whatsapp_business_id: response.data.whatsapp_business_id || '',
          app_id: response.data.app_id || '',
          phone_number_id: response.data.phone_number_id || '',
        })
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch business profile')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await businessProfileService.updateProfile(formData)
      if (response.success) {
        showSuccess('Business profile updated successfully')
        fetchProfile()
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update business profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <h2 className="mb-0 text-dark">
            <FontAwesomeIcon icon={faBuilding} className="me-2" />
            Business Profile
          </h2>
          <p className="text-muted mb-0">Configure your WhatsApp Business account details</p>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="border-2 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Business Information</h5>
            </Card.Header>
            <Card.Body>
              {fetching ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-primary mb-3" size="3x" />
                  <p className="text-muted">Loading business profile...</p>
                </div>
              ) : (
                <>
                  <Alert variant="info" className="mb-4">
                    <strong>Note:</strong> This information is required to connect with WhatsApp Cloud API. 
                    You can find these details in your Meta Business Manager.
                  </Alert>

                  <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Business Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="business_name"
                        value={formData.business_name}
                        onChange={handleChange}
                        required
                        placeholder="Enter business name"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>WhatsApp Business ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="whatsapp_business_id"
                        value={formData.whatsapp_business_id}
                        onChange={handleChange}
                        placeholder="Enter WhatsApp Business ID"
                      />
                      <Form.Text className="text-muted">
                        Found in Meta Business Manager
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>App ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="app_id"
                        value={formData.app_id}
                        onChange={handleChange}
                        placeholder="Enter App ID"
                      />
                      <Form.Text className="text-muted">
                        Your WhatsApp Cloud API App ID
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Phone Number ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone_number_id"
                        value={formData.phone_number_id}
                        onChange={handleChange}
                        placeholder="Enter Phone Number ID"
                      />
                      <Form.Text className="text-muted">
                        The ID of the phone number you want to use for messaging
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </Form>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-2 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Information</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small">
                <strong>Business Profile</strong> stores your WhatsApp Business account configuration.
                This information is used to authenticate and connect with the WhatsApp Cloud API.
              </p>
              <hr />
              <p className="text-muted small mb-0">
                <strong>Where to find these details:</strong>
              </p>
              <ul className="text-muted small">
                <li>Meta Business Manager</li>
                <li>WhatsApp Cloud API Dashboard</li>
                <li>Your Meta Developer Account</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default BusinessProfile

