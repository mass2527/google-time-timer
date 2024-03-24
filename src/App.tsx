import { useEffect, useRef, useState } from "react";

const HOUR_IN_SECONDS = 60 * 60;

function App() {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalIdRef = useRef<number>();
  const isDraggingRef = useRef(false);
  const clockElementRef = useRef<HTMLDivElement>(null);
  const prevAngleInDegrees = useRef<number>();

  const remainingTimeRatio = remainingSeconds / HOUR_IN_SECONDS;

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (isDraggingRef.current) {
        const clockElement = clockElementRef.current;
        if (!clockElement) {
          throw new Error("");
        }
        const rect = clockElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const x = event.clientX - centerX;
        const y = centerY - event.clientY;
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
          isDraggingRef.current = false;
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
          isDraggingRef.current = false;
          return;
        }

        prevAngleInDegrees.current = angleInDegrees;
        setRemainingSeconds(nextRemainingSeconds);
      }
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    function handleMouseUp() {
      isDraggingRef.current = false;
    }
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        className="relative grid place-items-center"
        ref={clockElementRef}
        style={{
          width: "345px",
          height: "345px",
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
          className="bg-white"
          style={{
            width: "calc(100% - 14px)",
            height: "calc(100% - 14px)",
            borderRadius: "50%",
          }}
        ></div>

        <div
          className="bg-black z-20 absolute"
          style={{
            width: "10%",
            height: "10%",
            borderRadius: "50%",
          }}
        >
          <div
            className="absolute top-1/2 left-1/2 bg-black h-2 rounded-md"
            style={{
              width: "100%",
              transformOrigin: "left center",
              transform: `translateY(-50%) scaleX(-1) rotate(${
                270 + remainingTimeRatio * 360
              }deg)`,
            }}
          ></div>
          <button
            className="absolute top-1/2 left-1/2 h-10 z-30 cursor-pointer"
            type="button"
            style={{
              width: "500%",
              transformOrigin: "left center",
              transform: `translateY(-50%) scaleX(-1) rotate(${
                270 + remainingTimeRatio * 360
              }deg)`,
            }}
            onMouseDown={() => (isDraggingRef.current = true)}
          ></button>
        </div>

        <div
          className="z-10 absolute"
          style={{
            width: "calc(100% - 14px)",
            height: "calc(100% - 14px)",
            borderRadius: "50%",
            backgroundColor: "#e31936",
            transform: "scaleX(-1)",

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
