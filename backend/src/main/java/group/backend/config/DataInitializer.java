package group.backend.config;

import group.backend.models.User;
import group.backend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                if (userRepository.findByUsername("Petra").isEmpty()) {
                    User user = new User();
                    user.setUsername("Petra");
                    user.setPassword(passwordEncoder.encode("1234"));
                    userRepository.save(user);
                    System.out.println("Default test user created successfully: username = 'Petra', password = '1234'");
                } else {
                    System.out.println("Default test user 'Petra' already exists.");
                }
            } catch (Exception e) {
                System.out.println("User 'Petra' already exists, skipping creation.");
            }
        };
    }
}