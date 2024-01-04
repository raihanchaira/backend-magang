import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv"
import bcrypt from "bcryptjs"
dotenv.config()

const app = express ();
app.use(express.json());
app.use(cors());
app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req, res) => {
    return res.status(200).json({
        message : "API ready"
    })
})

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    // password: 'your_password',
    database: 'test_magang'
  });
  
  // Connect to MySQL
db.connect((err) => {
    if (err) {
      throw err;
    }
    console.log('Connected to MySQL');
});
  
//register
app.post("/user", async(req, res) => {
    const {username, password, name, email} = req.body
    const hashPass = await bcrypt.hash(password, 15)
    const sql = 'INSERT INTO user (username, password, name, email) VALUES (?, ?, ?, ?)';
    const values = [username, hashPass, name, email];

    db.query(sql, values, (err, result) => {
      if (err) throw err;
      res.json({userId:result.insertId });
    });
})

//login
app.post("/login", async(req, res) => {
    const {username, password} = req.body // base on req
    const sql = 'SELECT * FROM user WHERE username = ?';
    db.query(sql, [username], (err, result) => {
        if (err) throw err;
        if (result.length === 0){
            return res.status(404).json({message : "User not Found"})
        }else{
            const isMatch = bcrypt.compare(password, result[0].password)
            if (isMatch){
                return res.status(200).json({
                    username : result[0].username,
                    name : result[0].name,
                    email : result[0].email
                })
            }
            
        }
    })
})

app.get("/user", async(req, res) => {
    const sql = 'SELECT userId, username, name, email FROM user';  
    db.query(sql, (err, result) => {
        return res.status(200).json({
            result
        })
    })
})

app.listen(3000, () => {
    console.log("server running on port 3000")
})


