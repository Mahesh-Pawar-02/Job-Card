import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/party-master', label: 'Party Master' },
  ]

  return (
    <nav style={{
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e9ecef',
      padding: '0 1rem',
      marginBottom: '1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        height: '60px'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
          Job Card System
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: 'none',
                color: location.pathname === item.path ? '#007bff' : '#6c757d',
                fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
