import React from 'react'
import { useState,useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { LanguageContext } from '../Components/Context/LanguageContext';


export default function Login() {

    const { language } = useContext(LanguageContext);
const lang = (language === 'en' || language === 'ar') ? language : 'en';
const translations = {
    en: { login: 'Login', password: 'Password', email: 'Email' },
    ar: { login: 'تسجيل الدخول', password: 'كلمة المرور', email: 'البريد الإلكتروني' }
};
  
    const users =[
        {email : 'admin@test.com', password: 'admin123', role: 'admin', orgId: 1, active: true},
        {email : 'sales@test.com', password: 'sales123', role: 'sales', orgId: 2, active: true},
        {email:'finance@test.com', password: 'finance123', role: 'finance', orgId: 3, active: true},
    ];
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    
    function handleEmailchange($event){
        setEmail($event.target.value);
    }
    function handlePasswordChange($event){
        setPassword($event.target.value)
    }
    
    const handleLogin = () => {
const user = users.find ((u)=> u.email === email && u.password === password);
if (user) {
    if(!user.active) {
        alert('User is inactive.');
        return
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
 navigate('/dashboard');
 window.location.reload();
    } else {
    alert('Invalid Login');
    }

    
};
  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-blue-400 overflow-hidden z-50">
      <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-blue-100 flex flex-col items-center">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-tr from-blue-400 via-blue-600 to-blue-300 rounded-full blur-2xl opacity-40 z-0"></div>
        
        <div className="relative z-10 flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-full w-16 h-16 flex items-center justify-center text-4xl font-extrabold shadow-xl border-4 border-white mb-2">
            <span>🔒</span>
          </div>
          <h2 className="text-3xl font-extrabold mb-1 text-blue-900 tracking-tight drop-shadow">Welcome</h2>
          <p className="text-blue-400 font-medium text-sm mb-2">Sign in to your CRM account</p>
        </div>
        <input
          type="email"
          placeholder={translations[lang].email}
          className="w-full mb-4 p-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition bg-blue-50/80 text-blue-900 font-medium placeholder-blue-400 shadow-sm"
          onChange={handleEmailchange}
        />
        <input
          type="password"
          placeholder={translations[lang].password}
          className="w-full mb-6 p-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition bg-blue-50/80 text-blue-900 font-medium placeholder-blue-400 shadow-sm"
          onChange={handlePasswordChange}
        />
        <button
          className="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 hover:from-blue-800 hover:to-blue-500 text-white w-full py-3 rounded-xl font-bold shadow-lg transition-all duration-150 text-lg tracking-wide mb-2"
          onClick={handleLogin}
        >
          {translations[lang].login}
        </button>
        <div className="flex justify-between w-full mt-2 text-xs text-blue-400">
          <span className="hover:underline cursor-pointer transition">Forgot password?</span>
          <span className="hover:underline cursor-pointer transition">Need help?</span>
        </div>
      </div>
    </div>
  )
}
