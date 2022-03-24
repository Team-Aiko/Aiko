import { useState } from 'react';

export default function useInputCustom (initialValue) {
    const [value, setValue] = useState(initialValue)

    function handleChange (e) {
        setValue(e.target.value)
    }

    return { value, onChange: handleChange}
}
