const express = require('express');
const graphqlHTTP = require('express-graphql');
const { PORT, announce, isDev } = require('./config');
const schema = require('./schema');
const mongoose = require('mongoose');
const { user, password } = require('./dbCredentials');
const cors = require('cors');

const app = express();

app.use(cors());

const connectionString = `mongodb://${user}:${password}@ds223653.mlab.com:23653/startup-weekend-db`
mongoose.connect(connectionString, { useNewUrlParser: true });
mongoose.connection.once('open', () => {
    announce('connected to database');
});

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: isDev()
}));

app.listen(4000, () => announce(`listening on port ${PORT}`));