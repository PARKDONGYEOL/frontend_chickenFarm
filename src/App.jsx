import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from './layout/Login'
import Security from './page/Security'
import PoultryFarmManagement from './page/PoultryFarmManagement'
import DailyInformation from './page/DailyInformation'
import WeeklyInformation from './page/WeeklyInformation'
import ChickenManagement from './page/ChickenManagement'
import Home from './page/Home'


function App() {

   return (
    <Routes>
      <Route path='/' element={<Login />} />

      <Route path='home' element={<Home />} >
        <Route path='pfm' element={<PoultryFarmManagement />} />
        <Route path='daily' element={<DailyInformation />} />
        <Route path='weekly' element={<WeeklyInformation />} />
        <Route path='chickenmanagement' element={<ChickenManagement />} />
      </Route>

    </Routes>
  )
}
export default App
