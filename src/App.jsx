import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import UserLayout from './layout/UserLayout'
import Login from './layout/Login'
import Security from './page/Security'
import AdminLayout from './layout/AdminLayout'
import PoultryFarmManagement from './page/PoultryFarmManagement'
import DailyInformation from './page/DailyInformation'
import WeeklyInformation from './page/WeeklyInformation'


function App() {

   return (
    <Routes>
      <Route path='login' element={<Login />} />
      
      <Route path='/' element={<UserLayout />}>
        {/* 유저 페이지 라우팅 추가 가능 */}
      </Route>

      <Route path='/admin' element={<AdminLayout />}>
      
        <Route path='pfm' element={<PoultryFarmManagement/>} />

        <Route path='daily' element={<DailyInformation/>}/>

        <Route path='weekly' element={<WeeklyInformation/>}/>

      </Route>

    </Routes>
  )
}
export default App
