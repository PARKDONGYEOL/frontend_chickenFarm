import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from './layout/Login'
import DailyInformation from './page/DailyInformation'
import WeeklyInformation from './page/WeeklyInformation'
import Home from './page/Home'
import RealTimeMonitoring from './page/RealTimeMonitoring'
import TrendAnalysis from './page/TrendAnalysis'
import EnvDashboard from './page/EnvDashboard'
import ChickenManagement from './page/ChickenManagement'
import Settings from './page/Settings'
import ChickenInoculation from './page/ChickenInoculation'
import ChickenInoculationList from './page/ChickenInoculationList'
import ChickenInoculationSchedule from './page/ChickenInoculationSchedule'


function App() {

   return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/settings' element={<Settings />} />

      <Route path='home' element={<Home />} >
        <Route path='real' element={<RealTimeMonitoring />} />
        <Route path='env' element={<EnvDashboard/>}/>
        <Route path='trend' element={<TrendAnalysis/>}/>
        <Route path='daily' element={<DailyInformation />} />
        <Route path='weekly' element={<WeeklyInformation />} />
        <Route path='chickenmanagement' element={<ChickenManagement />} />
        <Route path='inoculation' element={<ChickenInoculation />} />
        <Route path='inoculation-list' element={<ChickenInoculationList />} />
        <Route path='inoculation-schedule' element={<ChickenInoculationSchedule />} />
      </Route>

    </Routes>
  )
}
export default App
