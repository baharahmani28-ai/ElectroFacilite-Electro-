'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authAPI } from '@/lib/api';
import { setToken, setUser } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      setToken(token);
      setUser(user);

      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 animate-gradient">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl animate-float-delay"></div>
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl animate-float-slow"></div>
        
        {/* Tech Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex items-center justify-between gap-16">
        
        {/* Left Side - Login Form */}
        <div className="flex-shrink-0 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <Image 
                  src="/logo.jpg" 
                  alt="Facilite ELECTRO" 
                  width={128}
                  height={128}
                  className="w-32 h-32 object-contain rounded-2xl shadow-lg animate-float-gentle hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent mb-2">
                Facilite ELECTRO
              </h1>
              <p className="text-gray-600 text-base font-medium">Paiements Échelonnés</p>
              <div className="mt-4 h-1 w-20 mx-auto bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl animate-shake">
                  <p className="font-medium text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:border-cyan-500 transition-all"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:border-cyan-500 transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white py-3.5 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Login to Dashboard'
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-100">
              <p className="font-bold text-blue-900 mb-2 text-center text-sm">📋 Demo Credentials</p>
              <div className="space-y-2 text-xs">
                <div className="bg-white/70 px-3 py-2 rounded-lg">
                  <span className="font-semibold text-cyan-700">Admin:</span>
                  <span className="text-gray-700 ml-2">admin@fcilite.com / admin123</span>
                </div>
                <div className="bg-white/70 px-3 py-2 rounded-lg">
                  <span className="font-semibold text-blue-700">POS:</span>
                  <span className="text-gray-700 ml-2">pos@fcilite.com / pos123</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Larger Soma Character */}
        <div className="flex-shrink-0 w-full max-w-xl flex items-center justify-center">
          <div className="relative scale-[3] animate-float-character">
            {/* Soma - Feminine Robot Character */}
            <div className="relative w-28 h-40">
              {/* Head - Feminine Robot with Softer Design */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-18 h-18 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 rounded-3xl shadow-2xl border-2 border-pink-300/50">
                {/* Decorative Hair/Headpiece */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                  <div className="w-12 h-6 bg-gradient-to-b from-rose-400 to-pink-500 rounded-t-full shadow-lg">
                    {/* Hair Bow */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 flex gap-2">
                      <div className="w-3 h-3 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full shadow-md"></div>
                      <div className="w-3 h-3 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full shadow-md"></div>
                    </div>
                  </div>
                </div>
                
                {/* Softer Decorative Lines */}
                <div className="absolute top-3 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-300/40 to-transparent"></div>
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-300/40 to-transparent"></div>
                
                {/* Feminine Robot Face Display */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-2">
                  {/* Softer Digital Eyes with Eyelashes */}
                  <div className="flex gap-3 justify-center items-center mb-2">
                    <div className="relative">
                      {/* LED Eye Frame - Rounded */}
                      <div className="w-5 h-3.5 bg-gradient-to-b from-purple-900 to-purple-950 rounded-full border border-pink-400/50 flex items-center justify-center shadow-inner">
                        {/* Glowing Pupil */}
                        <div className="w-3 h-3 bg-gradient-to-br from-pink-400 via-rose-300 to-purple-400 rounded-full animate-shimmer shadow-lg">
                          <div className="absolute inset-0 bg-pink-300 rounded-full blur-sm animate-pulse-slow"></div>
                          {/* Light reflection */}
                          <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-90"></div>
                          <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-90"></div>
                        </div>
                      </div>
                      {/* Eyelashes */}
                      <div className="absolute -top-1 left-0 right-0 flex justify-around">
                        <div className="w-0.5 h-1.5 bg-pink-500 rounded-full transform -rotate-45"></div>
                        <div className="w-0.5 h-2 bg-pink-500 rounded-full"></div>
                        <div className="w-0.5 h-1.5 bg-pink-500 rounded-full transform rotate-45"></div>
                      </div>
                    </div>
                    <div className="relative">
                      {/* LED Eye Frame - Rounded */}
                      <div className="w-5 h-3.5 bg-gradient-to-b from-purple-900 to-purple-950 rounded-full border border-pink-400/50 flex items-center justify-center shadow-inner">
                        {/* Glowing Pupil */}
                        <div className="w-3 h-3 bg-gradient-to-br from-pink-400 via-rose-300 to-purple-400 rounded-full animate-shimmer shadow-lg">
                          <div className="absolute inset-0 bg-pink-300 rounded-full blur-sm animate-pulse-slow"></div>
                          {/* Light reflection */}
                          <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-90"></div>
                        </div>
                      </div>
                      {/* Eyelashes */}
                      <div className="absolute -top-1 left-0 right-0 flex justify-around">
                        <div className="w-0.5 h-1.5 bg-pink-500 rounded-full transform -rotate-45"></div>
                        <div className="w-0.5 h-2 bg-pink-500 rounded-full"></div>
                        <div className="w-0.5 h-1.5 bg-pink-500 rounded-full transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cute Nose Sensor */}
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2 h-1.5 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full shadow-md">
                    <div className="absolute inset-0.5 bg-pink-200 rounded-full"></div>
                  </div>
                  
                  {/* Warm, Welcoming Smile - LED Display Style */}
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-11 h-5">
                    {/* Smile Arc */}
                    <div className="w-full h-full border-b-3 border-pink-400 rounded-b-full shadow-lg" style={{borderBottomWidth: '3px'}}>
                      <div className="absolute inset-0 border-b-2 border-rose-300 rounded-b-full blur-[1px]"></div>
                    </div>
                    {/* Heart Dimples */}
                    <div className="absolute -left-1 top-0 w-2 h-2 bg-pink-400 rounded-full shadow-md"></div>
                    <div className="absolute -right-1 top-0 w-2 h-2 bg-pink-400 rounded-full shadow-md"></div>
                    {/* Glowing Effect */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-9 h-1 bg-pink-400/50 blur-md"></div>
                  </div>
                  
                  {/* Rosy Cheek Light Indicators */}
                  <div className="absolute top-8 left-0 w-2.5 h-2 bg-pink-400 rounded-full shadow-lg animate-pulse-slow">
                    <div className="absolute inset-0 bg-pink-300 rounded-full blur-[1px]"></div>
                    <div className="absolute inset-1 bg-rose-200 rounded-full"></div>
                  </div>
                  <div className="absolute top-8 right-0 w-2.5 h-2 bg-pink-400 rounded-full shadow-lg animate-pulse-slow">
                    <div className="absolute inset-0 bg-pink-300 rounded-full blur-[1px]"></div>
                    <div className="absolute inset-1 bg-rose-200 rounded-full"></div>
                  </div>
                </div>
                
                {/* Bottom Panel Line */}
                <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-300/40 to-transparent"></div>
              </div>
              
              {/* Neck - Delicate Joint */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-gradient-to-b from-pink-100 to-rose-200 border-x-2 border-pink-300/50"></div>
              
              {/* Body - Feminine Robot Chassis */}
              <div className="absolute top-18 left-1/2 transform -translate-x-1/2 w-20 h-18 bg-gradient-to-br from-pink-400 via-rose-500 to-pink-600 rounded-t-3xl rounded-b-3xl shadow-xl border-2 border-pink-300/50">
                {/* Chest Panel with Heart */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-14 bg-gradient-to-br from-rose-300/30 to-pink-400/30 rounded-2xl border border-pink-200/40"></div>
                
                {/* Heart LED Indicator */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="relative w-4 h-4">
                    <div className="absolute top-0 left-0 w-2 h-2 bg-pink-300 rounded-full shadow-lg animate-pulse-slow"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 bg-pink-300 rounded-full shadow-lg animate-pulse-slow"></div>
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-pink-300"></div>
                  </div>
                </div>
                
                {/* Digital ID Badge */}
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-9 h-8 bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg border-2 border-pink-400 shadow-lg flex flex-col items-center justify-center">
                  <div className="text-[9px] font-bold text-pink-400 tracking-wider animate-shimmer">SOMA</div>
                  <div className="text-[6px] text-pink-300 mt-0.5">Team Member</div>
                  <div className="w-6 h-2 bg-cyan-950 rounded mt-0.5 border border-cyan-500/50 flex items-center justify-center">
                    <div className="text-[5px] text-cyan-400 font-mono">AI-001</div>
                  </div>
                </div>
              </div>
              
              {/* Arms - Slender Robotic Arms */}
              <div className="absolute top-20 -left-2 w-2.5 h-12 bg-gradient-to-b from-pink-400 via-rose-500 to-pink-600 rounded-full shadow-md border border-pink-300/40">
                {/* Elbow Joint */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-2 bg-pink-200 rounded-full border border-pink-400/50"></div>
              </div>
              <div className="absolute top-20 -right-2 w-2.5 h-12 bg-gradient-to-b from-pink-400 via-rose-500 to-pink-600 rounded-full shadow-md border border-pink-300/40 animate-wave-elegant">
                {/* Elbow Joint */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-2 bg-pink-200 rounded-full border border-pink-400/50"></div>
              </div>
              
              {/* Hands - Delicate with Fingers */}
              <div className="absolute top-31 -left-2.5 w-3 h-3 bg-gradient-to-br from-pink-100 to-rose-200 rounded-lg shadow-lg border border-pink-400/50">
                <div className="absolute inset-0.5 bg-pink-50 rounded"></div>
              </div>
              <div className="absolute top-31 -right-2.5 w-3 h-3 bg-gradient-to-br from-pink-100 to-rose-200 rounded-lg shadow-lg border border-pink-400/50">
                <div className="absolute inset-0.5 bg-pink-50 rounded"></div>
              </div>
              
              {/* Lower Body - Feminine Design */}
              <div className="absolute top-35 left-1/2 transform -translate-x-1/2 w-18 h-4 bg-gradient-to-b from-pink-600 to-rose-700 rounded-b-3xl shadow-lg border-b-2 border-pink-400/40">
                {/* Hip Joint Indicators */}
                <div className="absolute bottom-0 left-3 w-1.5 h-1.5 bg-pink-300 rounded-full border border-pink-400/50"></div>
                <div className="absolute bottom-0 right-3 w-1.5 h-1.5 bg-pink-300 rounded-full border border-pink-400/50"></div>
              </div>
              
              {/* Legs - Slender Robotic with Segments */}
              <div className="absolute top-38 left-5 w-3 h-8 bg-gradient-to-b from-pink-500 via-rose-600 to-pink-700 rounded-full shadow-md border border-pink-400/40">
                {/* Knee Joint */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3.5 h-2 bg-pink-200 rounded-full border border-pink-400/50"></div>
              </div>
              <div className="absolute top-38 right-5 w-3 h-8 bg-gradient-to-b from-pink-500 via-rose-600 to-pink-700 rounded-full shadow-md border border-pink-400/40">
                {/* Knee Joint */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3.5 h-2 bg-pink-200 rounded-full border border-pink-400/50"></div>
              </div>
              
              {/* Feet - Cute Robotic Boots */}
              <div className="absolute bottom-[-2px] left-3.5 w-4 h-3 bg-gradient-to-r from-pink-600 to-rose-700 rounded-lg shadow-lg border border-pink-400/50">
                <div className="absolute inset-0.5 bg-gradient-to-r from-pink-500 to-rose-600 rounded"></div>
              </div>
              <div className="absolute bottom-[-2px] right-3.5 w-4 h-3 bg-gradient-to-r from-pink-600 to-rose-700 rounded-lg shadow-lg border border-pink-400/50">
                <div className="absolute inset-0.5 bg-gradient-to-r from-pink-500 to-rose-600 rounded"></div>
              </div>
            </div>
            
            {/* Welcoming Speech Bubble */}
            <div className="absolute -bottom-28 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-purple-900 to-purple-800 backdrop-blur-sm px-8 py-5 rounded-3xl shadow-2xl border-2 border-pink-400">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-slow shadow-lg">
                  <div className="absolute inset-0 bg-green-300 rounded-full blur-sm animate-pulse"></div>
                </div>
                <p className="text-xl font-bold text-pink-400">
                  Hello, I'm Soma 💕
                </p>
              </div>
              <p className="text-base text-pink-300">I'm also part of the team</p>
              {/* Arrow */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-pink-400"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-[7px] border-r-[7px] border-b-[7px] border-transparent border-b-purple-900"></div>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes float-character {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes wave-elegant {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-15deg); }
        }
        @keyframes blink-elegant {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-gradient { background-size: 200% 200%; animation: gradient 12s ease infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-float-gentle { animation: float-gentle 3s ease-in-out infinite; }
        .animate-float-character { animation: float-character 2.5s ease-in-out infinite; }
        .animate-wave-elegant { animation: wave-elegant 2s ease-in-out infinite; }
        .animate-blink-elegant { animation: blink-elegant 4s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 1.5s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}} />
    </div>
  );
}
