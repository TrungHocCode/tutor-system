require("dotenv").config()
const express = require("express");
const cors = require("cors")
const morgan = require("morgan")
const bodyParser = require('body-parser');

const authRouters = require('./routers/authRouter')
const userRouters = require('./routers/userRouter')

const app = express()
app.use(cors())
app.use(bodyParser.json()); 
app.use(express.json());
const PORT = 3000
app.use('/api/auth', authRouters);
app.use('/api/users', userRouters);

app.get('/', (req, res) => {
    res.send('Server is running!');
});


app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`)
    console.log(`Server is running on http://localhost:${PORT}`)
})