import { useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { User, Baby, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_ENDPOINTS } from '../api/config';

interface LoginPageProps {
  onLogin: (userType: 'parent' | 'child') => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [userType, setUserType] = useState<'parent' | 'child' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form fields (only for child login)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = API_ENDPOINTS.auth.googleLogin;
  };

  const resetForm = () => {
    setUserType(null);
    setUsername('');
    setPassword('');
    setError('');
    setSuccess('');
    setIsLoading(false);
  };

  // Child login handler
  const handleChildLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const res = await axios.post(
        API_ENDPOINTS.auth.login,
        { username, password }
      );
      // Store access token and user info with user_type
      localStorage.setItem('access_token', res.data.access_token);
      const userInfo = res.data.user_info || {};
      userInfo.user_type = 'child'; // Ensure user_type is set
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        onLogin('child');
      }, 500);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || err?.response?.data?.message || 'Invalid username or password.'
      );
    } finally {
      setIsLoading(false);
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
        ) : userType === 'parent' ? (
          /* Parent Login - Only Google OAuth */
          <div className="space-y-6">
            <Button
              type="button"
              variant="ghost"
              onClick={resetForm}
              className="mb-4 text-gray-600"
            >
              ← Back
            </Button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-[#2D5F3F] mb-2">Parent Login</h2>
              <p className="text-gray-600 text-sm">Sign in with your Google account to continue</p>
            </div>

            {/* Alert Messages */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Google Login Button */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-14 bg-white border-2 border-gray-300 hover:border-[#A8E6CF] hover:bg-green-50 font-semibold rounded-xl shadow-lg text-gray-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Secure authentication powered by Google
            </p>
          </div>
        ) : (
          /* Child Login - Username/Password Form */
          <form onSubmit={handleChildLogin} className="space-y-6">
            <Button
              type="button"
              variant="ghost"
              onClick={resetForm}
              className="mb-4 text-gray-600"
            >
              ← Back
            </Button>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="child-username">Username</Label>
              <Input
                id="child-username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="child-password">Password</Label>
              <Input
                id="child-password"
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
              className="w-full h-12 rounded-xl bg-[#B3E5FC] hover:bg-[#81D4FA] text-[#1E4F6F]"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Login
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
