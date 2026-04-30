import Image from 'next/image'
import NavbarPublico from './components/NavbarPublico'
import AnimatedSection from './components/AnimatedSection'
import ContactCards from './components/ContactCards'
import BotonAdmision from './components/BotonAdmision'

export const metadata = {
  title: 'Logia Sanitas Sanitatum N°763 — Masonería en Rosario',
  description: 'Logia masónica en Rosario, Santa Fe. Masonería y salud. Bajo los auspicios de la Gran Logia de la Argentina de Libres y Aceptados Masones.',
  keywords: 'masonería Rosario, logia Rosario, masonería y salud, Sanitas Sanitatum, logia masónica Rosario, masonería Argentina',
  openGraph: {
    title: 'Logia Sanitas Sanitatum N°763 — Masonería en Rosario',
    description: 'Logia masónica en Rosario dedicada a la salud como derecho universal. Bajo los auspicios de la Gran Logia de la Argentina de Libres y Aceptados Masones.',
    url: 'https://logiasanitas763.com.ar',
    siteName: 'Logia Sanitas Sanitatum N°763',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'Montserrat', system-ui, sans-serif", backgroundColor: '#F5F5F5' }}>

      <NavbarPublico />

      {/* HERO */}
      <section aria-label="Presentación" style={{ position: 'relative', height: '640px', overflow: 'hidden' }}>
        <Image
          src="/el-medico.jpg"
          alt="El médico de Luke Fildes, 1891 — símbolo de la vocación sanitaria"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center center' }}
          priority
        />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(28, 28, 28, 0.75)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '2rem', textAlign: 'center'
        }}>
          <p style={{ fontSize: '11px', color: '#CDA434', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>
            A L.·.G.·.D.·.G.·.A.·.D.·.U.·.
          </p>
          <Image
            src="/logo-sanitas.png"
            alt="Logo Logia Sanitas Sanitatum N°763"
            width={200}
            height={200}
            style={{ marginBottom: '1.5rem', objectFit: 'contain' }}
            priority
          />
          <h1 style={{ fontSize: '34px', fontWeight: '700', color: '#F5F5F5', marginBottom: '8px', lineHeight: '1.3' }}>
            Resp.·. Log.·. Sanitas Sanitatum
          </h1>
          <p style={{ fontSize: '14px', color: '#CDA434', marginBottom: '8px', letterSpacing: '0.1em' }}>
            N° 763 · Rosario, Santa Fe · Est. 5 de mayo de 2023 (e.·.v.·.)
          </p>
          <p style={{ fontSize: '12px', color: '#9e9b8e', marginBottom: '2rem' }}>
            Bajo los auspicios de la Gran Logia de la Argentina de Libres y Aceptados Masones
          </p>
          <p style={{
            fontSize: '18px', color: '#F5F5F5', fontStyle: 'italic',
            maxWidth: '560px', lineHeight: '1.7', marginBottom: '2rem',
            fontFamily: 'Georgia, serif'
          }}>
            &quot;Forjando la salud como un derecho universal, con Sabiduría, Justicia y Solidaridad&quot;
          </p>
          <a
            href="https://masoneria-argentina.org.ar"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '11px', color: '#CDA434', textDecoration: 'underline' }}
          >
            Gran Logia de la Argentina →
          </a>
        </div>
      </section>

      <div style={{ height: '3px', backgroundColor: '#CDA434' }} />

      {/* NOSOTROS */}
      <section id="nosotros" aria-label="Nuestra historia" style={{ padding: '5rem 2rem', backgroundColor: '#F5F5F5' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <AnimatedSection>
            <p style={{ fontSize: '12px', color: '#CDA434', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Nuestra historia
            </p>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1C1C1C', marginBottom: '1.5rem' }}>
              Obreros de la salud
            </h2>
            <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.9', marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>
              La Logia Sanitas Sanitatum fue fundada el 5 de mayo de 2023 (e.·.v.·.) como iniciativa de un grupo de masones pertenecientes al sistema de salud. No solo médicos, sino profesionales y trabajadores de diferentes áreas, todos convocados bajo la certeza de que la salud no puede abordarse desde un solo lugar.
            </p>
            <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.9', marginBottom: '3rem', fontFamily: 'Georgia, serif' }}>
              Lo que comenzó como la idea de un grupo de trabajo y reflexión se convirtió en algo más profundo: un taller donde la piedra bruta del sistema sanitario se pule colectivamente con herramientas masónicas, generando una mirada compleja y holística sobre la salud como derecho inalienable.
            </p>
          </AnimatedSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <AnimatedSection delay={100}>
              <div style={{ border: '1px solid #CDA434', borderRadius: '4px', padding: '1.5rem', height: '100%' }}>
                <p style={{ fontSize: '11px', color: '#CDA434', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: '600' }}>Misión</p>
                <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.8', fontFamily: 'Georgia, serif' }}>
                  Forjar la salud como un derecho inalienable, mediante la unión de los obreros de la salud y la aplicación de las herramientas masónicas, para construir un ecosistema sanitario justo, equitativo y holístico.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div style={{ border: '1px solid #CDA434', borderRadius: '4px', padding: '1.5rem', height: '100%' }}>
                <p style={{ fontSize: '11px', color: '#CDA434', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: '600' }}>Visión</p>
                <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.8', fontFamily: 'Georgia, serif' }}>
                  Ser el taller de herreros de la salud, donde se forjan líderes visionarios, capaces de esculpir la piedra bruta de la salud en una joya brillante, que ilumine el camino hacia la soberanía y la dignidad humana.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <div style={{ height: '1px', backgroundColor: '#e0ddd5' }} />

      {/* QUÉ ES LA MASONERÍA */}
      <section id="masoneria" aria-label="Qué es la masonería" style={{ padding: '5rem 2rem', backgroundColor: '#1C1C1C' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <AnimatedSection>
            <p style={{ fontSize: '12px', color: '#CDA434', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Conocé la institución
            </p>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#F5F5F5', marginBottom: '1.5rem' }}>
              ¿Qué es la masonería?
            </h2>
            <p style={{ fontSize: '16px', color: '#c8c5b8', lineHeight: '1.9', marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>
              La masonería es la organización fraternal más antigua del mundo. Es una escuela de pensamiento y un sistema de ética basado en la convicción de que cada persona tiene la responsabilidad de mejorarse a sí misma y de contribuir al bien de su entorno. Sus principios fundamentales son la Libertad, la Igualdad y la Fraternidad, sostenidos por el lema: Ciencia, Justicia y Trabajo.
            </p>
            <p style={{ fontSize: '16px', color: '#c8c5b8', lineHeight: '1.9', marginBottom: '3rem', fontFamily: 'Georgia, serif' }}>
              No es una religión ni está afiliada a ninguna. Se eleva sobre toda clase de diferencias para ofrecer a los amantes de la verdad un terreno de entendimiento mutuo y unión fraternal, admitiendo en su seno a personas de todas las creencias, profesiones y orígenes.
            </p>
          </AnimatedSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {[
              { titulo: 'Fraternidad universal', texto: 'Los masones de cualquier país y rito constituyen una sola familia humana. La fraternidad es uno de sus principios; la tolerancia, el principal de sus deberes.' },
              { titulo: 'Mejoramiento personal', texto: 'La masonería trabaja sobre la piedra bruta de cada hombre para esculpir una persona más justa, más sabia y más comprometida con su comunidad.' },
              { titulo: 'Compromiso social', texto: 'Lejos del hermetismo que el mito popular le atribuye, la masonería ha contribuido históricamente al progreso moral, intelectual y social de los pueblos.' },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div style={{
                  borderLeft: '3px solid #CDA434',
                  paddingLeft: '1.25rem',
                  borderRadius: '0'
                }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#CDA434', marginBottom: '0.5rem' }}>
                    {item.titulo}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#9e9b8e', lineHeight: '1.7', fontFamily: 'Georgia, serif' }}>
                    {item.texto}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: '3px', backgroundColor: '#CDA434' }} />

      {/* ADMISIÓN */}
      <section id="admision" aria-label="Cómo ingresar a la masonería" style={{ padding: '5rem 2rem', backgroundColor: '#F5F5F5' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <AnimatedSection>
            <p style={{ fontSize: '12px', color: '#CDA434', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Sumate
            </p>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1C1C1C', marginBottom: '1rem' }}>
              ¿Cómo ingresar a la logia?
            </h2>
            <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.9', marginBottom: '2rem', fontFamily: 'Georgia, serif' }}>
              Sanitas es una logia simbólica con una identidad muy marcada en torno a la salud, pero como cualquier taller masónico trabaja los mismos grados y enseñanzas de siempre. Nuestra mirada sobre la salud como derecho universal es el prisma desde el que nos acercamos al mundo, no un requisito de admisión. Si compartís esos valores y te interesa crecer junto a una comunidad comprometida, sos bienvenido.
            </p>
          </AnimatedSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {[
              { num: '01', titulo: 'Requisitos básicos', texto: 'Ser mayor de 18 años, hombre libre y de buenas costumbres. No se requiere fortuna ni conocimientos excepcionales, sino apertura y compromiso genuino.' },
              { num: '02', titulo: 'El proceso', texto: 'Podés comunicarte directamente con nosotros o ser presentado por un masón que conozcas. Tu solicitud es tratada con absoluta reserva y fraternidad.' },
              { num: '03', titulo: 'El perfil de Sanitas', texto: 'Trabajamos en salud o nos interesa la salud como bien social. Médicos, enfermeros, psicólogos, trabajadores sociales, o simplemente personas convencidas de que la salud es un derecho.' },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div style={{
                  backgroundColor: '#fff',
                  border: '0.5px solid #e0ddd5',
                  borderRadius: '4px',
                  padding: '1.5rem',
                  height: '100%'
                }}>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#CDA434', marginBottom: '0.5rem', opacity: 0.6 }}>
                    {item.num}
                  </p>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1C1C1C', marginBottom: '0.5rem' }}>
                    {item.titulo}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.7', fontFamily: 'Georgia, serif' }}>
                    {item.texto}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={300}>
            <BotonAdmision />
          </AnimatedSection>
        </div>
      </section>

      <div style={{ height: '1px', backgroundColor: '#e0ddd5' }} />

      {/* TENIDAS BLANCAS */}
      <section id="tenidas" aria-label="Tenidas blancas" style={{ backgroundColor: '#2F4F4F', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <AnimatedSection>
            <p style={{ fontSize: '12px', color: '#CDA434', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Actividades abiertas
            </p>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#F5F5F5', marginBottom: '1rem' }}>
              Tenidas blancas
            </h2>
            <p style={{ fontSize: '16px', color: '#c8c5b8', lineHeight: '1.8', marginBottom: '2.5rem', fontFamily: 'Georgia, serif' }}>
              Las tenidas blancas son encuentros abiertos donde masones y público en general comparten reflexión, debate y fraternidad en torno a la salud como bien común. Las próximas fechas se publicarán en nuestra web y en Instagram.
            </p>
            <div style={{
              backgroundColor: 'rgba(205, 164, 52, 0.1)',
              border: '1px solid rgba(205, 164, 52, 0.4)',
              borderRadius: '4px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CDA434" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#F5F5F5', marginBottom: '4px' }}>
                  ¿Querés participar de una tenida blanca?
                </p>
                <p style={{ fontSize: '13px', color: '#9e9b8e' }}>
                  Seguinos en{' '}
                  <a href="https://www.instagram.com/sanitas_sanitatum/" target="_blank" rel="noopener noreferrer" style={{ color: '#CDA434' }}>
                    @sanitas_sanitatum
                  </a>{' '}
                  para enterarte de las próximas actividades. Las fechas también se publicarán en esta web.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <div style={{ height: '3px', backgroundColor: '#CDA434' }} />

      {/* CONTACTO */}
      <section id="contacto" aria-label="Contacto" style={{ padding: '5rem 2rem', backgroundColor: '#F5F5F5' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <AnimatedSection>
            <p style={{ fontSize: '12px', color: '#CDA434', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Contacto
            </p>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1C1C1C', marginBottom: '2rem' }}>
              Comunicate con nosotros
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <ContactCards />
          </AnimatedSection>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#1C1C1C', padding: '2.5rem 2rem', textAlign: 'center', borderTop: '2px solid #CDA434' }}>
        <p style={{ fontSize: '11px', color: '#CDA434', letterSpacing: '0.15em', marginBottom: '8px' }}>
          A L.·.G.·.D.·.G.·.A.·.D.·.U.·.
        </p>
        <p style={{ fontSize: '12px', color: '#9e9b8e', lineHeight: '1.8', marginBottom: '8px' }}>
          Resp.·. Log.·. Sanitas Sanitatum N° 763 · Rosario, Santa Fe, Argentina<br />
          Bajo los auspicios de la Gran Logia de la Argentina de Libres y Aceptados Masones
        </p>
        <a
          href="https://masoneria-argentina.org.ar"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '11px', color: '#CDA434' }}
        >
          masoneria-argentina.org.ar
        </a>
        <p style={{ fontSize: '11px', color: '#555', marginTop: '1rem' }}>
           © 2026 Logia Sanitas Sanitatum. Todos los derechos reservados. Desarrollado por{' '}
          <a 
            href="https://www.instagram.com/santaweb.studio/" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: '#555', textDecoration: 'underline' }}
          >
            Santa | Web & UX Studio
          </a>
        </p>
      </footer>

    </div>
  )
}