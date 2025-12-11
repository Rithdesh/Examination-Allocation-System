const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

//ROUTES
const UserRoutes = require('./Routes/UserRoutes');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config();
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

app.get('/', (req, res) => {
    res.send('Welcome to the Examination Allocation System API');
});

//REGISTER ROUTES
app.use('/examallocation/users', UserRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});