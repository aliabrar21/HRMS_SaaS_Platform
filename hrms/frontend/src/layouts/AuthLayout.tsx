import { Outlet } from 'react-router-dom';

const AuthLayout = () => {

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white p-6 md:p-10 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
