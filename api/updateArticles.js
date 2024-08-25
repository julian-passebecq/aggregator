const { MongoClient, ObjectId } = require('mongodb');

export default async function handler(req, res) {
  const MONGO_URI = process.env.MONGO_URI;

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  try {
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const collection = client.db("blue-sitemaps").collection("data");

    const { body } = req;
    if (!body) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    const { newState } = JSON.parse(body);
    const id = req.url.split('/').pop();
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const updateResult = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { state: newState } }
    );

    await client.close();

    return res.status(updateResult.matchedCount === 0 ? 404 : 200).json({ modifiedCount: updateResult.modifiedCount });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}
