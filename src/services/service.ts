export abstract class Service {
    abstract start(): Promise<void>;
    abstract stop(): Promise<void>;
}
