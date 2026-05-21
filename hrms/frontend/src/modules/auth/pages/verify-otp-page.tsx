import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { otpVerifySchema, type OtpVerifyInput } from '@hrms/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVerifyOtpMutation } from '../hooks';
import { useAuthStore } from '@/store/auth-store';

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const pendingTempToken = useAuthStore((state) => state.pendingTempToken);
  const setAuth = useAuthStore((state) => state.setAuth);

  const verifyMutation = useVerifyOtpMutation();

  useEffect(() => {
    if (!pendingTempToken) {
      navigate('/login');
    }
  }, [pendingTempToken, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<OtpVerifyInput>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: {
      tempToken: pendingTempToken ?? '',
      otp: '',
    },
  });

  const onSubmit = async (values: OtpVerifyInput) => {
    const result = await verifyMutation.mutateAsync(values);
    setAuth({ accessToken: result.accessToken, user: result.user });
    navigate('/dashboard');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>
        <CardDescription>Enter the 6-digit OTP sent to your email.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('tempToken')} />

          <div className="space-y-2">
            <Label htmlFor="otp">OTP</Label>
            <Input id="otp" maxLength={6} placeholder="123456" {...register('otp')} />
            {errors.otp ? <p className="text-xs text-red-500">{errors.otp.message}</p> : null}
          </div>

          <Button className="w-full" type="submit" disabled={verifyMutation.isPending}>
            {verifyMutation.isPending ? 'Verifying...' : 'Verify OTP'}
          </Button>

          {verifyMutation.isError ? (
            <p className="text-sm text-red-600">Invalid OTP. Please try again.</p>
          ) : null}

          <p className="text-sm text-slate-500">
            Back to{' '}
            <Link className="text-primary hover:underline" to="/login">
              login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default VerifyOtpPage;
