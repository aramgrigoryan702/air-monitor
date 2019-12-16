const express = require('express');
const app = express();
const path =  require('path');
const port = process.env.PORT || 5555;

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

app.use('/', express.static(path.join(__dirname, 'build')))
// create a GET route
app.get('*', (req, res) => {
    res.send_file('./build/index.html');
});
