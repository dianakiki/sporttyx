package com.app.repository;

import com.app.model.NotificationTemplate;
import com.app.model.NotificationTemplateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Long> {
    List<NotificationTemplate> findByEventIdAndStatusOrderByCreatedAtDesc(Long eventId, NotificationTemplateStatus status);
    List<NotificationTemplate> findByEventIdOrderByCreatedAtDesc(Long eventId);
}
