
     (function(){
        try {
          if (typeof emailjs !== 'undefined') {
            emailjs.init("V-BC-AYYC2sg3dxHo"); // Replace with your Public Key
          }
        } catch(e) {
          console.error("emailjs init failed:", e);
        }
     })();
  

    

    var STORAGE_NOTIFS_KEY = 'userNotificationsDB';

    function toTitleCase(str) {
      if (!str) return '';
      return str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    var isPasswordVisible = false;
    var realPassword = '••••••••';

    var generatedOtpCode = null;
    var otpExpirationTime = null;
    var targetUserDocId = null;

    function openChangePasswordModal() {
      var sessionData = localStorage.getItem('currentUser');
      if (sessionData) {
        var user = JSON.parse(sessionData);
        var emailInput = document.getElementById('otpEmailInput');
        if (emailInput && user.email) {
          emailInput.value = user.email;
        }
      }
      document.getElementById('requestOtpModal').classList.add('show');
    }

    function closeOtpModal(modalId) {
      var modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('show');
    }

    function generate6DigitOTP() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async function handleSendOtp(e) {
  e.preventDefault();
  var emailInput = document.getElementById('otpEmailInput');
  var email = emailInput ? emailInput.value.trim().toLowerCase() : '';

  if (!email) {
    showErrorToast('يُرجَى إدخال البريد الإلكتروني');
    return;
  }

  try {
    var userFound = false;
    var userData = null;

    // 1. Check Firestore first by email
    var snapshot = await db.collection('users').where('email', '==', email).get();

    if (!snapshot.empty) {
      targetUserDocId = snapshot.docs[0].id;
      userData = snapshot.docs[0].data();
      userFound = true;
    } else {
      // 2. Fallback to LocalStorage session check
      var sessionData = localStorage.getItem('currentUser');
      if (sessionData) {
        var currentUser = JSON.parse(sessionData);
        if (currentUser.email && currentUser.email.toLowerCase() === email) {
          targetUserDocId = (currentUser.username || email.split('@')[0]).toLowerCase();
          userData = currentUser;
          userFound = true;
        }
      }
    }

    if (!userFound) {
      showErrorToast('عذراً، البريد الإلكتروني غير مسجل بالمنظومة');
      return;
    }

    // --- 2-WEEK LIMITATION CHECK ---
    if (userData && userData.lastPasswordChange) {
      var lastChangeDate = userData.lastPasswordChange.toDate 
        ? userData.lastPasswordChange.toDate() 
        : new Date(userData.lastPasswordChange);

      var twoWeeksMs = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
      var timeSinceLastChange = Date.now() - lastChangeDate.getTime();

      if (timeSinceLastChange < twoWeeksMs) {
        var remainingDays = Math.ceil((twoWeeksMs - timeSinceLastChange) / (1000 * 60 * 60 * 24));
        showErrorToast(`عذراً، يمكن تغيير كلمة المرور مرة واحدة كل أسبوعين. يمكنك المحاولة بعد ${remainingDays} يوم/أيام.`);
        return;
      }
    }

    // Generate 6-digit OTP code & 10-minute expiration
    generatedOtpCode = generate6DigitOTP();
    otpExpirationTime = Date.now() + (10 * 60 * 1000);

    showToastNotification('جاري إرسال رمز التحقق...');

    var templateParams = {
      pass_code: generatedOtpCode,
      to_email: email,
      to_name: email.split('@')[0]
    };

    await emailjs.send('service_87l9tyn', 'template_jhy7wcq', templateParams);

    closeOtpModal('requestOtpModal');
    document.getElementById('verifyOtpModal').classList.add('show');
    
    showToastNotification('تم إرسال رمز التحقق إلى بريدك الإلكتروني!');

  } catch (err) {
    console.error('EmailJS Send Error:', err);
    showErrorToast('حدث خطأ أثناء إرسال البريد الإلكتروني، يُرجى المحاولة لاحقاً');
  }
}

var isUniPasswordVisible = false;
var realUniPassword = '-';

// --- UNIVERSITY CREDENTIAL MODAL TOGGLES ---
function openUniUsernameModal() {
  var modal = document.getElementById('uniUsernameModal');
  var input = document.getElementById('newUniUsernameInput');
  var currentVal = document.getElementById('uniUsernameValue').textContent;
  if (modal && input) {
    input.value = currentVal === '-' ? '' : currentVal;
    modal.classList.add('show');
  }
}

function closeUniUsernameModal() {
  var modal = document.getElementById('uniUsernameModal');
  if (modal) modal.classList.remove('show');
}

function openUniPasswordModal() {
  var modal = document.getElementById('uniPasswordModal');
  if (modal) modal.classList.add('show');
}

function closeUniPasswordModal() {
  var modal = document.getElementById('uniPasswordModal');
  if (modal) modal.classList.remove('show');
}

    window.toggleUniPasswordVisibility = function() {
  var passEl = document.getElementById('uniPasswordValue');
  var openIcon = document.getElementById('eyeOpenIconUni');
  var offIcon = document.getElementById('eyeOffIconUni');

  if (realUniPassword === '-' || !realUniPassword) return;

  isUniPasswordVisible = !isUniPasswordVisible;
  if (isUniPasswordVisible) {
    passEl.textContent = realUniPassword;
    openIcon.style.display = 'none';
    offIcon.style.display = 'block';
  } else {
    passEl.textContent = '••••••••';
    openIcon.style.display = 'block';
    offIcon.style.display = 'none';
  }
}

// --- SAVE UNIVERSITY USERNAME TO FIRESTORE ---
async function handleUniUsernameChange(e) {
  e.preventDefault();
  var input = document.getElementById('newUniUsernameInput');
  var val = input ? input.value.trim() : '';

  var sessionData = localStorage.getItem('currentUser');
  if (!sessionData) return;

  var currentUser = JSON.parse(sessionData);
  var docId = (currentUser.username || currentUser.email.split('@')[0]).toLowerCase();

  try {
    await db.collection('users').doc(docId).set({
      uni_username: val,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    currentUser.uni_username = val;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    document.getElementById('uniUsernameValue').textContent = val || '-';
    closeUniUsernameModal();
    showToastNotification('تم تحديث اسم المستخدم لموقع الجامعة بنجاح!');
  } catch (err) {
    console.error('Firestore Update Error:', err);
    showErrorToast('حدث خطأ أثناء التحديث في قاعدة البيانات');
  }
}

// --- SAVE UNIVERSITY PASSWORD TO FIRESTORE ---
async function handleUniPasswordChange(e) {
  e.preventDefault();
  var input = document.getElementById('newUniPasswordInput');
  var val = input ? input.value.trim() : '';

  var sessionData = localStorage.getItem('currentUser');
  if (!sessionData) return;

  var currentUser = JSON.parse(sessionData);
  var docId = (currentUser.username || currentUser.email.split('@')[0]).toLowerCase();

  try {
    await db.collection('users').doc(docId).set({
      uni_password: val,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    currentUser.uni_password = val;
    realUniPassword = val;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    document.getElementById('uniPasswordValue').textContent = '••••••••';
    closeUniPasswordModal();
    showToastNotification('تم تحديث كلمة المرور لموقع الجامعة بنجاح!');
  } catch (err) {
    console.error('Firestore Update Error:', err);
    showErrorToast('حدث خطأ أثناء التحديث في قاعدة البيانات');
  }
}

async function handleResetPassword(e) {
  e.preventDefault();
  
  var inputOtp = document.getElementById('otpCodeInput').value.trim();
  var newPassword = document.getElementById('newPasswordInput').value.trim();
  
  if (!generatedOtpCode || inputOtp !== generatedOtpCode) {
    showErrorToast('رمز التحقق غير صحيح، يُرجَى التأكد وإعادة المحاولة');
    return;
  }

  if (Date.now() > otpExpirationTime) {
    showErrorToast('انتهت صلاحية رمز التحقق، يُرجَى طلب رمز جديد');
    return;
  }

  var sessionData = localStorage.getItem('currentUser');
  if (!sessionData) {
    showErrorToast('جلسة غير صالحة');
    return;
  }
  
  var currentUser = JSON.parse(sessionData);
  var docIdToUpdate = targetUserDocId || (currentUser.username || currentUser.email.split('@')[0]).toLowerCase();

  try {
    var nowISO = new Date().toISOString();

    // UPDATE FIRESTORE WITH TIMESTAMP
    await db.collection('users').doc(docIdToUpdate).set({
      pass: newPassword,
      password: newPassword,
      lastPasswordChange: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // UPDATE LOCAL STORAGE SESSION
    currentUser.pass = newPassword;
    currentUser.password = newPassword;
    currentUser.lastPasswordChange = nowISO;
    realPassword = newPassword;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    closeOtpModal('verifyOtpModal');
    showToastNotification('تم تغيير كلمة المرور بنجاح! 🎉');

  } catch (err) {
    console.error('Failed to update password in Firestore:', err);
    showErrorToast('فشل تحديث كلمة المرور في قاعدة البيانات');
  }
}


    function checkUserSession() {
      var sessionData = localStorage.getItem('currentUser');
      if (!sessionData) return;

      var user = JSON.parse(sessionData);

      // === STEP 1: Render profile fields instantly from localStorage ===
      if (!realPassword || realPassword.trim() === '' || realPassword === '••••••••') {
        realPassword = user.pass || user.password || '123';
      }
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

      var displayName = user.name || '-';
      var formattedUsername = toTitleCase(user.username);
      var userEmail = user.email || '-';

      // Populate profile fields instantly from localStorage
      document.getElementById('profileDisplayName').textContent = displayName;
      document.getElementById('profileUsername').textContent = formattedUsername || '-';
      document.getElementById('profileEmail').textContent = userEmail;
      document.getElementById('profileStudentId').textContent = user.studentId || '-';

      var badgeContainer = document.querySelector('.gender-badge-container');
      if (badgeContainer) badgeContainer.innerHTML = genderBadgeHTML;

      // Populate uni fields from localStorage
      document.getElementById('uniUsernameValue').textContent = user.uni_username || '-';
      if (user.uni_password) {
        realUniPassword = user.uni_password;
        document.getElementById('uniPasswordValue').textContent = '••••••••';
      } else {
        realUniPassword = '-';
        document.getElementById('uniPasswordValue').textContent = '-';
      }

      updateNotificationBadge();

      // === STEP 2: Fetch fresh data from DB in background ===
      var checkDb = setInterval(async function() {
        if (!window.db) return; // keep waiting
        clearInterval(checkDb);

        try {
          var doc = await db.collection('users').doc(user.username.toLowerCase()).get();
          if (doc.exists) {
            var data = doc.data();
            if (data.name) user.name = data.name;
            if (data.email) user.email = data.email;
            if (data.studentid || data.studentId) user.studentId = data.studentid || data.studentId;
            if (data.avatar) user.avatar = data.avatar;
            if (data.role) user.role = data.role;
            if (data.gender) user.gender = data.gender;
            if (data.pass || data.password) realPassword = data.pass || data.password;
            if (data.uni_username) user.uni_username = data.uni_username;
            if (data.uni_password) user.uni_password = data.uni_password;
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Refresh UI with fresh DB data
            document.getElementById('profileDisplayName').textContent = user.name || '-';
            document.getElementById('profileUsername').textContent = toTitleCase(user.username) || '-';
            document.getElementById('profileEmail').textContent = user.email || '-';
            document.getElementById('profileStudentId').textContent = user.studentId || '-';
            document.getElementById('uniUsernameValue').textContent = user.uni_username || '-';
            if (user.uni_password) {
              realUniPassword = user.uni_password;
              document.getElementById('uniPasswordValue').textContent = '••••••••';
            }
          }
        } catch (err) {
          console.warn('Could not sync with Firestore:', err);
        }
      }, 100);
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

    function getNotifications() {
      return JSON.parse(localStorage.getItem(STORAGE_NOTIFS_KEY) || '[]');
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
      var dropdown = document.getElementById('profileDropdown');
      if (dropdown) dropdown.classList.remove('show');

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
      localStorage.removeItem('currentUser'); localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    window.togglePasswordVisibility = function() {
      var passwordEl = document.getElementById('profilePassword');
      var eyeOpen = document.getElementById('eyeOpenIcon');
      var eyeOff = document.getElementById('eyeOffIcon');

      isPasswordVisible = !isPasswordVisible;
      if (isPasswordVisible) {
        passwordEl.textContent = realPassword;
        eyeOpen.style.display = 'none';
        eyeOff.style.display = 'block';
      } else {
        passwordEl.textContent = '••••••••';
        eyeOpen.style.display = 'block';
        eyeOff.style.display = 'none';
      }
    }

    function smoothNavigate(e, target) {
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = target; }, 300);
    }

    function openNameModal() {
      var modal = document.getElementById('nameModal');
      var input = document.getElementById('newDisplayNameInput');
      var currentTitle = document.getElementById('profileDisplayName').textContent;
      if (modal && input) {
        input.value = currentTitle;
        modal.classList.add('show');
      }
    }

    function closeNameModal() {
      var modal = document.getElementById('nameModal');
      if (modal) modal.classList.remove('show');
    }

    async function handleNameChange(e) {
  e.preventDefault();
  var input = document.getElementById('newDisplayNameInput');
  var newName = input ? input.value.trim() : '';
  if (!newName) return;

  var sessionData = localStorage.getItem('currentUser');
  if (sessionData) {
    var user = JSON.parse(sessionData);
    try {
      showToastNotification('جاري تحديث الاسم المعروض...');

      // Save exact case to Firestore
      await db.collection('users').doc(user.username.toLowerCase()).set({
        name: newName,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      user.name = newName;
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Update UI without forcing Title Case
      checkUserSession();
      closeNameModal();
      showToastNotification('تم تغيير الاسم المعروض بنجاح!');
    } catch (err) {
      console.error('Firebase Update Error:', err);
      showErrorToast('حدث خطأ أثناء تحديث الاسم');
    }
  }
}

    function showToastNotification(messageText) {
      var toast = document.getElementById('toastNotification');
      var messageSpan = document.getElementById('toastMessage');
      if (toast && messageSpan) {
        messageSpan.textContent = messageText;
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

    // Expose functions globally for Next.js onReady re-calls
    window.checkUserSession = checkUserSession;
    window.initSidebarEvents = initSidebarEvents;

    // In Next.js, DOMContentLoaded might have already fired, so just execute these directly
    setTimeout(async () => {
      checkUserSession();
      initSidebarEvents();
    }, 100);
