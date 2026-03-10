package com.admindashboard.config;

import com.admindashboard.domain.User;
import com.admindashboard.service.UserService;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.logging.Logger;

@ApplicationScoped
public class DataInitializer {

    private static final Logger LOGGER = Logger.getLogger(DataInitializer.class.getName());

    @Inject UserService userService;

    @Transactional
    public void onStart(@Observes StartupEvent ev) {
        if (User.count() == 0) {
            LOGGER.info("Seeding database with initial users...");
            userService.seedData();
            LOGGER.info("Seeding complete. Total users: " + User.count());
        } else {
            LOGGER.info("Database already contains data. Skipping seeding.");
        }
    }
}
