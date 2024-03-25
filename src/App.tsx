import { useCallback, useEffect, useRef, useState } from "react";
import CountDownTimer from "./CountDownTimer";
import SpeakerLoudIcon from "./SpeakerLoudIcon";
import SpeakerOffIcon from "./SpeakerOffIcon";
import PlayIcon from "./PlayIcon";
import PauseIcon from "./PauseIcon";

function App() {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const requestIdRef = useRef(-1);
  const isChangingTimerDurationRef = useRef(false);
  const prevAngleInDegrees = useRef<number>();
  const [audioRef] = useState(() => ({
    current: new Audio("/default-alarm.mp3"),
  }));
  const svgElementRef = useRef<SVGSVGElement>(null);
  const [isSpeakerOn, setIsSpeakerOf] = useState(true);
  const startTimeStampRef = useRef(-1);
  const startRemainingSecondsRef = useRef(-1);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  useEffect(() => {
    const audioElement = audioRef.current;
    audioElement.volume = isSpeakerOn ? 1 : 0;
  }, [isSpeakerOn, audioRef]);

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
          startRemainingSecondsRef.current = -1;
          isChangingTimerDurationRef.current = false;
          cancelAnimationFrame(requestIdRef.current);
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
  }, [isSpeakerOn, audioRef, updateTime]);

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
              setIsSpeakerOf((prevIsSpeakerOn) => !prevIsSpeakerOn)
            }
            aria-label={
              isSpeakerOn ? "Turn off the speaker" : "Turn on the speaker"
            }
            className="border-black border rounded-full size-10 grid place-items-center"
          >
            {isSpeakerOn ? (
              <SpeakerLoudIcon className="size-4" />
            ) : (
              <SpeakerOffIcon className="size-4" />
            )}
          </button>

          {remainingSeconds !== 0 && (
            <button
              onClick={() => {
                if (isTimerPaused) {
                  requestIdRef.current = requestAnimationFrame(updateTime);
                  setIsTimerPaused(false);
                } else {
                  cancelAnimationFrame(requestIdRef.current);
                  startTimeStampRef.current = -1;
                  startRemainingSecondsRef.current = remainingSeconds;
                  setIsTimerPaused(true);
                }
              }}
              type="button"
              className="border-black border rounded-full size-10 grid place-items-center"
            >
              {isTimerPaused ? (
                <PlayIcon className="size-4" />
              ) : (
                <PauseIcon className="size-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
