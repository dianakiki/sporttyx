package com.app.repository;

import com.app.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    Optional<Participant> findByUsername(String username);
    
    @Query("SELECT p FROM Participant p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Participant> searchByName(@Param("query") String query);
}
