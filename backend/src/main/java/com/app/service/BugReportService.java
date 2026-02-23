package com.app.service;

import com.app.dto.BugReportRequest;
import com.app.dto.BugReportResponse;
import com.app.model.BadgeType;
import com.app.model.BugReport;
import com.app.model.BugReportStatus;
import com.app.model.Participant;
import com.app.repository.BugReportRepository;
import com.app.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BugReportService {
    
    @Autowired
    private BugReportRepository bugReportRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private BadgeService badgeService;
    
    public BugReportResponse createBugReport(Long participantId, BugReportRequest request) {
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        BugReport bugReport = new BugReport();
        bugReport.setParticipant(participant);
        bugReport.setTitle(request.getTitle());
        bugReport.setDescription(request.getDescription());
        bugReport.setStatus(BugReportStatus.PENDING);
        bugReport.setCreatedAt(LocalDateTime.now());
        
        bugReport = bugReportRepository.save(bugReport);
        
        // Generate unique bug number after save to get the ID
        String bugNumber = String.format("BUG-%06d", bugReport.getId());
        bugReport.setBugNumber(bugNumber);
        bugReport = bugReportRepository.save(bugReport);
        
        // Award badges based on bug report count
        Long resolvedCount = bugReportRepository.countByParticipantIdAndStatus(participantId, BugReportStatus.RESOLVED);
        Long totalCount = (long) bugReportRepository.findByParticipantIdOrderByCreatedAtDesc(participantId).size();
        
        if (totalCount == 1) {
            badgeService.awardBadge(participantId, BadgeType.BUG_HUNTER_BRONZE, null, "Отправил первый баг-репорт");
        } else if (totalCount == 5) {
            badgeService.awardBadge(participantId, BadgeType.BUG_HUNTER_SILVER, null, "Отправил 5 баг-репортов");
        } else if (totalCount == 10) {
            badgeService.awardBadge(participantId, BadgeType.BUG_HUNTER_GOLD, null, "Отправил 10 баг-репортов");
        } else if (totalCount == 25) {
            badgeService.awardBadge(participantId, BadgeType.BUG_HUNTER_PLATINUM, null, "Отправил 25 баг-репортов");
        }
        
        return toBugReportResponse(bugReport);
    }
    
    public List<BugReportResponse> getUserBugReports(Long participantId) {
        return bugReportRepository.findByParticipantIdOrderByCreatedAtDesc(participantId).stream()
                .map(this::toBugReportResponse)
                .collect(Collectors.toList());
    }
    
    public List<BugReportResponse> getAllBugReports() {
        return bugReportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toBugReportResponse)
                .collect(Collectors.toList());
    }
    
    public BugReportResponse updateBugReportStatus(Long bugReportId, String status, Long adminId, String adminNotes, Boolean awardBadge) {
        BugReport bugReport = bugReportRepository.findById(bugReportId)
                .orElseThrow(() -> new RuntimeException("Bug report not found"));
        
        bugReport.setStatus(BugReportStatus.valueOf(status));
        bugReport.setAdminNotes(adminNotes);
        
        if (adminId != null) {
            Participant admin = participantRepository.findById(adminId)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            bugReport.setResolvedBy(admin);
        }
        
        if (BugReportStatus.valueOf(status) == BugReportStatus.RESOLVED) {
            bugReport.setResolvedAt(LocalDateTime.now());
            
            if (awardBadge != null && awardBadge && !bugReport.getBadgeAwarded()) {
                badgeService.awardBadge(bugReport.getParticipant().getId(), 
                        BadgeType.HELPFUL_CONTRIBUTOR, adminId, "За помощь в улучшении системы");
                bugReport.setBadgeAwarded(true);
            }
        }
        
        bugReport = bugReportRepository.save(bugReport);
        return toBugReportResponse(bugReport);
    }
    
    public void deleteBugReport(Long bugReportId) {
        bugReportRepository.deleteById(bugReportId);
    }
    
    private BugReportResponse toBugReportResponse(BugReport bugReport) {
        return new BugReportResponse(
                bugReport.getId(),
                bugReport.getBugNumber(),
                bugReport.getTitle(),
                bugReport.getDescription(),
                bugReport.getStatus().name(),
                bugReport.getCreatedAt(),
                bugReport.getResolvedAt(),
                bugReport.getParticipant().getName(),
                bugReport.getParticipant().getId(),
                bugReport.getResolvedBy() != null ? bugReport.getResolvedBy().getName() : null,
                bugReport.getAdminNotes(),
                bugReport.getBadgeAwarded()
        );
    }
}
