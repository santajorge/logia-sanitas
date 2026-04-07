'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function NavbarPublico() {
  const [hoveredLink, setHoveredLink] = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(false)

  const linkStyle = (id) => ({
    fontSize: '12px',
    color: hoveredLink === id ? '#CDA434' : '#9e9b8e',
    textDecoration: 'none',
    transition: 'color 0.2s',
    cursor: 'pointer',
    padding: '0.5rem 0',
  })

  return (
    <nav style={{
      backgroundColor: '#1C1C1C',
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '2px solid #CDA434'
    }}>

      {/* Logo + nombre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Image
          src="/logo-sanitas.png"
          alt="Logo Logia Sanitas Sanitatum"
          width={40}
          height={40}
          style={{ objectFit: 'contain' }}
        />
        <div>
          <p style={{ fontSize: '13px', color: '#F5F5F5', fontWeight: '500', margin: 0 }}>
            Logia Sanitas Sanitatum
          </p>
          <p style={{ fontSize: '10px', color: '#CDA434', margin: 0 }}>
            N° 763 · Rosario
          </p>
        </div>
      </div>

      {/* Links — escritorio */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}
        className="nav-desktop">
        {[
          { id: 'nosotros', label: 'Nosotros', href: '#nosotros' },
          { id: 'masoneria', label: '¿Qué es la masonería?', href: '#masoneria' },
          { id: 'admision', label: 'Admisión', href: '#admision' },
          { id: 'tenidas', label: 'Tenidas blancas', href: '#tenidas' },
          { id: 'contacto', label: 'Contacto', href: '#contacto' },
        ].map(link => (
          <a
            key={link.id}
            href={link.href}
            style={linkStyle(link.id)}
            onMouseEnter={() => setHoveredLink(link.id)}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {link.label}
          </a>
        ))}
        <Link
          href="/tesoro"
          style={{
            backgroundColor: hoveredLink === 'reservada' ? '#b8891e' : '#CDA434',
            color: '#1C1C1C',
            padding: '6px 16px',
            borderRadius: '4px',
            fontWeight: '500',
            fontSize: '12px',
            textDecoration: 'none',
            transition: 'background-color 0.2s',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={() => setHoveredLink('reservada')}
          onMouseLeave={() => setHoveredLink(null)}
        >
          Área reservada
        </Link>
      </div>

      {/* Botón hamburguesa — móvil */}
      <button
        onClick={() => setMenuAbierto(!menuAbierto)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          flexDirection: 'column',
          gap: '5px'
        }}
        className="nav-hamburger"
        aria-label="Menú"
      >
        <span style={{ display: 'block', width: '22px', height: '2px', backgroundColor: '#CDA434' }} />
        <span style={{ display: 'block', width: '22px', height: '2px', backgroundColor: '#CDA434' }} />
        <span style={{ display: 'block', width: '22px', height: '2px', backgroundColor: '#CDA434' }} />
      </button>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <div style={{
          position: 'absolute',
          top: '64px',
          left: 0,
          right: 0,
          backgroundColor: '#1C1C1C',
          borderBottom: '2px solid #CDA434',
          padding: '1rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 99
        }}
          className="nav-mobile-menu"
        >
          {[
            { href: '#nosotros', label: 'Nosotros' },
            { href: '#masoneria', label: '¿Qué es la masonería?' },
            { href: '#admision', label: 'Admisión' },
            { href: '#tenidas', label: 'Tenidas blancas' },
            { href: '#contacto', label: 'Contacto' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuAbierto(false)}
              style={{ fontSize: '14px', color: '#9e9b8e', textDecoration: 'none' }}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/tesoro"
            style={{
              backgroundColor: '#CDA434',
              color: '#1C1C1C',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: '500',
              fontSize: '13px',
              textDecoration: 'none',
              textAlign: 'center'
            }}
          >
            Área reservada
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}