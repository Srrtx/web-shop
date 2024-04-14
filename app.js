const express = require('express');
const path = require('path');
const bcrypt = require("bcrypt");
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const con = require('./config/db');

const app = express();

// set the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// for session
app.use(session({
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, //1 day in millisec
    secret: 'mysecretcode',
    resave: false,
    saveUninitialized: true,
    // config MemoryStore here
    store: new MemoryStore({
        checkPeriod: 24 * 60 * 60 * 1000 // prune expired entries every 24h
    })
}));

// ------------- Create hashed password --------------
app.get("/password/:pass", function (req, res) {
    const password = req.params.pass;
    const saltRounds = 10;    //the cost of encrypting see https://github.com/kelektiv/node.bcrypt.js#a-note-on-rounds
    bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
            return res.status(500).send("Hashing error");
        }
        res.send(hash);
    });
});

// =================== User routes =======================
// ------------- get orders and order details --------------
app.get('/user/order/:orderID', function (req, res) {
    const sql = "SELECT product.product_id, product.name, product.price FROM product INNER JOIN ordering_detail ON product.product_id=ordering_detail.product_id WHERE ordering_id=?";
    con.query(sql, [req.params.orderID], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        res.json(results);
    });
});

// ------------- get orders and order details --------------
app.get('/user/order', function (req, res) {
    const sql = "SELECT * FROM ordering WHERE user_id=?";
    con.query(sql, [req.session.userID], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        res.json(results);
    });
});

// ------------- Customer checks out products --------------
app.post('/user/checkout', function (req, res) {
    const cart = req.body;
    // console.log(cart[0].name);
    // res.send('test');
    // const sql = "INSERT INTO booking(`user_id`, `room_id`, `date`, `timeslot`, `status`) VALUES (?, ?, CURRENT_DATE, ?, 0)";
    let sql = "INSERT INTO ordering(date, user_id, status) VALUES(CURRENT_DATE, ?, 1)";
    con.query(sql, [req.session.userID], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        if (results.affectedRows != 1) {
            return res.status(500).send("Checkout failed");
        }
        // successful insert, get insert ID
        // const insertId = results.insertId;
        // console.log(insertId);
        // if insert only 1 row
        // const test = { ordering_id: insertId, product_id: 2 };
        // sql = "INSERT INTO ordering_detail SET ?";
        // insert multiple rows, must convert data to 2D array
        // let rows = [['odering_id', 'product_id']];
        let rows = [];
        cart.forEach(function(product) {
            rows.push([results.insertId, product.product_id]);
        });
        sql = "INSERT INTO ordering_detail(ordering_id, product_id) VALUES ?";
        const query = con.query(sql, [rows], function (err, results) {
            if (err) {
                console.log(query.sql);
                console.error(err);
                return res.status(500).send("Database server error");
            }
            if (results.affectedRows != rows.length) {
                return res.status(500).send("Checkout failed");
            }
            res.send('done');
        });
    });
});

// ------------- get all products for user --------------
app.get('/user/product', function (req, res) {
    const sql = "SELECT * FROM product WHERE status=1";
    con.query(sql, function (err, results) {
        if (err) {
            // console.log(sql);
            console.error(err);
            return res.status(500).send("Database server error");
        }
        res.json(results);
    });
});

// =================== Admin routes =======================
// ------------- confirm order --------------
app.put('/admin/order/:orderID', function (req, res) {
    const sql = "UPDATE ordering SET status=2 WHERE ordering_id=?";
    con.query(sql, [req.params.orderID], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        if (results.affectedRows != 1) {
            return res.status(500).send("Update error");
        }
        res.send('Confirm order!');
    });
});

// ------------- get all orders and order details --------------
app.get('/admin/order', function (req, res) {
    const sql = "SELECT user.username, ordering.ordering_id, ordering.date, ordering.status FROM user INNER JOIN ordering ON user.user_id=ordering.user_id";
    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        res.json(results);
    });
});

// ------------- get all products for admin --------------
app.get('/admin/product', function (req, res) {
    const sql = "SELECT * FROM product";
    con.query(sql, function (err, results) {
        if (err) {
            // console.log(sql);
            console.error(err);
            return res.status(500).send("Database server error");
        }
        res.json(results);
    });
});

// ------------- enable/disable product --------------
app.put('/admin/product/:pid/:status', function (req, res) {
    const sql = "UPDATE product SET status=? WHERE product_id=?";
    con.query(sql, [req.params.status, req.params.pid], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        if (results.affectedRows != 1) {
            return res.status(500).send("Update error");
        }
        res.send('Product status updated!');
    });
});

// =================== Other routes =======================
// ------------- get user info --------------
app.get('/userInfo', function (req, res) {
    res.json({ "userID": req.session.userID, "username": req.session.username });
});

// ---------- login -----------
app.post('/login', function (req, res) {
    const { username, password } = req.body;
    const sql = "SELECT user_id, password, role FROM user WHERE username = ?";
    con.query(sql, [username], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        if (results.length != 1) {
            return res.status(401).send("Wrong username");
        }
        // check password
        bcrypt.compare(password, results[0].password, function (err, same) {
            if (err) {
                res.status(500).send("Server error");
            }
            else if (same) {
                // remember user
                req.session.userID = results[0].user_id;
                req.session.username = username;
                req.session.role = results[0].role;
                // role check
                if (results[0].role == 1) {
                    // admin
                    res.send('/admin/productPage');
                }
                else if (results[0].role == 2) {
                    // user
                    res.send('/user/productPage');
                }
            }
            else {
                res.status(401).send("Wrong password");
            }
        });
    });
});

// ------------- Logout --------------
app.get("/logout", function (req, res) {
    //clear session variable
    req.session.destroy(function (err) {
        if (err) {
            console.error(err);
            res.status(500).send("Cannot clear session");
        }
        else {
            res.redirect("/");
        }
    });
});

// *********************** Page routes *******************
// =================== User routes =======================
// ------------ user history page ----------
app.get('/user/historyPage', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/user_history.html'));
});

// ------------ user cart page ----------
app.get('/user/cartPage', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/user_cart.html'));
});

// ------------ user landing page ----------
app.get('/user/productPage', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/user_product.html'));
});

// =================== Admin routes =======================
// ------------ admin order page ----------
app.get('/admin/orderPage', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/admin_order.html'));
});

// ------------ admin landing page ----------
app.get('/admin/productPage', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/admin_product.html'));
});

// ------------ root service ----------
app.get('/', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

const PORT = 3000;
app.listen(PORT, function () {
    console.log('Server is runnint at port ' + PORT);
});