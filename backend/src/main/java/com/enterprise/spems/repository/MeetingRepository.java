package com.enterprise.spems.repository;

import com.enterprise.spems.model.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByProjectId(Long projectId);
    List<Meeting> findByClientId(Long clientId);
    List<Meeting> findByTeamId(Long teamId);
    List<Meeting> findByVisibilityScope(String visibilityScope);
    List<Meeting> findByOrganizerId(Long organizerId);
}
