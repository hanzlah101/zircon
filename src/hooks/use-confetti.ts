import confetti from "canvas-confetti";
import { useCallback, useEffect } from "react";
import { parseAsBoolean, useQueryState } from "nuqs";

export function useConfetti() {
  const [isSuccess, setIsSuccess] = useQueryState("success", parseAsBoolean);

  const triggerConfetti = useCallback(() => {
    const end = Date.now() + 3 * 1000;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    function frame() {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    }

    frame();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      triggerConfetti();
      setIsSuccess(null);
    }
  }, [triggerConfetti, isSuccess, setIsSuccess]);
}
