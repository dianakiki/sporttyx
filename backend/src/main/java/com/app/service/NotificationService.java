package com.app.service;

import com.app.dto.NotificationResponse;
import com.app.dto.NotificationTemplateRequest;
import com.app.dto.NotificationTemplateResponse;
import com.app.dto.SendNotificationRequest;
import com.app.model.*;
import com.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private NotificationTemplateRepository notificationTemplateRepository;
    
    @Autowired
    private EventParticipantRepository eventParticipantRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private TeamParticipantRepository teamParticipantRepository;
    
    @Transactional
    public Notification createNotification(Long participantId, String title, String message, NotificationType type, Long activityId) {
        Notification notification = new Notification();
        
        Participant participant = new Participant();
        participant.setId(participantId);
        notification.setParticipant(participant);
        
        if (activityId != null) {
            Activity activity = new Activity();
            activity.setId(activityId);
            notification.setActivity(activity);
        }
        
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        
        return notificationRepository.save(notification);
    }
    
    @Transactional
    public Notification createActivityApprovedNotification(Activity activity, Participant moderator) {
        return createActivityApprovedNotification(activity, moderator, null, null);
    }
    
    @Transactional
    public Notification createActivityApprovedNotification(Activity activity, Participant moderator, BonusType bonusType, String comment) {
        Notification notification = new Notification();
        notification.setParticipant(activity.getParticipant());
        notification.setActivity(activity);
        notification.setType(NotificationType.ACTIVITY_APPROVED);
        notification.setTitle("Активность одобрена");
        
        StringBuilder messageBuilder = new StringBuilder();
        messageBuilder.append(String.format(
            "Ваша активность \"%s\" была одобрена модератором %s. Вы получили %d баллов",
            activity.getActivityType().getName(),
            moderator.getName(),
            activity.getEnergy()
        ));
        
        if (bonusType != null) {
            // Check if it's a bonus (positive) or penalty (negative)
            if (bonusType.getPointsAdjustment() >= 0) {
                messageBuilder.append(String.format(
                    " + бонус \"%s\" (%+d баллов)",
                    bonusType.getName(),
                    bonusType.getPointsAdjustment()
                ));
            } else {
                messageBuilder.append(String.format(
                    " + штраф \"%s\" (%d баллов)",
                    bonusType.getName(),
                    bonusType.getPointsAdjustment()
                ));
            }
        }
        
        messageBuilder.append(".");
        
        if (comment != null && !comment.trim().isEmpty()) {
            messageBuilder.append(String.format("\n\n💬 Комментарий модератора: %s", comment));
        }
        
        notification.setMessage(messageBuilder.toString());
        
        return notificationRepository.save(notification);
    }
    
    @Transactional
    public Notification createActivityRejectedNotification(Activity activity, Participant moderator, String reason) {
        return createActivityRejectedNotification(activity, moderator, reason, null);
    }
    
    @Transactional
    public Notification createActivityRejectedNotification(Activity activity, Participant moderator, String reason, BonusType penaltyType) {
        Notification notification = new Notification();
        notification.setParticipant(activity.getParticipant());
        notification.setActivity(activity);
        notification.setType(NotificationType.ACTIVITY_REJECTED);
        notification.setTitle("Активность отклонена");
        
        StringBuilder messageBuilder = new StringBuilder();
        messageBuilder.append(String.format(
            "Ваша активность \"%s\" была отклонена модератором %s",
            activity.getActivityType().getName(),
            moderator.getName()
        ));
        
        if (penaltyType != null) {
            messageBuilder.append(String.format(
                " + штраф \"%s\" (%d баллов)",
                penaltyType.getName(),
                penaltyType.getPointsAdjustment()
            ));
        }
        
        messageBuilder.append(".\n\nПричина: ");
        messageBuilder.append(reason != null ? reason : "Не указана");
        
        notification.setMessage(messageBuilder.toString());
        
        return notificationRepository.save(notification);
    }
    
    public List<NotificationResponse> getParticipantNotifications(Long participantId) {
        return notificationRepository.findByParticipantIdOrderByCreatedAtDesc(participantId)
                .stream()
                .map(this::toNotificationResponse)
                .collect(Collectors.toList());
    }
    
    public List<NotificationResponse> getUnreadNotifications(Long participantId) {
        return notificationRepository.findByParticipantIdAndIsReadFalseOrderByCreatedAtDesc(participantId)
                .stream()
                .map(this::toNotificationResponse)
                .collect(Collectors.toList());
    }
    
    public long getUnreadCount(Long participantId) {
        return notificationRepository.countByParticipantIdAndIsReadFalse(participantId);
    }
    
    @Transactional
    public void markAsRead(Long notificationId, Long participantId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getParticipant().getId().equals(participantId)) {
            throw new RuntimeException("Notification does not belong to this participant");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void markAllAsRead(Long participantId) {
        List<Notification> unreadNotifications = 
            notificationRepository.findByParticipantIdAndIsReadFalseOrderByCreatedAtDesc(participantId);
        
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }
    
    @Transactional
    public void deleteNotification(Long notificationId, Long participantId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getParticipant().getId().equals(participantId)) {
            throw new RuntimeException("Notification does not belong to this participant");
        }
        
        notificationRepository.delete(notification);
    }
    
    private NotificationResponse toNotificationResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType().name(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getIsRead(),
                notification.getCreatedAt(),
                notification.getActivity() != null ? notification.getActivity().getId() : null,
                notification.getActivity() != null ? notification.getActivity().getActivityType().getName() : null
        );
    }
    
    @Transactional
    public int sendAdminNotifications(SendNotificationRequest request) {
        Set<Long> recipientIds = new HashSet<>();
        
        switch (request.getRecipientType()) {
            case "ALL":
                // Получаем всех участников мероприятия
                List<EventParticipant> allParticipants = eventParticipantRepository
                    .findByEventIdAndStatus(request.getEventId(), EventParticipantStatus.ACCEPTED);
                allParticipants.forEach(ep -> recipientIds.add(ep.getParticipant().getId()));
                
                // Также добавляем участников из команд этого мероприятия
                List<Team> teams = teamRepository.findByEventId(request.getEventId());
                for (Team team : teams) {
                    List<TeamParticipant> teamParticipants = teamParticipantRepository.findByTeamId(team.getId());
                    teamParticipants.forEach(tp -> recipientIds.add(tp.getParticipant().getId()));
                }
                break;
                
            case "CAPTAINS":
                // Получаем только капитанов команд
                List<Team> eventTeams = teamRepository.findByEventId(request.getEventId());
                for (Team team : eventTeams) {
                    List<TeamParticipant> teamParticipants = teamParticipantRepository.findByTeamId(team.getId());
                    teamParticipants.stream()
                        .filter(tp -> tp.getRole() == TeamRole.CAPTAIN)
                        .forEach(tp -> recipientIds.add(tp.getParticipant().getId()));
                }
                break;
                
            case "SPECIFIC":
                // Используем конкретный список участников
                if (request.getParticipantIds() != null) {
                    recipientIds.addAll(request.getParticipantIds());
                }
                break;
                
            default:
                throw new RuntimeException("Invalid recipient type: " + request.getRecipientType());
        }
        
        // Создаем уведомления для всех получателей
        int count = 0;
        for (Long participantId : recipientIds) {
            createNotification(
                participantId,
                request.getTitle(),
                request.getMessage(),
                NotificationType.ADMIN_MESSAGE,
                null
            );
            count++;
        }
        
        return count;
    }
    
    @Transactional
    public NotificationTemplateResponse saveDraft(NotificationTemplateRequest request, Long createdById) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
        Participant createdBy = participantRepository.findById(createdById)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        NotificationTemplate template = new NotificationTemplate();
        template.setEvent(event);
        template.setCreatedBy(createdBy);
        template.setTitle(request.getTitle());
        template.setMessage(request.getMessage());
        template.setRecipientType(RecipientType.valueOf(request.getRecipientType()));
        
        if (request.getParticipantIds() != null && !request.getParticipantIds().isEmpty()) {
            String participantIdsStr = request.getParticipantIds().stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
            template.setParticipantIds(participantIdsStr);
        }
        
        template.setStatus(NotificationTemplateStatus.DRAFT);
        template = notificationTemplateRepository.save(template);
        
        return toTemplateResponse(template);
    }
    
    @Transactional
    public NotificationTemplateResponse sendFromTemplate(Long templateId, Long senderId) {
        NotificationTemplate template = notificationTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));
        
        SendNotificationRequest sendRequest = new SendNotificationRequest();
        sendRequest.setEventId(template.getEvent().getId());
        sendRequest.setTitle(template.getTitle());
        sendRequest.setMessage(template.getMessage());
        sendRequest.setRecipientType(template.getRecipientType().name());
        
        if (template.getParticipantIds() != null && !template.getParticipantIds().isEmpty()) {
            List<Long> participantIds = Arrays.stream(template.getParticipantIds().split(","))
                    .map(Long::valueOf)
                    .collect(Collectors.toList());
            sendRequest.setParticipantIds(participantIds);
        }
        
        int sentCount = sendAdminNotifications(sendRequest);
        
        template.setStatus(NotificationTemplateStatus.SENT);
        template.setSentCount(sentCount);
        template.setSentAt(LocalDateTime.now());
        template = notificationTemplateRepository.save(template);
        
        return toTemplateResponse(template);
    }
    
    public List<NotificationTemplateResponse> getDrafts(Long eventId) {
        return notificationTemplateRepository
                .findByEventIdAndStatusOrderByCreatedAtDesc(eventId, NotificationTemplateStatus.DRAFT)
                .stream()
                .map(this::toTemplateResponse)
                .collect(Collectors.toList());
    }
    
    public List<NotificationTemplateResponse> getSentNotifications(Long eventId) {
        return notificationTemplateRepository
                .findByEventIdAndStatusOrderByCreatedAtDesc(eventId, NotificationTemplateStatus.SENT)
                .stream()
                .map(this::toTemplateResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteTemplate(Long templateId) {
        notificationTemplateRepository.deleteById(templateId);
    }
    
    private NotificationTemplateResponse toTemplateResponse(NotificationTemplate template) {
        List<Long> participantIds = null;
        if (template.getParticipantIds() != null && !template.getParticipantIds().isEmpty()) {
            participantIds = Arrays.stream(template.getParticipantIds().split(","))
                    .map(Long::valueOf)
                    .collect(Collectors.toList());
        }
        
        return new NotificationTemplateResponse(
                template.getId(),
                template.getTitle(),
                template.getMessage(),
                template.getRecipientType().name(),
                participantIds,
                template.getStatus().name(),
                template.getSentCount(),
                template.getCreatedAt(),
                template.getSentAt(),
                template.getCreatedBy().getName()
        );
    }
}
