import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Ambulance, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';

// Password validation helper
const validatePassword = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  const isValid = Object.values(checks).every(Boolean);
  return { isValid, checks };
};

export default function Login({ onLogin }) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'personnel',
  });
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login(loginData.email, loginData.password);
      toast.success('Login successful!');
      onLogin(response.token, response.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (password) => {
    setRegisterData({ ...registerData, password });
    if (password.length > 0) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation(null);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Client-side password validation
    const validation = validatePassword(registerData.password);
    if (!validation.isValid) {
      toast.error('Password does not meet requirements');
      return;
    }
    
    setLoading(true);
    try {
      // Only allow personnel registration from public form
      const payload = {
        ...registerData,
        role: 'personnel' // Force personnel role for public registration
      };
      
      await authAPI.register(payload);
      toast.success('Registration successful! Please login.');
      setRegisterData({ email: '', password: '', full_name: '', role: 'personnel' });
      setPasswordValidation(null);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      toast.error(errorMessage);
      
      // Handle validation errors from backend
      if (error.response?.status === 422) {
        const errors = error.response.data.detail;
        if (Array.isArray(errors)) {
          errors.forEach(err => {
            toast.error(`${err.loc.join('.')}: ${err.msg}`);
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md relative z-10 bg-white border-slate-200 shadow-xl" data-testid="login-card">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-24 w-24 rounded-full bg-[#038B5C] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-4xl">L</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900">LASAMBUS Portal</CardTitle>
          <CardDescription className="text-slate-600">
            Lagos State Ambulance Service Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-slate-700">Email</Label>
                  <Input
                    id="login-email"
                    data-testid="login-email-input"
                    type="email"
                    placeholder="your.email@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className="bg-white border-slate-300 text-slate-900 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-slate-700">Password</Label>
                  <Input
                    id="login-password"
                    data-testid="login-password-input"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="bg-white border-slate-300 text-slate-900 h-12"
                  />
                </div>
                <Button
                  type="submit"
                  data-testid="login-submit-button"
                  className="w-full h-12 bg-[#038B5C] hover:bg-[#02764E] text-white font-semibold rounded-full"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-slate-700">Full Name</Label>
                  <Input
                    id="register-name"
                    data-testid="register-name-input"
                    type="text"
                    placeholder="John Doe"
                    value={registerData.full_name}
                    onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                    required
                    className="bg-white border-slate-300 text-slate-900 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-slate-700">Email</Label>
                  <Input
                    id="register-email"
                    data-testid="register-email-input"
                    type="email"
                    placeholder="your.email@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    className="bg-white border-slate-300 text-slate-900 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-slate-700">
                    Password
                    <span className="text-xs text-slate-500 ml-2">(min. 8 chars, uppercase, lowercase, number, special char)</span>
                  </Label>
                  <Input
                    id="register-password"
                    data-testid="register-password-input"
                    type="password"
                    placeholder="Create a strong password"
                    value={registerData.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    className={`bg-white border-slate-300 text-slate-900 h-12 ${
                      passwordValidation && !passwordValidation.isValid ? 'border-red-500' : ''
                    }`}
                  />
                  {passwordValidation && (
                    <div className="space-y-1 text-xs">
                      <div className={`flex items-center gap-2 ${passwordValidation.checks.length ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.checks.length ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        At least 8 characters
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidation.checks.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.checks.uppercase ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        One uppercase letter
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidation.checks.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.checks.lowercase ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        One lowercase letter
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidation.checks.number ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.checks.number ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        One number
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidation.checks.special ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.checks.special ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        One special character
                      </div>
                    </div>
                  )}
                </div>
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    Only Ambulance Personnel accounts can be created here. Admin accounts must be created by existing administrators.
                  </AlertDescription>
                </Alert>
                <Button
                  type="submit"
                  data-testid="register-submit-button"
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
