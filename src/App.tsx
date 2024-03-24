import { useEffect, useRef, useState } from "react";
import CountDownTimer from "./CountDownTimer";
import SpeakerLoudIcon from "./SpeakerLoudIcon";
import SpeakerOffIcon from "./SpeakerOffIcon";

function App() {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalIdRef = useRef<number>();
  const isChangingTimerDurationRef = useRef(false);
  const prevAngleInDegrees = useRef<number>();
  const [audioRef] = useState(() => ({
    current: new Audio("/default-alarm.mp3"),
  }));
  const svgElementRef = useRef<SVGSVGElement>(null);
  const [isSpeakerOn, setIsSpeakerOf] = useState(true);

  useEffect(() => {
    const audioElement = audioRef.current;
    audioElement.volume = isSpeakerOn ? 1 : 0;
  }, [isSpeakerOn, audioRef]);

  useEffect(() => {
    function changeTimerDuration(event: MouseEvent | TouchEvent) {
      if (isChangingTimerDurationRef.current) {
        const svgElement = svgElementRef.current;
        if (!svgElement) {
          throw new Error(
            "Please check if svgElementRef is correctly attached to the dom"
          );
        }

        const coords =
          event instanceof TouchEvent
            ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
            : { x: event.clientX, y: event.clientY };
        const rect = svgElement.getBoundingClientRect();
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
          isChangingTimerDurationRef.current = false;
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
          isChangingTimerDurationRef.current = false;
          return;
        }

        prevAngleInDegrees.current = angleInDegrees;
        setRemainingSeconds(nextRemainingSeconds);
      }
    }
    window.addEventListener("mousemove", changeTimerDuration);
    window.addEventListener("touchmove", changeTimerDuration);
    return () => {
      window.removeEventListener("mousemove", changeTimerDuration);
      window.removeEventListener("touchmove", changeTimerDuration);
    };
  }, [isSpeakerOn, audioRef]);

  useEffect(() => {
    function endChangingTimerDuration() {
      isChangingTimerDurationRef.current = false;
    }
    window.addEventListener("mouseup", endChangingTimerDuration);
    window.addEventListener("touchend", endChangingTimerDuration);
    return () => {
      window.removeEventListener("mouseup", endChangingTimerDuration);
      window.removeEventListener("touchend", endChangingTimerDuration);
    };
  }, []);

  return (
    <div className="min-h-screen grid place-items-center bg-[#E9ECF3]">
      <div className="flex flex-col items-center gap-10">
        <CountDownTimer
          ref={svgElementRef}
          remainingSeconds={remainingSeconds}
          onMouseDown={() => (isChangingTimerDurationRef.current = true)}
          onTouchStart={() => (isChangingTimerDurationRef.current = true)}
        />

        <button
          type="button"
          onClick={() => setIsSpeakerOf((prevIsSpeakerOn) => !prevIsSpeakerOn)}
          aria-label={
            isSpeakerOn ? "Turn off the speaker" : "Turn on the speaker"
          }
        >
          {isSpeakerOn ? (
            <SpeakerLoudIcon className="size-8" />
          ) : (
            <SpeakerOffIcon className="size-8" />
          )}
        </button>
      </div>
    </div>
  );
}

export default App;
