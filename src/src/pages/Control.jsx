import { useState } from "react";

export default function Control() {
  const [fan, setFan] = useState(false);
  const [light, setLight] = useState(false);

  return (
    <div>
      <h2>환경 제어</h2>
      <button onClick={() => setFan(!fan)}>
        {fan ? "환기팬 끄기" : "환기팬 켜기"}
      </button>
      <button onClick={() => setLight(!light)}>
        {light ? "조명 끄기" : "조명 켜기"}
      </button>
    </div>
  );
}