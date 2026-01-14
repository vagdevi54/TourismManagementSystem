const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
require('dotenv').config();

const app = express();

// Middleware Configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 3600000 }
}));

// Flash messages middleware
app.use(flash());

// Make flash messages available to all views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Set EJS as View Engine and Configure Layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Database Connection
const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Handle database connection errors
con.connect((err) => {
    if (err) {
        console.error('Database connection failed:');
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);
        console.error('Error number:', err.errno);
        console.error('SQL state:', err.sqlState);
        
        // Log environment variables for debugging
        console.log('Environment variables:');
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_USER:', process.env.DB_USER);
        console.log('DB_NAME:', process.env.DB_NAME);
        
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('Database does not exist. Creating database...');
            createDatabase();
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('Access denied. Please check your MySQL username and password.');
        }
        return;
    }
    console.log('Connected to MySQL Database!');
    
    // Check if reviews table exists
    const checkReviewsTableQuery = `
        SELECT COUNT(*) as count
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'reviews'
    `;
    
    con.query(checkReviewsTableQuery, [process.env.DB_NAME], (err, result) => {
        if (err) {
            console.error('Error checking reviews table:', err);
            return;
        }
        
        // If table doesn't exist, create it
        if (result[0].count === 0) {
            const createReviewsTableQuery = `
                CREATE TABLE reviews (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    package_id INT NOT NULL,
                    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
                    comment TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (package_id) REFERENCES tour_packages(id)
                )
            `;
            
            con.query(createReviewsTableQuery, (err) => {
                if (err) {
                    console.error('Error creating reviews table:', err);
                    return;
                }
                console.log('Reviews table created successfully');
                
                // Add some sample reviews
                const sampleReviews = `
                    INSERT INTO reviews (user_id, package_id, rating, comment) VALUES
                    (1, 1, 5, 'Amazing experience! The tour guides were knowledgeable and the itinerary was well-planned.'),
                    (2, 1, 4, 'Great package overall. The hotel could have been better, but the sightseeing was excellent.'),
                    (3, 2, 5, 'Perfect family vacation. Kids loved the activities and the staff was very accommodating.')
                `;
                
                con.query(sampleReviews, (err) => {
                    if (err && !err.code === 'ER_DUP_ENTRY') {
                        console.error('Error adding sample reviews:', err);
                    } else {
                        console.log('Sample reviews added successfully');
                    }
                });
            });
        }
    });
    
    // Check if payment columns exist in bookings table
    const checkPaymentColumnsQuery = `
        SELECT COUNT(*) as count
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'bookings' 
        AND COLUMN_NAME IN ('payment_date', 'card_last_four')
    `;
    
    con.query(checkPaymentColumnsQuery, [process.env.DB_NAME], (err, result) => {
        if (err) {
            console.error('Error checking payment columns:', err);
            return;
        }
        
        // If columns don't exist, add them
        if (result[0].count < 2) {
            const alterTableQueries = [
                'ALTER TABLE bookings ADD COLUMN payment_date DATETIME',
                'ALTER TABLE bookings ADD COLUMN card_last_four VARCHAR(4)'
            ];
            
            // Execute each query separately
            alterTableQueries.forEach(query => {
                con.query(query, (err) => {
                    if (err && !err.message.includes('Duplicate column name')) {
                        console.error('Error adding payment column:', err);
                    }
                });
            });
            console.log('Successfully added payment columns to bookings table');
        } else {
            console.log('Payment columns already exist in bookings table');
        }
    });
    
    // First check if the column exists
    const checkColumnQuery = `
        SELECT COUNT(*) as count
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'destinations' 
        AND COLUMN_NAME = 'is_international'
    `;
    
    con.query(checkColumnQuery, [process.env.DB_NAME], (err, result) => {
        if (err) {
            console.error('Error checking column existence:', err);
            return;
        }
        
        // If column doesn't exist, add it
        if (result[0].count === 0) {
            const alterTableQuery = `
                ALTER TABLE destinations 
                ADD COLUMN is_international BOOLEAN DEFAULT FALSE
            `;
            
            con.query(alterTableQuery, (err) => {
                if (err) {
                    console.error('Error adding is_international column:', err);
                    return;
                }
                console.log('Successfully added is_international column');
                
                // Update existing destinations to set international status
                const updateQuery = `
                    UPDATE destinations 
                    SET is_international = true 
                    WHERE country NOT IN ('India')
                `;
                
                con.query(updateQuery, (err) => {
                    if (err) {
                        console.error('Error updating international status:', err);
                        return;
                    }
                    console.log('Successfully updated international status for destinations');
                });
            });
        } else {
            console.log('is_international column already exists');
        }
    });
});

