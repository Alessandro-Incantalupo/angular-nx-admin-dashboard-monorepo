package com.admindashboard.config;

import com.admindashboard.domain.User;
import com.admindashboard.domain.enumeration.Role;
import com.admindashboard.domain.enumeration.Status;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;
import java.util.logging.Logger;

@ApplicationScoped
public class DataInitializer {

    private static final Logger LOGGER = Logger.getLogger(DataInitializer.class.getName());

    @Transactional
    public void onStart(@Observes StartupEvent ev) {
        if (User.count() == 0) {
            LOGGER.info("Seeding database with initial users...");

            User.persist(
                new User("Alice Developer", "alice@example.com", Role.admin, Status.active),
                new User("Bob Designer", "bob@example.com", Role.user, Status.inactive),
                new User("Charlie Manager", "charlie@example.com", Role.admin, Status.active),
                new User("Diana Analyst", "diana@example.com", Role.user, Status.active),
                new User("Eve Tester", "eve@example.com", Role.user, Status.inactive),
                new User("Frank Engineer", "frank@example.com", Role.user, Status.active),
                new User("Grace Architect", "grace@example.com", Role.admin, Status.active),
                new User("Hank Consultant", "hank@example.com", Role.user, Status.inactive),
                new User("Ivy Developer", "ivy@example.com", Role.user, Status.active),
                new User("Jack Support", "jack@example.com", Role.user, Status.inactive)
            );

            LOGGER.info("Seeding complete. Total users: " + User.count());
        } else {
            LOGGER.info("Database already contains data. Skipping seeding.");
        }
    }
}
