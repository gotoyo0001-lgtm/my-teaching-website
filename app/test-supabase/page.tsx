export default function TestSupabasePage() {
  return (
    <div className="p-8 min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">🔬 Supabase 連接測試</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">環境變數檢查</h2>
          <div className="space-y-1 text-sm">
            <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || '未設置'}</div>
            <div>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已設置' : '未設置'}</div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">頁面狀態</h2>
          <div className="text-green-400">✅ 頁面載入成功</div>
          <div className="text-blue-400">ℹ️ 這證明路由和基本渲染正常</div>
        </div>
      </div>
    </div>
  );
}