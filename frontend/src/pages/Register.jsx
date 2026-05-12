import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    const res = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
    setLoading(false);
    
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary-500/20 rounded-full blur-[50px] -z-10" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent-500/20 rounded-full blur-[50px] -z-10" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-sm">Join the BidSphere community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
          <Input 
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
          <Input 
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            minLength="6"
          />
          <Input 
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          
          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
              Register
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
