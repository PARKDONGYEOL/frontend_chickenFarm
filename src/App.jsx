import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import UserLayout from './layout/UserLayout'
import Login from './layout/Login'
import VideoStream from './common/VideoStream'
import Security from './page/Security'


function App() {

  return (
    <>
      <Routes>
        
        <Route path='login' element={<Login/>}/>

        <Route path='/' element={<UserLayout/>}>
        
        </Route>


      </Routes>
    </>
  )
}

export default App
