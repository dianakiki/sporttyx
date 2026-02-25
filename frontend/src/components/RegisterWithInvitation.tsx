import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  eventInvitationApi,
  EventInvitationResponse,
  RegisterWithInvitationRequest,
} from '../api/eventInvitationApi';
import './RegisterWithInvitation.css';

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
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      setSubmitting(true);
      await eventInvitationApi.registerWithInvitation(formData);
      alert('Регистрация успешна! Вы автоматически добавлены в мероприятие. Теперь вы можете войти в систему.');
      navigate('/login');
    } catch (err: any) {
      alert(err.response?.data || 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="register-invitation-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка приглашения...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="register-invitation-page">
        <div className="error-container">
          <h2>Ошибка</h2>
          <p>{error || 'Приглашение не найдено'}</p>
          <button onClick={() => navigate('/')}>На главную</button>
        </div>
      </div>
    );
  }

  if (invitation.isExpired) {
    return (
      <div className="register-invitation-page">
        <div className="error-container">
          <h2>Приглашение истекло</h2>
          <p>Срок действия этого приглашения истек.</p>
          <button onClick={() => navigate('/')}>На главную</button>
        </div>
      </div>
    );
  }

  if (invitation.isMaxedOut) {
    return (
      <div className="register-invitation-page">
        <div className="error-container">
          <h2>Приглашение исчерпано</h2>
          <p>Это приглашение достигло максимального количества использований.</p>
          <button onClick={() => navigate('/')}>На главную</button>
        </div>
      </div>
    );
  }

  if (!invitation.isActive) {
    return (
      <div className="register-invitation-page">
        <div className="error-container">
          <h2>Приглашение неактивно</h2>
          <p>Это приглашение было деактивировано.</p>
          <button onClick={() => navigate('/')}>На главную</button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-invitation-page">
      <div className="register-container">
        <div className="invitation-info-box">
          <h2>Вы приглашены!</h2>
          <div className="event-info">
            <h3>{invitation.eventName}</h3>
            {invitation.description && <p className="invitation-description">{invitation.description}</p>}
          </div>
          <p className="info-text">
            Зарегистрируйтесь, чтобы автоматически стать участником этого мероприятия.
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <h3>Регистрация</h3>
          
          <div className="form-group">
            <label>
              Логин <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              placeholder="Введите логин"
            />
          </div>

          <div className="form-group">
            <label>
              Пароль <span className="required">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Введите пароль"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>
              Имя <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Введите ваше имя"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Введите email (необязательно)"
            />
          </div>

          <div className="form-group">
            <label>Телефон</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Введите телефон (необязательно)"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>

          <p className="login-link">
            Уже есть аккаунт? <a href="/login">Войти</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterWithInvitation;
