import { DatabaseEntity } from "@mds-coding/database-entity";
import { Db, Document, MongoClient } from "mongodb";

export class DatabaseMongo {
  client: MongoClient;
  database: Db;

  constructor(connectionString: string, databaseName: string) {
    this.client = new MongoClient(connectionString);
    this.database = this.client.db(databaseName);
  }

  async disconnect() {
    return this.client.close()
  }

  async insert<T extends Document>(entity: DatabaseEntity<T>) {
    const collection = this.database.collection(entity.collection);
    await collection.insertOne({ id: entity.id, ...entity.data });
    return entity;
  }

  async findById<T>(collectionName: string, id: string) {
    const collection = this.database.collection(collectionName);
    const document = await collection.findOne({ id: id });

    if (!document) {
      throw new Error(`Document ${id} not found id collection ${collectionName}`)
    }

    console.log({ document })
    return new DatabaseEntity<T>(id, collectionName, document as T);
  }
}
