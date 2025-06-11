# SvelteKit Donation Dashboard with M-Pesa Integration

A modern, responsive donation platform built with SvelteKit and integrated with M-Pesa payment system. The platform allows users to make donations to various projects and causes through M-Pesa mobile money service.

## Features

- 🎯 Multiple donation projects support
- 💳 M-Pesa payment integration
- 📱 Responsive design
- 🔒 Secure admin dashboard
- 📊 Real-time donation tracking
- 🌐 MongoDB database integration

## Live Projects

Currently supporting the following causes:
- Education for All (Goal: KES 300,000)
- Community Health Center (Goal: KES 1,000,000)
- Youth Sports Program (Goal: KES 200,000)
- Clean Water Initiative (Goal: KES 500,000)

## Tech Stack

- **Frontend**: SvelteKit
- **Backend**: Node.js
- **Database**: MongoDB
- **Payment**: M-Pesa API
- **Deployment**: Vercel

## Prerequisites

Before you begin, ensure you have the following:
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account
- M-Pesa API credentials (Safaricom Developer Account)
- Vercel account (for deployment)

## M-Pesa Integration Details

### Setting Up M-Pesa API
1. Register for a Safaricom Developer Account at [Daraja Portal](https://developer.safaricom.co.ke/)
2. Create a new app to get your credentials:
   - Consumer Key
   - Consumer Secret
   - Passkey
   - Shortcode

### M-Pesa API Flow
1. User initiates payment
2. System generates payment request
3. User receives M-Pesa prompt on their phone
4. User enters PIN
5. M-Pesa processes payment
6. Callback URL receives payment confirmation
7. System updates donation status

### Testing M-Pesa Integration
- Use Safaricom's test credentials for development
- Test phone numbers format: 254XXXXXXXXX
- Test amount range: 10 - 150,000 KES

### M-Pesa API Response Codes
```json
{
  "0": "Success",
  "1": "Insufficient Funds",
  "2": "Less Than Minimum Transaction Value",
  "3": "More Than Maximum Transaction Value",
  "4": "Would Exceed Daily Transfer Limit",
  "5": "Would Exceed Minimum Balance",
  "6": "Unresolved Primary Party",
  "7": "Would Exceed Maximum Balance",
  "8": "Invalid Debit Account",
  "11": "Debit Account Invalid",
  "12": "Invalid Credit Account",
  "13": "Unresolved Receiver Party",
  "14": "Missing Parameter",
  "15": "Invalid Request",
  "17": "Request Timeout",
  "20": "Unresolved Primary Party",
  "26": "Traffic Blocking Condition In Place"
}
```

### Handling Failed Transactions
1. Implement retry mechanism for failed requests
2. Store transaction status in database
3. Provide user feedback on transaction status
4. Implement webhook for status updates
5. Handle timeout scenarios

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_CALLBACK_URL=your_mpesa_callback_url
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
SUPER_ADMIN_SECRET=your_super_admin_secret
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/mokwathedeveloper/svelte-donation-dashboard.git
cd svelte-donation-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Visit `http://localhost:5173` in your browser

## API Documentation

### Authentication Endpoints

#### POST /api/admin/login
Login for admin users
```json
{
  "email": "string",
  "password": "string"
}
```

#### POST /api/admin/signup
Create new admin account
```json
{
  "email": "string",
  "password": "string",
  "secretKey": "string"
}
```

### Donation Endpoints

#### POST /api/donations/initiate
Initiate M-Pesa payment
```json
{
  "amount": "number",
  "phoneNumber": "string",
  "projectId": "string"
}
```

#### GET /api/projects
Get all donation projects
```json
{
  "projects": [
    {
      "id": "string",
      "title": "string",
      "goal": "number",
      "raised": "number"
    }
  ]
}
```

#### GET /api/projects/:id
Get a specific project
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "goal": "number",
  "raised": "number",
  "donations": [
    {
      "id": "string",
      "amount": "number",
      "date": "string",
      "status": "string"
    }
  ]
}
```

#### POST /api/donations/callback
M-Pesa callback endpoint
```json
{
  "ResultCode": "number",
  "ResultDesc": "string",
  "MerchantRequestID": "string",
  "CheckoutRequestID": "string",
  "Amount": "number",
  "TransactionDate": "string",
  "PhoneNumber": "string"
}
```

#### GET /api/donations/status/:id
Check donation status
```json
{
  "status": "string",
  "transactionId": "string",
  "amount": "number",
  "date": "string"
}
```

#### GET /api/admin/dashboard
Get admin dashboard statistics
```json
{
  "totalDonations": "number",
  "totalAmount": "number",
  "activeProjects": "number",
  "recentDonations": [
    {
      "id": "string",
      "amount": "number",
      "project": "string",
      "date": "string"
    }
  ]
}
```

## Detailed Deployment Instructions

### 1. Prepare for Deployment

1. Build the project locally:
```bash
npm run build
```

2. Test the production build:
```bash
npm run preview
```

### 2. Deploy to Vercel

#### Option 1: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

#### Option 2: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: SvelteKit
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .svelte-kit/output
   - Install Command: npm install

### 3. Environment Variables Setup in Vercel

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required variables:
   - Add to Production, Preview, and Development
   - Use "Encrypt" option for sensitive data

### 4. Configure Custom Domain (Optional)

1. Go to project settings
2. Click "Domains"
3. Add your domain
4. Follow DNS configuration instructions

## Troubleshooting

### Common Issues and Solutions

1. **TypeScript Configuration Warning**
```
Cannot find base config file "./.svelte-kit/tsconfig.json"
```
Solution:
```bash
npm run sync
# or
npx svelte-kit sync
```

2. **MongoDB Connection Issues**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure network connectivity

3. **M-Pesa API Errors**
- Verify phone number format (254XXXXXXXXX)
- Check API credentials
- Ensure callback URL is accessible

4. **Build Errors**
- Clear .svelte-kit directory:
```bash
rm -rf .svelte-kit
npm run dev
```

5. **Deployment Issues**
- Check environment variables
- Verify build output
- Review Vercel deployment logs

### Debug Mode

Enable debug mode by setting:
```env
DEBUG=true
VITE_DEBUG=true
```

## Screenshots

[Note: Add screenshots of your application here. Suggested screenshots:
1. Homepage with projects
2. Donation form
3. Admin dashboard
4. Payment confirmation
5. Project details page]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any inquiries, please reach out to the project maintainer:
- GitHub: [@mokwathedeveloper](https://github.com/mokwathedeveloper)

## Performance Optimization

### Frontend Optimization
1. **Code Splitting**
   ```js
   import { lazy } from 'svelte';
   const AdminDashboard = lazy(() => import('./AdminDashboard.svelte'));
   ```

2. **Asset Optimization**
   - Use WebP images
   - Implement lazy loading
   - Optimize bundle size

3. **Caching Strategy**
   ```js
   // Service Worker Registration
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('/service-worker.js');
   }
   ```

4. **State Management**
   - Use Svelte stores efficiently
   - Implement local storage caching
   - Optimize reactive statements

### Backend Optimization
1. **Database Indexing**
   ```js
   // Example MongoDB indexes
   db.donations.createIndex({ projectId: 1, date: -1 });
   db.projects.createIndex({ title: 1 });
   ```

2. **Connection Pooling**
   ```js
   // MongoDB connection pooling
   mongoose.connect(MONGODB_URI, {
     maxPoolSize: 10,
     minPoolSize: 2,
     maxIdleTimeMS: 30000
   });
   ```

3. **Caching Layer**
   ```js
   // Redis caching example
   const cache = await redis.get(`project:${id}`);
   if (cache) return JSON.parse(cache);
   ```

4. **API Rate Limiting**
   ```js
   // Rate limiting middleware
   export const rateLimit = {
     windowMs: 15 * 60 * 1000,
     max: 100
   };
   ```

## Development Roadmap

### Q2 2024
- [ ] Multi-language support
- [ ] Enhanced analytics dashboard
- [ ] Automated email receipts
- [ ] Social media sharing

### Q3 2024
- [ ] Multiple payment methods
- [ ] Recurring donations
- [ ] Gift aid support
- [ ] Donor accounts

### Q4 2024
- [ ] Mobile app development
- [ ] Advanced reporting
- [ ] Campaign management
- [ ] Integration with CRM systems

### Q1 2025
- [ ] AI-powered insights
- [ ] Blockchain integration
- [ ] Advanced security features
- [ ] API marketplace

## Additional Troubleshooting

### Connection Issues
1. **MongoDB Atlas Connection Errors**
   ```bash
   # Check MongoDB connection
   mongosh "mongodb+srv://..."
   ```
   Solution: Update IP whitelist, check credentials

2. **M-Pesa API Timeout**
   ```json
   {
     "error": "ESOCKETTIMEDOUT",
     "code": "500"
   }
   ```
   Solution: Implement exponential backoff

3. **SvelteKit SSR Issues**
   ```bash
   # Clear SSR cache
   rm -rf .svelte-kit/output
   ```

4. **Vercel Build Failures**
   ```bash
   # Local build test
   npm run build
   npm run preview
   ```

5. **WebSocket Connection Issues**
   ```js
   // Check WebSocket status
   if (socket.readyState === WebSocket.CLOSED) {
     reconnect();
   }
   ```

### Security Best Practices
1. **API Security**
   - Implement rate limiting
   - Use HTTPS
   - Validate all inputs
   - Implement CORS properly

2. **Database Security**
   - Use connection pooling
   - Implement proper indexing
   - Regular backups
   - Monitor query performance

3. **M-Pesa Security**
   - Validate callback IPs
   - Verify transaction signatures
   - Monitor transaction patterns
   - Implement timeout handling
