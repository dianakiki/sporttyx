package com.app.repository;

import com.app.model.BugReport;
import com.app.model.BugReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BugReportRepository extends JpaRepository<BugReport, Long> {
    List<BugReport> findByParticipantIdOrderByCreatedAtDesc(Long participantId);
    List<BugReport> findAllByOrderByCreatedAtDesc();
    Long countByParticipantIdAndStatus(Long participantId, BugReportStatus status);
}
