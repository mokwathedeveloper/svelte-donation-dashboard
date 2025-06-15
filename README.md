# SvelteKit Donation Platform

A modern, responsive donation platform built with SvelteKit that enables well-wishers to donate anonymously to various social projects through M-Pesa mobile money integration. The platform includes a secure admin interface to track donations and manage projects.

## Features

- Anonymous donation system (no user registration required)
- M-Pesa payment integration with STK Push
- Responsive design with dark mode support
- Admin dashboard for project and donation management
- Real-time donation tracking and statistics
- Secure authentication for admin access
- MongoDB database integration
- Modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: SvelteKit, Tailwind CSS
- **Backend**: Node.js, SvelteKit API routes
- **Database**: MongoDB with Mongoose
- **Payment**: M-Pesa Daraja API
- **Authentication**: JWT with HTTP-only cookies
- **Deployment**: Vercel-ready configuration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance
- M-Pesa API credentials (Safaricom Developer Account)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd svelte-donation-platform
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/donation-platform

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback

# Admin Authentication
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

# Environment
NODE_ENV=development
```

4. Seed the database with sample projects:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

6. Visit `http://localhost:5173` in your browser

## M-Pesa Integration

### Setting Up M-Pesa API

1. Register for a Safaricom Developer Account at [Daraja Portal](https://developer.safaricom.co.ke/)
2. Create a new app to get your credentials
3. Configure callback URLs
4. Test with sandbox credentials

### Testing M-Pesa Integration

- Use Safaricom's test credentials for development
- Test phone numbers format: 254XXXXXXXXX
- Test amount range: 1 - 150,000 KES

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Fetch all projects |
| POST | `/api/projects` | Create new project (admin only) |
| POST | `/api/mpesa/stk-push` | Initiate M-Pesa payment |
| POST | `/api/mpesa/callback` | Handle M-Pesa confirmation |
| GET | `/api/donations` | Get donations (admin only) |
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/logout` | Admin logout |
| GET | `/api/admin/stats` | Get dashboard statistics |

## Admin Access

- Navigate to `/admin/login`
- Use the credentials configured in your `.env` file
- Access dashboard, project management, and donation tracking

## Project Structure

```
src/
|-- routes/
|   |-- +layout.svelte           # Main layout
|   |-- +page.svelte             # Homepage with projects
|   |-- donate/+page.svelte      # Donation form
|   |-- admin/                   # Admin interface
|   |-- api/                     # API endpoints
|-- lib/
|   |-- components/              # Reusable components
|   |-- db/                      # Database configuration
|   |-- models/                  # Database models
|   |-- utils/                   # Utility functions
|   |-- scripts/                 # Seed scripts
|-- app.html                     # App template
```

## Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy!

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:
- MONGODB_URI
- JWT_SECRET
- MPESA_CONSUMER_KEY
- MPESA_CONSUMER_SECRET
- MPESA_PASSKEY
- MPESA_SHORTCODE
- MPESA_CALLBACK_URL
- ADMIN_EMAIL
- ADMIN_PASSWORD

## Security Features

- Anonymous donations (no personal data stored)
- Secure M-Pesa payment processing
- JWT authentication for admin access
- HTTP-only cookies for session management
- Input validation and sanitization
- CORS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository or contact the maintainers.
