# My Interests - Development Plan

## Project Overview
Develop "My Interests" - a social networking web application where users register with wallet addresses, connect based on shared interests, and communicate through private/public messaging. The application features wallet-based authentication via Reown's App Kit and exposes a Profile API for external access.

## Tech Stack
- **Frontend**: React + Vite, Material-UI, Reown App Kit, Wagmi
- **Backend**: Java Spring Boot, Spring Security, Hibernate, PostgreSQL, Lombok
- **Profile API Client**: Java Spring Boot with HTTP client
- **Database**: PostgreSQL

## Directory Structure
```
td_interests/
├── frontend/           # React + Vite application
├── backend/            # Spring Boot backend API
├── profile-api-client/ # Profile API client library
├── sql/               # Database initialization scripts
└── .claude/commands/  # This plan file
```

## Phase 1: Project Setup and Database

### 1.1 Database Setup
- [ ] Set up PostgreSQL database named "myinterests"
- [ ] Connect to PostgreSQL using `psql postgres`
- [ ] Create database schema tables (will be auto-created by Hibernate)
- [ ] Configure Spring Boot to auto-execute SQL data files at startup in dev mode:
  - `sql/continents_countries.sql`
  - `sql/interest_tags.sql`
- [ ] Create additional required tables:
  - users (wallet_address PK, handle, fk_country, location_tags, created_at, updated_at)
  - user_interests (user_wallet_address, interest_tag_id)
  - connections (id, requester_wallet, recipient_wallet, status, common_interests, created_at)
  - private_message_threads (id, user1_wallet, user2_wallet, subject, created_at)
  - public_message_threads (id, creator_wallet, title, created_at)
  - public_thread_interests (thread_id, interest_tag_id)
  - messages (id, thread_id, thread_type, sender_wallet, content, parent_message_id, tags, created_at)
  - api_clients (client_id PK, client_name, created_at)
  - notification_status (wallet_address PK, has_notifications BOOLEAN)

### 1.2 Backend Project Setup
- [ ] Use `java20` alias to set Java 20
- [ ] Create Spring Boot project in `backend/` directory
- [ ] Configure Maven with dependencies:
  - spring-boot-starter-web
  - spring-boot-starter-security
  - spring-boot-starter-data-jpa
  - postgresql driver
  - lombok
  - jjwt (JWT library)
  - web3j (for ECDSA signatures)
  - spring-boot-starter-validation
- [ ] Configure `application.yml` with:
  - Database connection to "myinterests"
  - Auto-execute SQL files on startup in dev mode (spring.sql.init.mode=always)
  - Configure data source initialization to run continent/country and interest tag SQL files
- [ ] Set up Lombok configuration

### 1.3 Frontend Project Setup
- [ ] Use `nvm` to select recent Node.js version
- [ ] Create React + Vite project in `frontend/` directory
- [ ] Install dependencies:
  - @mui/material @emotion/react @emotion/styled
  - @mui/icons-material
  - @reown/appkit @reown/appkit-adapter-wagmi
  - wagmi viem
  - axios
  - react-router-dom
- [ ] Configure Vite environment variables
- [ ] Set up basic project structure

### 1.4 Profile API Client Setup
- [ ] Use `java20` alias
- [ ] Create Spring Boot project in `profile-api-client/` directory
- [ ] Add HTTP client dependencies
- [ ] Create basic project structure

## Phase 2: Domain Models and Core Services

### 2.1 Backend Domain Classes
- [ ] Create base Domain class with audit fields (id, createdAt, updatedAt)
- [ ] Create domain entities with Lombok:
  - Continent.java (extends Domain)
  - Country.java (extends Domain, references Continent)
  - InterestTag.java (extends Domain)
  - User.java (extends Domain, wallet_address as ID, handle, country, locationTags)
  - Connection.java (extends Domain, requester/recipient wallets)
  - PrivateMessageThread.java (extends Domain)
  - PublicMessageThread.java (extends Domain)
  - Message.java (extends Domain, supports parent/child relationships)
  - ApiClient.java (extends Domain)
- [ ] Create JPA repositories for all entities
- [ ] Set up proper entity relationships and constraints

