import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect, useCallback } from 'react'


function Navbar() {
  const location = useLocation()
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [dropdownFocusedIndex, setDropdownFocusedIndex] = useState(-1)
  const navRef = useRef(null)

  const navItems = [
    { path: 'masters-dropdown', label: 'Masters', hasDropdown: true, number: '1' },
    { path: 'inward-dropdown', label: 'Inward', hasDropdown: true, number: '2' },
    { path: 'outward-dropdown', label: 'Outward', hasDropdown: true, number: '3' },
    { path: 'reports-dropdown', label: 'Reports', hasDropdown: true, number: '4' },
    { path: 'gst-reports-dropdown', label: 'GST Reports', hasDropdown: true, number: '5' },
    { path: 'outstanding-dropdown', label: 'Outstanding', hasDropdown: true, number: '6' },
    { path: 'utilities-dropdown', label: 'Utilities', hasDropdown: true, number: '7' },
  ]

  const mastersDropdownItems = [
    { path: '/masters/category', label: 'Category Master', number: 'A' },
    { path: '/masters/unit', label: 'Unit Master', number: 'B' },
    { path: '/masters/group', label: 'Group Master', number: 'C' },
    { path: '/masters/part', label: 'Part Master', number: 'D' },
    { path: '/masters/customer', label: 'Customer Master', number: 'E' },
    { path: '/masters/tax', label: 'Tax Master', number: 'F' },
    { path: '/masters/process', label: 'Process Master', number: 'G' },
    { path: '/masters/hsn-sac', label: 'HSN/SAC Master', number: 'H' },
    { path: '/masters/state', label: 'State Master', number: 'I' },
  ]

  const inwardDropdownItems = [
    { path: '/inward/lc-challan', label: 'Inward Challan For L/C', number: 'A' },
    { path: '/inward/supplier-po', label: 'Supplier P.O. Entry', number: 'B' },
    { path: '/inward/against-po', label: 'Inward agst P.O.', number: 'C' },
    { path: '/inward/without-po', label: 'Inward W/o P.O.', number: 'D' },
    { path: '/inward/account-bill', label: 'Account Bill Passing', number: 'E' },
    { path: '/inward/purchase-voucher', label: 'Purchase Voucher Entry', number: 'F' },
  ]

  const outwardDropdownItems = [
    { path: '/outward/customer-po', label: 'Customer P.O. Entry', number: 'A' },
    { path: '/outward/challan', label: 'Outward Challan', number: 'B' },
    { path: '/outward/challan-wo-po', label: 'Outward Challan w/o PO', number: 'C' },
    { path: '/outward/challan-invoice', label: 'Challan Cum Invoice', number: 'D' },
    { path: '/outward/invoice-challan', label: 'Invoice Agst Challan', number: 'E' },
    { path: '/outward/gin-updations', label: 'GIN Updations', number: 'F' },
    { path: '/outward/customer-po-copy', label: 'Customer P.O. Copy', number: 'G' },
    { path: '/outward/invoice-chal-print', label: 'Invoice cum Chal Print', number: 'H' },
    { path: '/outward/invoice-printing', label: 'Invoice Printing agst Ch.', number: 'I' },
  ]

  const reportsDropdownItems = [
    { path: '/reports/customer-po-register', label: 'Customer P.O. Register', number: 'A' },
    { path: '/reports/invoice-register', label: 'Invoice Register', number: 'B' },
    { path: '/reports/challan-register', label: 'Challan Register', number: 'C' },
    { path: '/reports/inward-register', label: 'Inward Register', number: 'D' },
    { path: '/reports/labour-charge-reports', label: 'Labour Charge Reports', number: 'E' },
    { path: '/reports/labour-charge-ledger', label: 'Labour Charge Ledger', number: 'F' },
    { path: '/reports/pending-challans', label: 'Pending Challans', number: 'G' },
    { path: '/reports/purchase-register', label: 'Purchase Register', number: 'H' },
    { path: '/reports/tax-reports', label: 'Tax Reports', number: 'I' },
  ]

  const gstReportsDropdownItems = [
    { path: '/gst-reports/invoice-report', label: 'GST Invoice Report', number: 'A' },
    { path: '/gst-reports/purchase-report', label: 'GST Purchase Report', number: 'B' },
    { path: '/gst-reports/debit-note-report', label: 'GST Debit Note Report', number: 'C' },
    { path: '/gst-reports/credit-note-report', label: 'GST Credit Note Report', number: 'D' },
  ]

  const outstandingDropdownItems = [
    { path: '/outstanding/account-reason-master', label: 'Account Reason Master', number: 'A' },
    { path: '/outstanding/account-op-bal-entry', label: 'Account Op.Bal.Entry', number: 'B' },
    { path: '/outstanding/receipt-entry', label: 'Recipt Entry', number: 'C' },
    { path: '/outstanding/payment-entry', label: 'Payment Entry', number: 'D' },
    { path: '/outstanding/debit-note-entry', label: 'Debit Note ENtry', number: 'E' },
    { path: '/outstanding/credit-note-entry', label: 'Credit Note Entry', number: 'F' },
    { path: '/outstanding/receipt-register', label: 'Reciept Register', number: 'G' },
    { path: '/outstanding/payment-register', label: 'Payment Register', number: 'H' },
    { path: '/outstanding/outstanding-statements', label: 'Outstanding Statements', number: 'I' },
    { path: '/outstanding/ledger-printing', label: 'Ledger Printing', number: 'J' },
    { path: '/outstanding/ac-balance-updation', label: 'A/C Balance Updation', number: 'K' },
    { path: '/outstanding/debit-note-register', label: 'Debit Note Register', number: 'L' },
    { path: '/outstanding/credit-note-register', label: 'Credit Note Register', number: 'M' },
  ]

  const utilitiesDropdownItems = [
    { path: '/utilities/reindex', label: 'Reindex', number: 'A' },
    { path: '/utilities/company-setting', label: 'Company Setting', number: 'B' },
    { path: '/utilities/company-setting-1', label: 'Company Setting-1', number: 'C' },
    { path: '/utilities/parameters', label: 'Parameters', number: 'D' },
    { path: '/utilities/closing-bal-update', label: 'Closing Bal.Update', number: 'E' },
    { path: '/utilities/po-bal-updation', label: 'PO Bal.Updation', number: 'F' },
    { path: '/utilities/year-end-process', label: 'Year End Process', number: 'G' },
    { path: '/utilities/user-master', label: 'User Master', number: 'H' },
    { path: '/utilities/sale-transfer-tally', label: 'Sale Transfer-Tally', number: 'I' },
    { path: '/utilities/update-hsn-sac', label: 'Update HSN/SAC', number: 'J' },
  ]

  // Global keyboard navigation handler
  const handleGlobalKeyDown = useCallback((e) => {
    // Don't interfere with input fields, textareas, or when typing
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
      return
    }

    // Don't interfere with common keyboard shortcuts
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return
    }

    const currentDropdownItems = openDropdown === 'Masters' ? mastersDropdownItems :
      openDropdown === 'Inward' ? inwardDropdownItems :
        openDropdown === 'Outward' ? outwardDropdownItems :
          openDropdown === 'Reports' ? reportsDropdownItems :
            openDropdown === 'GST Reports' ? gstReportsDropdownItems :
              openDropdown === 'Outstanding' ? outstandingDropdownItems :
                openDropdown === 'Utilities' ? utilitiesDropdownItems : []

    switch (e.key) {
      // Main menu shortcuts (1-7) - works globally
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
        e.preventDefault()
        const menuIndex = parseInt(e.key) - 1
        if (menuIndex < navItems.length && navItems[menuIndex].hasDropdown) {
          const targetMenu = navItems[menuIndex]
          setOpenDropdown(targetMenu.label)
          setFocusedIndex(menuIndex)
          setDropdownFocusedIndex(0)
          // Scroll to navbar to make dropdown visible
          navRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        break

      // Dropdown item shortcuts (A-Z) - works globally when dropdown is open
      case 'A':
      case 'B':
      case 'C':
      case 'D':
      case 'E':
      case 'F':
      case 'G':
      case 'H':
      case 'I':
      case 'J':
      case 'K':
      case 'L':
      case 'M':
      case 'N':
      case 'O':
      case 'P':
      case 'Q':
      case 'R':
      case 'S':
      case 'T':
      case 'U':
      case 'V':
      case 'W':
      case 'X':
      case 'Y':
      case 'Z':
        if (openDropdown) {
          e.preventDefault()
          const pressedKey = e.key
          const selectedItem = currentDropdownItems.find(item => item.number === pressedKey)
          if (selectedItem) {
            window.location.href = selectedItem.path
            setOpenDropdown(null)
            setDropdownFocusedIndex(-1)
          }
        }
        break

      // Close dropdown with Escape
      case 'Escape':
        if (openDropdown) {
          e.preventDefault()
          setOpenDropdown(null)
          setDropdownFocusedIndex(-1)
          setFocusedIndex(-1)
        }
        break
    }
  }, [openDropdown, navItems.length])

  // Local navbar keyboard navigation (for arrow keys and focus management)
  const handleNavbarKeyDown = useCallback((e) => {
    const currentDropdownItems = openDropdown === 'Masters' ? mastersDropdownItems :
      openDropdown === 'Inward' ? inwardDropdownItems :
        openDropdown === 'Outward' ? outwardDropdownItems :
          openDropdown === 'Reports' ? reportsDropdownItems :
            openDropdown === 'GST Reports' ? gstReportsDropdownItems :
              openDropdown === 'Outstanding' ? outstandingDropdownItems :
                openDropdown === 'Utilities' ? utilitiesDropdownItems : []

    // Handle logo navigation
    if (e.target.getAttribute('aria-label') === 'Job Card System - Go to Home' && e.key === 'Enter') {
      e.preventDefault()
      window.location.href = '/'
      return
    }

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        if (openDropdown && dropdownFocusedIndex >= 0) {
          // Navigate within dropdown
          setDropdownFocusedIndex(prev => (prev + 1) % currentDropdownItems.length)
        } else {
          // Navigate between nav items
          setFocusedIndex(prev => (prev + 1) % navItems.length)
        }
        break
      case 'ArrowLeft':
        e.preventDefault()
        if (openDropdown && dropdownFocusedIndex >= 0) {
          // Navigate within dropdown
          setDropdownFocusedIndex(prev => prev <= 0 ? currentDropdownItems.length - 1 : prev - 1)
        } else {
          // Navigate between nav items
          setFocusedIndex(prev => prev <= 0 ? navItems.length - 1 : prev - 1)
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (openDropdown) {
          // Navigate within dropdown
          setDropdownFocusedIndex(prev => (prev + 1) % currentDropdownItems.length)
        } else if (focusedIndex >= 0 && navItems[focusedIndex].hasDropdown) {
          // Open dropdown and focus first item
          const currentItem = navItems[focusedIndex]
          setOpenDropdown(currentItem.label)
          setDropdownFocusedIndex(0)
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (openDropdown && dropdownFocusedIndex >= 0) {
          // Navigate within dropdown
          setDropdownFocusedIndex(prev => prev <= 0 ? currentDropdownItems.length - 1 : prev - 1)
        }
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (openDropdown && dropdownFocusedIndex >= 0) {
          // Navigate to focused dropdown item
          const selectedItem = currentDropdownItems[dropdownFocusedIndex]
          if (selectedItem) {
            window.location.href = selectedItem.path
            setOpenDropdown(null)
            setDropdownFocusedIndex(-1)
          }
        } else if (focusedIndex >= 0 && navItems[focusedIndex].hasDropdown) {
          // Toggle dropdown
          const currentItem = navItems[focusedIndex]
          setOpenDropdown(openDropdown === currentItem.label ? null : currentItem.label)
          setDropdownFocusedIndex(-1)
        }
        break
      case 'Tab':
        setFocusedIndex(-1)
        setDropdownFocusedIndex(-1)
        break
    }
  }, [focusedIndex, openDropdown, dropdownFocusedIndex, navItems.length])

  // Global keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [handleGlobalKeyDown])

  // Local navbar keyboard event listener
  useEffect(() => {
    const navElement = navRef.current
    if (navElement) {
      navElement.addEventListener('keydown', handleNavbarKeyDown)
      return () => navElement.removeEventListener('keydown', handleNavbarKeyDown)
    }
  }, [handleNavbarKeyDown])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null)
        setDropdownFocusedIndex(-1)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      <nav
        ref={navRef}
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e1e5e9',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
          padding: '0 2rem',
          position: 'fixed',      // Fix navbar
          top: 0,                // At the top
          left: 0,
          right: 0,
          zIndex: 10000,         // High z-index to overlay content
          marginBottom: '50px'
        }}
        role="navigation"
        aria-label="Main navigation"
      >

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Navigation Items */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>


            {navItems.map((item, index) => (
              <div key={item.path} style={{ position: 'relative' }}>
                {!item.hasDropdown ? (
                  <Link
                    to={item.path}
                    style={{
                      textDecoration: 'none',
                      color: location.pathname === item.path ? '#3498db' : '#5a6c7d',
                      fontWeight: location.pathname === item.path ? '500' : '400',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      backgroundColor: focusedIndex === index ? '#f8f9fa' : 'transparent',
                      border: focusedIndex === index ? '2px solid #3498db' : '2px solid transparent',
                      outline: 'none',
                      display: 'block',
                      cursor: 'pointer'
                    }}
                    tabIndex="0"
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(-1)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    onMouseLeave={() => setFocusedIndex(-1)}
                    role="menuitem"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    style={{
                      textDecoration: 'none',
                      color: '#5a6c7d',
                      fontWeight: '400',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      backgroundColor: focusedIndex === index ? '#f8f9fa' : 'transparent',
                      border: focusedIndex === index ? '2px solid #3498db' : '2px solid transparent',
                      outline: 'none',
                      display: 'block',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                    tabIndex="0"
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(-1)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    onMouseLeave={() => setFocusedIndex(-1)}
                    onClick={() => {
                      if (item.hasDropdown) {
                        setOpenDropdown(openDropdown === item.label ? null : item.label)
                      }
                    }}
                    role="menuitem"
                    aria-haspopup={item.hasDropdown ? 'true' : 'false'}
                    aria-expanded={item.hasDropdown && openDropdown === item.label ? 'true' : 'false'}
                  >
                    <span style={{
                      fontWeight: 'bold',
                      color: '#3498db',
                      marginRight: '0.5rem',
                      fontSize: '0.8rem'
                    }}>
                      {item.number}.
                    </span>
                    {item.label}
                  </button>
                )}

                {/* Dropdown for all navigation items */}
                {item.hasDropdown && openDropdown === item.label && (() => {
                  const currentDropdownItems = item.label === 'Masters' ? mastersDropdownItems :
                    item.label === 'Inward' ? inwardDropdownItems :
                      item.label === 'Outward' ? outwardDropdownItems :
                        item.label === 'Reports' ? reportsDropdownItems :
                          item.label === 'GST Reports' ? gstReportsDropdownItems :
                            item.label === 'Outstanding' ? outstandingDropdownItems :
                              item.label === 'Utilities' ? utilitiesDropdownItems : []
                  return (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e1e5e9',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      minWidth: '280px',
                      zIndex: 1000,
                      padding: '0.25rem 0'
                    }}
                      role="menu"
                    >
                      {currentDropdownItems.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.path}
                          to={dropdownItem.path}
                          style={{
                            display: 'block',
                            padding: '0.5rem 1rem',
                            textDecoration: 'none',
                            color: '#5a6c7d',
                            fontSize: '0.9rem',
                            transition: 'background-color 0.2s ease',
                            backgroundColor: dropdownFocusedIndex === currentDropdownItems.indexOf(dropdownItem) ? '#f8f9fa' : 'transparent',
                            border: dropdownFocusedIndex === currentDropdownItems.indexOf(dropdownItem) ? '2px solid #3498db' : '2px solid transparent',
                            borderRadius: '4px',
                            margin: '0 0.125rem'
                          }}
                          onMouseEnter={e => {
                            e.target.style.backgroundColor = '#f8f9fa'
                          }}
                          onMouseLeave={e => {
                            if (dropdownFocusedIndex !== currentDropdownItems.indexOf(dropdownItem)) {
                              e.target.style.backgroundColor = 'transparent'
                            }
                          }}
                          role="menuitem"
                        >
                          <span style={{
                            fontWeight: 'bold',
                            color: '#3498db',
                            marginRight: '0.5rem',
                            minWidth: '1.5rem',
                            display: 'inline-block'
                          }}>
                            {dropdownItem.number}.
                          </span>
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  )
                })()}
              </div>
            ))}
          </div>

          {/* Logo/Brand */}
          <Link
            to="/"
            style={{
              fontWeight: '600',
              fontSize: '1.25rem',
              color: '#2c3e50',
              cursor: 'pointer',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              outline: 'none',
              display: 'block'
            }}
            tabIndex="0"
            role="banner"
            aria-label="Job Card System - Go to Home"
            onFocus={(e) => {
              e.target.style.backgroundColor = '#f8f9fa'
              e.target.style.border = '2px solid #3498db'
              e.target.style.boxShadow = '0 2px 4px rgba(52, 152, 219, 0.2)'
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.border = '2px solid transparent'
              e.target.style.boxShadow = 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8f9fa'
              e.target.style.border = '2px solid #3498db'
              e.target.style.boxShadow = '0 2px 4px rgba(52, 152, 219, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.border = '2px solid transparent'
              e.target.style.boxShadow = 'none'
            }}
            title="Go to Home Page (Press Enter when focused)"
          >
            🏢 Job Card
          </Link>
        </div>
      </nav>

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          backgroundColor: '#3498db',
          color: 'white',
          padding: '0.5rem',
          textDecoration: 'none',
          zIndex: 9999
        }}
        onFocus={e => {
          e.target.style.left = '0'
        }}
        onBlur={e => {
          e.target.style.left = '-9999px'
        }}
      >
        Skip to main content
      </a>
    </>
  )
}


export default Navbar
