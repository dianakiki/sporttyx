package com.app.service;

import com.app.dto.AuthResponse;
import com.app.dto.LoginRequest;
import com.app.dto.RegisterRequest;
import com.app.model.Participant;
import com.app.repository.ParticipantRepository;
import com.app.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    public AuthResponse register(RegisterRequest request) {
        System.out.println("=== REGISTER REQUEST ===");
        System.out.println("Username: " + request.getUsername());
        System.out.println("Name: " + request.getName());
        System.out.println("Password length: " + (request.getPassword() != null ? request.getPassword().length() : "null"));
        
        if (participantRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Name is required");
        }
        
        Participant participant = new Participant();
        participant.setUsername(request.getUsername());
        participant.setPassword(passwordEncoder.encode(request.getPassword()));
        participant.setName(request.getName().trim());
        
        participant = participantRepository.save(participant);
        
        String token = jwtUtil.generateToken(participant.getUsername(), participant.getId());
        
        return new AuthResponse(token, participant.getId(), participant.getUsername(), participant.getName(), participant.getRole().name());
    }
    
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        
        Participant participant = participantRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String token = jwtUtil.generateToken(participant.getUsername(), participant.getId());
        
        return new AuthResponse(token, participant.getId(), participant.getUsername(), participant.getName(), participant.getRole().name());
    }
}
