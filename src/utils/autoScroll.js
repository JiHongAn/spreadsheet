export function autoScroll(element, duration = 30000, distance = 15000) {
    const start = element.scrollTop;
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        element.scrollTop = start + distance * progress;

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            const endTime = performance.now();
            console.log('자동 스크롤 완료');
            console.log(`총 소요 시간: ${((endTime - startTime) / 1000).toFixed(2)}초`);
            console.log(`총 스크롤 거리: ${distance}px`);
            console.log(`평균 스크롤 속도: ${(distance / duration * 1000).toFixed(2)}px/s`);
        }
    }

    requestAnimationFrame(step);
} 