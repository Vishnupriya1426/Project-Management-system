package com.enterprise.spems.service.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file, String folder);
    Resource loadAsResource(String fileKey);
    void delete(String fileKey);
}
