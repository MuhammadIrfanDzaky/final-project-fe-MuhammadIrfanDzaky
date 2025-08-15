'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import FutsalLogo from '@/components/ui/futsal-logo';
import TogglePasswordIcon from '@/components/ui/togglePasswordIcon';
import {
  FormState,
  FormErrors,
  RoleType,
  validateRegisterForm,
} from '@/utils/validateRegisterForm';
import { Button } from 'react-day-picker';

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register: registerUser } = useAuth();
  const router = useRouter();

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { confirmPassword, ...userData } = form;
      const success = await registerUser({
        ...userData,
        role: form.role as Exclude<RoleType, ''>,
      });

      if (success) {
        alert('Account created successfully!');
        router.push('/dashboard');
      } else {
        alert('Failed to create account');
      }
    } catch {
      alert('An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-5">
          <div className="flex justify-center mx-auto mb-4">
            <FutsalLogo size={64} className="rounded-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join Dribble today</p>
        </div>

        {/* Form */}
        <div className="glass-effect rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-2">Sign Up</h2>
          <p className="text-gray-600 mb-4">Create your account to start booking courts</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
              <input
                id="name"
                name="name"
                placeholder="Enter your full name"
                className="border rounded w-full h-9 px-3"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="border rounded w-full h-9 px-3"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium">Phone (Optional)</label>
              <input
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                className="border rounded w-full h-9 px-3"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium">Account Type</label>
              <select
                id="role"
                name="role"
                className="border rounded w-full h-9 px-3"
                value={form.role}
                onChange={handleChange}
              >
                <option value="" disabled>Select account type</option>
                <option value="regular_user">Regular User</option>
                <option value="field_owner">Field Owner</option>
              </select>
              {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  className="border rounded w-full h-9 px-3 pr-10"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 text-gray-500"
                  onClick={() => setShowPassword(prev => !prev)}
                  tabIndex={-1}
                >
                  <TogglePasswordIcon isVisible={showPassword} />
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="border rounded w-full h-9 px-3 pr-10"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 text-gray-500"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  tabIndex={-1}
                >
                  <TogglePasswordIcon isVisible={showConfirmPassword} />
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white rounded px-4 py-2 flex items-center justify-center disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}