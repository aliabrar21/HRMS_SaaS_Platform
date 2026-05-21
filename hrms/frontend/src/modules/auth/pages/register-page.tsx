import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { registerFromInviteSchema, type RegisterFromInviteInput } from '@hrms/shared';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegisterMutation } from '../hooks';

const extendedSchema = registerFromInviteSchema.extend({
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof extendedSchema>;

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

  const registerMutation = useRegisterMutation();
  const { register, handleSubmit, formState: { errors, isSubmitSuccessful } } = useForm<RegisterFormValues>({
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      inviteToken,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    const payload: RegisterFromInviteInput = {
      inviteToken: values.inviteToken,
      password: values.password,
    };
    await registerMutation.mutateAsync(payload);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete your invite</CardTitle>
        <CardDescription>Set your password to activate your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="inviteToken">Invite token</Label>
            <Input id="inviteToken" {...register('inviteToken')} />
            {errors.inviteToken ? <p className="text-xs text-red-500">{errors.inviteToken.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Strong password" {...register('password')} />
            {errors.password ? <p className="text-xs text-red-500">{errors.password.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
            {errors.confirmPassword ? <p className="text-xs text-red-500">{errors.confirmPassword.message}</p> : null}
          </div>

          <Button className="w-full" type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Activating...' : 'Activate account'}
          </Button>

          {isSubmitSuccessful && !registerMutation.isError ? (
            <p className="text-sm text-green-600">Account activated. You can sign in now.</p>
          ) : null}

          {registerMutation.isError ? (
            <p className="text-sm text-red-600">Failed to complete registration.</p>
          ) : null}

          <p className="text-sm text-slate-500">
            Already activated?{' '}
            <Link className="text-primary hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterPage;
