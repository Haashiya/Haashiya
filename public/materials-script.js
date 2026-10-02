
    // --- DATA LOADERS ---
    async function loadUsersData() {
      try {
        var response = await fetch('data/users.json');
        if (!response.ok) throw new Error('Failed to fetch users.json');
        return await response.json();
      } catch (error) {
        console.error('Error loading users JSON data:', error);
        return [];
      }
    }
  
    async function loadBooksData() {
      try {
        var response = await fetch('data/books.json');
        if (!response.ok) throw new Error('Failed to fetch books.json');
        return await response.json();
      } catch (error) {
        console.error('Error loading books JSON data:', error);
        return [];
      }
    }
  
    async function renderEducationalBooks() {
      var container = document.getElementById('educationalBooksContainer');
      if (!container) return;
  
      var books = await loadBooksData();
      container.innerHTML = '';
  
      books.forEach(book => {
        var card = document.createElement('div');
        card.className = 'book-row-card';
        card.setAttribute('data-category', book.category);
  
        card.innerHTML = `
          <div class="book-row-right">
            <img src="${book.coverUrl}" alt="${book.title}" class="book-row-cover">
            <div class="book-row-details">
              <h3 class="book-row-title">${book.title}</h3>
              <p class="book-row-author">${book.author}</p>
              <span class="book-row-meta">${book.meta}</span>
            </div>
          </div>
          <div class="book-row-actions">
            <a href="${book.pdfUrl}" target="_blank" class="action-icon-btn" title="قراءة">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </a>
            <a href="${book.pdfUrl}" download class="action-icon-btn" title="تحميل">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </a>
          </div>
        `;
        container.appendChild(card);
      });
  
      filterBooks();
    }
  
    function smoothNavigate(event, targetUrl) {
      event.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 300);
    }
  
    var activeCategory = 'balagha';
  
    function filterCategory(categoryKey, btnElement) {
      activeCategory = categoryKey;
      document.querySelectorAll('.category-buttons .cat-btn').forEach(btn => btn.classList.remove('active'));
      btnElement.classList.add('active');
      filterBooks();
    }
  
    function filterBooks() {
      var searchInput = document.getElementById('searchInput');
      var searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
      var bookRows = document.querySelectorAll('.book-row-card');
  
      bookRows.forEach(row => {
        var rowCat = row.getAttribute('data-category');
        var title = row.querySelector('.book-row-title')?.textContent.toLowerCase() || '';
        var author = row.querySelector('.book-row-author')?.textContent.toLowerCase() || '';
  
        var matchesCategory = (activeCategory === 'all' || rowCat === activeCategory);
        var matchesSearch = title.includes(searchTerm) || author.includes(searchTerm);
  
        if (matchesCategory && matchesSearch) {
          row.style.display = 'flex';
        } else {
          row.style.display = 'none';
        }
      });
    }
  
    // --- LOCALSTORAGE KEYS ---
    var STORAGE_PENDING_KEY = 'pendingBooksDB';
    var STORAGE_APPROVED_KEY = 'approvedBooksDB';
    var STORAGE_NOTIFS_KEY = 'userNotificationsDB';
  
    // --- USER LOGIN SESSION & DROPDOWN ---
    function checkUserSession() {
      var sessionData = localStorage.getItem('currentUser');
      var navbarRight = document.querySelector('.navbar-right');
  
      if (sessionData && navbarRight) {
        var user = JSON.parse(sessionData);
        var isMale = user.gender === 'male';
  
        var genderBadgeHTML = isMale ? `
          <span class="gender-badge gender-male">
            <svg class="gender-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="10" cy="14" r="5"></circle>
              <path d="M19 5L13.5 10.5"></path>
              <path d="M19 5h-5"></path>
              <path d="M19 5v5"></path>
            </svg>
            طالب
          </span>` : `
          <span class="gender-badge gender-female">
            <svg class="gender-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="10" r="5"></circle>
              <path d="M12 15v7"></path>
              <path d="M9 19h6"></path>
            </svg>
            طالبة
          </span>`;
  
        navbarRight.innerHTML = `
          <div class="user-profile-wrapper">
            <button class="user-profile-badge" onclick="toggleProfileDropdown(event)">
              <img src="${user.avatar}" alt="${user.name}" class="profile-avatar" onError="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1565c0&color=fff'">
              <div class="profile-info-group">
                <span class="profile-name">${user.name}</span>
                ${genderBadgeHTML}
              </div>
              <span class="nav-unread-dot" style="display: none;"></span>
              <svg class="dropdown-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
  
            <div id="profileDropdown" class="profile-dropdown-menu">
              <a href="profile.html" class="dropdown-item" onclick=smoothNavigate(event, 'profile.html')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                الملف الشخصي
              </a>
  
              <a href="#" class="dropdown-item" onclick="openNotificationsModal(event)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                الإشعارات
                <span class="unread-badge" style="display: none;">0</span>
              </a>
              
              <div class="dropdown-divider"></div>
              
              <button class="dropdown-item logout-item" onclick="logoutUser()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                تسجيل الخروج
              </button>
            </div>
          </div>
  
          <button id="open-sidebar-btn" class="btn-menu" aria-label="القائمة" onclick="toggleSidebar()">
            <svg width="22" height="22" viewBox="0 0 16 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1L11.5 4.5L8 8L4.5 4.5Z" />
              <path d="M8 4.5L11.5 8L8 11.5L4.5 8Z" transform="translate(0, 2)" />
              <path d="M8 8L11.5 11.5L8 15L4.5 11.5Z" transform="translate(0, 4)" />
            </svg>
          </button>
        `;
  
        if (user.role === 'admin') {
          var adminBtn = document.getElementById('adminQueueBtn');
          if (adminBtn) adminBtn.style.display = 'inline-flex';
          updatePendingBadgeCount();
          updateNotificationBadge();
        }
      }
    }
  
    function toggleProfileDropdown(e) {
      e.stopPropagation();
      var dropdown = document.getElementById('profileDropdown');
      if (dropdown) dropdown.classList.toggle('show');
    }
  
    document.addEventListener('click', (e) => {
      var dropdown = document.getElementById('profileDropdown');
      if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
      }
    });
  
    function logoutUser() {
      var modal = document.getElementById('logoutModal');
      if (modal) modal.classList.add('show');
    }
  
    function closeLogoutModal() {
      var modal = document.getElementById('logoutModal');
      if (modal) modal.classList.remove('show');
    }
  
    function confirmLogout() {
      localStorage.removeItem('currentUser');
      location.reload();
    }
  
    function openUploadModal() {
      document.getElementById('uploadModal').classList.add('show');
    }
  
    function closeUploadModal() {
      document.getElementById('uploadModal').classList.remove('show');
      document.getElementById('uploadBookForm').reset();
      document.getElementById('pdfDropText').innerHTML = 'اسحب ملف PDF الكتاب هنا أو <b>اختر من الجهاز</b>';
      document.getElementById('coverDropText').innerHTML = 'اسحب صورة الغلاف (PNG/JPG) أو <b>اختر صورة</b>';
    }
  
    function showToastNotification() {
      var toast = document.getElementById('toastNotification');
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
      }
    }
  
    function showErrorToast(messageText) {
      var toast = document.getElementById('errorToastNotification');
      var messageSpan = document.getElementById('errorToastMessage');
  
      if (toast && messageSpan) {
        messageSpan.textContent = messageText;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
      }
    }
  
    function validateFileSelect(input, textId, allowedTypes, fileTypeName) {
      if (input.files && input.files[0]) {
        var file = input.files[0];
        var isAllowed = allowedTypes.some(type => file.type.match(type) || file.name.toLowerCase().endsWith(type));
  
        if (!isAllowed) {
          showErrorToast(`عذراً، هذا الحقل يقبل ملفات ${fileTypeName} فقط!`);
          input.value = '';
          return;
        }
        document.getElementById(textId).textContent = 'تم اختيار: ' + file.name;
      }
    }
  
    function setupDropZone(zoneId, inputId, textId, allowedTypes, fileTypeName) {
      var zone = document.getElementById(zoneId);
      var input = document.getElementById(inputId);
  
      if (!zone || !input) return;
  
      ['dragenter', 'dragover'].forEach(eventName => {
        zone.addEventListener(eventName, (e) => {
          e.preventDefault();
          zone.classList.add('drag-over');
        }, false);
      });
  
      ['dragleave', 'drop'].forEach(eventName => {
        zone.addEventListener(eventName, (e) => {
          e.preventDefault();
          zone.classList.remove('drag-over');
        }, false);
      });
  
      zone.addEventListener('drop', (e) => {
        var files = e.dataTransfer.files;
        if (files.length > 0) {
          var file = files[0];
          var isAllowed = allowedTypes.some(type => file.type.match(type) || file.name.toLowerCase().endsWith(type));
  
          if (!isAllowed) {
            showErrorToast(`عذراً، هذا الحقل يقبل ملفات ${fileTypeName} فقط!`);
            return;
          }
  
          var dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          input.files = dataTransfer.files;
          validateFileSelect(input, textId, allowedTypes, fileTypeName);
        }
      });
    }
  
    function openAdminQueueModal() {
      renderPendingQueueList();
      document.getElementById('adminQueueModal').classList.add('show');
    }
  
    function closeAdminQueueModal() {
      document.getElementById('adminQueueModal').classList.remove('show');
    }
  
    function getPendingBooks() {
      return JSON.parse(localStorage.getItem(STORAGE_PENDING_KEY) || '[]');
    }
  
    function updatePendingBadgeCount() {
      var badge = document.getElementById('pendingBadgeCount');
      if (badge) badge.textContent = getPendingBooks().length;
    }
  
    function renderPendingQueueList() {
      var container = document.getElementById('pendingBooksList');
      var pendingBooks = getPendingBooks();
  
      if (!container) return;
      container.innerHTML = '';
  
      if (pendingBooks.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#94a3b8; font-size:0.88rem; padding: 20px 0;">لا توجد كتب معلقة حالياً</p>';
        return;
      }
  
      pendingBooks.forEach((book, index) => {
        var card = document.createElement('div');
        card.className = 'pending-item-card';
        var coverImage = book.coverUrl || 'assets/images/covers/badee3tareekh.png';
  
        card.innerHTML = `
          <div class="pending-item-left">
            <img src="${coverImage}" alt="${book.title}" class="pending-book-cover">
            <div class="pending-book-info">
              <strong class="pending-book-title">${book.title}</strong>
              <span class="pending-book-meta">المؤلف: ${book.author} | الفن: ${book.theme}</span>
            </div>
          </div>
  
          <div class="pending-action-btns">
            <a href="${book.pdfUrl}" target="_blank" class="action-icon-btn btn-view-pending" title="معاينة الكتاب">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </a>
            <button class="btn-approve" onclick="approveBook(${index})" title="قبول الطلب">قبول</button>
            <button class="btn-reject" onclick="rejectBook(${index})" title="رفض الطلب">رفض</button>
          </div>
        `;
        container.appendChild(card);
      });
    }
  
    function approveBook(index) {
      var pending = getPendingBooks();
      var approved = JSON.parse(localStorage.getItem(STORAGE_APPROVED_KEY) || '[]');
  
      var bookToApprove = pending.splice(index, 1)[0];
      if (!bookToApprove) return;
  
      approved.unshift(bookToApprove);
  
      localStorage.setItem(STORAGE_PENDING_KEY, JSON.stringify(pending));
      localStorage.setItem(STORAGE_APPROVED_KEY, JSON.stringify(approved));
  
      addNotification(
        'تم القبول بنجاح! 🎉', 
        `تمت الموافقة على كتاب "${bookToApprove.title}" وهو متاح الآن في المكتبة العامة.`, 
        'success'
      );
  
      renderPendingQueueList();
      updatePendingBadgeCount();
      renderApprovedBooksOnSurface();
    }
  
    function rejectBook(index) {
      var pending = getPendingBooks();
      var bookToReject = pending.splice(index, 1)[0];
      
      localStorage.setItem(STORAGE_PENDING_KEY, JSON.stringify(pending));
  
      if (bookToReject) {
        addNotification(
          'تم رفض الطلب ❌', 
          `عذراً، لم تتم الموافقة على كتاب "${bookToReject.title}" من قبل الإدارة.`, 
          'rejected'
        );
      }
  
      renderPendingQueueList();
      updatePendingBadgeCount();
    }
  
    function listenToApprovedBooks() {
  var container = document.querySelector('.main-card-section:last-of-type .book-list-container');
  if (!container) return;

  var sessionData = localStorage.getItem('currentUser');
  var user = sessionData ? JSON.parse(sessionData) : null;
  var isAdmin = user && user.role === 'admin';

  db.collection('approved_books')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      document.querySelectorAll('.user-approved-card').forEach(el => el.remove());

      snapshot.forEach((doc) => {
        var book = doc.data();
        var card = document.createElement('div');
        card.className = 'book-row-card user-approved-card';
        card.setAttribute('data-category', 'general');

        var adminActions = isAdmin ? `
          <button class="action-icon-btn admin-delete-btn" onclick="removeApprovedBook('${doc.id}')" title="حذف الكتاب">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        ` : '';

        card.innerHTML = `
          <div class="book-row-right">
            <img src="${book.coverUrl}" alt="${book.title}" class="book-row-cover">
            <div class="book-row-details">
              <h3 class="book-row-title">${book.title}</h3>
              <p class="book-row-author">${book.author}</p>
              <span class="book-row-meta">المكتبة العامة - الفن: ${book.theme}</span>
            </div>
          </div>
          <div class="book-row-actions">
            ${adminActions}
            <a href="${book.pdfUrl}" target="_blank" class="action-icon-btn" title="قراءة">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </a>
            <a href="${book.pdfUrl}" download="${book.title}.pdf" class="action-icon-btn" title="تحميل">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </a>
          </div>
        `;
        container.appendChild(card);
      });
    });
}

  // --- HELPER FUNCTION FOR FIREBASE STORAGE ---