// Function to create database if it doesn't exist
function createDatabase() {
    const tempCon = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    tempCon.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }

        tempCon.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {
            if (err) {
                console.error('Error creating database:', err);
                return;
            }
            console.log('Database created successfully');
            tempCon.end();
            
            // Reconnect with the new database
            con.connect();
        });
    });
}

con.on('error', function(err) {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Database connection was closed. Reconnecting...');
        handleDisconnect();
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
        console.log('Database has too many connections.');
    } else if (err.code === 'ECONNREFUSED') {
        console.log('Database connection was refused.');
    } else {
        console.log('Unknown database error:', err);
    }
});

function handleDisconnect() {
    con.connect((err) => {
        if (err) {
            console.error('Error reconnecting to database:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });
}

// Middleware to Check Authentication
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Middleware to Check Admin Role
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).send('Access denied. Admin only.');
};

// Routes
app.get('/register', (req, res) => {
    res.render('signup');
});

app.post('/register', (req, res) => {
    const { uname, email, phno, pwd } = req.body;
    
    // Check if email already exists
    const checkQuery = 'SELECT id FROM users WHERE email = ?';
    con.query(checkQuery, [email], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error.');
        }
        
        if (result.length > 0) {
            return res.render('signup', { error: 'Email already registered' });
        }
        
        // Hash password
        bcrypt.hash(pwd, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Password hashing error:', err);
                return res.status(500).send('Server error.');
            }
            
            // Insert new user
            const insertQuery = 'INSERT INTO users (uname, email, phno, pwd, role) VALUES (?, ?, ?, ?, ?)';
            con.query(insertQuery, [uname, email, phno, hashedPassword, 'user'], (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).send('Database error.');
                }
                
                res.redirect('/login');
            });
        });
    });
});

app.get('/login', (req, res) => {
    res.render('login', { layout: false });
});

app.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    
    // Get full user data from database
    const userQuery = 'SELECT id, uname, email, role FROM users WHERE id = ?';
    
    con.query(userQuery, [req.session.user.id], (err, userResult) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error.');
        }
        if (!userResult.length) {
            req.session.destroy();
            return res.redirect('/login');
        }
        
        // Get recent reviews with error handling
        const reviewsQuery = `
            SELECT r.*, u.uname as user_name, tp.name as package_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN tour_packages tp ON r.package_id = tp.id
            ORDER BY r.created_at DESC
            LIMIT 3
        `;
        
        con.query(reviewsQuery, (err, reviewsResult) => {
            // If there's an error with reviews, just show the page without reviews
            if (err) {
                console.error('Error fetching reviews:', err);
                return res.render('home', { 
                    user: userResult[0],
                    recentReviews: [],
                    title: 'Home'
                });
            }
            
            res.render('home', { 
                user: userResult[0],
                recentReviews: reviewsResult || [],
                title: 'Home'
            });
        });
    });
});

// Tour Package Routes
app.get('/packages', isAuthenticated, (req, res) => {
    const query = `
        SELECT tp.*, d.name as destination_name, d.country
        FROM tour_packages tp
        JOIN destinations d ON tp.destination_id = d.id
    `;
    con.query(query, (err, packages) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error.');
        }
        res.render('packages', { 
            packages,
            title: 'Tour Packages',
            user: req.session.user
        });
    });
});

