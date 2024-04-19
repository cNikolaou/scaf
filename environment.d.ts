import { SchemaName } from './src/account';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            SEED: string;
            SCHEMA: SchemaName;
        }
    }
}
