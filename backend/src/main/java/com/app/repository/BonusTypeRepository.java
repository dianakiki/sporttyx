package com.app.repository;

import com.app.model.BonusType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BonusTypeRepository extends JpaRepository<BonusType, Long> {
    List<BonusType> findByEventIdAndIsActiveTrue(Long eventId);
}
