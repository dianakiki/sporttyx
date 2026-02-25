import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Mail, Phone, User, Lock, Calendar } from 'lucide-react';
import {
  eventInvitationApi,
  EventInvitationResponse,
  RegisterWithInvitationRequest,
} from '../api/eventInvitationApi';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

const RegisterWithInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteToken = searchParams.get('invite');

  const [invitation, setInvitation] = useState<EventInvitationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterWithInvitationRequest>({
    invitationToken: inviteToken || '',
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!inviteToken) {
      setError('Отсутствует токен приглашения');
      setLoading(false);
      return;
    }

    loadInvitation();
  }, [inviteToken]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      const data = await eventInvitationApi.getInvitationByToken(inviteToken!);
      setInvitation(data);
      setError(null);
    } catch (err) {
      setError('Приглашение не найдено или недействительно');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.name) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await eventInvitationApi.registerWithInvitation(formData);
      
      // Автоматическая авторизация после регистрации
      if (response.token && response.userId) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId.toString());
        navigate('/');
      } else {
        // Если токен не вернулся, пытаемся авторизоваться
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: formData.username, 
            password: formData.password 
          }),
        });
        
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          localStorage.setItem('token', loginData.token);
          localStorage.setItem('userId', loginData.userId);
          navigate('/');
        } else {
          navigate('/login');
        }
      }
    } catch (err: any) {
      setError(err.response?.data || 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 text-lg">Загрузка приглашения...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Ошибка</h2>
          <p className="text-slate-600 mb-6">{error || 'Приглашение не найдено'}</p>
          <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
      </div>
    );
  }

  if (invitation.isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
            <Calendar className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Приглашение истекло</h2>
          <p className="text-slate-600 mb-6">Срок действия этого приглашения истек.</p>
          <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
      </div>
    );
  }

  if (invitation.isMaxedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Приглашение исчерпано</h2>
          <p className="text-slate-600 mb-6">Это приглашение достигло максимального количества использований.</p>
          <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
      </div>
    );
  }

  if (!invitation.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
            <span className="text-4xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Приглашение неактивно</h2>
          <p className="text-slate-600 mb-6">Это приглашение было деактивировано.</p>
          <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        {/* Invitation Info Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-t-3xl shadow-xl p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Вы приглашены!</h2>
          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <h3 className="text-xl font-bold mb-2">{invitation.eventName}</h3>
            {invitation.description && (
              <p className="text-blue-100 text-sm">{invitation.description}</p>
            )}
          </div>
          <p className="text-blue-100">
            Зарегистрируйтесь, чтобы автоматически стать участником этого мероприятия
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-b-3xl shadow-2xl p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Регистрация</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <Input
              label="Логин"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Введите логин"
              required
            />

            <Input
              label="Пароль"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Минимум 6 символов"
              required
            />

            <Input
              label="Имя"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ваше имя"
              required
            />

            <Input
              label="Email (необязательно)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@mail.com"
            />

            <Input
              label="Телефон (необязательно)"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (999) 123-45-67"
            />

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <Button type="submit" isLoading={submitting}>
              Зарегистрироваться
            </Button>

            <div className="mt-6 text-center">
              <span className="text-slate-600">Уже есть аккаунт? </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                Войти
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterWithInvitation;
