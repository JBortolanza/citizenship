import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  return (
    // 1. Base background changed to stone-50 (a warm creme)
    <div className="relative flex min-h-screen items-center justify-center bg-stone-50 px-4 sm:px-6 lg:px-8">
      
      {/* 2. The Pattern: A subtle CSS dot grid using Tailwind arbitrary values */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      {/* 3. The Card: Elevated shadow and a heavy blue top-border for authority */}
      <div className="relative z-10 w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-2xl border border-stone-100 border-t-4 border-t-blue-900">
        
        <div className="text-center">
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-blue-900">
            Citizenship Portal
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Secure access for authorized legal representatives
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-stone-700">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900 sm:text-sm transition-colors"
                placeholder="attorney@lawfirm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900 sm:text-sm transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-stone-300 text-blue-900 focus:ring-blue-900"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-stone-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-800 hover:text-blue-900 transition-colors">
                Forgot your password?
              </a>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-900 py-2.5 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
            >
              Sign in to Dashboard
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center text-xs text-stone-400 border-t border-stone-100 pt-6">
          Protected system. Unauthorized access is strictly prohibited.
        </div>
      </div>
    </div>
  );
}