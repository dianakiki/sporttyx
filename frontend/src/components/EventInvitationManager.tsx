import React, { useState, useEffect } from 'react';
import {
  eventInvitationApi,
  EventInvitationResponse,
  CreateEventInvitationRequest,
} from '../api/eventInvitationApi';
import './EventInvitationManager.css';

interface EventInvitationManagerProps {
  eventId: number;
  eventName: string;
}

const EventInvitationManager: React.FC<EventInvitationManagerProps> = ({ eventId, eventName }) => {
  const [invitations, setInvitations] = useState<EventInvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateEventInvitationRequest>({
    eventId,
    description: '',
    maxUses: undefined,
    expiresAt: undefined,
  });

  useEffect(() => {
    loadInvitations();
  }, [eventId]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const data = await eventInvitationApi.getEventInvitations(eventId);
      setInvitations(data);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventInvitationApi.createInvitation(formData);
      setShowCreateForm(false);
      setFormData({
        eventId,
        description: '',
        maxUses: undefined,
        expiresAt: undefined,
      });
      loadInvitations();
    } catch (error) {
      console.error('Failed to create invitation:', error);
      alert('Не удалось создать приглашение');
    }
  };

  const handleToggleActive = async (invitation: EventInvitationResponse) => {
    try {
      if (invitation.isActive) {
        await eventInvitationApi.deactivateInvitation(invitation.id);
      } else {
        await eventInvitationApi.activateInvitation(invitation.id);
      }
      loadInvitations();
    } catch (error) {
      console.error('Failed to toggle invitation:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это приглашение?')) {
      return;
    }
    try {
      await eventInvitationApi.deleteInvitation(id);
      loadInvitations();
    } catch (error) {
      console.error('Failed to delete invitation:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Ссылка скопирована в буфер обмена!');
  };

  const getStatusBadge = (invitation: EventInvitationResponse) => {
    if (invitation.isExpired) return <span className="badge badge-expired">Истекла</span>;
    if (invitation.isMaxedOut) return <span className="badge badge-maxed">Исчерпана</span>;
    if (!invitation.isActive) return <span className="badge badge-inactive">Неактивна</span>;
    return <span className="badge badge-active">Активна</span>;
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="event-invitation-manager">
      <div className="header">
        <h2>Пригласительные ссылки для {eventName}</h2>
        <button className="btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Отмена' : '+ Создать приглашение'}
        </button>
      </div>

      {showCreateForm && (
        <form className="create-form" onSubmit={handleCreate}>
          <h3>Новое приглашение</h3>
          <div className="form-group">
            <label>Описание (необязательно)</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Например: Для студентов МГУ"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Макс. использований (необязательно)</label>
              <input
                type="number"
                min="1"
                value={formData.maxUses || ''}
                onChange={(e) =>
                  setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : undefined })
                }
                placeholder="Без ограничений"
              />
            </div>
            <div className="form-group">
              <label>Срок действия (необязательно)</label>
              <input
                type="datetime-local"
                value={formData.expiresAt || ''}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value || undefined })}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            Создать
          </button>
        </form>
      )}

      <div className="invitations-list">
        {invitations.length === 0 ? (
          <div className="empty-state">
            <p>Пригласительные ссылки еще не созданы</p>
          </div>
        ) : (
          invitations.map((invitation) => (
            <div key={invitation.id} className="invitation-card">
              <div className="invitation-header">
                <div className="invitation-info">
                  {invitation.description && <h4>{invitation.description}</h4>}
                  {getStatusBadge(invitation)}
                </div>
                <div className="invitation-actions">
                  <button
                    className={`btn-toggle ${invitation.isActive ? 'active' : ''}`}
                    onClick={() => handleToggleActive(invitation)}
                    disabled={invitation.isExpired || invitation.isMaxedOut}
                  >
                    {invitation.isActive ? 'Деактивировать' : 'Активировать'}
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(invitation.id)}>
                    Удалить
                  </button>
                </div>
              </div>
              <div className="invitation-url">
                <input type="text" value={invitation.invitationUrl} readOnly />
                <button className="btn-copy" onClick={() => copyToClipboard(invitation.invitationUrl)}>
                  Копировать
                </button>
              </div>
              <div className="invitation-stats">
                <div className="stat">
                  <span className="stat-label">Использовано:</span>
                  <span className="stat-value">
                    {invitation.timesUsed}
                    {invitation.maxUses && ` / ${invitation.maxUses}`}
                  </span>
                </div>
                {invitation.expiresAt && (
                  <div className="stat">
                    <span className="stat-label">Истекает:</span>
                    <span className="stat-value">{new Date(invitation.expiresAt).toLocaleString('ru-RU')}</span>
                  </div>
                )}
                <div className="stat">
                  <span className="stat-label">Создано:</span>
                  <span className="stat-value">
                    {new Date(invitation.createdAt).toLocaleString('ru-RU')} ({invitation.createdByName})
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventInvitationManager;
