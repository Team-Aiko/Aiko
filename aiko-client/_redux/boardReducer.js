const SAVE = 'DATA_SAVE';
const SELECT = 'DATA_SELECT';
const EDIT = 'DATA_EDIT';
const DELETE = 'DATA_DELETE';

const date = new Date();

export const dataSave = (inputData) => ({
    type: SAVE,
    inputData: {
        id: inputData.id,
        title: inputData.title,
        content: inputData.content,
        name: inputData.name,
        date: date.toLocaleString()
    }
});

export const selectRow = (id) => ({
    type: SELECT,
    inputData: {
        id: id,
    }
});

export const editContent = (inputData) => ({
    type: EDIT,
    inputData: {
        id: inputData.id,
        title: inputData.title,
        content:inputData.content,
        name: inputData.name,
        date: inputData.date
    }
});

export const removeContent = (id) => ({
    type: DELETE,
    inputData: {
        id : id
    }
});



const initialState = {
    lastId: 0,
    inputData: [
        {
            id:'',
            title:'',
            content:'',
            name:'',
            date: date.toLocaleString()
        }
    ],
    selectRowData: {}
};

export default function boardReducer(state = initialState, action) {
    switch(action.type) {
        case SAVE:
            return {
            lastId: state.lastId + 1,
            inputData: state.inputData.concat({
                ...action.inputData,
                id: state.lastId + 1,
            })
        }
        case SELECT:
            return {
                ...state,
                selectRowData: state.inputData.find(row => row.id === action.inputData.id)
            }
        case EDIT:
            return {
                ...state,
                inputData: state.inputData.map(row => row.id === action.inputData.id ?
                    {...action.inputData} : row
                    ),
                    selectRowData: {}
            }
        case DELETE:
            return {
                lastId: state.lastId === action.inputData.id ? state.lastId -1 : state.lastId,
                inputData: state.inputData.filter(row=>
                    row.id !== action.inputData.id
                    ),
                    selectRowData: {}
            }
        default:
            return state;
    }
};