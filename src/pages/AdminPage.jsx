import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminOverview from './admin/AdminOverview'
import AdminUsers from './admin/AdminUsers'
import AdminDraws from './admin/AdminDraws'
import AdminCharities from './admin/AdminCharities'
import AdminWinners from './admin/AdminWinners'

const AdminPage = () => {
  return (
    <Routes>
      <Route index element={<AdminOverview />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="draws" element={<AdminDraws />} />
      <Route path="charities" element={<AdminCharities />} />
      <Route path="winners" element={<AdminWinners />} />
    </Routes>
  )
}

export default AdminPage
