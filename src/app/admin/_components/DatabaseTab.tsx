"use client";
import React, { useState, useEffect, useMemo } from 'react';

interface Student {
  id: string;
  name: string;
  username: string;
  studentId: string;
  email: string;
  gender: string;
  avatar: string;
}

export default function DatabaseTab({ userRole }: { userRole: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<'male' | 'female'>('male');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const db = (window as any).db;
        if (!db) return;
        const snapshot = await db.collection('users').get();
        if (isMounted) {
          const list: Student[] = [];
          snapshot.forEach((doc: any) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              name: data.name || 'بدون اسم',
              username: doc.id,
              studentId: data.studentId || '11011110001',
              email: data.email || 'غير مسجل',
              gender: (data.gender || 'male').toLowerCase().trim(),
              avatar: data.avatar || ''
            });
          });
          setStudents(list);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setLoading(false);
      }
    };
    fetchStudents();
    return () => { isMounted = false; };
  }, []);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter(s => {
      const matchesGender = s.gender === genderFilter;
      const matchesSearch = s.name.toLowerCase().includes(q) || s.username.toLowerCase().includes(q) || s.studentId.includes(q);
      return matchesGender && matchesSearch;
    });
  }, [students, genderFilter, searchQuery]);

  return (
    <section className="tab-section active">
      <div className="gender-db-tabs">
        <button type="button" className={`gender-tab-btn male-tab ${genderFilter === 'male' ? 'active' : ''}`} onClick={() => setGenderFilter('male')}>
          <span>قاعدة بيانات الطلاب</span>
          <svg className="gender-tab-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="14" r="5"></circle><path d="M19 5L13.5 10.5"></path><path d="M19 5h-5"></path><path d="M19 5v5"></path>
          </svg>
        </button>
        <button type="button" className={`gender-tab-btn female-tab ${genderFilter === 'female' ? 'active' : ''}`} onClick={() => setGenderFilter('female')}>
          <span>قاعدة بيانات الطالبات</span>
          <svg className="gender-tab-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="10" r="5"></circle><path d="M12 15v7"></path><path d="M9 19h6"></path>
          </svg>
        </button>
      </div>

      <div className="tab-card-body">
        <div className="database-card-header">
          <div className="fancy-search-wrapper">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className="fancy-search-input" 
              placeholder={genderFilter === 'female' ? 'بحث باسم الطالبة أو اسم المستخدم...' : 'بحث باسم الطالب أو اسم المستخدم...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="clear-search-btn show" onClick={() => setSearchQuery('')}>&times;</button>
            )}
          </div>
        </div>

        <div className="student-list-container">
          {loading ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0' }}>جاري تحميل البيانات...</p>
          ) : filteredStudents.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0' }}>لا توجد نتائج مطابقة للبحث</p>
          ) : (
            filteredStudents.map(student => {
              const avatar = student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1d4ed8&color=fff`;
              const canViewFull = userRole === 'superadmin';

              return (
                <div key={student.id} className="student-row-item">
                  <div className="student-row-info">
                    <img src={avatar} alt={student.name} className="student-list-avatar" onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1d4ed8&color=fff`)} />
                    <h4 className="student-list-name">{student.name}</h4>
                  </div>
                  <div>
                    {canViewFull ? (
                      <button className="btn-view-profile-card" onClick={() => setSelectedStudent(student)}>عرض الملف</button>
                    ) : (
                      <span className="text-restricted-badge">محظور</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* STUDENT PROFILE MODAL */}
      {selectedStudent && (
        <div className="admin-modal-overlay show" style={{ display: 'flex' }} onClick={() => setSelectedStudent(null)}>
          <div className="admin-modal-card profile-preview-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setSelectedStudent(null)}>&times;</button>
            
            <div className="profile-preview-header">
              <img src={selectedStudent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=1d4ed8&color=fff`} alt="Avatar" className="profile-preview-avatar" />
              <span className="profile-label-top">الاسم المعروض</span>
              <h2 className="profile-user-title">{selectedStudent.name}</h2>
              <div className="gender-badge-container">
                {selectedStudent.gender === 'male' ? (
                  <span className="gender-badge gender-male">
                    <svg className="gender-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="10" cy="14" r="5"></circle><path d="M19 5L13.5 10.5"></path><path d="M19 5h-5"></path><path d="M19 5v5"></path>
                    </svg>
                    طالب ♂
                  </span>
                ) : (
                  <span className="gender-badge gender-female">
                    <svg className="gender-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="10" r="5"></circle><path d="M12 15v7"></path><path d="M9 19h6"></path>
                    </svg>
                    طالبة ♀
                  </span>
                )}
              </div>
            </div>

            <hr className="profile-divider" />

            <div className="profile-details-list">
              <div className="detail-row">
                <span className="detail-value">{selectedStudent.studentId}</span>
                <span className="detail-label">الرقم الجامعي</span>
              </div>
              <div className="detail-row">
                <span className="detail-value">{selectedStudent.email}</span>
                <span className="detail-label">البريد الإلكتروني</span>
              </div>
              <div className="detail-row">
                <span className="detail-value">{selectedStudent.username}</span>
                <span className="detail-label">اسم المستخدم</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
