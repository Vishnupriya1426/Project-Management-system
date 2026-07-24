package com.enterprise.spems.repository;

import com.enterprise.spems.model.entity.ResourceAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceAllocationRepository extends JpaRepository<ResourceAllocation, Long> {
    List<ResourceAllocation> findByProjectId(Long projectId);
    List<ResourceAllocation> findByEmployeeId(Long employeeId);
    List<ResourceAllocation> findByTeamId(Long teamId);
}
