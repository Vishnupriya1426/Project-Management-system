package com.enterprise.spems.controller;

import com.enterprise.spems.dto.ApiResponse;
import com.enterprise.spems.model.entity.Client;
import com.enterprise.spems.repository.ClientRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientRepository clientRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Client>>> getAllClients(HttpServletRequest request) {
        List<Client> clients = clientRepository.findAll();
        return ResponseEntity
                .ok(ApiResponse.success(clients, "Clients retrieved successfully", request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Client>> createClient(@RequestBody Client client, HttpServletRequest request) {
        Client created = clientRepository.save(client);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Client onboarded successfully", request.getRequestURI()));
    }
}
