CREATE TABLE application (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE item (
    id             BIGSERIAL PRIMARY KEY,
    application_id BIGINT       NOT NULL REFERENCES application (id),
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    version        VARCHAR(50),
    status         VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'REVIEW', 'PUBLISHED')),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_item_application_id ON item (application_id);

-- There is no endpoint to create applications, so seed a few.
INSERT INTO application (name) VALUES
    ('Customer Portal'),
    ('Billing Service'),
    ('Mobile App');
