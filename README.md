# Pet Adoption Website - Backend

This is the backend of the Pet Adoption Website, built with Node.js, Express, and MongoDB. It provides RESTful APIs for managing users, pets, adoptions, and integrates with Cloudinary for image uploads.

## Features
- User authentication (JWT-based)
- User roles: admin, shelter, adopter
- CRUD operations for pets and users
- Adoption management
- File upload support for pet images (Cloudinary integration)
- Admin dashboard APIs
- CORS and environment variable support

## Getting Started

### Prerequisites
- Node.js (v16 or above recommended)
- npm or yarn
- MongoDB (local or Atlas)

### Installation
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Environment Variables
Create a `.env` file in the `backend` directory and specify the following (example):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/pet_adoption
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Running the Server
```bash
npm run dev
# or
yarn dev
```
The API will be available at `http://localhost:5000/api`.

### Project Structure
- `src/models/` - Mongoose models (User, Pet, etc.)
- `src/routes/` - Express route handlers
- `src/controllers/` - Request logic for each resource
- `src/middleware/` - Authentication, error handling, etc.
- `src/config/` - Configuration files (Cloudinary, DB)

### Cloudinary Integration
Pet images are uploaded from the frontend to the backend, which then uploads them to Cloudinary. Configure your Cloudinary credentials in `.env`.

### API Endpoints
- `/api/auth` - Authentication routes
- `/api/pets` - Pet management
- `/api/users` - User management
- `/api/adoptions` - Adoption management

### Linting & Formatting
```bash
npm run lint
npm run format
```

## License
MIT
