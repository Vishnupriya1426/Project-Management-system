package com.enterprise.spems.service.storage.impl;

import com.enterprise.spems.exception.BadRequestException;
import com.enterprise.spems.exception.ResourceNotFoundException;
import com.enterprise.spems.service.storage.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

@Service
@Slf4j
public class LocalStorageProviderImpl implements StorageService {

    private final Path rootLocation;

    public LocalStorageProviderImpl(@Value("${spems.storage.local-directory:./uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize local storage directory", e);
        }
    }

    @Override
    public String store(MultipartFile file, String folder) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = "";
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = originalFilename.substring(i);
        }

        String uniqueKey = (folder != null ? folder + "/" : "") + UUID.randomUUID() + extension;
        Path targetLocation = this.rootLocation.resolve(uniqueKey).normalize();

        try {
            Files.createDirectories(targetLocation.getParent());
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return uniqueKey;
        } catch (IOException e) {
            log.error("Failed to store file {}", originalFilename, e);
            throw new BadRequestException("Failed to store file " + originalFilename);
        }
    }

    @Override
    public Resource loadAsResource(String fileKey) {
        try {
            Path filePath = this.rootLocation.resolve(fileKey).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Could not read file: " + fileKey);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Could not read file: " + fileKey);
        }
    }

    @Override
    public void delete(String fileKey) {
        try {
            Path filePath = this.rootLocation.resolve(fileKey).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Could not delete file {}", fileKey, e);
        }
    }
}
