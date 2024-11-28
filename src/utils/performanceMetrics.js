export class PerformanceMetrics {
    static metrics = {
        memoryUsage: [],
        scrollMetrics: {
            renderTime: [],
            scrollSpeed: []
        },
        timeStamps: []
    };

    static startTracking() {
        this.metrics.startTime = performance.now();
        this.trackMemory();
        console.log('성능 측정 시작');
    }

    static trackMemory() {
        const measureMemory = () => {
            if ('memory' in performance) {
                // 현재 시간이 측정 시작 후 60초 이내인 경우에만 측정
                if (performance.now() - this.metrics.startTime < 60000) {
                    // @ts-ignore
                    const memory = performance.memory.usedJSHeapSize / (1024 * 1024);
                    this.metrics.memoryUsage.push({
                        timestamp: performance.now() - this.metrics.startTime,
                        value: memory
                    });
                    // 측정 간격을 2초로 늘림
                    setTimeout(measureMemory, 2000);
                }
            }
        };

        measureMemory();
    }

    static addScrollMetric(visibleCells, renderTime, scrollSpeed) {
        const now = performance.now();
        // 측정 간격을 100ms로 제한
        if (!this.lastMeasurement || now - this.lastMeasurement > 100) {
            const timestamp = now - this.metrics.startTime;
            this.metrics.scrollMetrics.renderTime.push({ timestamp, value: renderTime });
            this.metrics.scrollMetrics.scrollSpeed.push({ timestamp, value: scrollSpeed });
            this.lastMeasurement = now;
        }
    }

    static generateReport() {
        const calculateStats = (arr) => {
            if (!arr.length) return { min: 0, max: 0, avg: 0 };
            const values = arr.map(item => item.value);
            return {
                min: Math.min(...values),
                max: Math.max(...values),
                avg: values.reduce((a, b) => a + b, 0) / values.length
            };
        };

        const report = {
            "메모리 사용량 (MB)": calculateStats(this.metrics.memoryUsage),
            "스크롤 성능": {
                "평균 렌더링 시간 (ms)": calculateStats(this.metrics.scrollMetrics.renderTime),
                "평균 스크롤 속도 (px/s)": calculateStats(this.metrics.scrollMetrics.scrollSpeed)
            }
        };

        return report;
    }
} 