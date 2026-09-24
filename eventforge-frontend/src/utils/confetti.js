import confetti from 'canvas-confetti';

export const fireConfetti = () => {
  const colors = ['#6C4CF1', '#FF7A3D', '#17C3A2'];
  confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, colors, startVelocity: 38 });
  setTimeout(() => confetti({ particleCount: 40, spread: 100, origin: { y: 0.5 }, colors, scalar: 0.8 }), 180);
};
