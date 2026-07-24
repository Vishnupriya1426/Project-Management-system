package com.enterprise.spems.repository;

import com.enterprise.spems.model.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByOrganizerId(Long organizerId);
}
