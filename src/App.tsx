import { useCallback, useEffect, useRef, useState } from "react";
import CountDownTimer from "./CountDownTimer";
import SpeakerLoudIcon from "./SpeakerLoudIcon";
import SpeakerOffIcon from "./SpeakerOffIcon";

function App() {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const requestIdRef = useRef(-1);
  const isChangingTimerDurationRef = useRef(false);
  const prevAngleInDegreesRef = useRef<number>();
  const [audioRef] = useState(() => ({
    current: new Audio("/default-alarm.mp3"),
  }));
  const svgElementRef = useRef<SVGSVGElement>(null);
  const [isSpeakerActive, setIsSpeakerActive] = useState(true);
  const startTimeStampRef = useRef(-1);
  const startRemainingSecondsRef = useRef(-1);

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
      if (!isChangingTimerDurationRef.current) {
        return;
      }

      const svgElement = svgElementRef.current;
      if (!svgElement) {
        throw new Error("svgElementRef is not connected");
      }

      if (requestIdRef.current !== -1) {
        cancelAnimationFrame(requestIdRef.current);
      }
      requestIdRef.current = requestAnimationFrame(updateTime);

      const coords =
        event instanceof TouchEvent
          ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
          : { x: event.clientX, y: event.clientY };
      const rect = svgElement.getBoundingClientRect();
      const centerCoords = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      const dx = coords.x - centerCoords.x;
      const dy = centerCoords.y - coords.y;
      // To set the positive y-axis as 0 degrees, I subtracted π / 2.
      const angleInRadians = Math.atan2(dy, dx) - Math.PI / 2;
      const angleInDegrees = (angleInRadians * 180) / Math.PI;
      const hasReachedMinAngle =
        typeof prevAngleInDegreesRef.current !== "undefined" &&
        prevAngleInDegreesRef.current >= 0 &&
        prevAngleInDegreesRef.current < 90 &&
        angleInDegrees < 0 &&
        angleInDegrees > -90;
      if (hasReachedMinAngle) {
        setRemainingSeconds(0);
        startRemainingSecondsRef.current = -1;
        isChangingTimerDurationRef.current = false;
        cancelAnimationFrame(requestIdRef.current);
        return;
      }

      const hasReachedMaxAngle =
        typeof prevAngleInDegreesRef.current !== "undefined" &&
        prevAngleInDegreesRef.current < 0 &&
        prevAngleInDegreesRef.current > -90 &&
        angleInDegrees >= 0 &&
        angleInDegrees < 90;
      if (hasReachedMaxAngle) {
        setRemainingSeconds(3600);
        startRemainingSecondsRef.current = 3600;
        isChangingTimerDurationRef.current = false;
        return;
      }

      const normalizedAngleInDegrees =
        angleInDegrees >= 0 ? angleInDegrees : angleInDegrees + 360;
      const nextRemainingSeconds = Math.round(
        3600 * (normalizedAngleInDegrees / 360)
      );
      prevAngleInDegreesRef.current = angleInDegrees;
      setRemainingSeconds(nextRemainingSeconds);
      startRemainingSecondsRef.current = nextRemainingSeconds;
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
      </div>
    </div>
  );
}

export default App;
