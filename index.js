const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');

const uri = "mongodb+srv://Pranav:Pranav369@cluster0.0jvn3ck.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const app = express();
const port = process.env.PORT || 3030;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/donors', async (req, res) => {
  try {
    const client = await MongoClient.connect(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });

    const db = client.db("blooddonation");
    const collection = db.collection("donors");

    const newDonor = {
      name: req.body.name,
      email: req.body.email,
      bloodGroup: req.body.blood_type,
      contact: req.body.phone,
      address: req.body.address
    };

    // TODO: Add validation for newDonor fields before inserting into the database

    const result = await collection.insertOne(newDonor);
    console.log(`Donor data inserted with ID: ${result.insertedId}`);
    res.send('Donor information submitted successfully!');
  } catch (error) {
    console.error("Error inserting donor data:", error);
    res.status(500).send('Error submitting donor information. Please try again later.');
  }
});

// Serve HTML files
app.get('/get_involve', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'get_involve.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'contact.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.get('/donors_list', async (req, res) => {
  let client;
  try {
    client = await MongoClient.connect(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });

    const db = client.db("blooddonation");
    const collection = db.collection("donors");

    const donors = await collection.find({}).toArray();

    let donorCardsHTML = '';

    donors.forEach(donor => {
      donorCardsHTML += `
        <div class="card my-3 d-flex justify-content-center" style="width: auto;">
          <div class="card-body">
            <h5 class="card-title">Donor Name : ${donor.name}</h5>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">Donor Email : ${donor.email}</li>
            <li class="list-group-item">Blood Group : ${donor.bloodGroup}</li>
            <li class="list-group-item">Number : ${donor.contact}</li> 
            <li class="list-group-item">Address : ${donor.address}</li> 
          </ul>
        </div>
      `;
    });

    // Construct the complete HTML response
    const htmlResponse = `
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body>
        <div class="mt-5">
          <div class="container mt-5">
          <div>
          <h1 class="text-center" style="font-size: 4rem; color:#8C1C13;">Donors List</h1>
      </div>
  
            <div class="row">
              ${donorCardsHTML}
            </div>
          </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
      </body>
      </html>
    `;

    // Send the HTML response
    res.send(htmlResponse);
  } catch (error) {
    console.error("Error fetching donor data:", error);
    res.status(500).send('Error fetching donor information. Please try again later.');
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
