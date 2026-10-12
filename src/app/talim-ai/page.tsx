'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './talim.css';

export default function TalimAIWorkspace() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userData, setUserData] = useState<{name: string, role: string, avatar: string, gender?: string} | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeChat, setActiveChat] = useState<{ id?: string; title: string; type: 'book' | 'history' } | null>(null);
  
  const [attachedBooks, setAttachedBooks] = useState<any[]>([]);
  const [showBooksModal, setShowBooksModal] = useState<boolean>(false);
  const [books, setBooks] = useState<any[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [activePromptCategory, setActivePromptCategory] = useState<string | null>(null);
  const [historyMenuOpen, setHistoryMenuOpen] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);

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

  // ☁️ Riwayat chat aktual yang dimuat dari Cloudflare R2
  const [historyList, setHistoryList] = useState<{id: string; title: string; isPinned?: boolean; project?: string | null; group?: string | null; updatedAt?: number}[]>([]);

  const [editingItem, setEditingItem] = useState<{ id: string, type: 'rename' | 'project' | 'group', currentValue: string } | null>(null);
  const [modalInputValue, setModalInputValue] = useState('');
  
  const { messages, sendMessage, status, stop, setMessages } = useChat();
  const isLoading = status === 'submitted' || status === 'streaming';
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const [voiceLang, setVoiceLang] = useState<'id-ID' | 'ar-SA'>('id-ID');
  const recognitionRef = useRef<any>(null);
  const baseInputRef = useRef<string>('');
  const accumulatedTranscriptRef = useRef<string>('');
  
  const [audioVolumes, setAudioVolumes] = useState<number[]>(() => Array(36).fill(4));
  const audioContextRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<any>(null);

  const startVisualizer = () => {
    const numBars = 36;
    if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
    fallbackTimerRef.current = setInterval(() => {
      setAudioVolumes(prev => {
        return prev.map((_, i) => {
          const distFromCenter = Math.abs(i - numBars / 2) / (numBars / 2);
          const envelope = 1 - Math.pow(distFromCenter, 1.8);
          const fluctuation = Math.random() * 18;
          return Math.max(4, Math.round(4 + fluctuation * Math.max(0.2, envelope)));
        });
      });
    }, 80);

    if (typeof window !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        mediaStreamRef.current = stream;
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 128;
            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            if (fallbackTimerRef.current) {
              clearInterval(fallbackTimerRef.current);
              fallbackTimerRef.current = null;
            }

            const updateWave = () => {
              analyser.getByteFrequencyData(dataArray);
              const newVolumes = [];
              for (let i = 0; i < numBars; i++) {
                const distFromCenter = Math.abs(i - numBars / 2) / (numBars / 2);
                const envelope = 1 - Math.pow(distFromCenter, 1.8);
                const binIdx = Math.floor((i / numBars) * (dataArray.length / 2));
                const val = dataArray[binIdx] || 0;
                const h = 4 + (val / 255) * 24 * Math.max(0.25, envelope);
                newVolumes.push(Math.round(h));
              }
              setAudioVolumes(newVolumes);
              animFrameRef.current = requestAnimationFrame(updateWave);
            };
            updateWave();
          }
        } catch (_) {}
      }).catch(() => {});
    }
  };

  const cleanupVisualizer = () => {
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (_) {}
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      try { mediaStreamRef.current.getTracks().forEach(t => t.stop()); } catch (_) {}
      mediaStreamRef.current = null;
    }
    setAudioVolumes(Array(36).fill(4));
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    isListeningRef.current = false;
  };

  const handleStopListening = () => {
    stopListening();
    cleanupVisualizer();

    const speechText = accumulatedTranscriptRef.current.trim();
    const base = baseInputRef.current;
    if (speechText) {
      const separator = base && !base.endsWith(' ') ? ' ' : '';
      const fullText = base ? `${base}${separator}${speechText}` : speechText;
      setInput(fullText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      }, 50);
    }
    accumulatedTranscriptRef.current = '';
    baseInputRef.current = '';
  };

  const handleCancelListening = () => {
    stopListening();
    cleanupVisualizer();
    accumulatedTranscriptRef.current = '';
    baseInputRef.current = '';
  };

  const startRecognition = (langOverride?: string) => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('متصفحك لا يدعم خاصية التعرف على الصوت (Speech Recognition). يرجى استخدام متصفح مثل Google Chrome أو Microsoft Edge.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }

      const targetLang = langOverride || voiceLang;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = targetLang;

      baseInputRef.current = input;
      accumulatedTranscriptRef.current = '';

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        startVisualizer();
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        accumulatedTranscriptRef.current = transcript.trim();
        // Disimpan sementara, dimunculkan ke input saat stop ditekan
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          alert('يرجى السماح بالوصول إلى الميكروفون لاستخدام الإدخال الصوتي.');
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Speech recognition notice:', event.error);
        }
        handleStopListening();
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          handleStopListening();
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      handleStopListening();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      handleStopListening();
    } else {
      startRecognition(voiceLang);
    }
  };

  const switchVoiceLang = (newLang: 'id-ID' | 'ar-SA') => {
    setVoiceLang(newLang);
    if (isListeningRef.current) {
      const currentSpeech = accumulatedTranscriptRef.current.trim();
      if (currentSpeech) {
        const base = baseInputRef.current;
        const sep = base && !base.endsWith(' ') ? ' ' : '';
        baseInputRef.current = base ? `${base}${sep}${currentSpeech}` : currentSpeech;
        accumulatedTranscriptRef.current = '';
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setTimeout(() => {
        startRecognition(newLang);
      }, 150);
    }
  };

  const cleanTextForSpeech = (rawText: string) => {
    return rawText
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^>\s+/gm, '')
      .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/[-*_]{3,}\s*$/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedMessageId(id);
      setTimeout(() => {
        setCopiedMessageId(prev => (prev === id ? null : prev));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleToggleSpeech = (id: string, rawText: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('متصفحك لا يدعم خاصية قراءة النصوص صوتياً (Speech Synthesis).');
      return;
    }

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = cleanTextForSpeech(rawText);
    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const arabicChars = (textToSpeak.match(/[\u0600-\u06FF]/g) || []).length;
    const latinChars = (textToSpeak.match(/[a-zA-Z]/g) || []).length;
    const isAr = arabicChars > latinChars;

    utterance.lang = isAr ? 'ar-SA' : 'id-ID';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = isAr
      ? voices.find(v => v.lang.startsWith('ar'))
      : voices.find(v => v.lang.startsWith('id'));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = (e: any) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis notice:', e.error || e);
      }
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(id);
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
    }
    return () => {
      handleCancelListening();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getUserId = () => {
    if (typeof window === 'undefined') return 'guest';
    try {
      const u = localStorage.getItem('currentUser');
      if (u) {
        const parsed = JSON.parse(u);
        return String(parsed.id || parsed.username || parsed.email || 'guest');
      }
    } catch (_) {}
    return 'guest';
  };

  // ☁️ Muat riwayat percakapan dari Cloudflare R2 saat halaman dibuka
  useEffect(() => {
    const userId = getUserId();
    fetch(`/api/chat/history?userId=${encodeURIComponent(userId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.chats && Array.isArray(data.chats)) {
          setHistoryList(data.chats);
        }
      })
      .catch(err => console.error('[R2 Chat] Gagal memuat daftar riwayat:', err));
  }, []);

  const openChatSession = async (item: { id: string; title: string; type?: 'book' | 'history' }) => {
    handleCancelListening();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
    setActiveChat({ id: item.id, title: item.title, type: item.type || 'history' });
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }

    try {
      const userId = getUserId();
      const res = await fetch(`/api/chat/history?userId=${encodeURIComponent(userId)}&chatId=${encodeURIComponent(item.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.chat?.messages && Array.isArray(data.chat.messages)) {
          setMessages(data.chat.messages);
        }
        if (data.chat?.attachedBooks && Array.isArray(data.chat.attachedBooks)) {
          setAttachedBooks(data.chat.attachedBooks);
        }
      }
    } catch (err) {
      console.error('[R2 Chat] Gagal membuka sesi chat:', err);
    }
  };

  const startNewChat = () => {
    handleCancelListening();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
    setActiveChat(null);
    setMessages([]);
    setAttachedBooks([]);
    setInput('');
  };

  const getMessageContent = (m: any) => {
    if (typeof m.content === 'string' && m.content) return m.content;
    if (Array.isArray(m.parts)) {
      return m.parts.map((p: any) => {
        if (p.type === 'text') return p.text || '';
        if (p.type === 'error') return `⚠️ ${p.error?.message || p.error || 'Terjadi kesalahan sistem'}`;
        return '';
      }).join('');
    }
    return '';
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ☁️ Auto-save percakapan ke Cloudflare R2 setiap selesai menerima respons
  useEffect(() => {
    if (status === 'ready' && messages.length > 0) {
      const userId = getUserId();
      const firstUserMsg = messages.find(m => m.role === 'user');
      const rawContent = getMessageContent(firstUserMsg);
      const defaultTitle = rawContent.slice(0, 32).trim() + (rawContent.length > 32 ? '...' : '') || 'محادثة جديدة';

      const currentId = activeChat?.id || `chat-${Date.now()}`;
      const currentTitle = activeChat?.title || defaultTitle;

      if (!activeChat?.id) {
        setActiveChat({ id: currentId, title: currentTitle, type: 'history' });
      }

      const sessionData = {
        id: currentId,
        title: currentTitle,
        messages,
        attachedBooks,
        isPinned: historyList.find(h => h.id === currentId)?.isPinned || false,
        project: historyList.find(h => h.id === currentId)?.project || null,
        group: historyList.find(h => h.id === currentId)?.group || null,
        updatedAt: Date.now(),
      };

      fetch('/api/chat/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, session: sessionData }),
      })
        .then(res => res.json())
        .then(() => {
          fetch(`/api/chat/history?userId=${encodeURIComponent(userId)}`)
            .then(r => r.json())
            .then(d => {
              if (d.chats && Array.isArray(d.chats)) setHistoryList(d.chats);
            });
        })
        .catch(err => console.error('[R2 Auto-save Error]', err));
    }
  }, [status, messages.length]);

  const togglePin = async (id: string) => {
    const currentItem = historyList.find(item => item.id === id);
    if (!currentItem) return;
    const newPinned = !currentItem.isPinned;

    setHistoryList(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, isPinned: newPinned, project: newPinned ? item.project : null };
    }));
    setHistoryMenuOpen(null);

    const userId = getUserId();
    await fetch('/api/chat/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'patch', chatId: id, patch: { isPinned: newPinned } }),
    });
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

  const removeFromGroup = async (id: string) => {
    setHistoryList(prev => prev.map(item => item.id === id ? { ...item, group: null } : item));
    setHistoryMenuOpen(null);

    const userId = getUserId();
    await fetch('/api/chat/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'patch', chatId: id, patch: { group: null } }),
    });
  };

  const handleDelete = async (id: string) => {
    setHistoryList(prev => prev.filter(item => item.id !== id));
    if (activeChat?.id === id) {
      startNewChat();
    }
    setHistoryMenuOpen(null);

    const userId = getUserId();
    await fetch(`/api/chat/history?userId=${encodeURIComponent(userId)}&chatId=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  };

  const saveEditing = async () => {
    if (!editingItem) return;
    const userId = getUserId();
    const id = editingItem.id;
    let patch: any = {};

    if (editingItem.type === 'rename') {
      const newTitle = modalInputValue.trim() || 'محادثة';
      patch.title = newTitle;
      if (activeChat?.id === id) {
        setActiveChat(prev => prev ? { ...prev, title: newTitle } : null);
      }
    } else if (editingItem.type === 'project') {
      const projName = modalInputValue.trim() || null;
      patch.project = projName;
      if (projName) patch.isPinned = true;
    } else if (editingItem.type === 'group') {
      const grpName = modalInputValue.trim() || null;
      patch.group = grpName;
      if (grpName) {
        setCreatedGroups(prev => Array.from(new Set([...prev, grpName])));
      }
    }

    setHistoryList(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, ...patch };
    }));
    setEditingItem(null);

    if (Object.keys(patch).length > 0) {
      await fetch('/api/chat/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'patch', chatId: id, patch }),
      });
    }
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

  const getUserAvatarSrc = () => {
    if (userData?.avatar && !userData.avatar.includes('default_avatar')) {
      return userData.avatar.startsWith('/') ? userData.avatar : `/${userData.avatar}`;
    }
    return userData?.gender === 'female' 
      ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jane&backgroundColor=ffdfbf' 
      : 'https://api.dicebear.com/9.x/avataaars/svg?seed=John&backgroundColor=b6e3f4';
  };

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

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleCustomSubmit = (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement> | any) => {
    e?.preventDefault();
    if (isUploadingFile) return;

    let textToSend = input.trim();
    if (isListeningRef.current || isListening) {
      const speechText = accumulatedTranscriptRef.current.trim();
      const base = baseInputRef.current.trim();
      if (speechText) {
        textToSend = base ? `${base} ${speechText}` : speechText;
      }
      handleStopListening();
    }

    if (!textToSend.trim()) return;
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
    
    setInput('');

    // Lampirkan konteks file/buku Cloudflare R2 jika ada
    if (attachedBooks.length > 0) {
      const attachmentsContext = attachedBooks.map(b => {
        if (b.publicUrl) {
          return `[ملف مرفق: "${b.title}" - رابط: ${b.publicUrl}]`;
        }
        return `[كتاب مرفق: "${b.title}"]`;
      }).join('\n');
      textToSend = `${attachmentsContext}\n\n${textToSend}`;
    }

    if (!activeChat) {
      setActiveChat({ id: `chat-${Date.now()}`, title: textToSend.substring(0, 30) + (textToSend.length > 30 ? '...' : ''), type: 'history' });
    }
    
    sendMessage({ text: textToSend });
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomSubmit(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      e.target.value = '';

      if (file.size > 10 * 1024 * 1024) {
        alert('حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت.');
        return;
      }

      setIsUploadingFile(true);
      try {
        // 1. Minta presigned upload URL ke Cloudflare R2
        const res = await fetch('/api/chat/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || 'application/octet-stream',
            size: file.size,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'فشل في تهيئة رفع الملف إلى Cloudflare R2');
        }

        const { uploadUrl, objectKey, publicUrl } = await res.json();

        // 2. Upload file langsung ke Cloudflare R2 bucket
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error('فشل رفع الملف إلى التخزين السحابي Cloudflare R2');
        }

        // 3. Masukkan ke attachedBooks
        setAttachedBooks(prev => [...prev, {
          id: objectKey,
          title: file.name,
          coverUrl: null,
          publicUrl,
          size: file.size,
          isFile: true,
        }]);
      } catch (err: any) {
        console.error('[Upload File R2 Error]', err);
        alert(err.message || 'حدث خطأ أثناء رفع الملف إلى Cloudflare R2');
      } finally {
        setIsUploadingFile(false);
      }
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

        <button className="new-chat-btn" onClick={startNewChat}>
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
                                onClick={() => openChatSession(item)}
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
                      onClick={() => openChatSession(item)}
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
                        onClick={() => openChatSession(item)}
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
                        onClick={() => openChatSession(item)}
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
                    onClick={() => openChatSession(item)}
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
                <img 
                  src={getUserAvatarSrc()} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
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
        <main className="main-workspace" style={{ borderLeft: 'none' }}>
          <header className="top-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="plan-badge">
                باقة الطالب · <a href="#">ترقية</a>
              </div>

              {activeChat && (
                <button 
                  onClick={() => setActiveChat(null)} 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    border: '1px solid rgba(255, 255, 255, 0.3)', 
                    backdropFilter: 'blur(8px)', 
                    cursor: 'pointer', 
                    color: 'white', 
                    fontSize: '0.88rem', 
                    fontWeight: 600, 
                    padding: '6px 14px', 
                    borderRadius: '8px', 
                    transition: 'all 0.2s' 
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                >
                  إلغاء
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {activeChat && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 14px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.25)', color: 'white', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', margin: 0 }}>
                    {activeChat.title}
                  </h2>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
              )}

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
            </div>
          </header>

          {activeChat ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '768px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {messages.length === 0 && (
                    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'white', opacity: 0.8, fontSize: '1.2rem', textAlign: 'center' }}>
                      Kirimkan pertanyaan pertama Anda untuk memulai percakapan...
                    </div>
                  )}

                  {messages.map((m, idx) => {
                    let userMsgForThisTurn = m;
                    if (m.role !== 'user') {
                      for (let i = idx - 1; i >= 0; i--) {
                        if (messages[i].role === 'user') {
                          userMsgForThisTurn = messages[i];
                          break;
                        }
                      }
                    }
                    const userText = getMessageContent(userMsgForThisTurn);
                    const arabicChars = (userText.match(/[\u0600-\u06FF]/g) || []).length;
                    const latinChars = (userText.match(/[a-zA-Z]/g) || []).length;
                    const isAr = arabicChars > latinChars;
                    return (
                    <React.Fragment key={m.id}>
                      {m.role === 'user' ? (
                        <div dir={isAr ? "rtl" : "ltr"} style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', alignItems: 'flex-start', gap: '16px' }}>
                          <div style={{ 
                            backgroundColor: '#ffffff', padding: '14px 22px', borderRadius: isAr ? '4px 20px 20px 20px' : '20px 4px 20px 20px', 
                            color: '#0F172A', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '75%', 
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)', fontWeight: 500 
                          }}>
                            {getMessageContent(m)}
                          </div>
                          <div style={{ 
                            width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#1E3A8A',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', 
                            flexShrink: 0, border: '2px solid rgba(255,255,255,0.8)', overflow: 'hidden',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                          }}>
                            <img 
                              src={getUserAvatarSrc()} 
                              alt="User" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          </div>
                        </div>
                      ) : (
                        <div dir={isAr ? "rtl" : "ltr"} style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', alignItems: 'flex-start', gap: '16px' }}>
                          <div style={{ 
                            width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'white', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1359c8', 
                            flexShrink: 0, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.8)' 
                          }}>
                            <img src="/icon.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ maxWidth: '85%' }}>
                            <div className="markdown-body" style={{ color: '#ffffff', fontSize: '1.05rem', lineHeight: 1.6, textShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {getMessageContent(m)}
                              </ReactMarkdown>
                            </div>
                            {(() => {
                              const aiContent = getMessageContent(m);
                              const isCopied = copiedMessageId === m.id;
                              const isSpeaking = speakingMessageId === m.id;
                              return (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', alignItems: 'center' }}>
                                  {/* Tombol Salin / Copy */}
                                  <button
                                    onClick={() => handleCopyMessage(m.id, aiContent)}
                                    style={{
                                      background: isCopied ? 'rgba(74, 222, 128, 0.2)' : 'none',
                                      border: isCopied ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid transparent',
                                      cursor: 'pointer',
                                      color: isCopied ? '#4ade80' : 'rgba(255,255,255,0.75)',
                                      padding: '5px 8px',
                                      borderRadius: '6px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      transition: 'all 0.2s',
                                    }}
                                    onMouseOver={e => {
                                      if (!isCopied) {
                                        e.currentTarget.style.color = '#ffffff';
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                                      }
                                    }}
                                    onMouseOut={e => {
                                      if (!isCopied) {
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                      }
                                    }}
                                    title={isCopied ? 'تم النسخ بنجاح! / Disalin!' : 'نسخ النص / Salin teks'}
                                  >
                                    {isCopied ? (
                                      <>
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>تم النسخ</span>
                                      </>
                                    ) : (
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                      </svg>
                                    )}
                                  </button>

                                  {/* Tombol Dengar / TTS / Listen */}
                                  <button
                                    onClick={() => handleToggleSpeech(m.id, aiContent)}
                                    style={{
                                      background: isSpeaking ? 'rgba(147, 197, 253, 0.22)' : 'none',
                                      border: isSpeaking ? '1px solid rgba(147, 197, 253, 0.4)' : '1px solid transparent',
                                      cursor: 'pointer',
                                      color: isSpeaking ? '#bfdbfe' : 'rgba(255,255,255,0.75)',
                                      padding: '5px 8px',
                                      borderRadius: '6px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      transition: 'all 0.2s',
                                    }}
                                    onMouseOver={e => {
                                      if (!isSpeaking) {
                                        e.currentTarget.style.color = '#ffffff';
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                                      }
                                    }}
                                    onMouseOut={e => {
                                      if (!isSpeaking) {
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                      }
                                    }}
                                    title={isSpeaking ? 'إيقاف القراءة الصوتية / Hentikan suara' : 'استماع للنص / Dengarkan teks'}
                                  >
                                    {isSpeaking ? (
                                      <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                          <rect x="5" y="5" width="14" height="14" rx="3"></rect>
                                        </svg>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>إيقاف</span>
                                      </>
                                    ) : (
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  )})}

                  {isLoading && (() => {
                    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                    const lastUserText = lastUserMsg ? getMessageContent(lastUserMsg) : '';
                    const arabicCharsLast = (lastUserText.match(/[\u0600-\u06FF]/g) || []).length;
                    const latinCharsLast = (lastUserText.match(/[a-zA-Z]/g) || []).length;
                    const isLastUserAr = arabicCharsLast > latinCharsLast;
                    return (
                    <div dir={isLastUserAr ? "rtl" : "ltr"} style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ 
                        width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1359c8', 
                        flexShrink: 0, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.8)' 
                      }}>
                        <img src="/icon.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ maxWidth: '85%' }}>
                         <div className="typing-indicator" style={{ marginTop: '14px', marginLeft: '8px' }}>
                           <span></span><span></span><span></span>
                         </div>
                      </div>
                    </div>
                    );
                  })()}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Chat Input Bottom */}
              <div style={{ padding: '16px 0 24px 0', backgroundColor: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '768px', padding: '0 16px', boxSizing: 'border-box' }}>
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255, 255, 255, 0.4)', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }}>
                    {(attachedBooks.length > 0 || isUploadingFile) && (
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
                                  {b.isFile ? 'ملف' : 'كتاب'}
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
                        {isUploadingFile && (
                          <div style={{ 
                            position: 'relative', width: '80px', height: '80px', 
                            borderRadius: '8px', border: '1.5px dashed #2563EB', 
                            backgroundColor: '#EFF6FF', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: '4px'
                          }}>
                            <div className="typing-indicator" style={{ display: 'flex', gap: '3px' }}>
                              <span style={{ width: '4px', height: '4px', background: '#2563EB' }}></span>
                              <span style={{ width: '4px', height: '4px', background: '#2563EB' }}></span>
                              <span style={{ width: '4px', height: '4px', background: '#2563EB' }}></span>
                            </div>
                            <span style={{ fontSize: '0.65rem', color: '#2563EB', fontWeight: 600 }}>جاري الرفع...</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '8px', backgroundColor: '#ffffff', minHeight: '52px' }}>
                      {/* Sisi Kanan (Start di RTL): Tombol Lampiran atau Batal saat merekam */}
                      {isListening ? (
                        <button
                          type="button"
                          onClick={handleCancelListening}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#9CA3AF',
                            cursor: 'pointer',
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            transition: 'all 0.2s',
                            flexShrink: 0
                          }}
                          onMouseOver={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                          onMouseOut={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                          title="إلغاء التسجيل / Batal"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      ) : (
                        <button className="icon-btn" title="إرفاق ملف" onClick={() => fileInputRef.current?.click()} style={{ padding: '8px', flexShrink: 0, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                      )}

                      {/* Bagian Tengah: Gelombang Suara Hitam saat merekam ATAU Textarea saat biasa */}
                      {isListening ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px',
                          flex: 1,
                          minWidth: 0,
                          height: '36px',
                          padding: '0 8px',
                          overflow: 'hidden'
                        }}>
                          {audioVolumes.map((vol, idx) => (
                            <span
                              key={idx}
                              style={{
                                width: '2.5px',
                                height: `${vol}px`,
                                backgroundColor: '#111827',
                                borderRadius: '9999px',
                                display: 'inline-block',
                                transition: 'height 0.08s ease',
                                opacity: 0.9,
                                flexShrink: 0
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <textarea 
                          ref={textareaRef}
                          placeholder="اكتب سؤالك أو استفسارك هنا..."
                          rows={1}
                          dir="auto"
                          value={input}
                          onChange={handleInput}
                          onKeyDown={handleKeyDown}
                          style={{ flex: 1, background: 'none', border: 'none', resize: 'none', outline: 'none', fontSize: '1rem', padding: '8px 0', maxHeight: '150px', fontFamily: 'inherit', color: '#111827' }}
                        ></textarea>
                      )}

                      {/* Sisi Kiri (End di RTL): Tombol Mic/Stop, dan Tombol Kirim di sebelahnya */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {isListening ? (
                          <button
                            type="button"
                            onClick={handleStopListening}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              border: '2px solid #111827',
                              backgroundColor: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0,
                              flexShrink: 0,
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                            }}
                            onMouseOver={e => {
                              e.currentTarget.style.backgroundColor = '#F3F4F6';
                              e.currentTarget.style.transform = 'scale(1.06)';
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title="إنهاء التسجيل وتثبيت النص / Selesai merekam"
                          >
                            <div style={{
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#111827',
                              borderRadius: '3px'
                            }} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={toggleListening}
                            className="icon-btn"
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              color: '#6B7280',
                              flexShrink: 0,
                              transition: 'background-color 0.2s'
                            }}
                            title="تسجيل صوتي (إملاء) / Dikte Suara"
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                              <line x1="12" y1="19" x2="12" y2="22"></line>
                            </svg>
                          </button>
                        )}

                        {(input.trim().length > 0 || isListening) && (
                          <button
                            type="button"
                            onClick={handleCustomSubmit}
                            className="icon-btn"
                            style={{
                              backgroundColor: 'var(--color-primary-600)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              paddingRight: '2px',
                              flexShrink: 0,
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={e => {
                              e.currentTarget.style.backgroundColor = 'var(--color-primary-700)';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.backgroundColor = 'var(--color-primary-600)';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title="إرسال"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-135deg)' }}>
                              <line x1="22" y1="2" x2="11" y2="13"></line>
                              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', textShadow: '0 1px 2px rgba(0,0,0,0.3)', padding: '0 8px', wordBreak: 'break-word' }}>
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
                {(attachedBooks.length > 0 || isUploadingFile) && (
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
                              {b.isFile ? 'ملف' : 'كتاب'}
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
                    {isUploadingFile && (
                      <div style={{ 
                        position: 'relative', width: '117px', height: '117px', 
                        borderRadius: '12px', border: '1.5px dashed #2563EB', 
                        backgroundColor: '#EFF6FF', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}>
                        <div className="typing-indicator" style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ width: '5px', height: '5px', background: '#2563EB' }}></span>
                          <span style={{ width: '5px', height: '5px', background: '#2563EB' }}></span>
                          <span style={{ width: '5px', height: '5px', background: '#2563EB' }}></span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>جاري الرفع...</span>
                      </div>
                    )}
                  </div>
                )}
                {/* Area Input Tengah: Gelombang Suara Hitam berlatar Putih saat merekam ATAU Textarea saat biasa */}
                {isListening ? (
                  /* Saat merekam: Sejajarkan dalam satu baris (Batal/Bahasa - Gelombang Suara - Stop/Kirim) */
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    minHeight: '52px',
                    padding: '4px 0'
                  }}>
                    {/* Sisi Kanan (Start di RTL): Batal */}
                    <button
                      type="button"
                      onClick={handleCancelListening}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        transition: 'all 0.2s',
                        flexShrink: 0
                      }}
                      onMouseOver={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                      onMouseOut={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      title="إلغاء التسجيل / Batal"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>

                    {/* Bagian Tengah: Gelombang Suara Sejajar (Centered & Responsive) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      flex: 1,
                      minWidth: 0,
                      height: '36px',
                      padding: '0 8px',
                      overflow: 'hidden'
                    }}>
                      {audioVolumes.map((vol, idx) => (
                        <span
                          key={idx}
                          style={{
                            width: '2.5px',
                            height: `${vol}px`,
                            backgroundColor: '#111827',
                            borderRadius: '9999px',
                            display: 'inline-block',
                            transition: 'height 0.08s ease',
                            opacity: 0.9,
                            flexShrink: 0
                          }}
                        />
                      ))}
                    </div>

                    {/* Sisi Kiri (End di RTL): Tombol Stop dan Tombol Kirim */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={handleStopListening}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: '2px solid #111827',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          flexShrink: 0,
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.backgroundColor = '#F3F4F6';
                          e.currentTarget.style.transform = 'scale(1.06)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="إنهاء التسجيل وتثبيت النص / Selesai merekam"
                      >
                        <div style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: '#111827',
                          borderRadius: '3px'
                        }} />
                      </button>

                      <button
                        type="button"
                        onClick={handleCustomSubmit}
                        className="icon-btn"
                        style={{
                          backgroundColor: 'var(--color-primary-600)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          paddingRight: '2px',
                          flexShrink: 0,
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.backgroundColor = 'var(--color-primary-700)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.backgroundColor = 'var(--color-primary-600)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="إرسال"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-135deg)' }}>
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <textarea 
                      ref={textareaRef}
                      className="main-input" 
                      placeholder="كيف يمكنني مساعدتك في دراستك اليوم؟"
                      rows={1}
                      dir="auto"
                      value={input}
                      onChange={handleInput}
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

                      <div className="toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={toggleListening}
                          className="icon-btn"
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            color: '#6B7280',
                            flexShrink: 0,
                            transition: 'background-color 0.2s'
                          }}
                          title="تسجيل صوتي (إملاء) / Dikte Suara"
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="22"></line>
                          </svg>
                        </button>

                        {input.trim().length > 0 && (
                          <button
                            type="button"
                            onClick={handleCustomSubmit}
                            className="icon-btn"
                            style={{
                              backgroundColor: 'var(--color-primary-600)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              paddingRight: '2px',
                              transition: 'all 0.2s',
                              flexShrink: 0
                            }}
                            onMouseOver={e => {
                              e.currentTarget.style.backgroundColor = 'var(--color-primary-700)';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.backgroundColor = 'var(--color-primary-600)';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title="إرسال"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-135deg)' }}>
                              <line x1="22" y1="2" x2="11" y2="13"></line>
                              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {input.trim().length === 0 && (
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
                    setInput(suggestion);
                    if (textareaRef.current) {
                      textareaRef.current.focus();
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
        /* Voice Recording Pulse Animation */
        @keyframes pulseRecord {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.03); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes blinkDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        /* Bouncing Dots Animation */
        .typing-indicator { display: flex; gap: 6px; padding: 8px 12px; background: rgba(255,255,255,0.1); border-radius: 12px; width: fit-content; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(4px); }
        .typing-indicator span { width: 6px; height: 6px; background: rgba(255,255,255,0.8); border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        
        /* Markdown block fade in animation */
        .markdown-body > * { animation: fadeUp 0.4s ease-out forwards; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Markdown Core Styles (Tables, Lists, Typography) */
        .markdown-body { direction: inherit; text-align: start; }
        .markdown-body p { margin: 0 0 0.7em 0; }
        .markdown-body p:last-child { margin: 0; }
        .markdown-body table { width: 100%; border-collapse: collapse; margin-bottom: 1em; background: rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; }
        .markdown-body th, .markdown-body td { border: 1px solid rgba(255,255,255,0.2); padding: 10px 14px; }
        .markdown-body th { background: rgba(255,255,255,0.15); font-weight: 700; }
        .markdown-body ul, .markdown-body ol { margin: 0 0 1em 0; padding-inline-start: 1.5em; }
        .markdown-body li { margin-bottom: 0.5em; }
        .markdown-body li::marker { color: rgba(255,255,255,0.7); }
        .markdown-body code { background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
        .markdown-body pre { background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; overflow-x: auto; border: 1px solid rgba(255,255,255,0.1); }
        .markdown-body pre code { background: transparent; padding: 0; font-size: 0.95em; }
        .markdown-body blockquote { border-inline-start: 4px solid rgba(255,255,255,0.4); margin: 0 0 1em 0; padding-inline-start: 1em; opacity: 0.85; font-style: italic; }
      `}} />
    </div>
  );
}
