-- last_modified_at_update
CREATE OR REPLACE FUNCTION last_modified_at_update() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$ BEGIN NEW.lastModifiedAt = extract(
        epoch
        from now()
    ) * 1000;
RETURN NEW;
END;
$$;
-- app_user table
CREATE TABLE app_user (
    id UUID DEFAULT uuid_generate_v4 () NOT NULL PRIMARY KEY,
    username VARCHAR(20) UNIQUE,
    -- signInType: SYSTEM, EMAIL, GOOGLE, FACEBOOK, APPLE, PHONE_NO
    signInType VARCHAR(10) NOT NULL,
    signInId VARCHAR(50) UNIQUE,
    externalId VARCHAR(50) UNIQUE,
    lastName VARCHAR(200) NOT NULL,
    firstName varchar(200),
    displayName VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    avatarUrl VARCHAR(200),
    -- status: ACTIVE, INACTIVE
    status VARCHAR(10) NOT NULL,
    -- Full text search
    tsv tsvector,
    createdAt BIGINT NOT NULL DEFAULT(
        extract(
            epoch
            from now()
        ) * 1000
    ),
    -- unix timestamp
    createdBy UUID REFERENCES app_user(id),
    lastModifiedAt BIGINT,
    -- unix timestamp
    lastModifiedBy UUID REFERENCES app_user(id)
);
CREATE INDEX app_user_tsv_idx ON app_user USING gin(tsv);
CREATE INDEX app_user_email_idx ON app_user(email);
CREATE TRIGGER app_user_tsvector_update BEFORE
INSERT
    OR
UPDATE ON app_user FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger(
        tsv,
        'pg_catalog.english',
        username,
        displayName,
        email
    );
CREATE TRIGGER app_user_last_modified_at_update BEFORE
UPDATE ON app_user FOR EACH ROW EXECUTE PROCEDURE last_modified_at_update();
-- role table
CREATE TABLE role (
    id UUID DEFAULT uuid_generate_v4 () NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(4000) NOT NULL,
    isDefault BOOLEAN NOT NULL DEFAULT(false),
    -- status: ACTIVE, INACTIVE
    status VARCHAR(10) NOT NULL,
    -- Full text search
    tsv tsvector,
    createdAt BIGINT NOT NULL DEFAULT(
        extract(
            epoch
            from now()
        ) * 1000
    ),
    -- unix timestamp
    createdBy UUID REFERENCES app_user(id),
    lastModifiedAt BIGINT,
    -- unix timestamp
    lastModifiedBy UUID REFERENCES app_user(id)
);
CREATE INDEX role_tsv_idx ON role USING gin(tsv);
CREATE TRIGGER role_tsvector_update BEFORE
INSERT
    OR
UPDATE ON role FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger(tsv, 'pg_catalog.english', name, description);
CREATE TRIGGER role_last_modified_at_update BEFORE
UPDATE ON role FOR EACH ROW EXECUTE PROCEDURE last_modified_at_update();
CREATE TABLE permission_category (
    id VARCHAR(200) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(4000) NOT NULL,
    sortOrder INT NOT NULL
);
-- permission-related tables
CREATE TABLE permission (
    id VARCHAR(200) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(4000) NOT NULL,
    categoryId VARCHAR(200) NOT NULL REFERENCES permission_category(id) NOT NULL,
    sortOrder INT NOT NULL
);
CREATE TABLE role_permission (
    roleId UUID REFERENCES role(id) NOT NULL,
    permissionId VARCHAR(200) NOT NULL REFERENCES permission(id),
    PRIMARY KEY(roleId, permissionId)
);
CREATE TABLE user_role (
    userId UUID NOT NULL REFERENCES app_user(id),
    roleId UUID NOT NULL REFERENCES role(id),
    PRIMARY KEY(userId, roleId)
);
-- event table to store all events in the system
CREATE TABLE event (
    id UUID DEFAULT uuid_generate_v4 () NOT NULL PRIMARY KEY,
    type varchar(20) NOT NULL,
    entityId UUID NOT NULL,
    event JSONB,
    createdAt BIGINT NOT NULL DEFAULT(
        extract(
            epoch
            from now()
        ) * 1000
    ),
    -- unix timestamp
    createdBy UUID REFERENCES app_user(id)
);
INSERT INTO app_user(
        id,
        username,
        signInType,
        signInId,
        firstName,
        lastName,
        displayName,
        status
    )
VALUES(
        '1c416b0f-4bc2-4fa1-a3c0-c9ffc4a56c8a',
        'admin',
        'SYSTEM',
        'admin',
        'Admin',
        'Super',
        'Super Admin',
        'ACTIVE'
    );
INSERT INTO role(id, name, description, isDefault, status)
VALUES(
        '61579deb-5e7d-4665-b645-8186c09aacd7',
        'Super Admin',
        'The super admin role of the whole system',
        false,
        'ACTIVE'
    );
INSERT INTO permission_category(id, name, description, sortOrder)
VALUES(
        'AUTH',
        'Authentication & authorization',
        'Authentication & authorization',
        100
    );
INSERT INTO permission(id, name, description, categoryId, sortOrder)
VALUES(
        'AUTH_USER_VIEW',
        'User - View',
        'View users',
        'AUTH',
        110
    );
INSERT INTO permission(id, name, description, categoryId, sortOrder)
VALUES(
        'AUTH_USER_CREATE',
        'User - Create',
        'Create user',
        'AUTH',
        120
    );
INSERT INTO permission(id, name, description, categoryId, sortOrder)
VALUES(
        'AUTH_USER_UPDATE',
        'User - Update',
        'Update user',
        'AUTH',
        130
    );
INSERT INTO permission(id, name, description, categoryId, sortOrder)
VALUES(
        'AUTH_USER_ACTIVATE',
        'Activate/Deactivate user',
        'Activate/Deactivate user',
        'AUTH',
        140
    );
INSERT INTO permission(id, name, description, categoryId, sortOrder)
VALUES(
        'AUTH_ROLE_VIEW',
        'View roles',
        'View roles',
        'AUTH',
        210
    );
INSERT INTO permission(id, name, description, categoryId, sortOrder)
VALUES(
        'AUTH_ROLE_CREATE',
        'Create role',
        'Create role',
        'AUTH',
        220
    );
INSERT INTO permission(id, name, description, categoryId, sortOrder)
VALUES(
        'AUTH_ROLE_UPDATE',
        'Update role',
        'Update role',
        'AUTH',
        230
    );
INSERT INTO permission(id, name, description, categoryId, sortOrder)
VALUES(
        'AUTH_ROLE_ACTIVE',
        'Activate/Deactivate role',
        'Activate/Deactivate role',
        'AUTH',
        240
    );
INSERT INTO permission(id, name, description, categoryId, sortOrder)
VALUES(
        'AUTH_ROLE_DELETE',
        'Delete role',
        'Delete role',
        'AUTH',
        250
    );
-- add all permissions to the 'admin' role
INSERT INTO role_permission(roleId, permissionId)
SELECT '61579deb-5e7d-4665-b645-8186c09aacd7',
    id
FROM permission;
-- add admin role to user 'admin'
INSERT INTO user_role(userId, roleId)
VALUES(
        '1c416b0f-4bc2-4fa1-a3c0-c9ffc4a56c8a',
        '61579deb-5e7d-4665-b645-8186c09aacd7'
    );