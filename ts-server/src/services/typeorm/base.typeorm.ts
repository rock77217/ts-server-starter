import { DataSource, EntitySchema, EntityTarget, FindOneAndReplaceOption, MixedList, ObjectLiteral } from "typeorm";
import { MONGO_URI, MONGO_URI_SUFFIX } from "../../configs/settings";

export class BaseTypeorm {
  protected dbName: string;
  protected ds: DataSource;

  constructor(dbName: string, entities: MixedList<Function | string | EntitySchema>) {
    this.dbName = dbName;
    this.ds = new DataSource({
      type: "mongodb",
      url: MONGO_URI_SUFFIX ? `${MONGO_URI}/${dbName}${MONGO_URI_SUFFIX}` : `${MONGO_URI}/${dbName}`,
      synchronize: true,
      entities: entities,
    });

    this.ds
      .initialize()
      .then(() => {
        console.log("Data Source has been initialized!");
      })
      .catch((err) => {
        console.error("Error during Data Source initialization", err);
      });
  }
  
  protected async delete<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, key: ObjectLiteral = {}) {
    return await this.ds.getMongoRepository(entity).deleteMany(key);
  }

  protected async findOneAndUpdate<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, update: Object, key: ObjectLiteral = {}) {
    return await this.ds.getMongoRepository(entity).findOneAndUpdate(key, { $set: update }, { upsert: true, returnOriginal: false });
  }

  protected async findOne<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, key: ObjectLiteral = {}) {
    return await this.ds.getMongoRepository(entity).findOne(key);
  }

  protected async find<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>, key: ObjectLiteral = {}) {
    return await this.ds.getMongoRepository(entity).find(key);
  }
}
