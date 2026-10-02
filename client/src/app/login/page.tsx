"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FullPageSpinner } from "@/components/ui/spinner";
import { useLogin } from "@/hooks/queries/use-auth-actions";
import { getApiErrorMessage } from "@/lib/api";
import { loginSchema, type LoginValues } from "@/lib/schemas";

const DEMO = { email: "admin@doctortracker.com", password: "Admin@12345" };

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, refresh } = useAuth();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // If a valid session already exists, skip the login screen.
  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/dashboard");
  }, [isLoading, isAuthenticated, router]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      await refresh();
      toast.success("Welcome back!");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Login failed"));
    }
  });

  if (isLoading || isAuthenticated) return <FullPageSpinner />;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Activity className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold">Doctor Tracker</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">
            Manage doctors &amp; patients with clarity.
          </h1>
          <p className="mt-4 text-primary-100">
            A secure admin portal with powerful search, filtering and real-time
            analytics — built for performance at scale.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-primary-50">
            {[
              "Centralised doctor & patient records",
              "Insightful dashboard & charts",
              "Fast, indexed search and filtering",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-primary-200">
          © {new Date().getFullYear()} Doctor Tracker. Admin access only.
        </p>

        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-10 h-48 w-48 rounded-full bg-primary-400/30 blur-2xl" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
                <Activity className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-semibold text-surface-900">
                Doctor Tracker
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-surface-900">Sign in</h2>
          <p className="mt-1 text-sm text-surface-500">
            Enter your admin credentials to continue.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Field label="Email" required error={errors.email?.message}>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="admin@doctortracker.com"
                  className="pl-9"
                  invalid={!!errors.email}
                  {...register("email")}
                />
              </div>
            </Field>

            <Field label="Password" required error={errors.password?.message}>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  invalid={!!errors.password}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600 focus-ring"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>

            <Button type="submit" className="w-full" isLoading={login.isPending}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-3 text-xs text-surface-500">
            <p className="font-medium text-surface-600">Demo credentials</p>
            <p className="mt-1">
              {DEMO.email} / {DEMO.password}
            </p>
            <button
              type="button"
              onClick={() => {
                setValue("email", DEMO.email);
                setValue("password", DEMO.password);
              }}
              className="mt-2 font-medium text-primary-600 hover:text-primary-700 focus-ring"
            >
              Fill demo credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
