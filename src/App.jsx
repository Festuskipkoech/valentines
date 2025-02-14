import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import MessageViewer from './MessageViewer'
// import Val from './val'
import LoveGenerator from './Love'
import Valentine from './Valentine.jsx'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <MessageViewer/> */}
      {/* <Val/> */}
      {/* <LoveGenerator/> */}
      <Valentine/>
    </>
  )
}

export default App
