export default function SimpleTestPage() {
  return (
    <div style={{ padding: '20px', background: '#1f2937', color: 'white', minHeight: '100vh' }}>
      <h1>🔬 基本測試頁面</h1>
      <p>如果你能看到這個頁面，說明：</p>
      <ul>
        <li>✅ Next.js 路由正常</li>
        <li>✅ 頁面渲染正常</li>
        <li>✅ 基本功能可用</li>
      </ul>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#374151', borderRadius: '8px' }}>
        <h2>環境變數檢查</h2>
        <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ 未設置'}</p>
        <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已設置' : '❌ 未設置'}</p>
      </div>
    </div>
  );
}