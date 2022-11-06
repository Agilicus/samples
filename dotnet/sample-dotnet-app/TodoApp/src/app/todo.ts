export class Todo {
    id: number;
    name: string;
    isComplete: boolean;

    constructor(values: object = {}) {
        Object.assign(this, values);
    }
}
