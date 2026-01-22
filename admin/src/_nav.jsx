import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilPeople,
  cilCog,
  cilLockLocked,
  cilBuilding,
  cilPhone,
  cilUser,
  cilFile,
  cilBullhorn,
  cilEnvelopeOpen,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'
import { PERMISSIONS } from './constants/permissions'

const _nav = [
  {
    component: CNavTitle,
    name: 'Main',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    permission: PERMISSIONS.DASHBOARD_READ,
  },
  {
    component: CNavTitle,
    name: 'WhatsApp Management',
  },
  {
    component: CNavItem,
    name: 'Business Profile',
    to: '/business-profile',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'WhatsApp Numbers',
    to: '/whatsapp-numbers',
    icon: <CIcon icon={cilPhone} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Contacts',
    to: '/contacts',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Templates',
    to: '/templates',
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Campaigns',
    to: '/campaigns',
    icon: <CIcon icon={cilBullhorn} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Message Logs',
    to: '/message-logs',
    icon: <CIcon icon={cilEnvelopeOpen} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'System',
  },
  {
    component: CNavItem,
    name: 'Users',
    to: '/users',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    permission: PERMISSIONS.USER_READ,
  },
  {
    component: CNavItem,
    name: 'Roles & Permissions',
    to: '/roles',
    icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
    permission: PERMISSIONS.ROLE_READ,
  },
  {
    component: CNavItem,
    name: 'Settings',
    to: '/settings',
    icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
    permission: PERMISSIONS.SETTINGS_READ,
  },
]

export default _nav