import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { User, Baby } from 'lucide-react';

interface LoginPageProps {
  onLogin: (userType: 'parent' | 'child') => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [userType, setUserType] = useState<'parent' | 'child' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userType) {
      onLogin(userType);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#A8E6CF] via-[#FFF8E1] to-[#B3E5FC] p-4">
      {/* Islamic Pattern Background Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Card className="w-full max-w-md p-8 shadow-2xl bg-white/95 backdrop-blur-sm relative z-10 rounded-3xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#A8E6CF] to-[#B3E5FC] mb-4">
            <span className="text-3xl">🌙</span>
          </div>
          <h1 className="text-[#2D5F3F] mb-2">Parvarish AI</h1>
          <p className="text-gray-600">Smart Parenting & Child Tarbiyat Assistant</p>
        </div>

        {/* User Type Selection */}
        {!userType ? (
          <div className="space-y-4">
            <h2 className="text-center text-gray-700 mb-6">Login As</h2>
            <Button
              onClick={() => setUserType('parent')}
              className="w-full h-16 bg-gradient-to-r from-[#A8E6CF] to-[#8BD4AE] hover:from-[#8BD4AE] hover:to-[#A8E6CF] text-[#2D5F3F] rounded-2xl"
            >
              <User className="mr-2 h-6 w-6" />
              Login as Parent
            </Button>
            <Button
              onClick={() => setUserType('child')}
              className="w-full h-16 bg-gradient-to-r from-[#B3E5FC] to-[#81D4FA] hover:from-[#81D4FA] hover:to-[#B3E5FC] text-[#1E4F6F] rounded-2xl"
            >
              <Baby className="mr-2 h-6 w-6" />
              Login as Child
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setUserType(null)}
              className="mb-4 text-gray-600"
            >
              ← Back
            </Button>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>

            <Button
              type="submit"
              className={`w-full h-12 rounded-xl ${
                userType === 'parent'
                  ? 'bg-[#A8E6CF] hover:bg-[#8BD4AE] text-[#2D5F3F]'
                  : 'bg-[#B3E5FC] hover:bg-[#81D4FA] text-[#1E4F6F]'
              }`}
            >
              Login
            </Button>

            <div className="text-center">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-800">
                Don't have an account? Sign up
              </a>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
