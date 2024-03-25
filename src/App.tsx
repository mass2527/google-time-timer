import { useCallback, useEffect, useRef, useState } from "react";
import CountDownTimer from "./CountDownTimer";
import SpeakerLoudIcon from "./SpeakerLoudIcon";
import SpeakerOffIcon from "./SpeakerOffIcon";

function App() {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const requestIdRef = useRef(-1);
  const isChangingTimerDurationRef = useRef(false);
  const prevAngleInDegrees = useRef<number>();
  const [audioRef] = useState(() => ({
    current: new Audio("/default-alarm.mp3"),
  }));
  const svgElementRef = useRef<SVGSVGElement>(null);
  const [isSpeakerActive, setIsSpeakerActive] = useState(true);
  const startTimeStampRef = useRef(-1);
  const startRemainingSecondsRef = useRef(-1);
  const [isTimerActive, setIsTimerActive] = useState(true);

  useEffect(() => {
    const audioElement = audioRef.current;
    audioElement.volume = isSpeakerActive ? 1 : 0;
  }, [isSpeakerActive, audioRef]);

  const updateTime = useCallback(
    (timestamp: number) => {
      if (startTimeStampRef.current === -1) {
        startTimeStampRef.current = timestamp;
      }

      const elapsedSeconds = (timestamp - startTimeStampRef.current) / 1000;
      const nextRemainMinutes =
        startRemainingSecondsRef.current - elapsedSeconds;
      if (nextRemainMinutes <= 0) {
        audioRef.current.play();
        cancelAnimationFrame(requestIdRef.current);
        startTimeStampRef.current = -1;
        setRemainingSeconds(0);
        return;
      }

      setRemainingSeconds(nextRemainMinutes);
      requestIdRef.current = requestAnimationFrame(updateTime);
    },
    [audioRef]
  );

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
        if (requestIdRef.current !== -1) {
          cancelAnimationFrame(requestIdRef.current);
        }

        requestIdRef.current = requestAnimationFrame(updateTime);

        if (
          typeof prevAngleInDegrees.current !== "undefined" &&
          prevAngleInDegrees.current >= 0 &&
          prevAngleInDegrees.current < 90 &&
          angleInDegrees < 0 &&
          angleInDegrees > -90
        ) {
          setRemainingSeconds(0);
          startRemainingSecondsRef.current = -1;
          isChangingTimerDurationRef.current = false;
          cancelAnimationFrame(requestIdRef.current);
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
          startRemainingSecondsRef.current = 3600;
          isChangingTimerDurationRef.current = false;
          return;
        }

        prevAngleInDegrees.current = angleInDegrees;
        setRemainingSeconds(nextRemainingSeconds);
        startRemainingSecondsRef.current = nextRemainingSeconds;
      }
    }
    window.addEventListener("mousemove", changeTimerDuration);
    window.addEventListener("touchmove", changeTimerDuration);
    return () => {
      window.removeEventListener("mousemove", changeTimerDuration);
      window.removeEventListener("touchmove", changeTimerDuration);
    };
  }, [isSpeakerActive, audioRef, updateTime]);

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

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setIsSpeakerActive((prevIsSpeakerOn) => !prevIsSpeakerOn)
            }
            aria-label={
              isSpeakerActive ? "Turn off the speaker" : "Turn on the speaker"
            }
          >
            {isSpeakerActive ? (
              <SpeakerLoudIcon className="size-6" />
            ) : (
              <SpeakerOffIcon className="size-6" />
            )}
          </button>

          <button
            onClick={() => {
              if (isTimerActive) {
                cancelAnimationFrame(requestIdRef.current);
                startTimeStampRef.current = -1;
                startRemainingSecondsRef.current = remainingSeconds;
                setIsTimerActive(false);
                alert(
                  "Timer Paused: The countdown has been paused. Click 'Resume' to continue."
                );
              } else {
                requestIdRef.current = requestAnimationFrame(updateTime);
                setIsTimerActive(true);
                alert(
                  "Timer Resumed: The countdown has been resumed. Time is ticking!"
                );
              }
            }}
            type="button"
            style={{
              opacity: remainingSeconds === 0 ? 0 : 1,
            }}
            disabled={remainingSeconds == 0}
          >
            {isTimerActive ? "Pause" : "Resume"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
