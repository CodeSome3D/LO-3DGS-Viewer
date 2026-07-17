export class EventBus {

    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {

        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        this.listeners.get(event).push(callback);
    }

    off(event, callback) {

        const list = this.listeners.get(event);

        if (!list) {
            return;
        }

        const index = list.indexOf(callback);

        if (index !== -1) {
            list.splice(index, 1);
        }
    }

    emit(event, ...args) {

        const list = this.listeners.get(event);

        if (!list) {
            return;
        }

        for (const callback of list) {
            callback(...args);
        }
    }

}