import React from 'react'
import { Container } from 'react-bootstrap'

const Dashboard = () => {
  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <h2 className="mb-0 text-dark">Dashboard</h2>
          <p className="text-muted mb-0">WhatsApp Bulk Message Sender Overview</p>
        </div>
      </div>
      
      <div className="text-center py-5">
        <p className="text-muted">Dashboard content will be added here</p>
      </div>
    </Container>
  )
}

export default Dashboard
