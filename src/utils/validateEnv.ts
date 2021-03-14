import { cleanEnv, port, str } from 'envalid'

function validateEnv() {
    cleanEnv(process.env, {
        MONGO_URI: str(),
        PORT: port(),
    })
}

export default validateEnv