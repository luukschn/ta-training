const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const { validateUserDetails } = require('./helpers/validationHelpers.js');

const app = express();
const port = 3002;


app.use(cors());
app.use(express.json());

const dbHost = process.env.DB_HOST || 'localhost';

const db = mysql.createPool({
    // host: 'localhost' || process.env.DB_HOST, //NOTE: this might not work in my containerized setup anymore. change to mysql-container when building to be sure?
    host: dbHost,
    user: 'testuser',
    password: 'testpw',
    database: 'ta_test_db'
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to databse:', err);
    } else {
        console.log('Connected to database');
        connection.release();
    }
});

const findUserByUsername = async (username) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Users WHERE username = ?', [username], (err, results) => {
            if(err) {
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
};

app.post('/api/user-login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await findUserByUsername(username);

        if(!user) {
            return res.status(401).json({ error: 'User does not exist' });
        }

        // not hashing passwords since security is irrelevant for this
        const passwordMatch = await (password === user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Password does not match' });
        }

        // DUMMY TOKEN - dont think there is a need to replace this with jwt in this app
        const token = 'token12';

        res.json({ 
            token: token,
            user_id: user.id
        });


    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/products/get-all', (req, res) => {
    const query = 'SELECT * FROM Products';

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

app.put('/api/products/add-product', (req, res) => {

    const { productName, amount_in_stock } = req.body;

    //validate input
    if(!productName) {
        return res.status(400).json({ error: 'Product name is required' });
    }

    const query = 'INSERT INTO Products (name, amount_in_stock) VALUES (?, ?)';

    db.query(query, [productName, amount_in_stock], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json({ message: 'Product added succesfully', productId: results.insertId });
        }
    });
});

app.get(`/api/users/details/:id`, (req, res) => {

    const user_id = req.params.id;
    const query = 'SELECT * FROM UserDetails WHERE user_id = ?';

    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        } else if (0 === results.length) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json(results);
        }
    });
});

app.put('/api/users/details/:id', (req, res) => {

    const user_id = req.params.id;
    const { gender, address, country, postal_code } = req.body;

    const userDetailValidation = validateUserDetails(user_id, req.body);

    if (!userDetailValidation['status']) {
        return res.status(400).json({ error: userDetailValidation['error_message']});
    };

    const query = `
        INSERT INTO UserDetails (user_id, gender, address, country, postal_code)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            gender = VALUES(gender),
            address = VALUES(address),
            country = VALUES(country),
            postal_code = VALUES(postal_code)
    `;

    db.query(query, [user_id, gender, address, country, postal_code], (err, results) => {
        if (err) {
            console.error('Error updating or inserting user details', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json({ success: true, message: 'User details updated or created succesfully' });
        }
    });
});

//TODO: returns 200 when there is no user present in DB with that id
app.get('/api/users/:id', (req, res) => {

    const user_id = req.params.id;

    // also gets pw from the db, which is not ideal
    const query = `SELECT * FROM Users WHERE id = ?`;

    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error('Error getting user.', err);
            res.status(500).json({ error: 'Internal server error.' });
        } else{
            res.json(results);
        }
    });
});

app.put('/api/users', (req, res) => {
    const {username, password, is_admin} = req.body;

    const query = `
        INSERT INTO Users (username, password, is_admin)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        `

    db.query(query, [username, password, is_admin], (err, results) => {
        if (err) {
            console.error('Issue inserting user', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json({ success: true, message: 'User inserted or updated succesfully' });
        }
    })
});



app.post('/api/calculate-score', (req, res) => {
    const {score} = req.body;

    let result = '';

    if (score < 0) {
        result = "invalid score";
    } else if (score >= 0 && score < 10) {
        result = 'A';
    } else if (score >= 10 && score < 20) {
        result = 'B';
    } else if (score >= 20 && score < 30) {
        result = 'C';
    } else if (score >= 30 && score < 40) {
        result = 'D';
    } else if (score >= 40 && score < 50) {
        result = 'E';
    } else if (score >= 50) {
        result = "invalid score";
    } else {
        result = "invalid input";
    }

    res.json({ result })
});


//start the server
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const shutdownServer = () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server has been shut down');
        process.exit(0);
    });
};

// Handle SIGNINT signal (CTRL+C)
process.on('SIGINT', () => {
    shutdownServer();
});

// handle SIGTERM signal (terminaltion signal)
process.on('SIGTERM', () => {
    shutdownServer();
});

// module.exports = app;

module.exports = {  app, shutdownServer };