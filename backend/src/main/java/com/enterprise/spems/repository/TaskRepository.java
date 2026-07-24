package com.enterprise.spems.repository;

import com.enterprise.spems.model.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssigneeId(Long assigneeId);
    List<Task> findByTeamId(Long teamId);
    List<Task> findBySprintId(Long sprintId);
    List<Task> findByDepartmentId(Long departmentId);
}
