export class AikoError extends Error {
    description: string;
    stateCode: number;
    appCode: number;

    constructor(description: string, stateCode: number, appCode: number) {
        super();
        this.description = description;
        this.stateCode = stateCode;
        this.appCode = appCode;
    }
}
