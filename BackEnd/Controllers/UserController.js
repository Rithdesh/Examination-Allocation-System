const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
require("dotenv").config();


// Register a user (customer, business owner or both)
const register = async (req, res) => {
  try {
    
    const { name, email, password, roles } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
   
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      roles: Array.isArray(roles) ? roles : [roles || 'STUDENT']
      
    });

    await newUser.save();
    // console.log(newUser);
    

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};




const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    
    const token = jwt.sign(
      { 
        id: user._id,
        roles: user.roles ,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token
    });

    
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
    
  }
};
  


const getUsers = async (req, res) => {
    try {
      const users = await User.find().select('-password'); 
      res.status(200).json(users);
    } catch (error) {
      console.error('Error getting users:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  };

module.exports = {getUsers,login,register};