app.get('/package/:id', isAuthenticated, (req, res) => {
    const packageQuery = `
        SELECT tp.*, d.name as destination_name, d.country
        FROM tour_packages tp
        JOIN destinations d ON tp.destination_id = d.id
        WHERE tp.id = ?
    `;
    
    const reviewsQuery = `
        SELECT r.*, u.uname as user_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.package_id = ?
        ORDER BY r.created_at DESC
    `;
    
    con.query(packageQuery, [req.params.id], (err, packageResult) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error.');
        }
        
        if (!packageResult.length) {
            return res.status(404).send('Package not found.');
        }
        
        con.query(reviewsQuery, [req.params.id], (err, reviewsResult) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Database error.');
            }
            
            res.render('package-details', { 
                package: packageResult[0],
                reviews: reviewsResult,
                user: req.session.user
            });
        });
    });
});

// Booking Routes
app.get('/booking', isAuthenticated, (req, res) => {
    const package_id = req.query.package;
    
    if (!package_id) {
        return res.redirect('/tours');
    }

    // Get package details
    const query = `
        SELECT tp.*, d.name as destination_name, d.country
        FROM tour_packages tp
        JOIN destinations d ON tp.destination_id = d.id
        WHERE tp.id = ?
    `;

    con.query(query, [package_id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.render('error', {
                message: 'Error retrieving package details.',
                user: req.session.user
            });
        }

        if (!result.length) {
            return res.render('error', {
                message: 'Package not found.',
                user: req.session.user
            });
        }

        res.render('booking', {
            package: result[0],
            user: req.session.user
        });
    });
});

app.post('/book-package', isAuthenticated, (req, res) => {
    const { package_id, travel_date, number_of_people } = req.body;
    const user_id = req.session.user.id;

    // Input validation
    if (!package_id || !travel_date || !number_of_people) {
        return res.render('error', {
            message: 'Please provide all required fields.',
            user: req.session.user
        });
    }

    // First, get package details to calculate total amount and check availability
    const packageQuery = 'SELECT * FROM tour_packages WHERE id = ?';
    con.query(packageQuery, [package_id], (err, packageResult) => {
        if (err) {
            console.error('Database error:', err);
            return res.render('error', {
                message: 'Error retrieving package details.',
                user: req.session.user
            });
        }

        if (!packageResult.length) {
            return res.render('error', {
                message: 'Package not found.',
                user: req.session.user
            });
        }

        const package = packageResult[0];

        // Check if number of people is within package limit
        if (number_of_people > package.max_participants) {
            return res.render('error', {
                message: `Maximum ${package.max_participants} participants allowed for this package.`,
                user: req.session.user
            });
        }

        // Calculate total amount
        const total_amount = package.price * number_of_people;

        // Create booking
        const bookingQuery = `
            INSERT INTO bookings (user_id, package_id, travel_date, number_of_people, total_amount, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        `;

        con.query(bookingQuery, [user_id, package_id, travel_date, number_of_people, total_amount], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.render('error', {
                    message: 'Error creating booking.',
                    user: req.session.user
                });
            }

            // Create pending payment record
            const paymentQuery = `
                INSERT INTO payments (booking_id, amount, status)
                VALUES (?, ?, 'pending')
            `;

            con.query(paymentQuery, [result.insertId, total_amount], (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.render('error', {
                        message: 'Error creating payment record.',
                        user: req.session.user
                    });
                }

                // Redirect to payment page
                res.redirect(`/payment/${result.insertId}`);
            });
        });
    });
});

// Booking confirmation route
app.get('/booking-confirmation/:id', isAuthenticated, (req, res) => {
    const query = `
        SELECT b.*, tp.name as package_name, tp.description, tp.price as package_price,
               u.uname as user_name, u.email as user_email
        FROM bookings b 
        JOIN tour_packages tp ON b.package_id = tp.id 
        JOIN users u ON b.user_id = u.id
        WHERE b.id = ? AND b.user_id = ?
    `;
    
    con.query(query, [req.params.id, req.session.user.id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error.');
        }
        
        if (!result.length) {
            return res.status(404).send('Booking not found.');
        }
        
        // Ensure total_amount is a number
        result[0].total_amount = parseFloat(result[0].total_amount);
        
        res.render('booking-confirmation', {
            booking: result[0],
            title: 'Booking Confirmation',
            user: req.session.user
        });
    });
});

