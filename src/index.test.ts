import { DatabaseEntity } from "@mds-coding/database-entity";
import { MongoDBContainer } from "@testcontainers/mongodb";
import { DatabaseMongo } from "./index.js";

test("`DatabaseMongo` can insert and findById", async () => {
  const container = await new MongoDBContainer().start();
  const database = new DatabaseMongo(`${container.getConnectionString()}?directConnection=true`, "database");
  try {
    await database.insert(new DatabaseEntity("123", "collection", { hello: "world" }));
    const document = await database.findById<{ id: string, hello: string }>("collection", "123");
    expect(document).toBeDefined();
    expect(document.id).toBe("123");
    expect(document.collection).toBe("collection");
    expect(document.data.id).toBe("123");
    expect(document.data.hello).toStrictEqual("world");
  } finally {
    await database.disconnect();
    await container.stop();
  }
}, 60000)
