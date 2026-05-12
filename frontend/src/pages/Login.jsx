import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-card p-8 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-[50px] -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-500/20 rounded-full blur-[50px] -z-10" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm">Sign in to place your bids</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input 
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          
          <div className="flex justify-end">
            <a href="#" className="text-sm text-primary-400 hover:text-primary-300">Forgot password?</a>
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
