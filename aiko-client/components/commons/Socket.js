import io from 'socket.io-client';

const STATUS_IO = io('http://localhost:5001/status', { withCredentials: true, autoConnect: false });
const PRIVATE_IO = io('http://localhost:5001/private-chat', { withCredentials: true, autoConnect: false });
const GROUP_IO = io('http://localhost:5001/group-chat', { withCredentials: true, autoConnect: false });

export { STATUS_IO, PRIVATE_IO, GROUP_IO };
