import React, { useState, useEffect } from 'react';
import {
  eventInvitationApi,
  EventInvitationStatsResponse,
} from '../api/eventInvitationApi';
import './EventInvitationStats.css';

interface EventInvitationStatsProps {
  eventId: number;
}

const EventInvitationStats: React.FC<EventInvitationStatsProps> = ({ eventId }) => {
  const [stats, setStats] = useState<EventInvitationStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [eventId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await eventInvitationApi.getEventInvitationStats(eventId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка статистики...</div>;
  }

  if (!stats) {
    return <div className="error">Не удалось загрузить статистику</div>;
  }

  const chartData = Object.entries(stats.registrationsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14);

  const maxValue = Math.max(...chartData.map(([, value]) => value), 1);

  return (
    <div className="event-invitation-stats">
      <h2>Статистика приглашений: {stats.eventName}</h2>

      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-number">{stats.totalInvitations}</div>
          <div className="stat-label">Всего приглашений</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.activeInvitations}</div>
          <div className="stat-label">Активных</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalRegistrations}</div>
          <div className="stat-label">Регистраций</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {stats.totalInvitations > 0
              ? ((stats.totalRegistrations / stats.totalInvitations) * 100).toFixed(1)
              : 0}
            %
          </div>
          <div className="stat-label">Конверсия</div>
        </div>
      </div>

      <div className="chart-section">
        <h3>Регистрации по дням (последние 14 дней)</h3>
        {chartData.length === 0 ? (
          <div className="empty-chart">Нет данных для отображения</div>
        ) : (
          <div className="bar-chart">
            {chartData.map(([date, count]) => (
              <div key={date} className="bar-container">
                <div className="bar-wrapper">
                  <div
                    className="bar"
                    style={{ height: `${(count / maxValue) * 100}%` }}
                    title={`${count} регистраций`}
                  >
                    <span className="bar-value">{count}</span>
                  </div>
                </div>
                <div className="bar-label">{new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="recent-usages-section">
        <h3>Последние регистрации</h3>
        {stats.recentUsages.length === 0 ? (
          <div className="empty-state">Регистраций пока нет</div>
        ) : (
          <div className="usages-table">
            <table>
              <thead>
                <tr>
                  <th>Дата и время</th>
                  <th>Участник</th>
                  <th>Логин</th>
                  <th>Приглашение</th>
                  <th>IP адрес</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsages.map((usage) => (
                  <tr key={usage.id}>
                    <td>{new Date(usage.usedAt).toLocaleString('ru-RU')}</td>
                    <td>{usage.participantName}</td>
                    <td>{usage.participantUsername}</td>
                    <td>{usage.invitationDescription || 'Без описания'}</td>
                    <td>{usage.ipAddress || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="invitations-overview">
        <h3>Обзор приглашений</h3>
        <div className="invitations-grid">
          {stats.invitations.map((invitation) => (
            <div key={invitation.id} className="invitation-summary-card">
              <div className="invitation-summary-header">
                <strong>{invitation.description || 'Без описания'}</strong>
                <span className={`status-badge ${invitation.isActive && !invitation.isExpired && !invitation.isMaxedOut ? 'active' : 'inactive'}`}>
                  {invitation.isExpired
                    ? 'Истекла'
                    : invitation.isMaxedOut
                    ? 'Исчерпана'
                    : invitation.isActive
                    ? 'Активна'
                    : 'Неактивна'}
                </span>
              </div>
              <div className="invitation-summary-stats">
                <div>
                  Использовано: <strong>{invitation.timesUsed}</strong>
                  {invitation.maxUses && ` / ${invitation.maxUses}`}
                </div>
                {invitation.expiresAt && (
                  <div className="expiry-info">
                    Истекает: {new Date(invitation.expiresAt).toLocaleDateString('ru-RU')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventInvitationStats;