app.get('/my-bookings', isAuthenticated, (req, res) => {
    const query = `
        SELECT 
            b.*,
            tp.name as package_name,
            tp.price as package_price,
            d.name as destination_name,
            d.country
        FROM bookings b 
        JOIN tour_packages tp ON b.package_id = tp.id 
        JOIN destinations d ON tp.destination_id = d.id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC
    `;
    
    con.query(query, [req.session.user.id], (err, bookings) => {
        if (err) {
            console.error('Database error:', err);
            return res.render('error', {
                message: 'Error retrieving your bookings.',
                user: req.session.user,
                showBackButton: true
            });
        }

        // Format the bookings data
        const formattedBookings = bookings.map(booking => ({
            ...booking,
            formattedDate: new Date(booking.travel_date).toLocaleDateString(),
            formattedAmount: new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(booking.total_amount),
            bookingDate: new Date(booking.booking_date).toLocaleDateString(),
            statusClass: booking.status === 'confirmed' ? 'success' : 
                        booking.status === 'pending' ? 'warning' : 'danger'
        }));

        res.render('my-bookings', {
            title: 'My Bookings',
            bookings: formattedBookings,
            user: req.session.user
        });
    });
});

// Admin Routes
app.get('/admin/dashboard', isAuthenticated, isAdmin, (req, res) => {
    const query = 'SELECT * FROM bookings';
    con.query(query, (err, bookings) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error.');
        }
        res.render('admin/dashboard', { bookings });
    });
});

app.get('/admin/packages', isAuthenticated, isAdmin, (req, res) => {
    const query = 'SELECT * FROM tour_packages';
    con.query(query, (err, packages) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error.');
        }
        res.render('admin/packages', { packages });
    });
});

// Login Route
app.post('/login', (req, res) => {
    const { email, pwd } = req.body;
    
    const query = 'SELECT * FROM users WHERE email = ?';
    con.query(query, [email], async (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error.');
        }
        
        if (result.length > 0) {
            const validPassword = await bcrypt.compare(pwd, result[0].pwd);
            if (validPassword) {
            req.session.user = {
                id: result[0].id,
                email: result[0].email,
                role: result[0].role
            };
                return res.redirect('/');
            }
        }
        res.render('login', { error: 'Invalid email or password.' });
    });
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/login');
    });
});

// Tours Route
app.get('/tours', isAuthenticated, (req, res) => {
    const { sort = 'price', filter = 'all' } = req.query;
    
    let orderBy = 'tp.price DESC';
    switch(sort) {
        case 'duration':
            orderBy = 'tp.duration DESC';
            break;
        case 'seats':
            orderBy = 'available_seats DESC';
            break;
        case 'price_asc':
            orderBy = 'tp.price ASC';
            break;
    }

    const query = `
        SELECT 
            tp.*,
            d.name as destination_name,
            d.country,
            d.description as destination_description,
            d.image_url as destination_image,
            (tp.max_participants - COALESCE(SUM(CASE 
                WHEN b.status IN ('confirmed', 'pending') 
                AND b.travel_date >= CURDATE() 
                THEN b.number_of_people 
                ELSE 0 
            END), 0)) as available_seats
        FROM tour_packages tp
        LEFT JOIN destinations d ON tp.destination_id = d.id
        LEFT JOIN bookings b ON tp.id = b.package_id
        WHERE tp.status = 'active'
        ${filter === 'available' ? 'AND (tp.max_participants - COALESCE(SUM(CASE WHEN b.status IN ("confirmed", "pending") AND b.travel_date >= CURDATE() THEN b.number_of_people ELSE 0 END), 0)) > 0' : ''}
        GROUP BY tp.id, tp.name, tp.description, tp.duration, tp.price, tp.max_participants, 
                 tp.status, tp.image_url, d.name, d.country, d.description, d.image_url
        HAVING available_seats > 0 OR available_seats IS NULL
        ORDER BY ${orderBy}
    `;

    con.query(query, (err, packages) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error: ' + err.message);
        }

        // Set available_seats to max_participants if no bookings exist
        packages.forEach(package => {
            if (package.available_seats === null) {
                package.available_seats = package.max_participants;
            }
            // Ensure available_seats is not negative
            package.available_seats = Math.max(0, package.available_seats);
            // Format price for display
            package.formattedPrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(package.price);
        });

        res.render('tours', {
            packages,
            title: 'Tour Packages',
            user: req.session.user,
            sort,
            filter
        });
    });
});

