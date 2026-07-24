package com.enterprise.spems.repository;

import com.enterprise.spems.model.entity.Project;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @EntityGraph(attributePaths = {"client", "projectManager", "team"})
    List<Project> findAll();

    Optional<Project> findByProjectCode(String projectCode);
    List<Project> findByClientId(Long clientId);
    List<Project> findByProjectManagerId(Long projectManagerId);
}
