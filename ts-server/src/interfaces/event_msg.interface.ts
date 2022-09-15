export enum dbOperate {
  update = "update",
  delete = "delete"
}

export interface EventMsg {
  dbName: string,
  modelName?: string,
  entityName?: string,
  modified?: any,
  operate?: dbOperate,
  extMsg?: any
}