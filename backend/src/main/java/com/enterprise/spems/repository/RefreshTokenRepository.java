package com.enterprise.spems.repository;

import com.enterprise.spems.model.entity.RefreshToken;
import com.enterprise.spems.model.entity.User;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUser(User user);

    @Modifying
    int deleteByUser(User user);
}
