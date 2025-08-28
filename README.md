# My Interests - Social Networking Platform

A blockchain-based social networking platform that connects people based on shared interests and location. Built with Spring Boot (backend) and React + TypeScript (frontend).

## 🌟 Features

### Core Features
- **Web3 Authentication** - Wallet-based login with MetaMask integration
- **Interest-Based Matching** - Connect with people who share your interests
- **Location Awareness** - Find people in your area or specific locations
- **Connection Management** - Send and manage connection requests
- **User Profiles** - Rich profiles with interests, location tags, and wallet information

### Messaging System (Phase 5 - Recently Completed)
- **Private Messaging** - 1-on-1 conversations between connected users
- **Public Discussion Threads** - Forum-style community discussions
- **Message Threading** - Nested replies and conversations
- **Interest-based Discovery** - Tag and find discussions by topics
- **Real-time Features** - Unread counts, activity tracking
- **Search & Filtering** - Find conversations and discussions easily

## 🏗️ Architecture

### Backend (Spring Boot)
```
backend/
├── src/main/java/com/myinterests/backend/
│   ├── controller/          # REST API endpoints
│   ├── service/             # Business logic layer
│   ├── repository/          # Data access layer
│   ├── domain/              # Entity models
│   ├── dto/                 # Data transfer objects
│   ├── config/              # Configuration classes
│   └── utils/               # Utility classes
├── src/main/resources/
│   ├── application.yml      # Application configuration
│   └── db/migration/        # Database migration scripts
└── mvn_compile.sh           # Compilation script
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── connections/    # Connection management
│   │   ├── home/          # Dashboard and home page
│   │   ├── layout/        # App layout components
│   │   ├── messages/      # Private messaging UI
│   │   ├── publicThreads/ # Public discussion UI
│   │   └── users/         # User search and profiles
│   ├── services/          # API service classes
│   ├── utils/             # Utility functions
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript type definitions
├── package.json
└── vite.config.ts         # Build configuration
```

## 🚀 Getting Started

### Prerequisites
- **Java 20** - Backend runtime
- **Node.js 18+** - Frontend development
- **Maven 3.6+** - Backend build tool
- **PostgreSQL** - Database (or H2 for development)
- **MetaMask** - For Web3 authentication

### Backend Setup

1. **Set up Java environment:**
   ```bash
   cd backend
   chmod +x mvn_compile.sh
   ./mvn_compile.sh
   ```

2. **Configure database:**
   - Update `src/main/resources/application.yml` with your database settings
   - Default uses H2 in-memory database for development

3. **Run the application:**
   ```bash
   ./mvnw spring-boot:run
   ```
   
   Backend will be available at `http://localhost:8080`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration:
   - `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8080)
   - `VITE_APP_TITLE` - Application title (default: "My Interests")
   - `VITE_REOWN_PROJECT_ID` - Get your project ID from [Reown Cloud](https://cloud.reown.com/)

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/challenge` - Get authentication challenge
- `POST /api/auth/login` - Login with signed message
- `POST /api/auth/register` - Register new user
- `POST /api/auth/refresh` - Refresh JWT token

### User Management
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users by criteria

### Connection Management
- `POST /api/connections/request` - Send connection request
- `GET /api/connections` - Get user connections
- `POST /api/connections/{id}/respond` - Accept/dismiss request

### Private Messaging
- `GET /api/private-messages/threads` - Get user's message threads
- `POST /api/private-messages/threads` - Create new thread
- `GET /api/private-messages/threads/{id}/messages` - Get thread messages
- `POST /api/private-messages/messages` - Send message

### Public Discussions
- `GET /api/public-threads` - Get all discussion threads
- `GET /api/public-threads/featured` - Get featured threads
- `GET /api/public-threads/popular` - Get popular threads
- `POST /api/public-threads` - Create new discussion thread
- `GET /api/public-threads/{id}/messages` - Get thread messages
- `POST /api/public-threads/{id}/messages` - Post message to thread

## 🛠️ Development

### Code Organization

**Backend Patterns:**
- **Domain-Driven Design** - Clear separation between domain, service, and controller layers
- **DTO Pattern** - Separate data transfer objects for API communication
- **Repository Pattern** - JPA repositories for data access
- **Service Layer** - Business logic encapsulation

**Frontend Patterns:**
- **Component Architecture** - Modular, reusable React components
- **Service Layer** - Axios-based API communication
- **Custom Hooks** - Reusable state logic
- **TypeScript** - Type safety throughout the application

### Testing

**Backend Testing:**
```bash
cd backend
./mvnw test
```

**Frontend Testing:**
```bash
cd frontend
npm test
```

### Database Schema

Key entities:
- `users` - User profiles with wallet addresses
- `interest_tag` - Available interest categories
- `connection` - User connections and requests
- `private_message_threads` - Private conversation threads
- `public_message_threads` - Public discussion threads
- `messages` - All messages (private and public)

## 🔐 Security

- **JWT Authentication** - Secure API access
- **Wallet Signature Verification** - Cryptographic authentication
- **Input Validation** - Request validation with Spring Boot
- **CORS Configuration** - Secure cross-origin requests
- **SQL Injection Protection** - JPA/Hibernate parameterized queries

## 📱 User Interface

### Key Pages
- **Dashboard** - Quick actions and connection requests
- **User Search** - Find people by interests and location
- **Connections** - Manage your network
- **Private Messages** - 1-on-1 conversations
- **Discussion Threads** - Community forums
- **Profile Management** - Edit your information
- **Legal Pages** - Terms & Conditions, Privacy Policy, Contact Us

### Design System
- **Material-UI** components for consistency
- **Responsive Design** - Works on desktop and mobile
- **Dark Mode Support** - System preference detection
- **Accessibility** - ARIA labels and keyboard navigation
- **Footer Navigation** - Persistent legal page links across all pages

## 🔄 Recent Updates (Phase 5 - Messaging System)

### What's New
- ✅ Complete private messaging system
- ✅ Public discussion threads with nested replies
- ✅ Interest-based thread tagging and discovery
- ✅ Search functionality across all messages
- ✅ Real-time unread count tracking
- ✅ Thread archiving and management
- ✅ Featured thread system for moderation
- ✅ Mobile-responsive messaging interface

### Technical Improvements
- Enhanced database schema for messaging
- Optimized queries with JOIN FETCH
- TypeScript service layers for API communication
- Component reusability improvements
- Build optimization for production

## 🚧 Roadmap

### Future Phases
- **Phase 6: UI/UX Enhancement** - Design system improvements
- **Phase 7: Testing & Quality** - Comprehensive test coverage
- **Phase 8: Documentation** - API docs and user guides
- **Phase 9: Deployment** - Production infrastructure
- **Phase 10: Advanced Features** - Real-time notifications, file uploads

### Potential Features
- Real-time messaging with WebSocket
- File and image sharing
- Message reactions and emoji support
- Advanced search with filters
- User blocking and reporting
- Thread moderation tools
- Mobile app development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

For support and questions:
- Create an issue in this repository
- Check the API documentation above
- Review the code comments and documentation

---

**Built with ❤️ using Spring Boot, React, and Web3 technologies**