import ProtectedRoute from '@/components/ProtectedRoute'

export default function ApplicationLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
