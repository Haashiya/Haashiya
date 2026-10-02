
    // Initialize Firebase
    

    async function handleLoginSubmit(e) {
      e.preventDefault();
      
      const messageDiv = document.getElementById('message');
      const usernameInput = document.getElementById('username').value.trim().toLowerCase();
      const passwordInput = document.getElementById('password').value.trim();

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const data = await response.json();

        if (!response.ok) {
          messageDiv.className = "message error";
          messageDiv.textContent = data.error || "حدث خطأ غير متوقع";
          return;
        }

        // Login successful
        const userSession = data.user;
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        
        messageDiv.className = "message success";
        messageDiv.textContent = "تم تسجيل الدخول بنجاح! جاري التوجيه...";

        setTimeout(() => {
          document.body.classList.add('fade-out');
          setTimeout(() => {
            window.location.replace("/archive");
          }, 300);
        }, 1000);

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
  
