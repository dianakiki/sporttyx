package com.app.service;

import com.app.dto.CommentResponse;
import com.app.dto.CreateCommentRequest;
import com.app.model.Activity;
import com.app.model.ActivityComment;
import com.app.model.CommentReaction;
import com.app.model.Participant;
import com.app.model.ReactionType;
import com.app.repository.ActivityCommentRepository;
import com.app.repository.ActivityRepository;
import com.app.repository.CommentReactionRepository;
import com.app.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ActivityCommentService {
    
    @Autowired
    private ActivityCommentRepository activityCommentRepository;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private CommentReactionRepository commentReactionRepository;
    
    @Transactional
    public CommentResponse createComment(Long activityId, Long participantId, CreateCommentRequest request) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        ActivityComment comment = new ActivityComment();
        comment.setActivity(activity);
        comment.setParticipant(participant);
        comment.setText(request.getText());
        
        if (request.getMentionedParticipantId() != null) {
            Participant mentionedParticipant = participantRepository.findById(request.getMentionedParticipantId())
                    .orElseThrow(() -> new RuntimeException("Mentioned participant not found"));
            comment.setMentionedParticipant(mentionedParticipant);
        }
        
        comment = activityCommentRepository.save(comment);
        
        return toCommentResponse(comment, participantId);
    }
    
    @Transactional
    public CommentResponse updateComment(Long commentId, Long participantId, String text) {
        ActivityComment comment = activityCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getParticipant().getId().equals(participantId)) {
            throw new RuntimeException("You can only edit your own comments");
        }
        
        comment.setText(text);
        comment.setUpdatedAt(LocalDateTime.now());
        comment = activityCommentRepository.save(comment);
        
        return toCommentResponse(comment, participantId);
    }
    
    @Transactional
    public void deleteComment(Long commentId, Long participantId) {
        ActivityComment comment = activityCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getParticipant().getId().equals(participantId)) {
            throw new RuntimeException("You can only delete your own comments");
        }
        
        activityCommentRepository.delete(comment);
    }
    
    public List<CommentResponse> getActivityComments(Long activityId, Long currentUserId) {
        List<ActivityComment> comments = activityCommentRepository.findByActivityIdOrderByCreatedAtAsc(activityId);
        
        return comments.stream()
                .map(comment -> toCommentResponse(comment, currentUserId))
                .collect(Collectors.toList());
    }
    
    public Long getCommentCount(Long activityId) {
        return activityCommentRepository.countByActivityId(activityId);
    }
    
    @Transactional
    public void addOrUpdateCommentReaction(Long commentId, Long participantId, ReactionType reactionType) {
        ActivityComment comment = activityCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        Optional<CommentReaction> existingReaction = 
                commentReactionRepository.findByCommentIdAndParticipantId(commentId, participantId);
        
        if (existingReaction.isPresent()) {
            CommentReaction reaction = existingReaction.get();
            reaction.setReactionType(reactionType);
            commentReactionRepository.save(reaction);
        } else {
            CommentReaction reaction = new CommentReaction();
            reaction.setComment(comment);
            reaction.setParticipant(participant);
            reaction.setReactionType(reactionType);
            commentReactionRepository.save(reaction);
        }
    }
    
    @Transactional
    public void removeCommentReaction(Long commentId, Long participantId) {
        commentReactionRepository.deleteByCommentIdAndParticipantId(commentId, participantId);
    }
    
    private CommentResponse toCommentResponse(ActivityComment comment, Long currentUserId) {
        Map<String, Integer> reactionCounts = getCommentReactionCounts(comment.getId());
        
        String userReaction = null;
        if (currentUserId != null) {
            Optional<CommentReaction> userReactionOpt = 
                    commentReactionRepository.findByCommentIdAndParticipantId(comment.getId(), currentUserId);
            if (userReactionOpt.isPresent()) {
                userReaction = userReactionOpt.get().getReactionType().name();
            }
        }
        
        boolean canEdit = currentUserId != null && comment.getParticipant().getId().equals(currentUserId);
        boolean canDelete = canEdit;
        
        return new CommentResponse(
                comment.getId(),
                comment.getActivity().getId(),
                comment.getParticipant().getId(),
                comment.getParticipant().getName(),
                comment.getParticipant().getProfileImageUrl(),
                comment.getText(),
                comment.getMentionedParticipant() != null ? comment.getMentionedParticipant().getId() : null,
                comment.getMentionedParticipant() != null ? comment.getMentionedParticipant().getName() : null,
                reactionCounts,
                userReaction,
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                canEdit,
                canDelete
        );
    }
    
    private Map<String, Integer> getCommentReactionCounts(Long commentId) {
        List<Object[]> results = commentReactionRepository.countReactionsByCommentId(commentId);
        Map<String, Integer> counts = new HashMap<>();
        
        for (Object[] result : results) {
            ReactionType type = (ReactionType) result[0];
            Long count = (Long) result[1];
            counts.put(type.name(), count.intValue());
        }
        
        return counts;
    }
}
