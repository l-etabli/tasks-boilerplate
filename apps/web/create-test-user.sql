-- Insert test user for development
INSERT INTO "user" (id, email, "emailVerified", name, image, "createdAt", "updatedAt", "preferredLocale")
VALUES (
  'test-user-id',
  'test@example.com',
  FALSE,
  'Test User',
  NULL,
  NOW(),
  NOW(),
  NULL
)
ON CONFLICT (id) DO NOTHING;
