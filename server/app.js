require('dotenv').config()
const PORT = process.env.PORT ? process.env.PORT : 5000;
const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const router = require('./routes/index');
const errorHandler = require('./middleware/ErrorHanlingMinddleware');
const seqelize = require('./models/db');



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}));
app.use('/api', router);
app.use(errorHandler);

app.get('/', (req, res) => {
    return res.send("aboba");
});

const start = async () =>{
    try{

        await seqelize.authenticate();
        await seqelize.sync();
        app.listen(PORT, () => console.log(`Server start on http://localhost:${PORT}`));
    }
    catch(err){
        console.log("Error: " + err);
    }
}
start();


module.exports = app;