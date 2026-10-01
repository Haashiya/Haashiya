
    // Initialize Firebase
    

    async function handleLoginSubmit(e) {
      e.preventDefault();
      
      const messageDiv = document.getElementById('message');
      const usernameInput = document.getElementById('username').value.trim().toLowerCase();
      const passwordInput = document.getElementById('password').value.trim();

      try {
        // Fallback to fetch from users.json since Firebase isn't initialized
        const response = await fetch('/data/users.json');
        const usersList = await response.json();
        
        const userData = usersList.find(u => u.username.toLowerCase() === usernameInput);

        if (!userData) {
          messageDiv.className = "message error";
          messageDiv.textContent = "اسم المستخدم غير مسجل بالمنظومة";
          return;
        }

        const activePassword = userData.pass || userData.password;

        if (activePassword === passwordInput) {
          const userSession = {
            username: usernameInput,
            name: userData.name || 'المستخدم',
            email: userData.email || '',
            gender: userData.gender || 'male',
            role: userData.role || 'user',
            pass: activePassword,
            password: activePassword,
            avatar: userData.avatar || '/assets/images/web/default_avatar.png',
            studentId: userData.studentId || '11011110001'
          };

          localStorage.setItem('currentUser', JSON.stringify(userSession));
          
          messageDiv.className = "message success";
          messageDiv.textContent = "تم تسجيل الدخول بنجاح! جاري التوجيه...";

          setTimeout(() => {
            document.body.classList.add('fade-out');
            setTimeout(() => {
              window.location.href = "/materials";
            }, 300);
          }, 1000);

        } else {
          messageDiv.className = "message error";
          messageDiv.textContent = "كلمة المرور غير صحيحة! يُرجَى المحاولة مرة أخرى";
        }

      } catch (err) {
        console.error('Login Error:', err);
        messageDiv.className = "message error";
        messageDiv.textContent = "حدث خطأ أثناء الاتصال بقاعدة البيانات";
      }
    }

    function smoothNavigate(event, targetUrl) {
      event.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 300);
    }
  
