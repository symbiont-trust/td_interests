-- Insert sample API clients
INSERT INTO api_clients (id, client_id, client_name, is_active, created_at, updated_at) 
VALUES 
(1, 'default-client-id', 'Sample Profile API Client', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'test-client-123', 'Test Profile API Client', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (client_id) DO NOTHING;