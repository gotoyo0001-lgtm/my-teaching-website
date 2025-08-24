// app/api/categories/route.ts - 分类API端点

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('获取分类失败:', error);
      return NextResponse.json(
        { error: '获取分类失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: categories || [] });
  } catch (error) {
    console.error('分类API错误:', error);
    return NextResponse.json(
      { error: '服务器错误', details: String(error) },
      { status: 500 }
    );
  }
}