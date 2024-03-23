import { useRef, useState } from "react";

const HOUR_IN_SECONDS = 60 * 60;

function App() {
  const [remainSeconds, setRemainSeconds] = useState(3600);
  const intervalIdRef = useRef<number>();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <input
        placeholder="minutes"
        value={remainSeconds}
        onChange={(event) => {
          const nextRemainSeconds = Number(event.target.value);

          if (nextRemainSeconds > 0) {
            if (typeof intervalIdRef.current === "number") {
              clearInterval(intervalIdRef.current);
            }

            intervalIdRef.current = setInterval(() => {
              setRemainSeconds((prevRemainSeconds) => {
                const nextRemainMinutes = prevRemainSeconds - 1;

                if (nextRemainMinutes === 0) {
                  clearInterval(intervalIdRef.current);
                }

                return nextRemainMinutes;
              });
            }, 1000);
          }

          setRemainSeconds(nextRemainSeconds);
        }}
      />
      <div
        className="relative grid place-items-center"
        style={{
          width: "400px",
          height: "400px",
          borderRadius: "50%",
        }}
      >
        {Array(30)
          .fill(null)
          .map((_, i) => {
            const height = i % 5 === 0 ? 4 : 1;
            return (
              <div
                key={i}
                className="absolute bg-black"
                style={{
                  top: `calc(50% - ${height}px / 2)`,
                  height: `${height}px`,
                  border: "1px solid black",
                  transform: `rotate(${6 * i}deg)`,
                  width: `calc(100% + ${i % 5 === 0 ? 14 : 0}px)`,
                }}
              ></div>
            );
          })}
        <div
          className="bg-white z-10"
          style={{
            width: "calc(100% - 14px)",
            height: "calc(100% - 14px)",
            borderRadius: "50%",
          }}
        ></div>

        <div
          className="z-10 absolute"
          style={{
            width: "calc(100% - 14px)",
            height: "calc(100% - 14px)",
            borderRadius: "50%",
            backgroundColor: "#e31936",
            transform: "scaleX(-1)",

            backgroundImage:
              remainSeconds <= HOUR_IN_SECONDS / 2
                ? `linear-gradient(${
                    90 + 360 * (remainSeconds / HOUR_IN_SECONDS)
                  }deg, transparent 50%, white 50%),
            linear-gradient(90deg, white 50%, transparent 50%)
            `
                : `linear-gradient(${
                    90 +
                    360 *
                      ((remainSeconds - HOUR_IN_SECONDS / 2) / HOUR_IN_SECONDS)
                  }deg, transparent 50%, #e31936 50%),
                linear-gradient(90deg, white 50%, transparent 50%)`,
          }}
        ></div>
        {Array(12)
          .fill(null)
          .map((_, i) => {
            const height = 10;

            return (
              <div
                key={i}
                className="absolute z-20 flex justify-end items-center"
                style={{
                  transform: `rotate(${270 + 30 * i}deg) translateX(50%)`,
                  top: `calc(50% - ${height}px / 2)`,
                  height: `${height}px`,
                  width: "calc(50% + 40px)",
                }}
              >
                <span
                  className="text-2xl font-semibold tracking-tight"
                  style={{
                    transform: `rotate(-${270 + 30 * i}deg)`,
                  }}
                >
                  {i === 0 ? 0 : 60 - 5 * i}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default App;
