import { DatabaseCriteria } from "@mds-coding/database-criteria";
import { DatabaseEntity } from "@mds-coding/database-entity";
import { DatabaseProviderAbstract } from "@mds-coding/database-provider-abstract";
import { DatabaseQuery } from "@mds-coding/database-query";
import { Db, MongoClient } from "mongodb";

export class DatabaseMongo extends DatabaseProviderAbstract {
  client: MongoClient = {} as MongoClient;
  database: Db = {} as Db;

  constructor(private connectionString: string, private databaseName: string) {
    super();
  }

  async connect(): Promise<void> {
    this.client = new MongoClient(this.connectionString);
    this.database = this.client.db(this.databaseName);
    this.client.connect
  }

  async disconnect() {
    return this.client.close()
  }

  async insert<T>(entity: DatabaseEntity<T>) {
    const collection = this.database.collection(entity.collection);
    await collection.insertOne({ id: entity.id, ...entity.data });
    return entity.data;
  }

  async updateOne<T>(query: DatabaseQuery<T>, fieldsToUpdate: Partial<T>): Promise<T> {
    const { collection: collectionName } = query;
    const collection = this.database.collection(collectionName);
    const finalQuery = query.criterias.map(criteriaToMongo).reduce((acc, current) => {
      return { ...acc, ...current }
    }, {});
    const document = await collection.updateOne(finalQuery, { $set: fieldsToUpdate });
    if (!document) {
      throw new Error(`No document found`)
    }
    return document as T;
  }

  async updateMany<T>(query: DatabaseQuery<T>, fieldsToUpdate: Partial<T>): Promise<T[]> {
    const { collection: collectionName } = query;
    const collection = this.database.collection(collectionName);
    const finalQuery = query.criterias.map(criteriaToMongo).reduce((acc, current) => {
      return { ...acc, ...current }
    }, {});
    const document = await collection.updateMany(finalQuery, { $set: fieldsToUpdate });
    if (!document) {
      throw new Error(`No document found`)
    }
    return [] as T[];
  }

  async findOne<T>(query: DatabaseQuery<T>): Promise<T> {
    const { collection: collectionName } = query;
    const collection = this.database.collection(collectionName);
    const finalQuery = query.criterias.map(criteriaToMongo).reduce((acc, current) => {
      return { ...acc, ...current }
    }, {});
    const document = await collection.findOne(finalQuery);
    if (!document) {
      throw new Error(`No document found`)
    }
    return document as T;
  }

  async findMany<T>(query: DatabaseQuery<T>): Promise<T[]> {
    const { collection: collectionName } = query;
    const collection = this.database.collection(collectionName);
    const finalQuery = query.criterias.map(criteriaToMongo).reduce((acc, current) => {
      return { ...acc, ...current }
    }, {});
    const document = await collection.find(finalQuery).toArray();
    if (!document) {
      throw new Error(`No documents found`)
    }
    return document as T[];
  }
}

function criteriaToMongo<T>(criteria: DatabaseCriteria<T>): Object {
  let value: any = criteria.value;
  switch (criteria.comparator) {
    case "LT":
      value = { $lt: criteria.value };
    case "LTE":
      value = { $lte: criteria.value };
    case "GT":
      value = { $gt: criteria.value };
    case "GTE":
      value = { $gte: criteria.value };
    case "EQ":
      value = criteria.value;
  }
  return { [criteria.field]: value }
}
