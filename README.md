# Travel Management System

A modern web application for managing travel packages, bookings, and user interactions. Built with Node.js, Express, MySQL, and EJS templating.

## Features

- User Authentication (Signup/Login)
- Travel Package Management
- Booking System
- Admin Dashboard
- Responsive Design
- Secure Payment Integration
- User Reviews and Ratings

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd travel-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=travel_management
SESSION_SECRET=your_session_secret
PORT=1312
```

4. Set up the database:
```bash
mysql -u your_mysql_username -p < database.sql
```

5. Start the application:
```bash
npm start
```

The application will be available at `http://localhost:1312`

## Project Structure

```
travel-management-system/
├── views/
│   ├── layout.ejs
│   ├── login.ejs
│   ├── signup.ejs
│   ├── home.ejs
│   ├── packages.ejs
│   ├── package-details.ejs
│   ├── my-bookings.ejs
│   └── admin/
│       ├── dashboard.ejs
│       └── packages.ejs
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── app.js
├── database.sql
├── package.json
└── README.md
```

## Features in Detail

### User Features
- User registration and authentication
- Browse travel packages
- View package details
- Make bookings
- View booking history
- Leave reviews and ratings

### Admin Features
- Dashboard with statistics
- Manage travel packages (CRUD operations)
- View and manage bookings
- User management
- System settings

## Technologies Used

- **Backend:**
  - Node.js
  - Express.js
  - MySQL
  - EJS Templating
  - bcrypt for password hashing
  - express-session for session management

- **Frontend:**
  - Bootstrap 5
  - Font Awesome icons
  - JavaScript (ES6+)
  - AJAX for API calls

## Security Features

- Password hashing using bcrypt
- Session-based authentication
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure cookie settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@travelms.com or create an issue in the repository. 