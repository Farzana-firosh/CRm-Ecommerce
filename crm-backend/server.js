const dotenv = require ('dotenv')
const express = require('express')
const cors = require('cors');
const itemsRouter = require('./routes/items');
const customersRoutes = require('./routes/CustomerRoutes');
const salesOrderRoutes = require('./routes/salesOrderRoutes');
const usersRoutes = require('./routes/users');
const invoicesRoutes = require('./routes/invoiceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const currencyRoutes = require('./routes/currencyRoutes');
const taxRoutes = require('./routes/taxRoutes');
const organizationRoutes = require('./routes/organizationRoutes');



// Load quotation routes
let quotationRoutes;
try {
  quotationRoutes = require('./routes/quotationRoutes');
  console.log('Quotation routes loaded successfully');
} catch (error) {
  console.error('Error loading quotation routes:', error);
}

// Load user routes
let userRoutes;
try {
  userRoutes = require('./routes/users');
  console.log('User routes loaded successfully');
} catch (error) {
  console.error(' Error loading user routes:', error);
}

dotenv.config({path : './config/config.env'})
const errorHandlers = require('./middlewares/errorHandler');


const app = express();

app.use(express.json());
app.use(cors({
    origin: '*'
}));


// Debug route - test if Express is working
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date() });
});

// Add debugging for route mounting
app.use('/api/quotations', (req, res, next) => {
  console.log(`📡 Route hit: ${req.method} /api/quotations${req.path}`);
  next();
}, quotationRoutes);

// Mount user routes only if they loaded successfully
if (userRoutes) {
  app.use('/api/users', (req, res, next) => {
    console.log(` Route hit: ${req.method} /api/users${req.path}`);
    next();
  }, userRoutes);
  console.log('User routes mounted successfully');
} else {
  console.log(' User routes not mounted due to loading errors');
}


app.use('/api/items', itemsRouter);

app.use('/api/customers', customersRoutes);

app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/invoices', invoicesRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use('/api/currencies', currencyRoutes);
app.use('/api/taxes', taxRoutes);
app.use('/api/organization', organizationRoutes);

// Error handler (should be last)
app.use(errorHandlers);

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(` Server is running on Port ${PORT}`);
   

})