async function uploadFileToStorage(file, folderName) {
  // Creates a unique path in bucket e.g., 'pdfs/1726732000000_book.pdf'
  var fileRef = storage.ref(`${folderName}/${Date.now()}_${file.name}`);
  var snapshot = await fileRef.put(file);
  return await snapshot.getDownloadURL();
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

  // --- UPDATED SUBMIT HANDLER ---
  async function handleBookSubmit(e) {
  e.preventDefault();

  var title = document.getElementById('bookTitle').value.trim();
  var author = document.getElementById('bookAuthor').value.trim();
  var theme = document.getElementById('bookCategory').value;
  var pdfFile = document.getElementById('pdfInput').files[0];
  var coverFile = document.getElementById('coverInput').files[0];

  if (!title || !author || !pdfFile) {
    showErrorToast('يُرجَى ملء جميع الحقول المطلوبة ورفع ملف PDF');
    return;
  }

  // Firestore documents have a 1MB size limit per document
  if (pdfFile.size > 800 * 1024) {
    showErrorToast('حجم ملف PDF يجب أن يكون أقل من 800 كيلوبايت');
    return;
  }

  try {
    showToastNotification('جاري تجهيز الملفات...');

    // Convert PDF to Base64 string
    var pdfUrl = await convertFileToBase64(pdfFile);

    // Convert Cover to Base64 string if present, else fallback
    var coverUrl = 'assets/images/covers/badee3tareekh.png';
    if (coverFile) {
      coverUrl = await convertFileToBase64(coverFile);
    }

    // Save directly to Firestore
    await db.collection('pending_books').add({
      title,
      author,
      theme,
      pdfUrl,
      coverUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    addNotification('طلب إضافة كتاب', `تم إرسال طلب إضافة كتاب "${title}" بنجاح، وهو قيد مراجعة الإدارة.`, 'pending');
    closeUploadModal();
    showToastNotification('تم طلب رفع الكتاب بنجاح!');
  } catch (err) {
    console.error('Base64 Upload Error:', err);
    showErrorToast('حدث خطأ أثناء حفظ الكتاب');
  }
}
  
    var currentEditingIndex = null;
  
    function openEditBookModal(index) {
      var approved = JSON.parse(localStorage.getItem(STORAGE_APPROVED_KEY) || '[]');
      var book = approved[index];
  
      if (!book) return;
      currentEditingIndex = index;
  
      document.getElementById('editBookTitle').value = book.title;
      document.getElementById('editBookAuthor').value = book.author;
      document.getElementById('editBookCategory').value = book.theme;
  
      document.getElementById('editBookModal').classList.add('show');
    }
  
    function closeEditBookModal() {
      document.getElementById('editBookModal').classList.remove('show');
      currentEditingIndex = null;
    }
  
    function handleEditBookSubmit(e) {
      e.preventDefault();
  
      if (currentEditingIndex === null) return;
  
      var approved = JSON.parse(localStorage.getItem(STORAGE_APPROVED_KEY) || '[]');
      
      approved[currentEditingIndex].title = document.getElementById('editBookTitle').value.trim();
      approved[currentEditingIndex].author = document.getElementById('editBookAuthor').value.trim();
      approved[currentEditingIndex].theme = document.getElementById('editBookCategory').value;
  
      localStorage.setItem(STORAGE_APPROVED_KEY, JSON.stringify(approved));
  
      closeEditBookModal();
      renderApprovedBooksOnSurface();
      showToastNotification();
    }
  
    var currentDeletingDocId = null;

function removeApprovedBook(docId) {
  currentDeletingDocId = docId;
  var modal = document.getElementById('deleteBookModal');
  if (modal) modal.classList.add('show');
}

function closeDeleteBookModal() {
  var modal = document.getElementById('deleteBookModal');
  if (modal) modal.classList.remove('show');
  currentDeletingDocId = null;
}

async function confirmDeleteBook() {
  if (currentDeletingDocId) {
    try {
      await db.collection('approved_books').doc(currentDeletingDocId).delete();
      closeDeleteBookModal();
      showErrorToast('تم حذف الكتاب بنجاح من المكتبة العامة');
    } catch (err) {
      console.error('Delete Error:', err);
      showErrorToast('حدث خطأ أثناء حذف الكتاب');
    }
  }
}
  
    function getNotifications() {
      return JSON.parse(localStorage.getItem(STORAGE_NOTIFS_KEY) || '[]');
    }
  
    function addNotification(title, message, type = 'pending') {
      var notifications = getNotifications();
      var now = new Date();
      var formattedTimestamp = now.toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'short'
      }) + ' ، ' + now.toLocaleTimeString('ar-EG', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
  
      notifications.unshift({
        id: Date.now(),
        title,
        message,
        type,
        timestamp: formattedTimestamp,
        unread: true
      });
  
      localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(notifications));
      updateNotificationBadge();
    }
  
    function updateNotificationBadge() {
      var dropdownBadge = document.querySelector('.unread-badge');
      var navRedDot = document.querySelector('.nav-unread-dot');
      
      var notifications = getNotifications();
      var unreadCount = notifications.filter(n => n.unread).length;
  
      if (unreadCount > 0) {
        if (dropdownBadge) {
          dropdownBadge.textContent = unreadCount;
          dropdownBadge.style.display = 'inline-block';
        }
        if (navRedDot) navRedDot.style.display = 'inline-block';
      } else {
        if (dropdownBadge) dropdownBadge.style.display = 'none';
        if (navRedDot) navRedDot.style.display = 'none';
      }
    }
  
    function openNotificationsModal(e) {
      if (e) e.preventDefault();
      
      var notifications = getNotifications().map(n => ({ ...n, unread: false }));
      localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(notifications));
      updateNotificationBadge();
  
      renderNotificationsList();
      document.getElementById('notificationsModal').classList.add('show');
    }
  
    function closeNotificationsModal() {
      document.getElementById('notificationsModal').classList.remove('show');
    }
  
    function clearAllNotifications() {
      localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify([]));
      renderNotificationsList();
      updateNotificationBadge();
    }
  
    function renderNotificationsList() {
      var container = document.getElementById('notificationsList');
      var notifications = getNotifications();
  
      if (!container) return;
      container.innerHTML = '';
  
      if (notifications.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#94a3b8; font-size:0.88rem; padding: 20px 0;">لا توجد إشعارات حالياً</p>';
        return;
      }
  
      notifications.forEach(n => {
        var card = document.createElement('div');
        card.className = `notification-item-card ${n.unread ? 'unread' : ''}`;
        var iconMarkup = '';
        
        if (n.type === 'success') {
          iconMarkup = `<div class="notification-icon success"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg></div>`;
        } else if (n.type === 'rejected' || n.type === 'deleted') {
          iconMarkup = `<div class="notification-icon error"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></div>`;
        } else {
          iconMarkup = `<div class="notification-icon pending"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>`;
        }
  
        card.innerHTML = `
          ${iconMarkup}
          <div class="notification-content">
            <h4 class="notification-title">${n.title}</h4>
            <p class="notification-body">${n.message}</p>
            <span class="notification-time">${n.timestamp}</span>
          </div>
        `;
        container.appendChild(card);
      });
    }
  
    function toggleSidebar() {
      var sidebar = document.getElementById('sidebar');
      var overlay = document.getElementById('sidebar-overlay');
  
      if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
      }
    }
  
    function initSidebarEvents() {
      var openSidebarBtn = document.getElementById('open-sidebar-btn');
      var closeSidebarBtn = document.getElementById('close-sidebar-btn');
      var sidebar = document.getElementById('sidebar');
      var overlay = document.getElementById('sidebar-overlay');
  
      var archiveBtn = document.getElementById('archive-btn');
      var archiveSubmenu = document.getElementById('archive-submenu');
      var libraryBtn = document.getElementById('library-btn');
      var librarySubmenu = document.getElementById('library-submenu');
  
      var closeSidebar = () => {
        if (sidebar && overlay) {
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
        }
      };
  
      if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
      if (overlay) overlay.addEventListener('click', closeSidebar);
  
      var toggleDropdown = (button, submenu) => {
        if (!button || !submenu) return;
        var isOpen = submenu.classList.contains('open');
        var arrow = button.querySelector('.arrow-icon');
  
        if (isOpen) {
          submenu.classList.remove('open');
          button.classList.remove('active');
          if (arrow) arrow.classList.remove('open');
        } else {
          submenu.classList.add('open');
          button.classList.add('active');
          if (arrow) arrow.classList.add('open');
        }
      };
  
      if (archiveBtn && archiveSubmenu) {
        archiveBtn.addEventListener('click', (e) => {
          if (e.target.tagName === 'SPAN') {
            smoothNavigate(e, 'archive.html');
          } else {
            toggleDropdown(archiveBtn, archiveSubmenu);
          }
        });
      }
      if (libraryBtn && librarySubmenu) {
        libraryBtn.addEventListener('click', () => toggleDropdown(libraryBtn, librarySubmenu));
      }
    }
  
    // --- SINGLE CONSOLIDATED DOM INITIALIZATION ---
    setTimeout( async () => {
      await renderEducationalBooks();
      checkUserSession();
      listenToApprovedBooks();
      updateNotificationBadge();
      initSidebarEvents();
      setupDropZone('pdfDropZone', 'pdfInput', 'pdfDropText', ['application/pdf', '.pdf'], 'PDF');
      setupDropZone('coverDropZone', 'coverInput', 'coverDropText', ['image/png', 'image/jpeg', 'image/jpg'], 'صور (PNG/JPG)');
    });
  
