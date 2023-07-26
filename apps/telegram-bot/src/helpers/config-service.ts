import dotenv from 'dotenv';

class ConfigService {
    private _config;

    constructor() {
        const { error, parsed } = dotenv.config();

        if (error) {
            throw new Error(`ConfigService error -> ${error}`);
        }
        
        if (!parsed) {
            throw new Error('ConfigService -> .env file empty');
        }

        this._config = parsed;
    }

    get = (key: string) => {
        const valueFromProcess = process.env[key];

        if (valueFromProcess) {
            return valueFromProcess;
        }

        const valueFromEnvFile = this._config[key];

        if (!valueFromEnvFile) {
            throw new Error(`ConfigService -> value by key ${key} not found`);
        }

        return valueFromEnvFile;
    }
}

const configService = new ConfigService();

export { configService };
