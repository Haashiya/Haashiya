import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Query user by username (case-insensitive)
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, name, gender, role, avatar, pass, password, "studentId"')
      .eq('id', username.toLowerCase().trim())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'اسم المستخدم غير مسجل بالمنظومة' },
        { status: 401 }
      );
    }

    // Check password
    const storedPassword = data.pass || data.password;
    if (storedPassword !== password.trim()) {
      return NextResponse.json(
        { error: 'كلمة المرور غير صحيحة! يُرجَى المحاولة مرة أخرى' },
        { status: 401 }
      );
    }

    // Return user data WITHOUT the password
    const userSession = {
      username: data.username || data.id,
      name: data.name || 'المستخدم',
      email: data.email || '',
      gender: data.gender || 'male',
      role: data.role || 'user',
      avatar: data.avatar || 'assets/images/web/default_avatar.png',
      studentId: data.studentId || '',
    };

    return NextResponse.json({ user: userSession }, { status: 200 });

  } catch (err) {
    console.error('Login API Error:', err);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء الاتصال بقاعدة البيانات' },
      { status: 500 }
    );
  }
}
