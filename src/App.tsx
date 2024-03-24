import { useEffect, useRef, useState } from "react";

const HOUR_IN_SECONDS = 60 * 60;

function App() {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalIdRef = useRef<number>();
  const isRotatingRef = useRef(false);
  const clockElementRef = useRef<HTMLDivElement>(null);
  const prevAngleInDegrees = useRef<number>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const remainingTimeRatio = remainingSeconds / HOUR_IN_SECONDS;

  useEffect(() => {
    function rotateTimer(event: MouseEvent | TouchEvent) {
      if (isRotatingRef.current) {
        const clockElement = clockElementRef.current;
        if (!clockElement) {
          throw new Error(
            "Please check if clockElementRef is correctly attached to the dom"
          );
        }

        const coords =
          event instanceof TouchEvent
            ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
            : { x: event.clientX, y: event.clientY };
        const rect = clockElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = coords.x - centerX;
        const y = centerY - coords.y;
        // To set the positive y-axis as 0 degrees, I subtracted π / 2.
        const angleInRadians = Math.atan2(y, x) - Math.PI / 2;

        const angleInDegrees = (angleInRadians * 180) / Math.PI;
        const normalizedAngleInDegrees =
          angleInDegrees >= 0 ? angleInDegrees : angleInDegrees + 360;

        const nextRemainingSeconds = Math.round(
          3600 * (normalizedAngleInDegrees / 360)
        );
        if (typeof intervalIdRef.current === "number") {
          clearInterval(intervalIdRef.current);
        }

        intervalIdRef.current = setInterval(() => {
          setRemainingSeconds((prevRemainingSeconds) => {
            const nextRemainMinutes = prevRemainingSeconds - 1;

            if (nextRemainMinutes === 0) {
              if (!audioRef.current) {
                audioRef.current = new Audio("/default-alarm.mp3");
              }
              audioRef.current.play();

              clearInterval(intervalIdRef.current);
            }

            return nextRemainMinutes;
          });
        }, 1000);

        if (
          typeof prevAngleInDegrees.current !== "undefined" &&
          prevAngleInDegrees.current >= 0 &&
          prevAngleInDegrees.current < 90 &&
          angleInDegrees < 0 &&
          angleInDegrees > -90
        ) {
          setRemainingSeconds(0);
          isRotatingRef.current = false;
          clearInterval(intervalIdRef.current);
          return;
        }

        if (
          typeof prevAngleInDegrees.current !== "undefined" &&
          prevAngleInDegrees.current < 0 &&
          prevAngleInDegrees.current > -90 &&
          angleInDegrees >= 0 &&
          angleInDegrees < 90
        ) {
          setRemainingSeconds(3600);
          isRotatingRef.current = false;
          return;
        }

        prevAngleInDegrees.current = angleInDegrees;
        setRemainingSeconds(nextRemainingSeconds);
      }
    }
    window.addEventListener("mousemove", rotateTimer);
    window.addEventListener("touchmove", rotateTimer);
    return () => {
      window.removeEventListener("mousemove", rotateTimer);
      window.removeEventListener("mousemove", rotateTimer);
    };
  }, []);

  useEffect(() => {
    function endRotateTimer() {
      isRotatingRef.current = false;
    }
    window.addEventListener("mouseup", endRotateTimer);
    window.addEventListener("touchend", endRotateTimer);
    return () => {
      window.removeEventListener("mouseup", endRotateTimer);
      window.removeEventListener("touchend", endRotateTimer);
    };
  }, []);

  return (
    <div className="min-h-screen grid place-items-center">
      <div
        className="relative grid place-items-center rounded-full w-[345px] h-[345px]"
        ref={clockElementRef}
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
        {/* <div
          className="bg-white rounded-full"
          style={{
            width: "calc(100% - 14px)",
            height: "calc(100% - 14px)",
          }}
        ></div> */}

        <div className="bg-black z-20 absolute rounded-full w-[10%] h-[10%]">
          <div
            className="absolute top-1/2 left-1/2 bg-black h-2 rounded-md w-full"
            style={{
              transformOrigin: "left center",
              transform: `translateY(-50%) scaleX(-1) rotate(${
                270 + remainingTimeRatio * 360
              }deg)`,
            }}
          ></div>
          <button
            className="absolute top-1/2 left-1/2 h-10 z-30 cursor-pointer w-[500%]"
            type="button"
            style={{
              transformOrigin: "left center",
              transform: `translateY(-50%) scaleX(-1) rotate(${
                270 + remainingTimeRatio * 360
              }deg)`,
            }}
            onMouseDown={() => (isRotatingRef.current = true)}
            onTouchStart={() => (isRotatingRef.current = true)}
          ></button>
        </div>

        <div
          className="z-10 absolute rounded-full -scale-x-100"
          style={{
            width: "calc(100% - 14px)",
            height: "calc(100% - 14px)",
            backgroundColor: "#e31936",

            backgroundImage:
              remainingSeconds <= HOUR_IN_SECONDS / 2
                ? `linear-gradient(${
                    90 + 360 * remainingTimeRatio
                  }deg, transparent 50%, white 50%),
            linear-gradient(90deg, white 50%, transparent 50%)
            `
                : `linear-gradient(${
                    90 +
                    360 *
                      ((remainingSeconds - HOUR_IN_SECONDS / 2) /
                        HOUR_IN_SECONDS)
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
                className="absolute flex justify-end items-center"
                style={{
                  transform: `rotate(${270 + 30 * i}deg) translateX(50%)`,
                  top: `calc(50% - ${height}px / 2)`,
                  height: `${height}px`,
                  width: "calc(50% + 40px)",
                }}
              >
                <span
                  className="text-2xl font-semibold tracking-tight select-none"
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
