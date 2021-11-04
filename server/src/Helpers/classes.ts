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

export class Pagination {
    private _currentPage: number;
    private _pageGroupCnt: number;
    private _feedPerPage: number; // 페이지당 보이는 아티클, 피드 등의 데이터 수 === offset
    private _totPageCnt: number;
    private _totalFeedCnt: number; // 총 피드, 아티클의 수
    private _pageGroup: number[] = [];
    private _offset: number;

    constructor(currentPage: number, totalFeedCnt: number, feedPerPage = 10, pageGroupCnt = 5) {
        this._currentPage = currentPage;
        this._totalFeedCnt = totalFeedCnt;
        this._pageGroupCnt = pageGroupCnt;
        this._feedPerPage = feedPerPage;

        this._totPageCnt = Math.ceil(totalFeedCnt / feedPerPage);
        // const groupNum = Math.ceil(this._totPageCnt / pageGroupCnt);

        // page group generator
        const groupOffset = Math.floor(currentPage / pageGroupCnt);
        console.log('🚀 ~ file: classes.ts ~ line 34 ~ Pagination ~ constructor ~ groupOffset', groupOffset);
        const groupIndex = currentPage % pageGroupCnt; // 1 2 3 4 0
        console.log('🚀 ~ file: classes.ts ~ line 35 ~ Pagination ~ constructor ~ groupIndex', groupIndex);
        for (let i = 0; i < pageGroupCnt; i += 1) {
            this._pageGroup.push(groupIndex === 1 ? currentPage + i : currentPage - groupIndex + i + 1);
        }

        // set offset
        this._offset = (currentPage - 1) * feedPerPage;
    }

    get currentPage() {
        return this._currentPage;
    }

    get pageGroupCnt() {
        return this._pageGroupCnt;
    }

    get feedPerPage() {
        return this._feedPerPage;
    }

    get offset() {
        return this._offset;
    }

    get totalFeedCnt() {
        return this._totalFeedCnt;
    }

    get totPageCnt() {
        return this._totPageCnt;
    }

    test = () => {
        console.log('클래스 테스트 로그');
        console.log('🚀 ~ file: classes.ts ~ line 71 ~ Pagination ~ _pageGroupCnt', this._pageGroupCnt);
        console.log('🚀 ~ file: classes.ts ~ line 71 ~ Pagination ~ _currentPage', this._currentPage);
        console.log('🚀 ~ file: classes.ts ~ line 18 ~ Pagination ~ _feedPerPage', this._feedPerPage);
        console.log('🚀 ~ file: classes.ts ~ line 22 ~ Pagination ~ _pageGroup', this._pageGroup);
        console.log('🚀 ~ file: classes.ts ~ line 74 ~ Pagination ~ _offset', this._offset);
        console.log('🚀 ~ file: classes.ts ~ line 73 ~ Pagination ~ _totalFeedCnt', this._totalFeedCnt);
        console.log('🚀 ~ file: classes.ts ~ line 73 ~ Pagination ~ _totPageCnt', this._totPageCnt);
    };
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

    static transformToLinkedList<T>(list: T[]) {
        const linkedList: LinkedList<T> = new LinkedList();
        list.forEach((item) => {
            linkedList.insertRight(item);
        });

        return linkedList;
    }

    static transformToList<T>(linkedList: LinkedList<T>) {
        const list: T[] = [];

        linkedList.forEach((curr) => {
            list.push(curr.data);
        });

        return list;
    }
}

interface IIterableCallback<T> {
    (curr: NodeData<T>, idx: number, self: LinkedList<T>): void;
}
