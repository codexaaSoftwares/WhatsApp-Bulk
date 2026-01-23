import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CSpinner } from '@coreui/react'

// Import components
const Dashboard = React.lazy(() => import('../../views/dashboard/Dashboard'))

// WhatsApp Management Components
const BusinessProfile = React.lazy(() => import('../../views/businessProfile/BusinessProfile'))
const WhatsAppNumbers = React.lazy(() => import('../../views/whatsappNumbers/WhatsAppNumbers'))
const Contacts = React.lazy(() => import('../../views/contacts/Contacts'))
const Templates = React.lazy(() => import('../../views/templates/Templates'))
const Campaigns = React.lazy(() => import('../../views/campaigns/Campaigns'))
const CreateCampaign = React.lazy(() => import('../../views/campaigns/CreateCampaign'))
const ViewCampaign = React.lazy(() => import('../../views/campaigns/ViewCampaign'))
const MessageLogs = React.lazy(() => import('../../views/messageLogs/MessageLogs'))

// User Management Components
const UsersList = React.lazy(() => import('../../views/users/UsersList'))
const Profile = React.lazy(() => import('../../views/users/Profile'))
const RolesList = React.lazy(() => import('../../views/roles/RolesList'))

// Settings Components
const Settings = React.lazy(() => import('../../views/settings/Settings'))

import PermissionRoute from './PermissionRoute'
import { PERMISSIONS } from '../../constants/permissions'

const AppContent = () => {
  return (
    <div className="app-content">
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.DASHBOARD_READ} showAccessDenied>
                <Dashboard />
              </PermissionRoute>
            }
          />
          
          {/* WhatsApp Management Routes - No permissions for now */}
          <Route path="/business-profile" element={<BusinessProfile />} />
          <Route path="/whatsapp-numbers" element={<WhatsAppNumbers />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/create" element={<CreateCampaign />} />
          <Route path="/campaigns/:id" element={<ViewCampaign />} />
          <Route path="/message-logs" element={<MessageLogs />} />
          <Route path="/compose" element={<CreateCampaign />} />
          
          {/* User Management Routes */}
          <Route
            path="/users"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.USER_READ} showAccessDenied>
                <UsersList />
              </PermissionRoute>
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/roles"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.ROLE_READ} showAccessDenied>
                <RolesList />
              </PermissionRoute>
            }
          />
          
          {/* Settings Routes */}
          <Route
            path="/settings"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.SETTINGS_READ} showAccessDenied>
                <Settings />
              </PermissionRoute>
            }
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default React.memo(AppContent)

