# Pet Adoption Website - Backend

## Project Overview

The Pet Adoption Website Backend is a robust Node.js application that powers the Pet Adoption platform. It provides a comprehensive set of RESTful APIs for managing users, pets, and the adoption process. The backend handles authentication, data storage, file uploads, and business logic for the entire application.

## Key Features

### Authentication & Authorization
- **JWT-Based Authentication**: Secure token-based authentication system
- **Role-Based Access Control**: Different permissions for admins, shelters, and regular users
- **Password Hashing**: Secure storage of user credentials using bcrypt
- **Token Management**: Generation, validation, and refresh of access tokens

### User Management
- **User Registration**: Create new user accounts with different roles
- **User Profiles**: Store and retrieve user information
- **Password Recovery**: Reset forgotten passwords securely
- **Account Management**: Update user details and preferences

### Pet Management
- **Pet Creation**: Add new pets to the system with details and images
- **Pet Retrieval**: Get individual pets or filtered lists
- **Pet Updates**: Modify pet information and status
- **Pet Deletion**: Remove pets from the system
- **Dynamic Mood System**: Automatic updates to pet moods based on time in the system

### Adoption Process
- **Adoption Requests**: Process adoption requests from users
- **Adoption Status Tracking**: Monitor the status of adoptions
- **Adoption History**: Maintain records of all adoptions

### File Management
- **Image Upload**: Process and store pet images via Cloudinary
- **Image Optimization**: Resize and optimize images for performance
- **Secure Storage**: Safely manage file references and access

### Admin Features
- **User Administration**: Manage all users in the system
- **System Statistics**: Generate reports and analytics
- **Content Moderation**: Review and manage content

## Technical Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js for API routing and middleware
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Password Security**: bcrypt for hashing
- **File Storage**: Cloudinary for image uploads
- **Validation**: Express-validator for request validation
- **CORS**: Cross-Origin Resource Sharing enabled
- **Environment**: dotenv for configuration
- **Logging**: Winston for structured logging

## Getting Started

### Prerequisites
- Node.js (v16 or above recommended)
- npm or yarn
- MongoDB (local instance or MongoDB Atlas)
- Cloudinary account (for image uploads)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/AkshayanAH112/Pet_Adoption_Website_Backend.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Pet_Adoption_Website_Backend
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Environment Setup
Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/pet_adoption

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

Replace the placeholder values with your actual configuration details.

### Running the Server

#### Development Mode
```bash
npm run dev
# or
yarn dev
```

This starts the server with nodemon for automatic reloading during development.

#### Production Mode
```bash
npm start
# or
yarn start
```

The API will be available at `http://localhost:5001/api` by default (or the port you specified in the .env file).

## Project Structure

```
/backend
├── src/
│   ├── config/         # Configuration files
│   │   ├── cloudinaryConfig.js
│   │   └── dbConfig.js
│   ├── controllers/    # Request handlers
│   │   ├── authController.js
│   │   ├── petController.js
│   │   ├── userController.js
│   │   └── matchingController.js
│   ├── middleware/     # Express middleware
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── errorHandler.js
│   ├── models/         # Database models
│   │   ├── Pet.js
│   │   └── User.js
│   ├── routes/         # API routes
│   │   ├── authRoutes.js
│   │   ├── petRoutes.js
│   │   ├── userRoutes.js
│   │   └── matchingRoutes.js
│   ├── utils/          # Utility functions
│   │   └── moodLogic.js
│   └── server.js       # Server entry point
├── .env                # Environment variables
├── package.json        # Dependencies
└── README.md          # Documentation
```

## API Documentation

### Authentication Endpoints

#### Register a New User
- **URL**: `POST /api/auth/register`
- **Body**: 
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "user|shelter|admin"
  }
  ```
- **Response**: User object with JWT token

#### Login
- **URL**: `POST /api/auth/login`
- **Body**: 
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: User object with JWT token

#### Get Current User
- **URL**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Current user object

### Pet Endpoints

#### Get All Pets
- **URL**: `GET /api/pets`
- **Query Parameters**: 
  - `species`: Filter by species
  - `mood`: Filter by mood
  - `adopted`: Filter by adoption status (true/false)
- **Response**: Array of pet objects

#### Get Pet by ID
- **URL**: `GET /api/pets/:id`
- **Response**: Pet object

#### Create New Pet
- **URL**: `POST /api/pets`
- **Headers**: `Authorization: Bearer <token>` (shelter role required)
- **Body**: FormData with the following fields:
  - `name`: Pet name
  - `species`: Pet species
  - `breed`: Pet breed (optional)
  - `age`: Pet age
  - `description`: Pet description
  - `image`: Pet image file
- **Response**: Created pet object

#### Update Pet
- **URL**: `PUT /api/pets/:id`
- **Headers**: `Authorization: Bearer <token>` (pet owner or admin required)
- **Body**: Same as create, but fields are optional
- **Response**: Updated pet object

#### Delete Pet
- **URL**: `DELETE /api/pets/:id`
- **Headers**: `Authorization: Bearer <token>` (pet owner or admin required)
- **Response**: Success message

#### Adopt Pet
- **URL**: `PATCH /api/pets/:id/adopt`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Updated pet object with adoption details

### User Endpoints

#### Get All Users (Admin)
- **URL**: `GET /api/users`
- **Headers**: `Authorization: Bearer <token>` (admin role required)
- **Response**: Array of user objects

#### Get User by ID
- **URL**: `GET /api/users/:id`
- **Headers**: `Authorization: Bearer <token>` (own user or admin required)
- **Response**: User object

#### Update User
- **URL**: `PUT /api/users/:id`
- **Headers**: `Authorization: Bearer <token>` (own user or admin required)
- **Body**: User data to update
- **Response**: Updated user object

#### Delete User
- **URL**: `DELETE /api/users/:id`
- **Headers**: `Authorization: Bearer <token>` (admin role required)
- **Response**: Success message

## Key Implementation Details

### Dynamic Pet Moods

Pets' moods change based on how long they've been in the system. This is implemented using a Mongoose pre-save hook:

```javascript
// Dynamic mood logic in Pet.js model
petSchema.pre('save', function(next) {
  const daysSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  
  if (daysSinceCreation > 30 && !this.isAdopted) {
    this.mood = 'sad';
  } else if (daysSinceCreation > 15) {
    this.mood = 'sleepy';
  }
  
  next();
});
```

### Image Upload with Cloudinary

The application uses Cloudinary for image storage. Images are processed using multer middleware and then uploaded to Cloudinary:

```javascript
// Example from petController.js
const result = await cloudinary.uploader.upload(req.file.path, {
  folder: 'pet_adoption',
  resource_type: 'image',
  transformation: [
    { width: 500, height: 500, crop: 'fill' }
  ]
});

pet.imageUrl = result.secure_url;
```

### Authentication Middleware

Protected routes use an authentication middleware that verifies JWT tokens:

```javascript
// Example from auth middleware
const token = req.headers.authorization?.split(' ')[1];
if (!token) return res.status(401).json({ message: 'No token provided' });

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
} catch (error) {
  return res.status(401).json({ message: 'Invalid token' });
}
```

### Linting & Formatting
```bash
npm run lint
npm run format
```
