# E-Voting System

A comprehensive, secure, and professional e-voting system built with Node.js, React, and MongoDB. This system provides a complete solution for conducting elections with pre-defined voters, ensuring security, transparency, and auditability.

## 🚀 Features

### Core Functionality
- **Admin Dashboard**: Complete election management interface
- **Voter Authentication**: Secure OTP-based voter verification
- **Token-based Voting**: One-time voting tokens for security
- **Real-time Results**: Live election results and analytics
- **Audit Logging**: Comprehensive audit trail for all actions

### Security Features
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive data validation
- **JWT Authentication**: Secure admin authentication
- **Argon2 Password Hashing**: Industry-standard password security
- **CORS Protection**: Cross-origin request security
- **Security Headers**: Multiple security headers for protection

### User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Material-UI Components**: Modern, accessible UI components
- **Real-time Updates**: Live election status and results
- **Intuitive Interface**: Easy-to-use admin and voter interfaces

## 🏗️ Architecture

### Backend (Node.js + TypeScript)
- **Express.js**: Web framework
- **MongoDB**: Database with Mongoose ODM
- **JWT**: Authentication tokens
- **Argon2**: Password hashing
- **Helmet**: Security middleware
- **Rate Limiting**: Request throttling

### Frontend (React + TypeScript)
- **React 18**: Modern React with hooks
- **TypeScript**: Type safety
- **Material-UI**: Component library
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Recharts**: Data visualization

### Database (MongoDB)
- **Optimized Indexes**: Performance-optimized queries
- **Data Validation**: Schema validation
- **Audit Logging**: Complete action tracking

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 6.0+
- Docker (optional, for containerized deployment)

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EVoting
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - MongoDB: localhost:27017

### Option 2: Manual Setup

1. **Install dependencies**
   ```bash
   # Backend
   cd evote-backend
   npm install
   
   # Frontend
   cd ../evote-frontend
   npm install
   ```

2. **Start MongoDB**
   ```bash
   mongod
   ```

3. **Start the backend**
   ```bash
   cd evote-backend
   npm run dev
   ```

4. **Start the frontend**
   ```bash
   cd evote-frontend
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Database
MONGO_URI=mongodb://localhost:27017/evote

# Security (CHANGE IN PRODUCTION!)
JWT_ADMIN_SECRET=your-secret-key
OTP_SECRET=your-otp-secret

# Server
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### Production Deployment

1. **Update environment variables** with production values
2. **Use HTTPS** in production
3. **Configure reverse proxy** (nginx/Apache)
4. **Set up SSL certificates**
5. **Configure firewall** rules
6. **Set up monitoring** and logging

## 📱 Usage

### Admin Workflow

1. **Register Admin Account**
   - Navigate to `/admin/login`
   - Click "Register" to create admin account

2. **Create Election**
   - Go to Elections page
   - Click "Create Election"
   - Fill in election details and candidates
   - Set start and end times

3. **Upload Voters**
   - Go to Voters page
   - Upload CSV file with voter data
   - Format: `voterId,email,phone`

4. **Start Election**
   - Click "Start" on the election card
   - Election becomes active for voting

5. **Monitor Progress**
   - View real-time turnout statistics
   - Monitor voting progress

6. **End Election**
   - Click "End" when voting period is over
   - Results are automatically calculated

### Voter Workflow

1. **Access Voting Interface**
   - Navigate to the main page
   - View active elections

2. **Identify Yourself**
   - Enter voter ID, email, or phone
   - System verifies eligibility

3. **Verify OTP**
   - Enter 6-digit OTP sent to registered contact
   - Receive voting token

4. **Cast Vote**
   - Select preferred candidate
   - Submit vote securely

5. **View Results**
   - Results available after election ends
   - View detailed analytics and charts

## 🔒 Security Features

### Authentication & Authorization
- JWT-based admin authentication
- OTP-based voter verification
- Role-based access control
- Session management

### Data Protection
- Argon2 password hashing
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Rate Limiting
- Authentication attempts: 5 per 15 minutes
- OTP requests: 3 per 5 minutes
- Voting attempts: 3 per minute
- General requests: 200 per 15 minutes

### Audit & Compliance
- Complete audit trail
- Action logging
- Data integrity verification
- Compliance reporting

## 📊 Database Schema

### Collections
- **elections**: Election data and configuration
- **voters**: Voter information and eligibility
- **votes**: Cast votes with integrity hashes
- **tokens**: One-time voting tokens
- **admins**: Admin user accounts
- **auditlogs**: System audit trail

### Indexes
- Optimized for common query patterns
- Compound indexes for complex queries
- Unique constraints for data integrity

## 🧪 Testing

### Backend Testing
```bash
cd evote-backend
npm test
```

### Frontend Testing
```bash
cd evote-frontend
npm test
```

### Integration Testing
```bash
# Run full test suite
npm run test:integration
```

## 📈 Performance

### Optimizations
- Database indexing
- Query optimization
- Caching strategies
- Connection pooling
- Compression

### Monitoring
- Health checks
- Performance metrics
- Error tracking
- Resource monitoring

## 🚀 Deployment

### Docker Deployment
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
1. Set up reverse proxy (nginx)
2. Configure SSL certificates
3. Set up monitoring
4. Configure backups
5. Set up logging

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the FAQ section

## 🔮 Roadmap

### Planned Features
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Blockchain integration
- [ ] Advanced security features
- [ ] API documentation
- [ ] Automated testing
- [ ] Performance monitoring

## 📝 Changelog

### Version 1.0.0
- Initial release
- Core voting functionality
- Admin dashboard
- Security features
- Docker support

---

**Built with ❤️ for secure and transparent elections**





