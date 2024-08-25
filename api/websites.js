const { MongoClient } = require('mongodb');

export default async function handler(req, res) {
  const MONGO_URI = process.env.MONGO_URI;

  try {
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const collection = client.db("blue-sitemaps").collection("data");

    const params = req.query;
    let query = {};

    if (params.field) {
      query.field = params.field;
    }

    const websites = await collection.distinct('website', query);
    await client.close();

    res.status(200).json(websites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