// Destination Route
app.get('/destination', isAuthenticated, (req, res) => {
    const query = `
        SELECT 
            d.*,
            COUNT(DISTINCT CASE WHEN tp.status = 'active' THEN tp.id END) as package_count,
            MIN(CASE WHEN tp.status = 'active' THEN tp.price END) as min_price,
            SUM(CASE 
                WHEN tp.status = 'active' 
                THEN (tp.max_participants - COALESCE(
                    (SELECT SUM(b.number_of_people) 
                     FROM bookings b 
                     WHERE b.package_id = tp.id 
                     AND b.status = 'confirmed' 
                     AND b.travel_date >= CURDATE()), 0
                )) 
                ELSE 0 
            END) as total_available_seats
        FROM destinations d
        LEFT JOIN tour_packages tp ON d.id = tp.destination_id
        GROUP BY d.id
        HAVING package_count > 0 AND total_available_seats > 0
    `;

    con.query(query, (err, destinations) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error occurred');
        }

        // Format the destinations data
        const formattedDestinations = destinations.map(dest => ({
            id: dest.id,
            name: dest.name,
            description: dest.description,
            country: dest.country || 'India',
            package_count: dest.package_count || 0,
            min_price: new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(dest.min_price || 10000),
            img: dest.image_url,
            available_seats: dest.total_available_seats
        }));

        res.render('destination', {
            title: 'Destinations',
            destinations: formattedDestinations,
            user: req.session.user
        });
    });
});

// Payment Routes
app.get('/payment/:booking_id', isAuthenticated, (req, res) => {
    const query = `
        SELECT b.*, tp.name as package_name, tp.price as package_price
        FROM bookings b
        JOIN tour_packages tp ON b.package_id = tp.id
        WHERE b.id = ? AND b.user_id = ?
    `;

    con.query(query, [req.params.booking_id, req.session.user.id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.render('error', {
                message: 'An error occurred while retrieving booking details.',
                user: req.session.user,
                showBackButton: true
            });
        }

        if (!result.length) {
            return res.render('error', {
                message: 'Booking not found or unauthorized.',
                user: req.session.user,
                showBackButton: true
            });
        }

        const booking = result[0];
        res.render('payment', {
            booking,
            user: req.session.user
        });
    });
});

// Payment processing route
app.post('/process-payment', isAuthenticated, async (req, res) => {
    const { booking_id, card_number, card_name, expiry, cvv } = req.body;
    
    try {
        // Validate booking exists and belongs to user
        const bookingQuery = `
            SELECT b.*, tp.name as package_name, tp.price as price_per_person 
            FROM bookings b
            JOIN tour_packages tp ON b.package_id = tp.id
            WHERE b.id = ? AND b.user_id = ? AND b.status = 'pending'
        `;
        
        con.query(bookingQuery, [booking_id, req.session.user.id], async (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.redirect('/payment-error');
            }

            if (!result.length) {
                return res.redirect('/payment-error');
            }

            const booking = result[0];

            // In a real application, you would integrate with a payment gateway here
            // For this demo, we'll simulate a successful payment
            
            // Update booking status to confirmed
            const updateQuery = `
                UPDATE bookings 
                SET status = 'confirmed',
                    payment_date = NOW(),
                    card_last_four = ?
                WHERE id = ?
            `;

            const lastFour = card_number.replace(/\s/g, '').slice(-4);
            
            con.query(updateQuery, [lastFour, booking_id], (err) => {
                if (err) {
                    console.error('Payment update error:', err);
                    return res.redirect('/payment-error');
                }

                // Redirect to success page
                res.redirect('/payment-success/' + booking_id);
            });
        });
    } catch (error) {
        console.error('Payment processing error:', error);
        res.redirect('/payment-error');
    }
});

