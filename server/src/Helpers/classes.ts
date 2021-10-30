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

class NodeData<T> {
    data: T;
    next: NodeData<T>;

    constructor(data: T, next?: NodeData<T>) {
        this.data = data;
        this.next = next;
    }
}

export class LinkedList<T> {
    private head: NodeData<T> | undefined;
    private size: number;

    constructor() {
        this.head = undefined;
        this.size = 0;
    }

    insertLeft(data: T) {
        this.head = new NodeData(data, this.head);
        this.size += 1;

        return true;
    }

    insertRight(data: T) {
        const node = new NodeData(data);
        let current: NodeData<T>;

        if (!this.head) this.head = node;
        else {
            current = this.head;

            // fined undefined current.next
            while (current.next) {
                current = current.next;
            }

            current.next = node;
        }

        this.size += 1; // increase size

        return true;
    }

    insertAt(data: T, idx: number) {
        if (idx > 0 && idx > this.size) {
            return false;
        }

        if (idx === 0) {
            this.insertLeft(data);
            return true;
        }

        if (idx === this.size) {
            this.insertRight(data);
            return true;
        }

        const node = new NodeData(data);
        let current: NodeData<T>;
        let previous: NodeData<T>;
        let cnt = 0;

        // set current
        current = this.head;

        // find position
        while (cnt < idx) {
            previous = current;
            cnt += 1;
            current = current.next;
        }

        // re-linking
        node.next = current;
        previous.next = node;
    }

    getAt(idx: number) {
        let current = this.head;
        let cnt = 0;

        while (cnt < idx) {
            current = current.next;
            cnt += 1;
            if (cnt === idx) {
                return current.data;
            }
        }
    }

    removeAt(idx: number) {
        if (idx > 0 && idx > this.size) {
            return false;
        }

        let current = this.head;
        let previous: NodeData<T>;
        let cnt = 0;

        if (idx === 0) this.head = current.next;
        else {
            while (cnt < idx) {
                cnt += 1;
                previous = current;
                current = current.next;
            }

            previous.next = current.next;
        }

        this.size -= 1;

        return true;
    }

    forEach(callback: IIterableCallback<T>) {
        let item = this.head;
        let idx = 0;

        while (idx < this.size) {
            callback(item, idx, this);
            idx += 1;
            item = item.next;
        }
    }
}

interface IIterableCallback<T> {
    (curr: NodeData<T>, idx: number, self: LinkedList<T>): void;
}
