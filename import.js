import Typesense from 'typesense';
import fs from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  let client = new Typesense.Client({
    nodes: [
      {
        host: process.env.TYPESENSE_HOST,
        port: process.env.TYPESENSE_PORT,
        protocol: 'https',
      },
    ],
    apiKey: process.env.TYPESENSE_APY_KEY,
    connectionTimeoutSeconds: 2,
  });

  const booksSchema = {
    name: 'books',
    fields: [
      { name: 'title', type: 'string' },
      { name: 'authors', type: 'string[]', facet: true },

      { name: 'publication_year', type: 'int32', facet: true },
      { name: 'ratings_count', type: 'int32' },
      { name: 'average_rating', type: 'float' },
    ],
    default_sorting_field: 'ratings_count',
  };
  await client.collections('books').delete();
  const data = await client.collections().create(booksSchema);

  const documents = await fs.readFile('./books.jsonl');

  client
    .collections('books')
    .documents()
    .import(documents, { batch_size: 100 });
}

main();