### 2.2 Authentication System
- [ ] Create JWT utility service (generate, validate, refresh tokens)
- [ ] Implement wallet signature verification service using web3j
- [ ] Create authentication controller:
  - POST /api/auth/register (wallet signature + user details)
  - POST /api/auth/login (wallet signature verification)
  - POST /api/auth/refresh (refresh JWT token)
- [ ] Configure Spring Security with JWT filter
- [ ] Create custom authentication provider for wallet-based auth

## Phase 3: User Registration and Authentication

### 3.1 Frontend Wallet Integration
- [ ] Configure Reown App Kit with Wagmi providers
- [ ] Wrap React Router with Wagmi configuration
- [ ] Create wallet connection components
- [ ] Implement wallet signature generation for auth

### 3.2 Registration Flow
- [ ] Create registration form using Material-UI:
  - Country dropdown using Material-UI Select component (from database)
  - Multi-select for interests using Material-UI Autocomplete component (from database)
  - Location tags input (free text)
  - Handle name input
- [ ] Connect registration form to backend API
- [ ] Handle wallet signature verification
- [ ] Store JWT token on successful registration

### 3.3 Login Flow
- [ ] Create login component with wallet connection
- [ ] Implement JWT token storage and management
- [ ] Create axios helper based on provided example:
  - Secured axios instance (injects JWT in headers)
  - Unsecured axios instance 
  - Request/response interceptors for error handling
  - Navigation integration for error routing

### 3.4 Settings Management
- [ ] Create settings page for profile editing
- [ ] Allow editing all fields except wallet address
- [ ] Implement interest removal with connection validation warning
- [ ] Update backend services to handle profile updates

## Phase 4: User Connections System

### 4.1 User Search and Discovery
- [ ] Create user search service in backend
- [ ] Implement search by interests and location tags
- [ ] Add endpoint to show mutual connections before friend requests
- [ ] Create search results API with pagination

### 4.2 Connection Management Backend
- [ ] Create connection request service
- [ ] Implement accept/dismiss connection logic
- [ ] Track common interests for each connection
- [ ] Create connection status management APIs

### 4.3 Connection Frontend Components
- [ ] Create user search interface with Material-UI
- [ ] Build connection request/management components
- [ ] Display mutual connections in search results
- [ ] Implement connection status updates

## Phase 5: Messaging System

### 5.1 Private Messaging
- [ ] Create private message thread service
- [ ] Implement message creation/retrieval APIs
- [ ] Create private chat UI components
- [ ] Add message history with pagination
- [ ] Implement thread subject management

### 5.2 Public Message Threads
- [ ] Create public thread management service
- [ ] Implement interest-based thread tagging
- [ ] Create thread search by interests
- [ ] Build nested message system (parent/child relationships)
- [ ] Implement message tagging functionality
- [ ] Add tag-based message filtering

### 5.3 Message Thread UI Components
- [ ] Create public thread listing page
- [ ] Build message thread view with navigation:
  - Click message to show immediate replies
  - Move clicked message to top
  - Show reply count for each message
  - Navigation back to parent message
- [ ] Implement message tagging interface with autocomplete
- [ ] Create tag filtering controls
- [ ] Add pagination for child messages
- [ ] Sort child messages by latest first

## Phase 6: Notification System

### 6.1 Backend Notification Service
- [ ] Create in-memory notification map (wallet_address -> boolean)
- [ ] Implement notification trigger on message replies
- [ ] Add response filter to inject `hasNotifications` header
- [ ] Create notification retrieval endpoints

### 6.2 Frontend Notification System
- [ ] Create axios response interceptor to check `hasNotifications` header
- [ ] Implement notification polling/retrieval
- [ ] Build YouTube-style notification UI components
- [ ] Add notification badge to header
- [ ] Handle notification state management

## Phase 7: Profile API System

### 7.1 Profile Generation Service
- [ ] Create profile JSON generation service with format:
  ```json
  {
    "profile-wallet-address": "0x...",
    "non-unique-handle": "username",
    "profile-interests": ["tag1", "tag2"],
    "contacts": [{
      "wallet-address": "0x...",
      "non-unique-handle": "friend",
      "common-interests": ["tag1", "tag2"]
    }]
  }
  ```
- [ ] Implement JSON string conversion (no spaces)
- [ ] Create hash generation utility
- [ ] Implement ECDSA signature generation using web3j

