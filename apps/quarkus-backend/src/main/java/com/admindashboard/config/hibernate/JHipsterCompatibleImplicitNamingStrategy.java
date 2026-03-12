package com.admindashboard.config.hibernate;

import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.ImplicitJoinTableNameSource;
import org.hibernate.boot.model.naming.ImplicitNamingStrategyJpaCompliantImpl;

/**
 * JHipster compatible naming strategy that ensures join tables are named correctly in snake_case.
 */
public class JHipsterCompatibleImplicitNamingStrategy
        extends ImplicitNamingStrategyJpaCompliantImpl {

    @Override
    public Identifier determineJoinTableName(ImplicitJoinTableNameSource source) {
        String joinedName =
                String.join(
                        "_",
                        source.getOwningPhysicalTableName(),
                        source.getAssociationOwningAttributePath().getProperty());
        return toIdentifier(joinedName, source.getBuildingContext());
    }
}
