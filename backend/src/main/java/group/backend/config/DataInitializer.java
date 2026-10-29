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
                if (userRepository.findByUsername("petra").isEmpty()) {
                    User user = new User();
                    user.setUsername("petra");
                    user.setPassword(passwordEncoder.encode("1234"));
                    userRepository.save(user);
                    System.out.println("Default test user created successfully: username = 'petra', password = '1234'");
                } else {
                    System.out.println("Default test user 'Petra' already exists.");
                }
            } catch (Exception e) {
                System.out.println("Skipping creation for 'Petra': " + e.getMessage());
            }

            try {
                if (userRepository.findByUsername("maria").isEmpty()) {
                    User user2 = new User();
                    user2.setUsername("maria");
                    user2.setPassword(passwordEncoder.encode("1234"));
                    userRepository.save(user2);
                    System.out.println("Default test user created successfully: username = 'maria', password = '1234'");
                } else {
                    System.out.println("Default test user 'John' already exists.");
                }
            } catch (Exception e) {
                System.out.println("Skipping creation for 'John': " + e.getMessage());
            }
        };
    }
}