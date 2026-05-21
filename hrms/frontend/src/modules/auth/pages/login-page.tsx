import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginInput } from '@hrms/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLoginMutation } from '../hooks';
import { useAuthStore } from '@/store/auth-store';

const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setPendingTempToken = useAuthStore((state) => state.setPendingTempToken);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
      orgSlug: '',
    },
  });

  const loginMutation = useLoginMutation();

  const onSubmit = async (values: LoginInput) => {
    const result = await loginMutation.mutateAsync(values);

    if (result.requiresTwoFactor && result.tempToken) {
      setPendingTempToken(result.tempToken);
      navigate('/verify-otp');
      return;
    }

    if (result.accessToken && result.user) {
      setAuth({ accessToken: result.accessToken, user: result.user });
      navigate('/dashboard');
    }
  };

  const loginErrorMessage = () => {
    const error = loginMutation.error as any;
    return error?.response?.data?.message ?? 'Unable to sign in. Please verify credentials.';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in to HRMS</CardTitle>
        <CardDescription>Use your organization slug, email, and password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="orgSlug">Organization slug</Label>
            <Input id="orgSlug" placeholder="acme" {...register('orgSlug')} />
            {errors.orgSlug ? <p className="text-xs text-red-500">{errors.orgSlug.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@company.com" {...register('email')} />
            {errors.email ? <p className="text-xs text-red-500">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="��������" {...register('password')} />
            {errors.password ? <p className="text-xs text-red-500">{errors.password.message}</p> : null}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" className="h-4 w-4 rounded border-border" {...register('rememberMe')} />
            Remember me
          </label>
          <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </Button>
          {loginMutation.isError ? (
            <p className="text-sm text-red-600">{loginErrorMessage()}</p>
          ) : null}
          <div className="flex items-center justify-between text-sm">
            <Link className="text-primary hover:underline" to="/register">
              Complete invitation setup
            </Link>
            <span className="text-slate-500">Invite-only registration</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginPage;
