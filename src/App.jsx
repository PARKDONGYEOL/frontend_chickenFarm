import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import UserLayout from './layout/UserLayout'

function App() {

  return (
    <>
      <Routes>
        
        <Route path='/' element={<UserLayout/>}/>


      </Routes>
    </>
  )
}

export default App
