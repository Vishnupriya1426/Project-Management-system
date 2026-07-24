package com.enterprise.spems.repository;

import com.enterprise.spems.model.entity.ProjectProposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectProposalRepository extends JpaRepository<ProjectProposal, Long> {
    List<ProjectProposal> findAllByOrderByIdDesc();
    List<ProjectProposal> findByClientOrganizationOrderByIdDesc(String clientOrganization);
}
