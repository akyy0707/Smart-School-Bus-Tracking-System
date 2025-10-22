import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { useNotificationHelpers } from './useNotificationHelpers';
import { 
  Bus, 
  User, 
  Users, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle,
  LogIn
} from 'lucide-react';

type UserRole = 'driver' | 'manager' | 'parent' | null;

interface LoginFormProps {
  onLogin: (role: UserRole) => void;
}

// Mock user accounts for demo
const DEMO_ACCOUNTS = {
  // Tài xế
  'taixe01': { password: '123456', role: 'driver' as const, name: 'Nguyễn Văn Minh' },
  'taixe02': { password: '123456', role: 'driver' as const, name: 'Trần Văn Nam' },
  
  // Quản lý  
  'quanly01': { password: '123456', role: 'manager' as const, name: 'Lê Thị Hoa' },
  'quanly02': { password: '123456', role: 'manager' as const, name: 'Phạm Văn Đức' },
  
  // Phụ huynh
  'phuhuynh01': { password: '123456', role: 'parent' as const, name: 'Nguyễn Thị Lan' },
  'phuhuynh02': { password: '123456', role: 'parent' as const, name: 'Võ Văn Hùng' },
};

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { system, showError } = useNotificationHelpers();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const account = DEMO_ACCOUNTS[username.toLowerCase() as keyof typeof DEMO_ACCOUNTS];
    
    if (!account) {
      setError('Tài khoản không tồn tại');
      showError('Đăng nhập thất bại', 'Tài khoản không tồn tại trong hệ thống.');
      setIsLoading(false);
      return;
    }

    if (account.password !== password) {
      setError('Mật khẩu không chính xác');
      showError('Đăng nhập thất bại', 'Mật khẩu không chính xác. Vui lòng thử lại.');
      setIsLoading(false);
      return;
    }

    // Successful login
    setIsLoading(false);
    const roleNames = {
      'driver': 'Tài xế',
      'manager': 'Quản lý', 
      'parent': 'Phụ huynh'
    };
    system.login(roleNames[account.role]);
    onLogin(account.role);
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'driver':
        return { label: 'Tài xế', color: 'bg-green-100 text-green-800', icon: User };
      case 'manager':
        return { label: 'Quản lý', color: 'bg-blue-100 text-blue-800', icon: Users };
      case 'parent':
        return { label: 'Phụ huynh', color: 'bg-purple-100 text-purple-800', icon: Bus };
      default:
        return { label: '', color: '', icon: User };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 backdrop-blur-sm rounded-2xl mb-4 shadow-lg border border-blue-200">
            <Bus className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2 drop-shadow-sm">SmartBus 1.0</h1>
          <p className="text-blue-700">
            Hệ thống quản lý xe buýt thông minh
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
            <CardDescription className="text-center">
              Nhập thông tin đăng nhập để truy cập hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Tài khoản</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tài khoản"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang đăng nhập...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Đăng nhập
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-blue-700 drop-shadow-sm">
          <p>SmartBus 1.0</p>
          <p className="text-blue-600">Phiên bản 1.0.0</p>
        </div>
      </div>
    </div>
  );
}