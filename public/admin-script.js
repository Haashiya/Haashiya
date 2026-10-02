
    

    let currentUserRole = 'student';
    let allEducationalBooks = [];

    function switchAdminTab(tabId, btnElement) {
      document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));
      document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));

      document.getElementById(tabId).classList.add('active');
      btnElement.classList.add('active');
    }

    function verifyAdminAccess() {
      const sessionData = localStorage.getItem('currentUser');
      if (!sessionData) {
        window.location.href = 'login.html';
        return;
      }

      const user = JSON.parse(sessionData);
      currentUserRole = user.role || (user.isAdmin ? 'admin' : 'student');

      const nameEl = document.getElementById('adminDisplayName');
      const badgeEl = document.getElementById('adminBadge');

      if (nameEl) nameEl.textContent = user.name || user.username;
      if (badgeEl) {
        if (currentUserRole === 'superadmin') {
          badgeEl.textContent = 'مشرف عام';
        } else if (currentUserRole === 'admin') {
          badgeEl.textContent = 'مشرف';
        } else {
          badgeEl.textContent = 'طالب';
        }
      }

      loadStudentDatabase();
    }

// LOAD STUDENT DATABASE FROM FIRESTORE
async function loadStudentDatabase() {
  const container = document.getElementById('studentListContainer');
  if (!container) return;

  try {
    const snapshot = await db.collection('users').get();
    allStudentsList = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      allStudentsList.push({
        id: doc.id,
        name: data.name || 'بدون اسم',
        username: doc.id,
        studentId: data.studentId || '11011110001',
        email: data.email || 'غير مسجل',
        gender: (data.gender || 'male').toLowerCase().trim(),
        avatar: data.avatar || 'assets/images/web/default_avatar.png'
      });
    });

    filterStudentDatabase();
  } catch (err) {
    console.error("Error loading students:", err);
    container.innerHTML = '<p style="text-align:center; color:#ef4444; padding: 20px 0;">حدث خطأ أثناء الاتصال بالخادم</p>';
  }
}

// SWITCH GENDER TAB (MALE / FEMALE)
function switchGenderDatabase(gender, btnEl) {
  currentGenderFilter = gender;

  // Toggle active class on tab buttons
  document.querySelectorAll('.gender-tab-btn').forEach(btn => btn.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  // Update search input placeholder dynamically
  const searchInput = document.getElementById('studentSearchInput');
  if (searchInput) {
    searchInput.placeholder = gender === 'female' 
      ? 'بحث باسم الطالبة أو اسم المستخدم...' 
      : 'بحث باسم الطالب أو اسم المستخدم...';
  }

  filterStudentDatabase();
}

// FILTER DATABASE BASED ON ACTIVE GENDER TAB & SEARCH QUERY
function filterStudentDatabase() {
  const searchInput = document.getElementById('studentSearchInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  const filtered = allStudentsList.filter(student => {
    // 1. Direct match against Firestore gender value
    const matchesGender = student.gender === currentGenderFilter;

    // 2. Search query filter
    const matchesQuery = 
      student.name.toLowerCase().includes(query) ||
      student.id.toLowerCase().includes(query) ||
      student.studentId.toString().includes(query);

    return matchesGender && matchesQuery;
  });

  renderStudentDatabase(filtered);
}

