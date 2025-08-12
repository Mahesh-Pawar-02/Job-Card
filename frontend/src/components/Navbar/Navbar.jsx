import React, { useState } from 'react'
import './Navbar.css'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const handleMouseEnter = (dropdown) => {
    setActiveDropdown(dropdown)
  }

  const handleMouseLeave = () => {
    setActiveDropdown(null)
  }

  const mastersItems = [
    { name: 'Customers', icon: 'fas fa-users' },
    { name: 'Part Master', icon: 'fas fa-tags' },
    { name: 'Process Master', icon: 'fas fa-cogs' },
    { name: 'Unit Master', icon: 'fas fa-scale-balanced' },
    { name: 'Tax Master', icon: 'fas fa-chart-bar' },
    { name: 'HSN Master', icon: 'fas fa-scale-balanced' },
    { name: 'State Master', icon: 'fas fa-flag-usa' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand">
          <h1 className="brand-text">Jyoti heat Treatment Pvt. Ltd.</h1>
        </div>

        {/* Desktop Menu */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-nav">
            {/* Masters Dropdown */}
            <li 
              className="nav-item dropdown"
              onMouseEnter={() => handleMouseEnter('masters')}
              onMouseLeave={handleMouseLeave}
            >
              <button 
                className="nav-link dropdown-toggle"
                onClick={() => toggleDropdown('masters')}
              >
                <i className="fas fa-database"></i>
                Masters
                {/* <i className="fas fa-chevron-down dropdown-arrow"></i> */}
              </button>
              <ul className={`dropdown-menu ${activeDropdown === 'masters' ? 'show' : ''}`}>
                {mastersItems.map((item, index) => (
                  <li key={index}>
                    <a href="#" className="dropdown-item">
                      <i className={item.icon}></i>
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </li>

            {/* Inward */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="fas fa-sign-in-alt"></i>
                Inward
              </a>
            </li>

            {/* Outward */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="fas fa-sign-out-alt"></i>
                Outward
              </a>
            </li>

            {/* Job Card */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="fas fa-clipboard-list"></i>
                Job Card
              </a>
            </li>

            {/* GST Reports */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="fas fa-chart-bar"></i>
                GST Reports
              </a>
            </li>

            {/* Outstanding */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="fas fa-clock"></i>
                Outstanding
              </a>
            </li>

            {/* Utilities */}
            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="fas fa-tools"></i>
                Utilities
              </a>
            </li>
          </ul>
        </div>

        {/* Mobile Menu Button */}
        <div className="navbar-toggle" onClick={toggleMenu}>
          <div className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