### 7.2 Profile API Authentication
- [ ] Create API client validation service
- [ ] Implement JWT token issuance for valid client IDs
- [ ] Create client authentication endpoints:
  - POST /api/profile-auth/authenticate (client_id -> JWT)

### 7.3 Profile API Endpoints
- [ ] Create profile retrieval endpoint:
  - GET /api/profile/{walletAddress} (requires client JWT)
- [ ] Return profile JSON + signature
- [ ] Implement proper error handling and validation

### 7.4 Profile API Client Implementation
- [ ] Create authentication service (client_id -> JWT)
- [ ] Implement profile retrieval client
- [ ] Add signature verification utilities
- [ ] Create example usage and documentation

## Phase 8: UI/UX and Layout

### 8.1 Application Layout
- [ ] Create responsive header with "My Interests" title
- [ ] Implement responsive navigation menu (desktop/mobile)
- [ ] Add settings menu item for profile editing
- [ ] Create footer with links:
  - Terms and Conditions (generate content)
  - Privacy Policy (generate content)  
  - Contact Us (john.charles.dickerson@gmail.com, Nairobi, Kenya)

### 8.2 Responsive Design
- [ ] Ensure all components work on mobile devices
- [ ] Use Material-UI Grid for layout positioning
- [ ] Implement proper breakpoints for different screen sizes
- [ ] Avoid external CSS files - use inline Material-UI styling
- [ ] Test touch interactions for mobile

### 8.3 Legal and Contact Pages
- [ ] Generate Terms and Conditions content appropriate for the app
- [ ] Create Privacy Policy content covering wallet auth and data usage
- [ ] Create Contact Us page with provided information
- [ ] Implement proper routing for all pages

## Phase 9: Testing and Quality Assurance

### 9.1 Backend Testing
- [ ] Use `java20` alias for compilation
- [ ] Create unit tests for all service layers
- [ ] Implement integration tests for API endpoints
- [ ] Test JWT authentication and authorization
- [ ] Validate database operations and constraints
- [ ] Test ECDSA signature generation/verification

### 9.2 Frontend Testing
- [ ] Use `nvm` for Node.js version management
- [ ] Run `npm run typecheck` for TypeScript validation
- [ ] Test wallet connection flows
- [ ] Validate form inputs and Material-UI components
- [ ] Test responsive design across devices
- [ ] Verify axios interceptor error handling

### 9.3 Integration Testing
- [ ] Test complete user registration flow
- [ ] Validate connection request/acceptance process
- [ ] Test message creation and threading
- [ ] Verify notification system functionality
- [ ] Test Profile API end-to-end integration

## Phase 10: Final Integration and Documentation

### 10.1 System Integration
- [ ] Test all components working together
- [ ] Validate JWT refresh token functionality
- [ ] Ensure proper error handling across all layers
- [ ] Test notification system with concurrent users
- [ ] Validate Profile API security and performance

### 10.2 Documentation and Deployment Prep
- [ ] Create API documentation for Profile API
- [ ] Document deployment procedures
- [ ] Create environment configuration guides
- [ ] Test build processes for both frontend and backend
- [ ] Validate all security requirements

## Development Standards

### Code Quality
- Use Lombok annotations to reduce boilerplate
- Follow Material-UI design patterns consistently
- Implement comprehensive error handling
- Use TypeScript for type safety
- Follow REST API naming conventions
- Prefer inline styling over external CSS

### Security Requirements
- Never expose private keys or wallet data
- Validate all wallet signatures properly
- Implement proper JWT token management
- Use HTTPS for all communications
- Sanitize all user inputs
- Implement rate limiting for API endpoints

### Performance Considerations
- Implement pagination for large datasets
- Use database indexing for search queries
- Optimize message threading queries
- Consider caching for frequently accessed data
- Implement efficient notification checking

## Success Criteria
1. ✅ Users can register/login using wallet authentication
2. ✅ Users can search and connect based on shared interests  
3. ✅ Private messaging works between connected users
4. ✅ Public message threads support unlimited nesting depth
5. ✅ Notification system alerts users of message replies
6. ✅ Profile API provides secure external access to profiles
7. ✅ Application is fully responsive on mobile devices
8. ✅ All functionality tested and working properly

This plan provides a comprehensive roadmap for implementing the "My Interests" application with all specified features and requirements.