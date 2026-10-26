declare module 'express-mysql-session' {
  import { Store } from 'express-session';
  import { Pool } from 'mysql2/promise';

  interface Options {
    checkExpirationInterval?: number;
    expiration?: number;
    createDatabaseTable?: boolean;
    connectionLimit?: number;
    schema?: {
      tableName?: string;
      columnNames?: {
        session_id?: string;
        expires?: string;
        data?: string;
      };
    };
  }

  function MySQLStoreFactory(session: any): {
    new (options: Options, connection: any): Store;
  };

  export default MySQLStoreFactory;
}
