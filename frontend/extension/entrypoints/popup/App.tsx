import { useState } from 'react'
import './App.css'

function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <div>
                <h1>My Job Notifier</h1>
            </div>
            <h1>WXT + React</h1>
            <div className="card">
                <button type="button" onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
            </div>
        </>
    )
}

export default App
