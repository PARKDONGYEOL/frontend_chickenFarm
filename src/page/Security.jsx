import React, { useEffect, useState } from 'react'

const Security = () => {

  const[alarms, setAlarms] = useState([]);

  useEffect(() => {

    const fetchAlarms = async () => {
      const res = await fetch("http://192.168.30.71:8000/alarms");
      const data = await res.json();
      console.log(data);
      setAlarms(data);
    }

    fetchAlarms();
    const interval = setInterval(fetchAlarms, 2000); // 2초
    return () => clearInterval(interval);
  }, []);

  return (
    <div>Security</div>
  )
}

export default Security