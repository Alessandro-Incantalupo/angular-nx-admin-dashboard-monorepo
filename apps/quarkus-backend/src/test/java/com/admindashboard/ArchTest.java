package com.admindashboard;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

class ArchTest {

    @Test
    void servicesAndRepositoriesShouldNotDependOnWebLayer() {
        JavaClasses importedClasses =
                new ClassFileImporter()
                        .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                        .importPackages("com.admindashboard");

        noClasses()
                .that()
                .resideInAnyPackage("com.admindashboard.service..")
                .or()
                .resideInAnyPackage("com.admindashboard.domain..")
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage("com.admindashboard.web..")
                .because("Services and domain entities should not depend on web layer")
                .allowEmptyShould(true)
                .check(importedClasses);
    }
}