// Payment success route
app.get('/payment-success/:booking_id', isAuthenticated, (req, res) => {
    const bookingQuery = `
        SELECT b.*, tp.name as package_name, d.name as destination_name
        FROM bookings b
        JOIN tour_packages tp ON b.package_id = tp.id
        JOIN destinations d ON tp.destination_id = d.id
        WHERE b.id = ? AND b.user_id = ? AND b.status = 'confirmed'
    `;

    con.query(bookingQuery, [req.params.booking_id, req.session.user.id], (err, result) => {
        if (err || !result.length) {
            return res.redirect('/payment-error');
        }

        res.render('payment-success', { 
            booking: result[0],
            title: 'Payment Successful',
            user: req.session.user
        });
    });
});

// Payment error route
app.get('/payment-error', (req, res) => {
    res.render('payment-error', {
        message: 'An error occurred while processing your payment.',
        user: req.session.user,
        showBackButton: true
    });
});

// About page route
app.get('/about', (req, res) => {
    res.render('about', { 
        title: 'About Us',
        user: req.session.user 
    });
});

// Contact page route
app.get('/contact', (req, res) => {
    res.render('contact', { 
        title: 'Contact Us',
        user: req.session.user 
    });
});

// Reviews Routes
app.get('/reviews', (req, res) => {
    const query = `
        SELECT r.*, u.uname as user_name, tp.name as package_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN tour_packages tp ON r.package_id = tp.id
        ORDER BY r.created_at DESC
    `;
    
    con.query(query, (err, reviews) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error.');
        }
        
        res.render('reviews', { 
            reviews,
            user: req.session.user
        });
    });
});

app.post('/submit-review', isAuthenticated, (req, res) => {
    const { package_id, rating, comment } = req.body;
    const user_id = req.session.user.id;

    // Input validation
    if (!package_id || !rating || !comment) {
        return res.render('error', {
            message: 'Please provide all required fields.',
            user: req.session.user,
            showBackButton: true
        });
    }

    // Validate rating is between 1 and 5
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.render('error', {
            message: 'Invalid rating value.',
            user: req.session.user,
            showBackButton: true
        });
    }
    
    // Check if user has already reviewed this package
    const checkQuery = 'SELECT id FROM reviews WHERE user_id = ? AND package_id = ?';
    con.query(checkQuery, [user_id, package_id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.render('error', {
                message: 'An error occurred while checking your review.',
                user: req.session.user,
                showBackButton: true
            });
        }
        
        if (result.length > 0) {
            return res.render('error', {
                message: 'You have already reviewed this package.',
                user: req.session.user,
                showBackButton: true
            });
        }
        
        // Insert new review
        const insertQuery = 'INSERT INTO reviews (user_id, package_id, rating, comment) VALUES (?, ?, ?, ?)';
        con.query(insertQuery, [user_id, package_id, ratingNum, comment], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.render('error', {
                    message: 'An error occurred while submitting your review.',
                    user: req.session.user,
                    showBackButton: true
                });
            }
            
            // Redirect back to the package page with a success message
            req.flash('success', 'Your review has been submitted successfully!');
            res.redirect(`/package/${package_id}`);
        });
    });
});

// Add a global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.render('error', {
        message: 'An unexpected error occurred. Please try again later.',
        user: req.session.user || null,
        showBackButton: true
    });
});

// Add a 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Page not found.',
        user: req.session.user || null,
        showBackButton: true
    });
});

// Start the Server
const PORT = process.env.PORT || 1312;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