// RENDER FILTERED ROWS TO DOM TABLE
function renderStudentDatabase(studentsToRender) {
  const container = document.getElementById('studentListContainer');
  if (!container) return;

  container.innerHTML = '';

  if (studentsToRender.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#94a3b8; padding: 24px 0;">لا توجد نتائج مطابقة للبحث</p>';
    return;
  }

  studentsToRender.forEach(student => {
    const canViewFull = currentUserRole === 'superadmin';
    const studentName = student.name || 'طالب';
    const avatarUrl = student.avatar && student.avatar.trim() !== '' 
      ? student.avatar 
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=1d4ed8&color=fff`;

    container.innerHTML += `
      <div class="student-row-item">
        <div class="student-row-info">
          <img src="${avatarUrl}" alt="${studentName}" class="student-list-avatar" onError="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=1d4ed8&color=fff'">
          <h4 class="student-list-name">${studentName}</h4>
        </div>
        <div>
          ${canViewFull 
            ? `<button class="btn-view-profile-card" onclick="openStudentProfileModal('${student.id}')">عرض الملف</button>` 
            : `<span class="text-restricted-badge">محظور</span>`}
        </div>
      </div>
    `;
  });
}

// OPEN FULL PROFILE MODAL FOR SUPERADMIN
function openStudentProfileModal(username) {
  const student = allStudentsList.find(s => s.id === username);
  if (!student) return;

  const modal = document.getElementById('studentProfileModal');
  const avatarEl = document.getElementById('modalUserAvatar');
  const nameEl = document.getElementById('modalDisplayName');
  const idEl = document.getElementById('modalStudentId');
  const emailEl = document.getElementById('modalEmail');
  const usernameEl = document.getElementById('modalUsername');
  const badgeContainer = document.getElementById('modalGenderBadgeContainer');

  const studentName = student.name || 'طالب';
  const avatarUrl = student.avatar && student.avatar.trim() !== '' 
    ? student.avatar 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=1d4ed8&color=fff`;

  if (avatarEl) {
    avatarEl.src = avatarUrl;
    avatarEl.onerror = function() {
      this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=1d4ed8&color=fff`;
    };
  }

  if (nameEl) nameEl.textContent = studentName;
  if (idEl) idEl.textContent = student.studentId || '11011110001';
  if (emailEl) emailEl.textContent = student.email || 'غير مسجل';
  if (usernameEl) usernameEl.textContent = student.username || student.id;

  const isMale = student.gender === 'male';
  if (badgeContainer) {
    badgeContainer.innerHTML = isMale 
      ? `<span class="gender-badge gender-male">
          <svg class="gender-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="10" cy="14" r="5"></circle>
            <path d="M19 5L13.5 10.5"></path>
            <path d="M19 5h-5"></path>
            <path d="M19 5v5"></path>
          </svg>
          طالب ♂
        </span>` 
      : `<span class="gender-badge gender-female">
          <svg class="gender-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="10" r="5"></circle>
            <path d="M12 15v7"></path>
            <path d="M9 19h6"></path>
          </svg>
          طالبة ♀
        </span>`;
  }

  if (modal) modal.classList.add('show');
}


function closeStudentProfileModal() {
  const modal = document.getElementById('studentProfileModal');
  if (modal) modal.classList.remove('show');
}



    function viewStudentProfile(username) {
      alert(`عرض الملف الكامل للطالب: ${username}`);
    }

    async function loadAdminEducationalBooks() {
  const container = document.getElementById('adminBooksContainer');
  if (!container) return;

  try {
    // 1. Attempt to fetch from Firestore collection
    const snapshot = await db.collection('educational_materials').get();
    
    if (!snapshot.empty) {
      allEducationalBooks = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
    } else {
      // 2. Fallback to data/books.json
      const res = await fetch('data/books.json');
      const jsonData = await res.json();

      // Handles both direct array [...] or wrapped { educational_materials: [...] }
      const booksList = Array.isArray(jsonData) ? jsonData : (jsonData.educational_materials || []);

      allEducationalBooks = booksList.map((book, idx) => ({
        id: book.id ? String(book.id) : `json_fallback_${idx}`,
        title: book.title || 'بدون عنوان',
        author: book.author || 'المحاضر',
        coverUrl: book.coverUrl || book.cover || 'assets/images/web/default_cover.png',
        pdfUrl: book.pdfUrl || book.pdf || book.fileUrl || '#',
        meta: book.meta || book.subjectTag || 'المواد التعليمية'
      }));
    }

    renderAdminBooks();
  } catch (err) {
    console.error("Error loading books:", err);
    container.innerHTML = `<p style="text-align: center; color: #ef4444; padding: 20px 0;">حدث خطأ أثناء تحميل البيانات</p>`;
  }
}


    // RENDER ALL EDUCATIONAL BOOKS (Using Exact Dashboard.css Layout)
function renderAdminBooks() {
  const container = document.getElementById('adminBooksContainer');
  if (!container) return;

  if (allEducationalBooks.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: #94a3b8; padding: 20px 0;">لا توجد كتب مضافة حالياً.</p>`;
    return;
  }

  container.innerHTML = '';
  allEducationalBooks.forEach(book => {
    const coverImage = book.coverUrl || book.cover || 'assets/images/web/default_cover.png';
    const pdfUrl = book.pdfUrl || book.pdf || book.fileUrl || '#';
    const authorName = book.author || 'المحاضر';
    const metaTag = book.meta || book.subjectTag || (book.category ? `المادة - ${book.category}` : 'المرجع الرئيسي');

    container.innerHTML += `
      <div class="book-row-card">
        <!-- RIGHT: BOOK COVER & DETAILS (Exact layout from category-view.html) -->
        <div class="book-row-right">
          <img src="${coverImage}" alt="${book.title}" class="book-row-cover" onError="this.src='assets/images/web/default_cover.png'">
          <div class="book-row-details">
            <h3 class="book-row-title">${book.title}</h3>
            <p class="book-row-author">${authorName}</p>
            <span class="book-row-meta">${metaTag}</span>
          </div>
        </div>

        <!-- LEFT: ACTION BUTTONS (View, Download + Admin Edit & Delete) -->
        <div class="book-row-actions admin-row-actions">
          <!-- View Button -->
          <a href="${pdfUrl}" target="_blank" class="action-icon-btn" title="قراءة">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </a>

          <!-- Download Button -->
          <a href="${pdfUrl}" download class="action-icon-btn" title="تحميل">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </a>

          <!-- Divider -->
          <span class="admin-action-divider"></span>

          <!-- Edit Button -->
          <button class="action-icon-btn admin-btn-edit" onclick="openBookModal('${book.id}')" title="تعديل">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>

          <!-- Delete Button -->
          <button class="action-icon-btn admin-btn-delete" onclick="deleteBook('${book.id}')" title="حذف">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  });
}


    function openBookModal(bookId = null) {
      const modal = document.getElementById('bookModal');
      const titleEl = document.getElementById('modalTitle');
      const form = document.getElementById('bookForm');

      if (!modal || !form) return;
      form.reset();

      if (bookId) {
        const book = allEducationalBooks.find(b => String(b.id) === String(bookId));
        if (book) {
          titleEl.textContent = "تعديل بيانات الكتاب";
          document.getElementById('bookIdInput').value = book.id;
          document.getElementById('bookTitleInput').value = book.title || '';
          document.getElementById('bookAuthorInput').value = book.author || '';
          document.getElementById('bookCategorySelect').value = book.category || 'balagha';
          document.getElementById('bookCoverInput').value = book.coverUrl || book.cover || '';
          document.getElementById('bookPdfInput').value = book.pdfUrl || book.pdf || book.fileUrl || '';
        }
      } else {
        titleEl.textContent = "إضافة كتاب جديد";
        document.getElementById('bookIdInput').value = '';
      }

      modal.classList.add('show');
    }

    function closeBookModal() {
      const modal = document.getElementById('bookModal');
      if (modal) modal.classList.remove('show');
    }

    async function handleSaveBook(e) {
      e.preventDefault();
      
      const bookId = document.getElementById('bookIdInput').value;
      const bookData = {
        title: document.getElementById('bookTitleInput').value.trim(),
        author: document.getElementById('bookAuthorInput').value.trim(),
        category: document.getElementById('bookCategorySelect').value,
        coverUrl: document.getElementById('bookCoverInput').value.trim(),
        pdfUrl: document.getElementById('bookPdfInput').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      try {
        if (bookId && !bookId.startsWith('json_fallback_')) {
          await db.collection('educational_materials').doc(bookId).set(bookData, { merge: true });
        } else {
          await db.collection('educational_materials').add(bookData);
        }
        
        closeBookModal();
        await loadAdminEducationalBooks();
        alert('تم حفظ البيانات بنجاح!');
      } catch (err) {
        console.error("Failed to save book:", err);
        alert('حدث خطأ أثناء الحفظ');
      }
    }

    async function deleteBook(bookId) {
      if (!confirm('هل أنت تأكد من أنك تريد حذف هذا الكتاب؟')) return;

      try {
        if (bookId && !bookId.startsWith('json_fallback_')) {
          await db.collection('educational_materials').doc(bookId).delete();
        } else {
          allEducationalBooks = allEducationalBooks.filter(b => String(b.id) !== String(bookId));
        }
        renderAdminBooks();
        alert('تم حذف الكتاب بنجاح!');
      } catch (err) {
        console.error("Failed to delete book:", err);
        alert('حدث خطأ أثناء الحذف');
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      verifyAdminAccess();
      loadAdminEducationalBooks();
    });

    let allStudentsList = []; // Global array to store fetched students


// RENDER STUDENT TABLE ROWS
function renderStudentDatabase(studentsToRender) {
  const container = document.getElementById('studentListContainer');
  if (!container) return;

  container.innerHTML = '';

  if (studentsToRender.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#94a3b8; padding: 24px 0;">لا توجد نتائج مطابقة للبحث</p>';
    return;
  }

  studentsToRender.forEach(student => {
    const canViewFull = currentUserRole === 'superadmin';

    container.innerHTML += `
      <div class="student-row-item">
        <div class="student-row-info">
          <img src="${student.avatar}" alt="${student.name}" class="student-list-avatar" onError="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1d4ed8&color=fff'">
          <h4 class="student-list-name">${student.name}</h4>
        </div>
        <div>
          ${canViewFull 
            ? `<button class="btn-view-profile-card" onclick="openStudentProfileModal('${student.id}')">عرض الملف</button>` 
            : `<span class="text-restricted-badge">محظور</span>`}
        </div>
      </div>
    `;
  });
}

// SEARCH FILTER FUNCTION (Real-time filtering as you type)
let currentGenderFilter = 'male'; // Default active view

// Switch Gender Tab
function switchGenderDatabase(gender, btnEl) {
  currentGenderFilter = gender;

  // Toggle active class on buttons
  document.querySelectorAll('.gender-tab-btn').forEach(btn => btn.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  // Update search input placeholder text dynamically
  const searchInput = document.getElementById('studentSearchInput');
  if (searchInput) {
    searchInput.placeholder = gender === 'female' 
      ? 'بحث باسم الطالبة أو اسم المستخدم...' 
      : 'بحث باسم الطالب أو اسم المستخدم...';
  }

  filterStudentDatabase();
}

// Filter Database Function
function filterStudentDatabase() {
  const searchInput = document.getElementById('studentSearchInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  const filtered = allStudentsList.filter(student => {
    // Direct match against Firestore gender value
    const matchesGender = student.gender === currentGenderFilter;

    // Search query filter
    const matchesQuery = 
      student.name.toLowerCase().includes(query) ||
      student.id.toLowerCase().includes(query) ||
      student.studentId.toString().includes(query);

    return matchesGender && matchesQuery;
  });

  renderStudentDatabase(filtered);
}




// Handle real-time filtering & toggle clear button
function handleSearchInput(inputEl) {
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) {
    if (inputEl.value.length > 0) {
      clearBtn.classList.add('show');
    } else {
      clearBtn.classList.remove('show');
    }
  }
  filterStudentDatabase();
}

// Clear search input on 'x' click
function clearStudentSearch() {
  const searchInput = document.getElementById('studentSearchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }
  if (clearBtn) {
    clearBtn.classList.remove('show');
  }
  filterStudentDatabase();
}



  
