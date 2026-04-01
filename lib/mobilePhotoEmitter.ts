import { EventEmitter } from "events";

// singleton emitter used to broadcast images uploaded from any client
const emitter = new EventEmitter();
export default emitter;