package com.app.repository;

import com.app.model.CommentReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentReactionRepository extends JpaRepository<CommentReaction, Long> {
    Optional<CommentReaction> findByCommentIdAndParticipantId(Long commentId, Long participantId);
    
    List<CommentReaction> findByCommentId(Long commentId);
    
    void deleteByCommentIdAndParticipantId(Long commentId, Long participantId);
    
    @Query("SELECT cr.reactionType, COUNT(cr) FROM CommentReaction cr WHERE cr.comment.id = :commentId GROUP BY cr.reactionType")
    List<Object[]> countReactionsByCommentId(@Param("commentId") Long commentId);
}
