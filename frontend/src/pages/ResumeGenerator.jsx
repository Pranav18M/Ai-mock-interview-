import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import { previewResume, downloadResume } from '../services/api'

// ── Default empty form state ──────────────────────────────────────────────────
const EMPTY = {
  full_name: '', phone: '', email: '', location: '',
  linkedin: '', github: '', portfolio: '',
  job_role: '', summary: '',
  frontend_skills: '', backend_skills: '',
  database_skills: '', tools_skills: '', other_skills: '',
  education: [{ degree: '', college: '', duration: '', cgpa: '', coursework: '' }],
  projects: [
    { name: '', technologies: '', point1: '', point2: '', link: '' },
    { name: '', technologies: '', point1: '', point2: '', link: '' },
  ],
  experience: [{ company: '', role: '', duration: '', description: '' }],
  certifications: [{ name: '', issuer: '', date: '' }],
}

// ── Section header component ──────────────────────────────────────────────────
function SectionHead({ label, color = '#6366f1' }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: '800', letterSpacing: '1.6px',
      textTransform: 'uppercase', color, marginBottom: '10px', marginTop: '18px',
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <div style={{ height: '2px', width: '18px', background: color, borderRadius: '2px' }} />
      {label}
    </div>
  )
}

// ── Input field component ─────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder = '', textarea = false, rows = 2 }) {
  const base = {
    width: '100%', padding: '8px 11px', borderRadius: '8px',
    border: '1.5px solid rgba(99,102,241,0.15)',
    background: '#fafaff', color: '#1a1a2e',
    fontSize: '12.5px', fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'border-color 0.15s',
    resize: textarea ? 'vertical' : 'none',
  }
  return (
    <div style={{ marginBottom: '8px' }}>
      {label && <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(26,26,46,0.55)', display: 'block', marginBottom: '3px' }}>{label}</label>}
      {textarea
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
            style={base}
            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.15)'}
          />
        : <input value={value} onChange={onChange} placeholder={placeholder}
            style={base}
            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.15)'}
          />
      }
    </div>
  )
}

// ── Add / Remove row buttons ──────────────────────────────────────────────────
function AddBtn({ onClick, label }) {
  return (
    <button onClick={onClick} style={{
      marginTop: '6px', padding: '6px 14px', borderRadius: '8px',
      border: '1.5px dashed rgba(99,102,241,0.3)', background: 'transparent',
      color: '#6366f1', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
    }}>+ Add {label}</button>
  )
}

function RemoveBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '3px 10px', borderRadius: '6px',
      border: '1px solid rgba(220,38,38,0.2)', background: '#fef2f2',
      color: '#dc2626', fontSize: '11px', cursor: 'pointer', fontWeight: '600',
    }}>Remove</button>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ResumeGenerator() {
  const [form, setForm]           = useState(EMPTY)
  const [previewHtml, setPreviewHtml] = useState('')
  const [loading, setLoading]     = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 900)
  const [activeTab, setActiveTab] = useState('form') // 'form' | 'preview'
  const debounceRef = useRef(null)
  const navigate    = useNavigate()

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  // ── Auto-preview with 800ms debounce after every form change ────────────────
  const triggerPreview = useCallback((data) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!data.full_name.trim()) return
      try {
        const res = await previewResume(data)
        setPreviewHtml(res.data.html)
      } catch (e) {
        console.error('Preview error:', e)
      }
    }, 800)
  }, [])

  useEffect(() => { triggerPreview(form) }, [form, triggerPreview])

  // ── Generic field updater ────────────────────────────────────────────────────
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  // ── Array field updater ──────────────────────────────────────────────────────
  const setArr = (section, idx, field) => (e) => {
    setForm(f => {
      const arr = [...f[section]]
      arr[idx] = { ...arr[idx], [field]: e.target.value }
      return { ...f, [section]: arr }
    })
  }

  const addRow = (section, template) => () =>
    setForm(f => ({ ...f, [section]: [...f[section], { ...template }] }))

  const removeRow = (section, idx) => () =>
    setForm(f => ({ ...f, [section]: f[section].filter((_, i) => i !== idx) }))

  // ── Manual preview ───────────────────────────────────────────────────────────
  const handlePreview = async () => {
    if (!form.full_name.trim()) return toast.error('Enter your full name first')
    setLoading(true)
    try {
      const res = await previewResume(form)
      setPreviewHtml(res.data.html)
      if (isMobile) setActiveTab('preview')
      toast.success('Preview updated!')
    } catch (e) {
      toast.error('Preview failed. Check your connection.')
    } finally { setLoading(false) }
  }

  // ── Download PDF ─────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!form.full_name.trim()) return toast.error('Enter your full name first')
    if (!form.email.trim())     return toast.error('Enter your email')
    setDownloading(true)
    try {
      const res = await downloadResume(form)

      // If server returned PDF binary
      if (res.data instanceof Blob || res.headers?.['content-type']?.includes('pdf')) {
        const blob = new Blob([res.data], { type: 'application/pdf' })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href     = url
        a.download = `${form.full_name.replace(/\s+/g, '_')}_Resume.pdf`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Resume downloaded!')
        return
      }

      // Fallback: server returned HTML — use browser print dialog
      if (res.data?.html) {
        const win = window.open('', '_blank')
        win.document.write(res.data.html)
        win.document.close()
        setTimeout(() => { win.print() }, 500)
        toast.success('Print dialog opened — choose "Save as PDF"')
        return
      }

      toast.error('Download failed. Try again.')
    } catch (e) {
      // If response is arraybuffer/blob (axios responseType not set)
      // Try to use previewHtml and print
      if (previewHtml) {
        const win = window.open('', '_blank')
        win.document.write(previewHtml)
        win.document.close()
        setTimeout(() => { win.print() }, 500)
        toast.success('Print dialog opened — choose "Save as PDF"')
      } else {
        toast.error(e.response?.data?.detail || 'Download error. Try Preview first.')
      }
    } finally { setDownloading(false) }
  }

  // ── Styles ────────────────────────────────────────────────────────────────────
  const card = {
    background: '#fff', borderRadius: '16px',
    border: '1.5px solid rgba(99,102,241,0.1)',
    boxShadow: '0 4px 20px rgba(99,102,241,0.07)',
    padding: '20px 22px',
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: isMobile ? '16px' : '32px 40px' }}>

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div style={{ ...card, marginBottom: '20px', animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '900', color: '#1a1a2e', margin: 0, letterSpacing: '-0.4px' }}>
                Resume Builder
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(26,26,46,0.45)', margin: '3px 0 0' }}>
                Fill the form → get a professional resume PDF instantly
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {isMobile && (
                <div style={{ display: 'flex', background: '#f0eff5', borderRadius: '10px', padding: '3px' }}>
                  {['form', 'preview'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} style={{
                      padding: '6px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: activeTab === t ? '#fff' : 'transparent',
                      color: activeTab === t ? '#1a1a2e' : 'rgba(26,26,46,0.42)',
                      fontWeight: activeTab === t ? '700' : '500', fontSize: '13px',
                      boxShadow: activeTab === t ? '0 2px 8px rgba(99,102,241,0.14)' : 'none',
                      transition: 'all 0.15s', textTransform: 'capitalize',
                    }}>{t}</button>
                  ))}
                </div>
              )}
              <button onClick={handlePreview} disabled={loading} style={{
                padding: '9px 20px', borderRadius: '10px',
                border: '1.5px solid rgba(99,102,241,0.3)',
                background: 'transparent', color: '#6366f1',
                fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                {loading
                  ? <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(99,102,241,0.3)', borderTop: '2px solid #6366f1', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Generating...</>
                  : <>👁 Preview</>}
              </button>
              <button onClick={handleDownload} disabled={downloading} style={{
                padding: '9px 22px', borderRadius: '10px', border: 'none',
                background: downloading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
              }}>
                {downloading
                  ? <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Downloading...</>
                  : <>⬇ Download PDF</>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Two-Column Layout ────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

          {/* ════════════════════════════════════════════
              LEFT — FORM
          ════════════════════════════════════════════ */}
          {(!isMobile || activeTab === 'form') && (
            <div style={{ flex: '0 0 420px', maxWidth: isMobile ? '100%' : '420px', width: isMobile ? '100%' : undefined }}>

              {/* Personal Info */}
              <div style={{ ...card, animation: 'fadeUp 0.35s ease both' }}>
                <SectionHead label="Personal Information" color="#6366f1" />
                <Field label="Full Name *"   value={form.full_name} onChange={set('full_name')} placeholder="e.g. MOHANA PRANAV M" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <Field label="Phone *"  value={form.phone}    onChange={set('phone')}    placeholder="+91-9344810862" />
                  <Field label="Location" value={form.location} onChange={set('location')} placeholder="Erode, Tamil Nadu" />
                </div>
                <Field label="Email *"     value={form.email}     onChange={set('email')}     placeholder="you@email.com" />
                <Field label="LinkedIn URL" value={form.linkedin}  onChange={set('linkedin')}  placeholder="linkedin.com/in/yourname" />
                <Field label="GitHub URL"   value={form.github}    onChange={set('github')}    placeholder="github.com/yourname" />
                <Field label="Portfolio URL (optional)" value={form.portfolio} onChange={set('portfolio')} placeholder="yourportfolio.vercel.app" />
              </div>

              {/* Professional */}
              <div style={{ ...card, marginTop: '14px', animation: 'fadeUp 0.38s ease both' }}>
                <SectionHead label="Professional" color="#8b5cf6" />
                <Field label="Job Role *" value={form.job_role} onChange={set('job_role')} placeholder="Full Stack Developer" />
                <Field label="Professional Summary *" value={form.summary} onChange={set('summary')}
                  placeholder="Full Stack Developer specializing in MERN Stack with expertise in building scalable web applications..."
                  textarea rows={3} />
              </div>

              {/* Technical Skills */}
              <div style={{ ...card, marginTop: '14px', animation: 'fadeUp 0.4s ease both' }}>
                <SectionHead label="Technical Skills" color="#06b6d4" />
                <Field label="Frontend Technologies" value={form.frontend_skills} onChange={set('frontend_skills')}
                  placeholder="HTML, CSS, React.js, Tailwind CSS, Responsive Web Design" />
                <Field label="Backend Technologies"  value={form.backend_skills}  onChange={set('backend_skills')}
                  placeholder="Node.js, Express.js, RESTful API Development" />
                <Field label="Databases"             value={form.database_skills} onChange={set('database_skills')}
                  placeholder="MongoDB (NoSQL), Database Optimization" />
                <Field label="Developer Tools"       value={form.tools_skills}    onChange={set('tools_skills')}
                  placeholder="Git, GitHub, VS Code, Vercel, npm" />
                <Field label="Other (Cloud, etc.)"   value={form.other_skills}    onChange={set('other_skills')}
                  placeholder="AWS Cloud Services" />
              </div>

              {/* Education */}
              <div style={{ ...card, marginTop: '14px', animation: 'fadeUp 0.42s ease both' }}>
                <SectionHead label="Education" color="#10b981" />
                {form.education.map((edu, i) => (
                  <div key={i} style={{ borderLeft: '2px solid rgba(16,185,129,0.2)', paddingLeft: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(26,26,46,0.4)' }}>Education {i + 1}</span>
                      {form.education.length > 1 && <RemoveBtn onClick={removeRow('education', i)} />}
                    </div>
                    <Field label="Degree / Course *" value={edu.degree} onChange={setArr('education', i, 'degree')}
                      placeholder="Bachelor of Engineering in Electronics and Communication Engineering" />
                    <Field label="College Name *" value={edu.college} onChange={setArr('education', i, 'college')}
                      placeholder="Excel Engineering College (Autonomous), Komarapalayam" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <Field label="Duration *"  value={edu.duration} onChange={setArr('education', i, 'duration')} placeholder="Sept 2023 – Aug 2027" />
                      <Field label="CGPA / %" value={edu.cgpa}     onChange={setArr('education', i, 'cgpa')}     placeholder="8.0/10.0" />
                    </div>
                    <Field label="Relevant Coursework (optional)" value={edu.coursework} onChange={setArr('education', i, 'coursework')}
                      placeholder="Data Structures, Web Development, DBMS, OOP" />
                  </div>
                ))}
                <AddBtn onClick={addRow('education', { degree: '', college: '', duration: '', cgpa: '', coursework: '' })} label="Education" />
              </div>

              {/* Projects */}
              <div style={{ ...card, marginTop: '14px', animation: 'fadeUp 0.44s ease both' }}>
                <SectionHead label="Projects" color="#f59e0b" />
                {form.projects.map((p, i) => (
                  <div key={i} style={{ borderLeft: '2px solid rgba(245,158,11,0.25)', paddingLeft: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(26,26,46,0.4)' }}>Project {i + 1}</span>
                      {form.projects.length > 1 && <RemoveBtn onClick={removeRow('projects', i)} />}
                    </div>
                    <Field label="Project Name *"    value={p.name}          onChange={setArr('projects', i, 'name')}          placeholder="Shopease – E-Commerce Web Application" />
                    <Field label="Technologies *"    value={p.technologies}   onChange={setArr('projects', i, 'technologies')}   placeholder="React.js, Node.js, MongoDB, Tailwind CSS" />
                    <Field label="Live Link (optional)" value={p.link}        onChange={setArr('projects', i, 'link')}           placeholder="shopease-pranav.vercel.app" />
                    <Field label="Bullet Point 1 *"  value={p.point1}        onChange={setArr('projects', i, 'point1')}
                      placeholder="Developed full-stack e-commerce platform with product catalog and cart management"
                      textarea rows={2} />
                    <Field label="Bullet Point 2 *"  value={p.point2}        onChange={setArr('projects', i, 'point2')}
                      placeholder="Implemented JWT authentication and RESTful APIs handling 100+ concurrent users"
                      textarea rows={2} />
                  </div>
                ))}
                <AddBtn onClick={addRow('projects', { name: '', technologies: '', point1: '', point2: '', link: '' })} label="Project" />
              </div>

              {/* Experience */}
              <div style={{ ...card, marginTop: '14px', animation: 'fadeUp 0.46s ease both' }}>
                <SectionHead label="Experience (optional)" color="#ec4899" />
                {form.experience.map((ex, i) => (
                  <div key={i} style={{ borderLeft: '2px solid rgba(236,72,153,0.2)', paddingLeft: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(26,26,46,0.4)' }}>Experience {i + 1}</span>
                      {form.experience.length > 1 && <RemoveBtn onClick={removeRow('experience', i)} />}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <Field label="Company / Event" value={ex.company}  onChange={setArr('experience', i, 'company')}  placeholder="TRIXATHON'25" />
                      <Field label="Role"            value={ex.role}     onChange={setArr('experience', i, 'role')}     placeholder="Hackathon Participant" />
                    </div>
                    <Field label="Duration"       value={ex.duration}     onChange={setArr('experience', i, 'duration')}     placeholder="Oct 2025" />
                    <Field label="Description"    value={ex.description}  onChange={setArr('experience', i, 'description')}
                      placeholder="Collaborated with team of 4 developers to build web-based solution within 24-hour deadline"
                      textarea rows={2} />
                  </div>
                ))}
                <AddBtn onClick={addRow('experience', { company: '', role: '', duration: '', description: '' })} label="Experience" />
              </div>

              {/* Certifications */}
              <div style={{ ...card, marginTop: '14px', marginBottom: '30px', animation: 'fadeUp 0.48s ease both' }}>
                <SectionHead label="Certifications (optional)" color="#8b5cf6" />
                {form.certifications.map((c, i) => (
                  <div key={i} style={{ borderLeft: '2px solid rgba(139,92,246,0.2)', paddingLeft: '12px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(26,26,46,0.4)' }}>Certification {i + 1}</span>
                      {form.certifications.length > 1 && <RemoveBtn onClick={removeRow('certifications', i)} />}
                    </div>
                    <Field label="Certificate Name" value={c.name}   onChange={setArr('certifications', i, 'name')}   placeholder="AWS Certified Cloud Practitioner" />
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                      <Field label="Issuer" value={c.issuer} onChange={setArr('certifications', i, 'issuer')} placeholder="Amazon Web Services" />
                      <Field label="Date"   value={c.date}   onChange={setArr('certifications', i, 'date')}   placeholder="Nov 2025" />
                    </div>
                  </div>
                ))}
                <AddBtn onClick={addRow('certifications', { name: '', issuer: '', date: '' })} label="Certification" />
              </div>

            </div>
          )}

          {/* ════════════════════════════════════════════
              RIGHT — LIVE PREVIEW
          ════════════════════════════════════════════ */}
          {(!isMobile || activeTab === 'preview') && (
            <div style={{ flex: 1, position: 'sticky', top: '76px' }}>
              <div style={{ ...card, padding: '0', overflow: 'hidden' }}>

                {/* Preview header bar */}
                <div style={{
                  padding: '12px 18px', borderBottom: '1px solid rgba(99,102,241,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'linear-gradient(135deg,#fafaff,#f5f3ff)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: '600', color: 'rgba(26,26,46,0.45)' }}>
                      Resume Preview
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'rgba(26,26,46,0.35)' }}>
                    {previewHtml ? '✓ Live' : 'Enter name to start'}
                  </span>
                </div>

                {/* Preview iframe */}
                <div style={{ background: '#e8e8ee', padding: '16px', minHeight: '600px' }}>
                  {previewHtml ? (
                    <iframe
                      srcDoc={previewHtml}
                      style={{
                        width: '100%', height: '900px', border: 'none',
                        borderRadius: '4px', background: '#fff',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                      }}
                      title="Resume Preview"
                    />
                  ) : (
                    <div style={{
                      height: '600px', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '12px',
                    }}>
                      <div style={{ fontSize: '48px' }}>📄</div>
                      <p style={{ color: 'rgba(26,26,46,0.4)', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
                        Start filling the form<br />
                        <span style={{ fontSize: '12px', fontWeight: '400' }}>Preview updates automatically</span>
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Download button repeated below preview for convenience */}
              {previewHtml && (
                <button onClick={handleDownload} disabled={downloading} style={{
                  marginTop: '14px', width: '100%', padding: '13px',
                  borderRadius: '12px', border: 'none',
                  background: downloading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 6px 24px rgba(99,102,241,0.4)',
                  animation: 'fadeUp 0.3s ease both',
                }}>
                  {downloading
                    ? <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Downloading...</>
                    : <>⬇ Download PDF — {form.full_name || 'Resume'}</>}
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </AppLayout>
  )
}