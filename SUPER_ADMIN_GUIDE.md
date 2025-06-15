# Super Admin System Guide

## Overview
The donation platform now includes a comprehensive Super Admin system with special key authentication and the ability to manage regular admins.

## Special Keys

### Super Admin Login Key
```
SUPER_ADMIN_2024_DONATION_HUB_KEY
```

### Super Admin Creation Key (Master Key)
```
CREATE_SUPER_ADMIN_2024_DONATION_HUB_MASTER_KEY
```

## Getting Started

### Method 1: Create Super Admin via Web Interface

1. **Navigate to Super Admin Signup**
   ```
   http://localhost:5174/superadmin/signup
   ```

2. **Fill in the form:**
   - Full Name: `Super Administrator`
   - Email: `superadmin@donationhub.com`
   - Password: `YourSecurePassword123!`
   - Confirm Password: `YourSecurePassword123!`
   - Master Creation Key: `CREATE_SUPER_ADMIN_2024_DONATION_HUB_MASTER_KEY`

3. **Click "Create Super Admin"**

### Method 2: Create Super Admin via Script

1. **Run the creation script:**
   ```bash
   npm run create-super-admin
   ```

2. **Default credentials created:**
   - Email: `superadmin@donationhub.com`
   - Password: `SuperAdmin2024!`
   - Role: `super_admin`

## Super Admin Login

### Access Super Admin Login
```
http://localhost:5174/superadmin/login
```

### Login Requirements
1. **Email:** Super admin email address
2. **Password:** Super admin password
3. **Special Key:** `SUPER_ADMIN_2024_DONATION_HUB_KEY`

### From Regular Admin Login
- Click "Super Admin Login" link on the regular admin login page

## Super Admin Powers

### 1. **Admin Management**
- **Create new admins** (regular or super admin)
- **View all admins** in the system
- **Activate/Deactivate** admin accounts
- **Delete regular admins** (cannot delete other super admins)
- **Promote admins** to super admin role

### 2. **System Access**
- **Full dashboard access** to all donation data
- **Project management** capabilities
- **Donation tracking** and analytics
- **System configuration** access

### 3. **Security Features**
- **Special key authentication** for enhanced security
- **Role-based access control**
- **Audit trail** of admin actions
- **Session management**

## Security Features

### Multi-Layer Authentication
1. **Email/Password** - Standard credentials
2. **Special Key** - Additional security layer
3. **Role Verification** - Must have super_admin role
4. **JWT Tokens** - Secure session management

### Access Control
- **Super Admin Only Routes:** `/superadmin/*`
- **Admin Management:** Only super admins can manage other admins
- **Self-Protection:** Super admins cannot delete themselves

## Routes & Endpoints

### Frontend Routes
```
/superadmin/login          - Super admin login page
/superadmin/signup         - Super admin creation page
/admin/login              - Regular admin login (with super admin link)
/admin/dashboard          - Main dashboard (both admin types)
/admin/manage-admins      - Admin management (super admin only)
```

### API Endpoints
```
POST /api/superadmin/login     - Super admin authentication
POST /api/superadmin/signup    - Super admin creation
GET  /api/admin/manage         - List all admins (super admin only)
POST /api/admin/manage         - Create new admin (super admin only)
PUT  /api/admin/manage         - Update admin (super admin only)
DELETE /api/admin/manage       - Delete admin (super admin only)
```

## Configuration

### Environment Variables
Make sure these are set in your `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Database Schema
The system uses the existing `Admin` model with roles:
- `admin` - Regular administrator
- `super_admin` - Super administrator

## Important Security Notes

1. **Keep Special Keys Secret:** Never expose the special keys in client-side code or public repositories
2. **Limit Super Admins:** Only create super admin accounts when absolutely necessary
3. **Regular Audits:** Regularly review admin accounts and their activities
4. **Strong Passwords:** Enforce strong password policies for all admin accounts
5. **Secure Environment:** Ensure your production environment is properly secured

## Admin Workflow

### Creating Regular Admins
1. Login as super admin
2. Navigate to "Manage Admins"
3. Click "Create New Admin"
4. Fill in details and select role
5. Admin receives credentials to login

### Managing Existing Admins
1. View all admins in the management interface
2. Activate/deactivate accounts as needed
3. Delete accounts that are no longer needed
4. Monitor admin activity and access

## Troubleshooting

### Cannot Access Super Admin Login
- Verify the special key is correct
- Check if super admin account exists
- Ensure MongoDB connection is working

### Super Admin Creation Fails
- Verify master creation key
- Check if super admin already exists (only one allowed via signup)
- Ensure all required fields are filled

### Admin Management Not Working
- Verify you're logged in as super admin
- Check JWT token validity
- Ensure proper role permissions

## Support

For technical support or questions about the super admin system:
1. Check the application logs for error messages
2. Verify database connectivity
3. Ensure all environment variables are properly set
4. Contact the system administrator

---

**Remember: With great power comes great responsibility. Use super admin privileges wisely and securely.**
