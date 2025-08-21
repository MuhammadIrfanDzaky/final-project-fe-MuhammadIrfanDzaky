"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import FutsalLogo from "@/components/ui/futsal-logo";
import TogglePasswordIcon from "@/components/ui/togglePasswordIcon";
import { useForm } from "react-hook-form";
import { RoleType } from "@/utils/validateRegisterForm";

export default function  RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: "",
    },
  });

  const onSubmit = async (data: any) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { type: "manual", message: "Passwords do not match" });
      return;
    }
    try {
      const { confirmPassword, ...userData } = data;
      const success = await registerUser({
        ...userData,
        role: data.role as Exclude<RoleType, "">,
      });
      if (success) {
        toast.success("Account created successfully!");
        reset();
        router.push("/dashboard");
      } else {
        toast.error("Failed to create account");
      }
    } catch {
      toast.error("An error occurred during registration");
    }
  };

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
              <input
                id="name"
                placeholder="Enter your full name"
                className="border rounded w-full h-9 px-3"
                {...register("name", {
                  required: "Full name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                })}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="border rounded w-full h-9 px-3"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium">Phone</label>
              <input
                id="phone"
                placeholder="Enter your phone number"
                className="border rounded w-full h-9 px-3"
                {...register("phone", {
                  required: "Phone number is required",
                  minLength: { value: 8, message: "Phone number must be at least 8 digits" },
                })}
              />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium">Account Type</label>
              <select
                id="role"
                className="border rounded w-full h-9 px-3"
                {...register("role", { required: "Role is required" })}
              >
                <option value="" disabled>Select account type</option>
                <option value="regular_user">Regular User</option>
                <option value="field_owner">Field Owner</option>
              </select>
              {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="border rounded w-full h-9 px-3 pr-10"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 text-gray-500"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  <TogglePasswordIcon isVisible={showPassword} />
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="border rounded w-full h-9 px-3 pr-10"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                  })}
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 text-gray-500"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                >
                  <TogglePasswordIcon isVisible={showConfirmPassword} />
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded px-4 py-2 flex items-center justify-center disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
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