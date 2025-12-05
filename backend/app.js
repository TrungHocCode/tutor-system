require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require('body-parser');

const authRouters  = require('./routers/authRouter');
const userRouters  = require('./routers/userRouter');
const tutorRouters = require('./routers/tutorRouter');
const studentRouters = require('./routers/studentRouter');
const reportRouters = require('./routers/reportRouter')
const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json()); 
app.use(express.json());

app.use('/api/auth', authRouters);
app.use('/api/users', userRouters);
app.use('/api/tutors', tutorRouters);
app.use('/api/students', studentRouters);
app.use('/api/reports',reportRouters)

app.get('/', (req, res) => {
    res.send('Server is running!');
});


app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`)
    console.log(`Server is running on http://localhost:${PORT}`)
});