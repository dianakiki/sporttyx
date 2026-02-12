package com.app.config;

import com.app.model.Participant;
import com.app.model.Role;
import com.app.repository.ParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DefaultAdminInitializer implements CommandLineRunner {
    
    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        if (!participantRepository.findByUsername("admin").isPresent()) {
            Participant admin = new Participant();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin_123"));
            admin.setName("Администратор");
            admin.setEmail("admin@diasporttyx.com");
            admin.setRole(Role.ADMIN);
            
            participantRepository.save(admin);
            System.out.println("✓ Default admin user created: admin / admin_123");
        } else {
            System.out.println("✓ Admin user already exists");
        }
    }
}
