import { DatabaseEntity } from "@mds-coding/database-entity";
import { MongoDBContainer } from "@testcontainers/mongodb";
import { DatabaseMongo } from "./index.js";
import { DatabaseQuery } from "@mds-coding/database-query";
import { DatabaseCriteria } from "@mds-coding/database-criteria";

type Cat = { id: string, name: string, age: number, cute: boolean };

test("`DatabaseMongo` can insert and findById", async () => {
  const container = await new MongoDBContainer().start();
  const database = new DatabaseMongo(`${container.getConnectionString()}?directConnection=true`, "database");
  try {
    await database.connect();

    // Insert 1
    await database.insert(new DatabaseEntity<Cat>("plume", "cats", { id: "plume", name: "Plume", age: 5, cute: false }));
    // Insert 2
    await database.insert(new DatabaseEntity<Cat>("scratchy", "cats", { id: "scratchy", name: "Scratchy", age: 10, cute: false }));

    // Find all
    const document = await database.findMany<Cat>(new DatabaseQuery("cats", []));
    expect(document).toBeDefined();
    expect(document.length).toBe(2);

    // Find all Plume
    const documentPlume = await database.findMany<Cat>(new DatabaseQuery("cats", [ new DatabaseCriteria<Cat, "name">("name", 'EQ', 'Plume')]));
    expect(documentPlume).toBeDefined();
    expect(documentPlume.length).toBe(1);
    expect(documentPlume[0].age).toBe(5);

    // Update many
    await database.updateMany<Cat>(new DatabaseQuery("cats", []), { cute: true });

    // Find one scratchy
    const scratchyOne = await database.findOne<Cat>(new DatabaseQuery("cats", [ new DatabaseCriteria<Cat, "name">("name", 'EQ', 'Scratchy')]));
    expect(scratchyOne).toBeDefined();
    expect(scratchyOne.age).toBe(10);
    expect(scratchyOne.cute).toBe(true);
  } finally {
    await database.disconnect();
    await container.stop();
  }
}, 60000)
