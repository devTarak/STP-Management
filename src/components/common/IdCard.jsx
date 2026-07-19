import { forwardRef, useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';

const iconPerson = (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" fill="#fff" />
    <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#fff" />
  </svg>
);

const iconId = (
  <svg viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="14" rx="2" fill="#fff" />
    <circle cx="8" cy="10" r="1.6" fill="#001d43" />
    <path d="M6 15c0-1.5 1-2.3 2-2.3s2 .8 2 2.3" stroke="#001d43" strokeWidth="1" />
    <line x1="13" y1="9" x2="18" y2="9" stroke="#001d43" strokeWidth="1.2" />
    <line x1="13" y1="12" x2="18" y2="12" stroke="#001d43" strokeWidth="1.2" />
    <line x1="13" y1="15" x2="16" y2="15" stroke="#001d43" strokeWidth="1.2" />
  </svg>
);

const iconCourse = (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 3 2 8l10 5 8-4.2V16h1.5V8L12 3Z" fill="#fff" />
    <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" stroke="#fff" strokeWidth="1.3" fill="none" />
  </svg>
);

const iconProject = (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#fff" strokeWidth="1.5" fill="none" />
    <rect x="9" y="3" width="6" height="4" rx="1" fill="#fff" />
    <line x1="9" y1="12" x2="15" y2="12" stroke="#fff" strokeWidth="1.3" />
    <line x1="9" y1="16" x2="13" y2="16" stroke="#fff" strokeWidth="1.3" />
  </svg>
);

const iconBatch = (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="8.5" cy="8" r="2.6" fill="#fff" />
    <circle cx="16" cy="9" r="2.2" fill="#fff" />
    <path d="M3 19c0-3 2.5-4.8 5.5-4.8S14 16 14 19" fill="#fff" />
    <path d="M14.5 14.6c2.4.2 4.5 1.8 4.5 4.4" stroke="#fff" strokeWidth="1.3" fill="none" />
  </svg>
);

const iconAddress = (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8 2 5 5 5 9c0 5.5 7 13 7 13s7-7.5 7-13c0-4-3-7-7-7Z" fill="#fff" />
    <circle cx="12" cy="9" r="2.3" fill="#001d43" />
  </svg>
);

const iconPhone = (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M4 5c0-1.1.9-2 2-2h1.2c.6 0 1.1.4 1.3 1l1 3c.2.6 0 1.2-.4 1.6l-1.3 1.2c1 2.2 2.8 4 5 5l1.2-1.3c.4-.4 1-.6 1.6-.4l3 1c.6.2 1 .7 1 1.3V17c0 1.1-.9 2-2 2h-1C9.5 19 4 13.5 4 6V5Z" fill="#fff" />
  </svg>
);

const iconCalendar = (
  <svg viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="17" rx="2" fill="#fff" />
    <rect x="3" y="4" width="18" height="4" fill="#057441" />
    <line x1="7" y1="2.5" x2="7" y2="6" stroke="#057441" strokeWidth="1.6" />
    <line x1="17" y1="2.5" x2="17" y2="6" stroke="#057441" strokeWidth="1.6" />
    <rect x="6" y="11" width="3" height="3" fill="#001d43" />
    <rect x="10.5" y="11" width="3" height="3" fill="#001d43" />
    <rect x="15" y="11" width="3" height="3" fill="#001d43" />
    <rect x="6" y="15.5" width="3" height="3" fill="#001d43" />
    <rect x="10.5" y="15.5" width="3" height="3" fill="#001d43" />
  </svg>
);

function formatAddress(student) {
  const parts = [student.present_village, student.present_road, student.present_po, student.present_upazila, student.present_district, student.present_division].filter(Boolean);
  const mid = Math.ceil(parts.length / 2);
  return { line1: parts.slice(0, mid).join(', '), line2: parts.slice(mid).join(', ') };
}

const IdCard = forwardRef(function IdCard({ student, photoDataUrl, stampDataUrl }, ref) {
  const addr = formatAddress(student);
  const imgSrc = photoDataUrl || student.photo_data_url || student.photo_url;
  const logoImg = stampDataUrl || student.stamp_data_url || student.institute_stamp_url;
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && student.ref_no) {
      try {
        JsBarcode(barcodeRef.current, student.ref_no, {
          format: 'CODE39',
          width: 1.8,
          height: 50,
          displayValue: false,
          margin: 0,
          background: 'transparent',
        });
      } catch {
        // barcode failed
      }
    }
  }, [student.ref_no]);

  return (
    <div ref={ref} style={{
      width: '638px',
      height: '1013px',
      background: '#f2f2f3',
      borderRadius: '22px',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "Arial, Helvetica, sans-serif",
    }}>

      {/* HEADER */}
      <div style={{
        position: 'relative',
        background: '#001d43',
        padding: '24px 35px',
        display: 'flex',
        alignItems: 'center',
        gap: '28px',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute',
          top: 0, right: 0,
          width: '200px', height: '100%',
          background: '#f2f2f3',
          clipPath: 'polygon(55% 0, 100% 0, 100% 100%, 100% 100%, 100% 45%)',
        }} />
        <div style={{
          position: 'absolute',
          top: 0, right: 0,
          width: '140px', height: '30px',
          background: '#057441',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-2px', right: 0,
          width: '180px', height: '25px',
          background: '#057441',
        }} />

        {/* Logo */}
        <div style={{
          flex: '0 0 auto',
          width: '110px', height: '110px',
          borderRadius: '50%',
          background: '#fff',
          border: '3px solid #001d43',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          overflow: 'hidden',
        }}>
          {logoImg ? (
            <img src={logoImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '36px', fontWeight: 800, color: '#001d43' }}>
              {student.institute_name?.charAt(0) || 'S'}
            </span>
          )}
        </div>

        <div style={{ position: 'relative', zIndex: 2, color: '#fff' }}>
          <div style={{ fontSize: '25px', fontWeight: 800, letterSpacing: '0.3px', lineHeight: 1.15 }}>
            {student.institute_name || 'Training Institute'}
          </div>
          <div style={{
            width: '80px', height: '3px',
            background: '#0a9350',
            margin: '6px 0 7px 0',
            borderRadius: '2px',
          }} />
          <div style={{
            fontSize: '16px', fontWeight: 600,
            letterSpacing: '0.3px', lineHeight: 1.35,
            color: '#dfe6f2',
            textTransform: 'uppercase',
          }}>
            Technical and Vocational Education and Training
          </div>
        </div>
      </div>

      {/* PHOTO */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '20px 0 15px 0',
        background: 'radial-gradient(circle at 15% 10%, rgba(0,29,67,0.05), transparent 40%), #f2f2f3',
        flexShrink: 0,
      }}>
        <div style={{
          width: '200px', height: '210px',
          border: '3px solid #001d43',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#fff',
        }}>
          {imgSrc ? (
            <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#001d43', fontSize: 48, fontWeight: 700 }}>
              {student.name_en?.charAt(0) || '?'}
            </div>
          )}
        </div>
      </div>

      {/* RIBBON */}
      <div style={{
        margin: '16px auto 13px auto',
        width: '80%',
        height: '36px',
        background: 'linear-gradient(90deg, #001d43 0%, #0b3572 40%, #057441 100%)',
        clipPath: 'polygon(4% 0, 100% 0, 96% 100%, 0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '25px', letterSpacing: '6px' }}>TRAINEE</span>
      </div>

      {/* INFO */}
      <div style={{ padding: '2px 40px', flex: 1 }}>
        <InfoRow icon={iconPerson} label="Name" value={student.name_en || '-'} />
        <InfoRow icon={iconId} label="ID No." value={student.ref_no || '-'} />
        <InfoRow icon={iconCourse} label="Course" value={student.course_name || '-'} />
        <InfoRow icon={iconProject} label="Project Name" value={student.project_name || '-'} />
        <InfoRow icon={iconBatch} label="Batch" value={student.batch_name || '-'} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '3px 0', borderBottom: '1px solid #e3e3e5' }}>
          <div style={{ flex: '0 0 auto', width: '32px', height: '32px', borderRadius: '8px', background: '#001d43', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
            {iconAddress}
          </div>
          <div style={{ display: 'flex', flex: 1, fontSize: '22px' }}>
            <div style={{ flex: '0 0 170px', fontWeight: 700, color: '#06123c', whiteSpace: 'nowrap' }}>Address</div>
            <div style={{ flex: '0 0 14px', fontWeight: 700, color: '#06123c' }}>:</div>
            <div style={{ fontWeight: 600, color: '#1a1a1a', lineHeight: 1.2 }}>
              {addr.line1}<br />{addr.line2}
            </div>
          </div>
        </div>
        <InfoRow icon={iconPhone} label="Guardian Contact" value={student.guardian_contact || '-'} />
        <InfoRow icon={iconCalendar} label="Validity" value={
          student.start_date && student.end_date
            ? `${new Date(student.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(student.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
            : 'N/A'
        } style={{ borderBottom: 'none' }} />
      </div>

      {/* BARCODE */}
      <div style={{ textAlign: 'center', padding: '4px 10px 2px 10px', flexShrink: 0, overflow: 'hidden' }}>
        <svg ref={barcodeRef} style={{ display: 'block', margin: '0 auto', maxWidth: '90%' }}></svg>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '3px', color: '#06123c', marginTop: '4px' }}>
          {student.ref_no || 'N/A'}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        background: '#001d43',
        color: '#fff',
        padding: '8px 35px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '16px',
        fontWeight: 600,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path d="M4 5c0-1.1.9-2 2-2h1.2c.6 0 1.1.4 1.3 1l1 3c.2.6 0 1.2-.4 1.6l-1.3 1.2c1 2.2 2.8 4 5 5l1.2-1.3c.4-.4 1-.6 1.6-.4l3 1c.6.2 1 .7 1 1.3V17c0 1.1-.9 2-2 2h-1C9.5 19 4 13.5 4 6V5Z" fill="#fff" />
          </svg>
          <span>{student.institute_contact || student.contact_no || 'N/A'}</span>
        </div>
        <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.35)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path d="M12 2C8 2 5 5 5 9c0 5.5 7 13 7 13s7-7.5 7-13c0-4-3-7-7-7Z" fill="#fff" />
            <circle cx="12" cy="9" r="2.3" fill="#001d43" />
          </svg>
          <span>{[student.institute_upazila, student.institute_district].filter(Boolean).join(', ') || 'Bangladesh'}</span>
        </div>
      </div>
    </div>
  );
});

function InfoRow({ icon, label, value, style }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '3px 0',
      borderBottom: '1px solid #e3e3e5',
      ...style,
    }}>
      <div style={{
        flex: '0 0 auto',
        width: '32px', height: '32px',
        borderRadius: '8px',
        background: '#001d43',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '2px',
      }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flex: 1, fontSize: '22px' }}>
        <div style={{ flex: '0 0 170px', fontWeight: 700, color: '#06123c', whiteSpace: 'nowrap' }}>{label}</div>
        <div style={{ flex: '0 0 14px', fontWeight: 700, color: '#06123c' }}>:</div>
        <div style={{ fontWeight: 600, color: '#1a1a1a', lineHeight: 1.5 }}>{value}</div>
      </div>
    </div>
  );
}

export default IdCard;
