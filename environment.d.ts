import { SchemaStr } from "./src/account"

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            SEED: string
            SCHEMA: SchemaStr
        }
    }
}
