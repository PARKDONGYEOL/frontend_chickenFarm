import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const data = [
  { time: "10:00", temp: 25, humidity: 60 },
  { time: "11:00", temp: 26, humidity: 62 },
  { time: "12:00", temp: 28, humidity: 65 },
];

export default function Monitoring() {
  return (
    <div>
      <h2>환경 모니터링</h2>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="temp" stroke="#ff7300" name="온도(°C)" />
        <Line type="monotone" dataKey="humidity" stroke="#387908" name="습도(%)" />
      </LineChart>
    </div>
  );
}