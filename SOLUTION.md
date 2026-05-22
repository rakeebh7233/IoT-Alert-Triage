* Device seed data was assumed trusted because it was static,
small, and provided as canonical configuration data.
Validation effort was focused on the high-volume
sensor ingestion pipeline where malformed data was expected.

SQLlite was choosen as DB to speed up development and avoid extra infrastructure