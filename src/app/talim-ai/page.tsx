'use client';

import React, { useRef, useState, useEffect } from 'react';
import './talim.css';

export default function TalimAIWorkspace() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userData, setUserData] = useState<{name: string, role: string, avatar: string, gender?: string} | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeChat, setActiveChat] = useState<{title: string, type: 'book' | 'history'} | null>(null);
  
  const [attachedBooks, setAttachedBooks] = useState<any[]>([]);
  const [showBooksModal, setShowBooksModal] = useState<boolean>(false);
  const [books, setBooks] = useState<any[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [activePromptCategory, setActivePromptCategory] = useState<string | null>(null);
  const [historyMenuOpen, setHistoryMenuOpen] = useState<string | null>(null);

  const [isPinnedOpen, setIsPinnedOpen] = useState<boolean>(true);
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [createdGroups, setCreatedGroups] = useState<string[]>(['مجموعة الفقه', 'دروس النحو']);

  const toggleProjectOpen = (proj: string) => {
    setOpenProjects(prev => ({ ...prev, [proj]: prev[proj] === false ? true : false }));
  };

  const toggleGroupOpen = (grp: string) => {
    setOpenGroups(prev => ({ ...prev, [grp]: prev[grp] === false ? true : false }));
  };

  const [historyList, setHistoryList] = useState<{id: string; title: string; isPinned?: boolean; project?: string | null; group?: string | null}[]>([
    { id: '1', title: 'أحكام القصر في السفر', isPinned: true, project: null, group: null },
    { id: '2', title: 'شرح إعراب الجملة', isPinned: false, project: null, group: null }
  ]);

  const [editingItem, setEditingItem] = useState<{ id: string, type: 'rename' | 'project' | 'group', currentValue: string } | null>(null);
  const [modalInputValue, setModalInputValue] = useState('');
  const [inputText, setInputText] = useState('');
  const [currentMessage, setCurrentMessage] = useState('ما هي شروط صحة الصلاة في هذا الباب؟');

  const togglePin = (id: string) => {
    setHistoryList(prev => prev.map(item => {
      if (item.id !== id) return item;
      const isNowPinned = !item.isPinned;
      return {
        ...item,
        isPinned: isNowPinned,
        project: isNowPinned ? item.project : null
      };
    }));
    setHistoryMenuOpen(null);
  };

  const handleRename = (id: string, currentTitle: string) => {
    setEditingItem({ id, type: 'rename', currentValue: currentTitle });
    setModalInputValue(currentTitle);
    setHistoryMenuOpen(null);
  };

  const handleAddProject = (id: string, currentProject?: string | null) => {
    setEditingItem({ id, type: 'project', currentValue: currentProject || '' });
    setModalInputValue(currentProject || '');
    setHistoryMenuOpen(null);
  };

  const handleMoveGroup = (id: string, currentGroup?: string | null) => {
    setEditingItem({ id, type: 'group', currentValue: currentGroup || '' });
    setModalInputValue(currentGroup || '');
    setHistoryMenuOpen(null);
  };

  const removeFromGroup = (id: string) => {
    setHistoryList(prev => prev.map(item => item.id === id ? { ...item, group: null } : item));
    setHistoryMenuOpen(null);
  };

  const handleDelete = (id: string) => {
    setHistoryList(prev => prev.filter(item => item.id !== id));
    setHistoryMenuOpen(null);
  };

  const saveEditing = () => {
    if (!editingItem) return;
    setHistoryList(prev => prev.map(item => {
      if (item.id !== editingItem.id) return item;
      if (editingItem.type === 'rename') {
        const newTitle = modalInputValue.trim() || item.title;
        if (activeChat?.title === item.title) {
          setActiveChat(prev => prev ? { ...prev, title: newTitle } : null);
        }
        return { ...item, title: newTitle };
      }
      if (editingItem.type === 'project') {
        const projName = modalInputValue.trim() || null;
        return { 
          ...item, 
          project: projName,
          isPinned: projName ? true : item.isPinned
        };
      }
      if (editingItem.type === 'group') {
        const grpName = modalInputValue.trim() || null;
        if (grpName) {
          setCreatedGroups(prev => Array.from(new Set([...prev, grpName])));
        }
        return { ...item, group: grpName };
      }
      return item;
    }));
    setEditingItem(null);
  };


  const PROMPT_SUGGESTIONS: Record<string, string[]> = {
    'إعراب جملة': [
      'أعرب هذه الجملة إعراباً تفصيلياً',
      'ما محل هذه الجملة من الإعراب؟',
      'استخرج الفاعل والمفعول به من النص'
    ],
    'شرح متن': [
      'اشرح هذا المتن شرحاً مبسطاً للمبتدئين',
      'ما هي المفردات الغريبة في هذا النص؟',
      'لخص المعنى الإجمالي لهذه الفقرة'
    ],
    'ترجمة للملايو': [
      'ترجم هذا النص إلى اللغة الملايوية',
      'ما معنى هذه الكلمة بالملايوية الدقيقة؟',
      'اشرح هذا المفهوم السياقي بالملايوية'
    ],
    'إنشاء أسئلة': [
      'ضع خمسة أسئلة اختيار من متعدد حول هذا النص',
      'اكتب ثلاثة أسئلة مقالية لاختبار الفهم العميق',
      'استخرج أسئلة صح أو خطأ من هذه الفقرة'
    ]
  };

  useEffect(() => {
    if (showBooksModal && books.length === 0) {
      setIsLoadingBooks(true);
      fetch('/api/books/educational')
        .then(res => res.json())
        .then(data => {
          setBooks(data);
          setIsLoadingBooks(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingBooks(false);
        });
    }
  }, [showBooksModal, books.length]);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        setUserData(JSON.parse(user));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (historyMenuOpen && !target.closest('.history-dropdown') && !target.closest('.history-item-actions')) {
        setHistoryMenuOpen(null);
      }
      if (activePromptCategory && !target.closest('.prompt-chip-claude')) {
        setActivePromptCategory(null);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [historyMenuOpen, activePromptCategory]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      setInputText(textareaRef.current.value);
    }
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (text) {
      setCurrentMessage(text);
      if (!activeChat) {
        setActiveChat({ title: text.substring(0, 30) + (text.length > 30 ? '...' : ''), type: 'history' });
      }
      setInputText('');
      if (textareaRef.current) {
        textareaRef.current.value = '';
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAttachedBooks(prev => [...prev, {
        id: `file-${Date.now()}`,
        title: file.name,
        coverUrl: null
      }]);
    }
  };

  return (
    <div className="talim-container" dir="rtl">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
      
      {/* Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar (Claude Style) */}
      <aside className={`talim-sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
          <div className="sidebar-header" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsSidebarOpen(false)}
              title="توسيع/تصغير"
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                border: '1.5px solid var(--color-primary-600)',
              backgroundColor: 'transparent',
              color: 'var(--color-primary-600)',
              padding: 0,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <svg width="18" height="18" viewBox="0 0 16 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              {/* Titik Atas */}
              <path d="M8 1L11.5 4.5L8 8L4.5 4.5Z" />
              {/* Titik Tengah (digeser ke bawah 1px) */}
              <path d="M8 4.5L11.5 8L8 11.5L4.5 8Z" transform="translate(0, 2)" />
              {/* Titik Bawah (digeser ke bawah 2px) */}
              <path d="M8 8L11.5 11.5L8 15L4.5 11.5Z" transform="translate(0, 4)" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="sidebar-title">حاشية</h1>
            <img src="/icon.png" alt="Logo" width="32" height="32" style={{ borderRadius: '8px', objectFit: 'cover' }} />
          </div>
        </div>

        <button className="new-chat-btn" onClick={() => setActiveChat(null)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          محادثة جديدة
        </button>

        <div className="sidebar-section">
          <div className="section-label">مساحة التعلم</div>
          
          {/* Pinned Section */}
          {historyList.some(item => item.isPinned) && (
            <div style={{ marginBottom: '8px' }}>
              <button 
                className="nav-item"
                onClick={() => setIsPinnedOpen(!isPinnedOpen)}
                style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'right', color: '#6B7280', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>المثبتة</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isPinnedOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </button>

              {isPinnedOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  {/* Pinned Projects */}
                  {Array.from(new Set(historyList.filter(item => item.isPinned && item.project).map(item => item.project))).map((projectName) => {
                    const proj = projectName as string;
                    const projectItems = historyList.filter(item => item.isPinned && item.project === proj);
                    const isOpen = openProjects[proj] !== false;

                    return (
                      <div key={proj} style={{ marginBottom: '4px' }}>
                        <button 
                          className="nav-item"
                          onClick={() => toggleProjectOpen(proj)}
                          style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'right', color: '#4B5563', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4B5563' }}>
                              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                              <line x1="8" y1="12" x2="16" y2="12"></line>
                              <line x1="8" y1="15" x2="16" y2="15"></line>
                            </svg>
                            <span>{proj}</span>
                          </div>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}>
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>

                        {isOpen && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '16px', marginTop: '2px' }}>
                            {projectItems.map(item => (
                              <div 
                                key={item.id} 
                                className="history-item" 
                                onClick={() => { setActiveChat({title: item.title, type: 'history'}); setIsSidebarOpen(false); }}
                              >
                                <div className="history-item-content" style={{ flex: 1, minWidth: 0 }}>
                                  <div className="history-item-icon" style={{ borderColor: '#9CA3AF' }}></div>
                                  <span className="history-item-text">{item.title}</span>
                                </div>
                                
                                <div style={{ position: 'relative' }}>
                                  <button 
                                    className="history-item-actions"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setHistoryMenuOpen(historyMenuOpen === item.id ? null : item.id);
                                    }}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                  </button>

                                  {historyMenuOpen === item.id && (
                                    <div className="history-dropdown" onClick={(e) => e.stopPropagation()}>
                                      <div className="history-dropdown-item" onClick={() => togglePin(item.id)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                                        <span>إلغاء التثبيت</span>
                                      </div>
                                      
                                      <div className="history-dropdown-item" onClick={() => handleRename(item.id, item.title)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                        <span>إعادة تسمية</span>
                                      </div>

                                      <div className="history-dropdown-item" onClick={() => handleAddProject(item.id, item.project)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
                                        <span>تعديل المشروع</span>
                                      </div>

                                      <div className="history-dropdown-item" onClick={() => handleMoveGroup(item.id, item.group)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                        <span>نقل إلى مجموعة</span>
                                      </div>

                                      <div style={{ height: '1px', backgroundColor: '#33363A', margin: '4px 12px' }}></div>

                                      <div className="history-dropdown-item danger" onClick={() => handleDelete(item.id)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        <span>حذف</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Standalone Pinned Items */}
                  {historyList.filter(item => item.isPinned && !item.project).map(item => (
                    <div 
                      key={item.id} 
                      className="history-item" 
                      onClick={() => { setActiveChat({title: item.title, type: 'history'}); setIsSidebarOpen(false); }}
                    >
                      <div className="history-item-content" style={{ flex: 1, minWidth: 0, gap: '10px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', border: '1.5px solid #9CA3AF', flexShrink: 0 }}></div>
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <span className="history-item-text">
                            {item.title}
                          </span>
                          {item.group && (
                            <div style={{ display: 'flex', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.65rem', backgroundColor: '#F3E8FF', color: '#6B21A8', padding: '1px 6px', borderRadius: '4px', fontWeight: 500 }}>
                                🏷️ {item.group}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ position: 'relative' }}>
                        <button 
                          className="history-item-actions"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHistoryMenuOpen(historyMenuOpen === item.id ? null : item.id);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                        </button>

                        {historyMenuOpen === item.id && (
                          <div className="history-dropdown" onClick={(e) => e.stopPropagation()}>
                            <div className="history-dropdown-item" onClick={() => togglePin(item.id)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                              <span>إلغاء التثبيت</span>
                            </div>
                            
                            <div className="history-dropdown-item" onClick={() => handleRename(item.id, item.title)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                              <span>إعادة تسمية</span>
                            </div>

                            <div className="history-dropdown-item" onClick={() => handleAddProject(item.id, item.project)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
                              <span>إضافة إلى مشروع</span>
                            </div>

                            {item.group ? (
                              <div className="history-dropdown-item" onClick={() => removeFromGroup(item.id)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                <span>إزالة من المجموعة</span>
                              </div>
                            ) : (
                              <div className="history-dropdown-item" onClick={() => handleMoveGroup(item.id, item.group)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                <span>نقل إلى مجموعة</span>
                              </div>
                            )}

                            <div style={{ height: '1px', backgroundColor: '#33363A', margin: '4px 12px' }}></div>

                            <div className="history-dropdown-item danger" onClick={() => handleDelete(item.id)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                              <span>حذف</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Projects Section */}
          {Array.from(new Set(historyList.map(item => item.project).filter(Boolean))).map((projectName) => {
            const proj = projectName as string;
            const projectItems = historyList.filter(item => item.project === proj && !item.isPinned);
            const isOpen = openProjects[proj] !== false; // default open

            if (projectItems.length === 0) return null;

            return (
              <div key={proj} style={{ marginBottom: '8px' }}>
                <button 
                  className="nav-item"
                  onClick={() => toggleProjectOpen(proj)}
                  style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'right', color: '#4B5563', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4B5563' }}>
                      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                      <line x1="8" y1="15" x2="16" y2="15"></line>
                    </svg>
                    <span>{proj}</span>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {isOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '16px', marginTop: '2px' }}>
                    {projectItems.map(item => (
                      <div 
                        key={item.id} 
                        className="history-item" 
                        onClick={() => { setActiveChat({title: item.title, type: 'history'}); setIsSidebarOpen(false); }}
                      >
                        <div className="history-item-content" style={{ flex: 1, minWidth: 0 }}>
                          <div className="history-item-icon" style={{ borderColor: '#9CA3AF' }}></div>
                          <span className="history-item-text">{item.title}</span>
                        </div>
                        
                        <div style={{ position: 'relative' }}>
                          <button 
                            className="history-item-actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHistoryMenuOpen(historyMenuOpen === item.id ? null : item.id);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                          </button>

                          {historyMenuOpen === item.id && (
                            <div className="history-dropdown" onClick={(e) => e.stopPropagation()}>
                              <div className="history-dropdown-item" onClick={() => togglePin(item.id)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                                <span>تثبيت</span>
                              </div>
                              
                              <div className="history-dropdown-item" onClick={() => handleRename(item.id, item.title)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                <span>إعادة تسمية</span>
                              </div>

                              <div className="history-dropdown-item" onClick={() => handleAddProject(item.id, item.project)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
                                <span>تعديل المشروع</span>
                              </div>

                              <div className="history-dropdown-item" onClick={() => handleMoveGroup(item.id, item.group)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                <span>نقل إلى مجموعة</span>
                              </div>

                              <div style={{ height: '1px', backgroundColor: '#33363A', margin: '4px 12px' }}></div>

                              <div className="history-dropdown-item danger" onClick={() => handleDelete(item.id)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                <span>حذف</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Groups Section */}
          {Array.from(new Set(historyList.map(item => item.group).filter(Boolean))).map((groupName) => {
            const grp = groupName as string;
            const groupItems = historyList.filter(item => item.group === grp && !item.isPinned && !item.project);
            const isOpen = openGroups[grp] !== false;

            if (groupItems.length === 0) return null;

            return (
              <div key={grp} style={{ marginBottom: '8px' }}>
                <button 
                  className="nav-item"
                  onClick={() => toggleGroupOpen(grp)}
                  style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'right', color: '#4B5563', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4B5563' }}>
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>{grp}</span>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {isOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '16px', marginTop: '2px' }}>
                    {groupItems.map(item => (
                      <div 
                        key={item.id} 
                        className="history-item" 
                        onClick={() => { setActiveChat({title: item.title, type: 'history'}); setIsSidebarOpen(false); }}
                      >
                        <div className="history-item-content" style={{ flex: 1, minWidth: 0 }}>
                          <div className="history-item-icon" style={{ borderColor: '#9CA3AF' }}></div>
                          <span className="history-item-text">{item.title}</span>
                        </div>
                        
                        <div style={{ position: 'relative' }}>
                          <button 
                            className="history-item-actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHistoryMenuOpen(historyMenuOpen === item.id ? null : item.id);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                          </button>

                          {historyMenuOpen === item.id && (
                            <div className="history-dropdown" onClick={(e) => e.stopPropagation()}>
                              <div className="history-dropdown-item" onClick={() => togglePin(item.id)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                                <span>تثبيت</span>
                              </div>
                              
                              <div className="history-dropdown-item" onClick={() => handleRename(item.id, item.title)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                <span>إعادة تسمية</span>
                              </div>

                              <div className="history-dropdown-item" onClick={() => handleAddProject(item.id, item.project)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
                                <span>إضافة إلى مشروع</span>
                              </div>

                              {item.group ? (
                                <div className="history-dropdown-item" onClick={() => removeFromGroup(item.id)}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                  <span>إزالة من المجموعة</span>
                                </div>
                              ) : (
                                <div className="history-dropdown-item" onClick={() => handleMoveGroup(item.id, item.group)}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                  <span>نقل إلى مجموعة</span>
                                </div>
                              )}

                              <div style={{ height: '1px', backgroundColor: '#33363A', margin: '4px 12px' }}></div>

                              <div className="history-dropdown-item danger" onClick={() => handleDelete(item.id)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                <span>حذف</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* General History Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button 
              className={`nav-item ${activeAccordion === 'history' ? 'active' : ''}`}
              onClick={() => setActiveAccordion(activeAccordion === 'history' ? null : 'history')}
              style={{ width: '100%', border: 'none', background: activeAccordion === 'history' ? 'rgba(36, 113, 234, 0.1)' : 'transparent', textAlign: 'right' }}
            >
              <svg className="icon-default" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <svg className="icon-hover" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
              </svg>
              سجل المحادثات
            </button>
            {activeAccordion === 'history' && (
              <div className="accordion-content" style={{ paddingRight: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {historyList.filter(item => !item.isPinned && !item.project && !item.group).map(item => (
                  <div 
                    key={item.id} 
                    className="history-item" 
                    onClick={() => { setActiveChat({title: item.title, type: 'history'}); setIsSidebarOpen(false); }}
                  >
                    <div className="history-item-content" style={{ flex: 1, minWidth: 0 }}>
                      <div className="history-item-icon" style={{ borderColor: '#9CA3AF' }}></div>
                      <span className="history-item-text">{item.title}</span>
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="history-item-actions"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHistoryMenuOpen(historyMenuOpen === item.id ? null : item.id);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                      </button>

                      {historyMenuOpen === item.id && (
                        <div className="history-dropdown" onClick={(e) => e.stopPropagation()}>
                          <div className="history-dropdown-item" onClick={() => togglePin(item.id)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                            <span>تثبيت</span>
                          </div>
                          
                          <div className="history-dropdown-item" onClick={() => handleRename(item.id, item.title)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            <span>إعادة تسمية</span>
                          </div>

                          <div className="history-dropdown-item" onClick={() => handleAddProject(item.id, item.project)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
                            <span>إضافة إلى مشروع</span>
                          </div>

                          <div className="history-dropdown-item" onClick={() => handleMoveGroup(item.id, item.group)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            <span>نقل إلى مجموعة</span>
                          </div>

                          <div style={{ height: '1px', backgroundColor: '#33363A', margin: '4px 12px' }}></div>

                          <div className="history-dropdown-item danger" onClick={() => handleDelete(item.id)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            <span>حذف</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            className="nav-item"
            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'right', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}
          >
            <svg className="icon-default" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v.5"/>
            </svg>
            <svg className="icon-hover" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
            العودة للسابق
          </button>
        </div>

        <div className="sidebar-spacer"></div>

        <div style={{ position: 'relative', width: '100%' }}>
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#E5E9EC',
              padding: '6px 6px 6px 12px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-arabic)',
              width: '100%',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Avatar */}
              <div style={{
                width: '32px', height: '32px', backgroundColor: '#1E3A8A', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                fontWeight: 700, fontSize: '12px', fontFamily: 'var(--font-base)', overflow: 'hidden',
                flexShrink: 0
              }}>
                {userData?.avatar && !userData.avatar.includes('default_avatar') ? (
                  <img src={userData.avatar.startsWith('/') ? userData.avatar : `/${userData.avatar}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img 
                    src={userData?.gender === 'female' 
                      ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jane&backgroundColor=ffdfbf' 
                      : 'https://api.dicebear.com/9.x/avataaars/svg?seed=John&backgroundColor=b6e3f4'} 
                    alt="Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                )}
              </div>
              
              {/* Name */}
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                {userData?.name || 'طالب علم'}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* Role Badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#BFDBFE',
                color: '#1E3A8A', padding: '2px 8px', borderRadius: '12px', fontSize: '11px',
                fontWeight: 600, marginTop: '2px', flexShrink: 0
              }}>
                <span>
                  {userData?.role === 'superadmin' ? 'مسؤول عام' : 
                   userData?.role === 'admin' ? 'مسؤول' : 'طالب'}
                </span>
              </div>
              

            </div>
          </button>
        </div>
      </aside>

      {/* Main Area & Split Screen Layout */}
      <div style={{ display: 'flex', flex: 1, width: '100%', overflow: 'hidden' }}>
        <main className="main-workspace" style={{ borderLeft: 'none', backgroundImage: activeChat ? 'none' : 'url("/images/hero_bg.png")', backgroundColor: activeChat ? '#ffffff' : 'var(--color-surface)' }}>
          <header className="top-bar">
            <div className="plan-badge">
              باقة الطالب · <a href="#">ترقية</a>
            </div>
            
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                title="إظهار القائمة"
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 16 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1L11.5 4.5L8 8L4.5 4.5Z" />
                  <path d="M8 4.5L11.5 8L8 11.5L4.5 8Z" transform="translate(0, 2)" />
                  <path d="M8 8L11.5 11.5L8 15L4.5 11.5Z" transform="translate(0, 4)" />
                </svg>
              </button>
            )}
          </header>

          {activeChat ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              {/* Chat Header */}
              <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                    {activeChat.title}
                  </h2>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6B7280' }}>
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
                <button onClick={() => setActiveChat(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '0.9rem', fontWeight: 500, padding: '4px 8px', borderRadius: '6px', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  إلغاء
                </button>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '768px', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* User Message */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <div style={{ backgroundColor: '#F3F4F6', padding: '12px 18px', borderRadius: '16px', color: '#111827', fontSize: '1rem', lineHeight: 1.6, maxWidth: '80%' }}>
                      {currentMessage}
                    </div>
                  </div>

                  {/* AI Message */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '90%' }}>
                      <div style={{ color: '#111827', fontSize: '1.05rem', lineHeight: 1.8 }}>
                        <p style={{ margin: '0 0 16px 0' }}>حسب نص <b>{activeChat.title}</b>، شروط صحة الصلاة قبل الدخول فيها هي خمسة أساسية:</p>
                        <ol style={{ margin: 0, paddingRight: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <li><b>طهارة الأعضاء</b> من الحدث الأكبر والأصغر، ومن النجس الذي لا يعفى عنه.</li>
                          <li><b>ستر العورة</b> بلباس طاهر.</li>
                          <li><b>الوقوف على مكان طاهر</b>.</li>
                          <li><b>العلم بدخول الوقت</b> أو ظنه بالاجتهاد.</li>
                          <li><b>استقبال القبلة</b> بالصدر.</li>
                        </ol>
                        <p style={{ margin: '16px 0 0 0', color: '#4B5563', fontSize: '0.95rem' }}>هل ترغب في شرح تفصيلي لأي من هذه الشروط؟</p>
                      </div>
                      
                      {/* Action Icons */}
                      <div style={{ display: 'flex', gap: '16px', marginTop: '16px', color: '#9CA3AF' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px', borderRadius: '4px', transition: 'color 0.2s' }} title="نسخ" onMouseOver={e => e.currentTarget.style.color = '#4B5563'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px', borderRadius: '4px', transition: 'color 0.2s' }} title="استماع" onMouseOver={e => e.currentTarget.style.color = '#4B5563'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px', borderRadius: '4px', transition: 'color 0.2s' }} title="إجابة جيدة" onMouseOver={e => e.currentTarget.style.color = '#4B5563'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px', borderRadius: '4px', transition: 'color 0.2s' }} title="إجابة سيئة" onMouseOver={e => e.currentTarget.style.color = '#4B5563'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px', borderRadius: '4px', transition: 'color 0.2s' }} title="إعادة التوليد" onMouseOver={e => e.currentTarget.style.color = '#4B5563'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input Bottom */}
              <div style={{ padding: '24px 0', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '768px', padding: '0 24px' }}>
                  <div style={{ backgroundColor: '#F9FAFB', borderRadius: '16px', display: 'flex', flexDirection: 'column', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    {attachedBooks.length > 0 && (
                      <div style={{ display: 'flex', padding: '12px 16px', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid #E5E7EB' }}>
                        {attachedBooks.map(b => (
                          <div key={b.id} style={{ 
                            position: 'relative', width: '80px', height: '80px', 
                            borderRadius: '8px', border: '1px solid #E5E9EC', overflow: 'hidden', 
                            backgroundColor: '#1E293B', display: 'flex', flexDirection: 'column' 
                          }}>
                            {b.coverUrl ? (
                              <img src={b.coverUrl} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ padding: '8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ color: 'white', fontSize: '0.7rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textAlign: 'right', direction: 'rtl' }}>
                                  {b.title}
                                </div>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '2px 4px', borderRadius: '4px', fontSize: '0.6rem', alignSelf: 'flex-end', border: '1px solid rgba(255,255,255,0.2)' }}>
                                  كتاب
                                </div>
                              </div>
                            )}
                            <button onClick={() => setAttachedBooks(prev => prev.filter(x => x.id !== b.id))} style={{ 
                              position: 'absolute', top: '4px', right: '4px', width: '18px', height: '18px', 
                              borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', 
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                            }} title="إزالة">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '8px' }}>
                      <button className="icon-btn" title="إرفاق ملف" onClick={() => fileInputRef.current?.click()} style={{ padding: '8px', flexShrink: 0, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>

                      <textarea 
                        ref={textareaRef}
                        placeholder="اكتب سؤالك أو استفسارك هنا..."
                        rows={1}
                        dir="auto"
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        style={{ flex: 1, background: 'none', border: 'none', resize: 'none', outline: 'none', fontSize: '1rem', padding: '8px 0', maxHeight: '150px', fontFamily: 'inherit', color: '#111827' }}
                      ></textarea>

                      {inputText.trim().length > 0 ? (
                        <button onClick={handleSend} style={{ backgroundColor: 'var(--color-primary-600)', color: 'white', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-primary-700)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--color-primary-600)'} title="إرسال">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-135deg)', marginLeft: '2px' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                      ) : (
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }} title="تسجيل صوتي" onMouseOver={e => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="22"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: '#9CA3AF' }}>
                    حاشية أداة ذكاء اصطناعي وقد تخطئ. يرجى التحقق من المعلومات المستخرجة من المتون.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="center-content">
              <h1 className="greeting-title">
                أهلاً بك مجدداً في حاشية!
              </h1>

              <div className="input-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
                {attachedBooks.length > 0 && (
                  <div style={{ display: 'flex', padding: '12px 16px', gap: '8px', flexWrap: 'wrap' }}>
                    {attachedBooks.map(b => (
                      <div key={b.id} style={{ 
                        position: 'relative', width: '117px', height: '117px', 
                        borderRadius: '12px', border: '1px solid #E5E9EC', overflow: 'hidden', 
                        backgroundColor: '#1E293B', display: 'flex', flexDirection: 'column' 
                      }}>
                        {b.coverUrl ? (
                          <img src={b.coverUrl} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', textAlign: 'right', direction: 'rtl' }}>
                              {b.title}
                            </div>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', alignSelf: 'flex-end', border: '1px solid rgba(255,255,255,0.2)' }}>
                              كتاب
                            </div>
                          </div>
                        )}
                        <button onClick={() => setAttachedBooks(prev => prev.filter(x => x.id !== b.id))} style={{ 
                          position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px', 
                          borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', 
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }} title="إزالة">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <textarea 
                  ref={textareaRef}
                  className="main-input" 
                  placeholder="كيف يمكنني مساعدتك في دراستك اليوم؟"
                  rows={1}
                  dir="auto"
                  onInput={handleInput}
                  onKeyDown={handleKeyDown}
                ></textarea>
                
                <div className="input-toolbar">
                  <div className="toolbar-right">
                    <button className="icon-btn" title="إرفاق ملف" onClick={() => fileInputRef.current?.click()}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                    <button className="icon-btn" title="تحديد الكتاب" style={{ display: 'flex', gap: '6px', fontSize: '0.85rem', padding: '6px 12px', borderRadius: '16px', border: '1px solid #e2e8f0' }} onClick={() => setShowBooksModal(true)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                      تحديد المصدر
                    </button>
                  </div>

                  <div className="toolbar-left">
                    {inputText.trim().length > 0 ? (
                      <button onClick={handleSend} className="icon-btn" style={{ backgroundColor: 'var(--color-primary-600)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', paddingRight: '2px' }} title="إرسال">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-135deg)' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      </button>
                    ) : (
                      <button className="icon-btn" title="تسجيل صوتي">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                          <line x1="12" y1="19" x2="12" y2="22"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {inputText.trim().length === 0 && (
                <div className="prompt-chips-container">
                  <div className="prompt-chip-claude" onClick={() => setActivePromptCategory('إعراب جملة')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    إعراب جملة
                  </div>
                  <div className="prompt-chip-claude" onClick={() => setActivePromptCategory('شرح متن')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                    شرح متن
                  </div>
                  <div className="prompt-chip-claude" onClick={() => setActivePromptCategory('ترجمة للملايو')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                    ترجمة للملايو
                  </div>
                  <div className="prompt-chip-claude" onClick={() => setActivePromptCategory('إنشاء أسئلة')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    إنشاء أسئلة
                  </div>
                </div>
              )}
            </div>
          )}
        </main>


      </div>

      {/* Books Selection Modal */}
      {showBooksModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }} onClick={() => setShowBooksModal(false)}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '32px',
            width: '90%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#111827' }}>الكتب النشطة (مواد التعليم)</h2>
              <button onClick={() => setShowBooksModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            {isLoadingBooks ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <div style={{ width: '30px', height: '30px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--color-primary-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {books.map((book: any) => {
                  const isSelected = attachedBooks.some(b => b.id === book.id);
                  return (
                  <div 
                    key={book.id} 
                    style={{
                      border: isSelected ? '2px solid var(--color-primary-600)' : '1px solid #E5E9EC',
                      backgroundColor: isSelected ? 'rgba(36, 113, 234, 0.04)' : 'white',
                      borderRadius: '12px', padding: '16px',
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => { if(!isSelected) { e.currentTarget.style.borderColor = 'var(--color-primary-400)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; } }}
                    onMouseLeave={(e) => { if(!isSelected) { e.currentTarget.style.borderColor = '#E5E9EC'; e.currentTarget.style.boxShadow = 'none'; } }}
                    onClick={() => {
                      if (isSelected) {
                        setAttachedBooks(prev => prev.filter(b => b.id !== book.id));
                      } else {
                        setAttachedBooks(prev => [...prev, book]);
                      }
                    }}
                  >
                    {/* Modern Checkbox */}
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      width: '24px', height: '24px', borderRadius: '50%',
                      border: isSelected ? 'none' : '2px solid #D1D5DB',
                      backgroundColor: isSelected ? 'var(--color-primary-600)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}>
                      {isSelected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>

                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} style={{ width: '120px', height: '170px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    ) : (
                      <div style={{ width: '120px', height: '170px', backgroundColor: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                      </div>
                    )}
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem', marginTop: '4px' }}>{book.title}</div>
                    <div style={{ color: '#6B7280', fontSize: '0.85rem' }}>{book.author}</div>
                  </div>
                )})}
                {books.length === 0 && !isLoadingBooks && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                    لا توجد كتب متاحة حالياً
                  </div>
                )}
              </div>
            )}
            
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E5E9EC', paddingTop: '20px' }}>
              <button 
                onClick={() => setShowBooksModal(false)}
                style={{
                  backgroundColor: 'var(--color-primary-600)', color: 'white', border: 'none', 
                  padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                  fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                إدراج المراجع ({attachedBooks.length}) 
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Suggestions Popup Modal */}
      {activePromptCategory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)'
        }} onClick={() => setActivePromptCategory(null)}>
          <div style={{
            backgroundColor: '#1E1E1E', borderRadius: '16px', padding: '0',
            width: '90%', maxWidth: '600px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
            color: '#E8EAED', display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #3C4043' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <h2 style={{ fontSize: '1rem', fontWeight: 500, margin: 0, color: '#9AA0A6' }}>{activePromptCategory}</h2>
              </div>
              <button onClick={() => setActivePromptCategory(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA0A6' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {PROMPT_SUGGESTIONS[activePromptCategory]?.map((suggestion, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    if (textareaRef.current) {
                      textareaRef.current.value = suggestion;
                      handleInput();
                    }
                    setActivePromptCategory(null);
                  }}
                  style={{
                    padding: '16px 24px', cursor: 'pointer', borderBottom: idx !== PROMPT_SUGGESTIONS[activePromptCategory].length - 1 ? '1px solid #3C4043' : 'none',
                    transition: 'background-color 0.2s', fontSize: '1rem', color: '#E8EAED'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#292A2D'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Rename, Project, Group) */}
      {editingItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
        }} onClick={() => setEditingItem(null)}>
          <div style={{
            backgroundColor: '#1E1E1E', borderRadius: '16px', padding: '24px',
            width: '90%', maxWidth: '420px', color: '#E8EAED',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
            border: '1px solid #33363A'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>
              {editingItem.type === 'rename' ? 'إعادة تسمية المحادثة' : 
               editingItem.type === 'project' ? 'إضافة إلى مشروع' : 'نقل إلى مجموعة'}
            </h3>

            {editingItem.type === 'group' && createdGroups.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', color: '#9AA0A6', marginBottom: '8px' }}>اختيار مجموعة حالية:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                  {Array.from(new Set(createdGroups)).map((grp, idx) => (
                    <button
                      key={`${grp}-${idx}`}
                      onClick={() => {
                        setHistoryList(prev => prev.map(item => item.id === editingItem.id ? { ...item, group: grp } : item));
                        setEditingItem(null);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', borderRadius: '8px', border: '1px solid #3C4043',
                        backgroundColor: editingItem.currentValue === grp ? 'rgba(36, 113, 234, 0.2)' : '#2D2E31',
                        color: 'white', cursor: 'pointer', textAlign: 'right', fontSize: '0.88rem',
                        fontFamily: 'var(--font-arabic)', width: '100%'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        <span>{grp}</span>
                      </div>
                      {editingItem.currentValue === grp && <span style={{ fontSize: '0.75rem', color: '#60A5FA' }}>محدد</span>}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9AA0A6', marginTop: '14px', marginBottom: '8px' }}>أو إنشاء مجموعة جديدة:</div>
              </div>
            )}

            <input
              type="text"
              value={modalInputValue}
              onChange={e => setModalInputValue(e.target.value)}
              placeholder={editingItem.type === 'rename' ? 'اسم المحادثة...' : editingItem.type === 'project' ? 'اسم المشروع...' : 'اسم المجموعة الجديدة...'}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: '1px solid #3C4043', backgroundColor: '#2D2E31', color: 'white',
                fontSize: '0.95rem', fontFamily: 'var(--font-arabic)', outline: 'none', marginBottom: '20px'
              }}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') saveEditing();
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setEditingItem(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #3C4043', color: '#9AA0A6', cursor: 'pointer', backgroundColor: 'transparent' }}>
                إلغاء
              </button>
              <button onClick={saveEditing} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-primary-600)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
