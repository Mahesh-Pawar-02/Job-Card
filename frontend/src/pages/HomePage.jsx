function HomePage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', margin: "5rem 1rem" }}>
      <h1 style={{ color: '#333', marginBottom: '1rem' }}>
        Welcome to Job Card System
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
        This is a comprehensive job card management system. Use the navigation above to access different modules.
      </p>
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', maxWidth: '500px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '1rem', color: '#495057' }}>Available Modules:</h3>
        <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e9ecef' }}>
            <strong>Party Master:</strong> Manage party information, vendor codes, and contact details
          </li>
          <li style={{ padding: '0.5rem 0', color: '#6c757d' }}>
            <strong>More modules coming soon...</strong>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default HomePage
