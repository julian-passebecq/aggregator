const { MongoClient } = require('mongodb');

export default async function handler(req, res) {
  const MONGO_URI = process.env.MONGO_URI;

  try {
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const collection = client.db("blue-sitemaps").collection("data");

    const params = req.query;
    let query = {};
    let sort = { lastmod: -1 }; // Default to newest first

    if (params.state && params.state !== '') {
      query.state = params.state;
    }
    if (params.curedName) {
      query['cured_name'] = { $regex: params.curedName, $options: 'i' };
    }
    if (params.field && params.field !== 'All Articles') {
      query.field = params.field;
    }
    if (params.website && params.website !== 'All') {
      const websites = params.website.split(',');
      query.website = { $in: websites };
    }
    if (params.curedKeyword) {
      const keywords = params.curedKeyword.split('|');
      query.$or = keywords.map(kw => ({ 'cured_name': { $regex: kw, $options: 'i' }}));
    }
    if (params.sortOrder === 'asc' || params.sortOrder === 'desc') {
      sort.lastmod = params.sortOrder === 'asc' ? 1 : -1;
    }

    const articles = await collection.find(query).sort(sort).toArray();
    await client.close();

    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
