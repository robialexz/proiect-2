// Script pentru monitorizarea performanței în timp real
console.log('Începe monitorizarea performanței în timp real...');

// Clasa pentru monitorizarea performanței
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: [],
      memory: [],
      responseTime: [],
      events: []
    };
    
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.currentFps = 0;
    
    this.lastResponseTime = performance.now();
    this.freezeThreshold = 500; // ms
    this.freezeCount = 0;
    
    this.isRunning = false;
  }
  
  // Începe monitorizarea
  start() {
    if (this.isRunning) return;
    
    console.log('Începe monitorizarea performanței...');
    this.isRunning = true;
    
    // Monitorizăm rata de cadre (FPS)
    this.fpsMonitorId = requestAnimationFrame(this.updateFps.bind(this));
    
    // Monitorizăm memoria la fiecare 5 secunde
    this.memoryMonitorId = setInterval(this.updateMemory.bind(this), 5000);
    
    // Monitorizăm timpul de răspuns la fiecare 100ms
    this.responseMonitorId = setInterval(this.updateResponseTime.bind(this), 100);
    
    // Monitorizăm evenimentele de interacțiune
    this.setupEventListeners();
  }
  
  // Oprește monitorizarea
  stop() {
    if (!this.isRunning) return;
    
    console.log('Oprește monitorizarea performanței...');
    this.isRunning = false;
    
    cancelAnimationFrame(this.fpsMonitorId);
    clearInterval(this.memoryMonitorId);
    clearInterval(this.responseMonitorId);
    
    this.removeEventListeners();
  }
  
  // Actualizează rata de cadre (FPS)
  updateFps(timestamp) {
    this.frameCount++;
    
    // Actualizăm FPS la fiecare secundă
    if (timestamp - this.lastFpsUpdate >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
      
      this.metrics.fps.push({
        time: timestamp,
        value: this.currentFps
      });
      
      // Limităm numărul de măsurători stocate
      if (this.metrics.fps.length > 100) {
        this.metrics.fps.shift();
      }
      
      // Detectăm probleme de performanță
      if (this.currentFps < 30) {
        console.log(`AVERTISMENT: FPS scăzut detectat: ${this.currentFps}`);
        
        this.metrics.events.push({
          time: timestamp,
          type: 'low-fps',
          value: this.currentFps,
          message: `FPS scăzut detectat: ${this.currentFps}`
        });
      }
      
      this.lastFpsUpdate = timestamp;
      this.frameCount = 0;
    }
    
    // Continuăm monitorizarea
    if (this.isRunning) {
      this.fpsMonitorId = requestAnimationFrame(this.updateFps.bind(this));
    }
  }
  
  // Actualizează măsurătorile de memorie
  updateMemory() {
    if (!window.performance || !window.performance.memory) {
      return;
    }
    
    const memoryInfo = window.performance.memory;
    const timestamp = performance.now();
    
    const usedMemory = memoryInfo.usedJSHeapSize / (1024 * 1024); // MB
    const totalMemory = memoryInfo.totalJSHeapSize / (1024 * 1024); // MB
    const limitMemory = memoryInfo.jsHeapSizeLimit / (1024 * 1024); // MB
    
    this.metrics.memory.push({
      time: timestamp,
      used: usedMemory,
      total: totalMemory,
      limit: limitMemory
    });
    
    // Limităm numărul de măsurători stocate
    if (this.metrics.memory.length > 100) {
      this.metrics.memory.shift();
    }
    
    // Detectăm probleme de memorie
    if (this.metrics.memory.length > 1) {
      const previousMeasurement = this.metrics.memory[this.metrics.memory.length - 2];
      const memoryIncrease = usedMemory - previousMeasurement.used;
      
      if (memoryIncrease > 5) { // 5MB
        console.log(`AVERTISMENT: Creștere semnificativă de memorie detectată: +${memoryIncrease.toFixed(2)}MB`);
        
        this.metrics.events.push({
          time: timestamp,
          type: 'memory-increase',
          value: memoryIncrease,
          message: `Creștere semnificativă de memorie detectată: +${memoryIncrease.toFixed(2)}MB`
        });
      }
      
      // Verificăm dacă ne apropiem de limita de memorie
      const memoryUsagePercent = (usedMemory / limitMemory) * 100;
      
      if (memoryUsagePercent > 80) {
        console.log(`AVERTISMENT: Utilizare ridicată a memoriei: ${memoryUsagePercent.toFixed(2)}%`);
        
        this.metrics.events.push({
          time: timestamp,
          type: 'high-memory-usage',
          value: memoryUsagePercent,
          message: `Utilizare ridicată a memoriei: ${memoryUsagePercent.toFixed(2)}%`
        });
      }
    }
  }
  
  // Actualizează timpul de răspuns
  updateResponseTime() {
    const now = performance.now();
    const responseTime = now - this.lastResponseTime;
    
    this.metrics.responseTime.push({
      time: now,
      value: responseTime
    });
    
    // Limităm numărul de măsurători stocate
    if (this.metrics.responseTime.length > 100) {
      this.metrics.responseTime.shift();
    }
    
    // Detectăm înghețări ale aplicației
    if (responseTime > this.freezeThreshold) {
      console.log(`AVERTISMENT: Timp de răspuns ridicat detectat: ${responseTime.toFixed(2)}ms`);
      
      this.freezeCount++;
      
      this.metrics.events.push({
        time: now,
        type: 'freeze',
        value: responseTime,
        message: `Timp de răspuns ridicat detectat: ${responseTime.toFixed(2)}ms`
      });
    }
    
    this.lastResponseTime = now;
  }
  
  // Configurează listenerii de evenimente
  setupEventListeners() {
    this.eventHandler = this.handleEvent.bind(this);
    
    // Monitorizăm evenimentele de interacțiune
    document.addEventListener('click', this.eventHandler);
    document.addEventListener('input', this.eventHandler);
    document.addEventListener('keydown', this.eventHandler);
    document.addEventListener('mousemove', this.eventHandler);
    document.addEventListener('scroll', this.eventHandler);
  }
  
  // Elimină listenerii de evenimente
  removeEventListeners() {
    document.removeEventListener('click', this.eventHandler);
    document.removeEventListener('input', this.eventHandler);
    document.removeEventListener('keydown', this.eventHandler);
    document.removeEventListener('mousemove', this.eventHandler);
    document.removeEventListener('scroll', this.eventHandler);
  }
  
  // Gestionează evenimentele de interacțiune
  handleEvent(event) {
    const timestamp = performance.now();
    const startTime = timestamp;
    
    // Măsurăm timpul de procesare a evenimentului
    setTimeout(() => {
      const processingTime = performance.now() - startTime;
      
      // Detectăm evenimente care durează prea mult
      if (processingTime > 50) { // 50ms
        console.log(`AVERTISMENT: Procesare lentă a evenimentului ${event.type}: ${processingTime.toFixed(2)}ms`);
        
        this.metrics.events.push({
          time: timestamp,
          type: 'slow-event',
          value: processingTime,
          message: `Procesare lentă a evenimentului ${event.type}: ${processingTime.toFixed(2)}ms`
        });
      }
    }, 0);
  }
  
  // Generează un raport de performanță
  generateReport() {
    console.log('Generează raport de performanță...');
    
    // Calculăm statistici pentru FPS
    const fpsValues = this.metrics.fps.map(item => item.value);
    const avgFps = fpsValues.length > 0 ? fpsValues.reduce((sum, value) => sum + value, 0) / fpsValues.length : 0;
    const minFps = fpsValues.length > 0 ? Math.min(...fpsValues) : 0;
    
    // Calculăm statistici pentru memorie
    const memoryUsed = this.metrics.memory.map(item => item.used);
    const avgMemory = memoryUsed.length > 0 ? memoryUsed.reduce((sum, value) => sum + value, 0) / memoryUsed.length : 0;
    const maxMemory = memoryUsed.length > 0 ? Math.max(...memoryUsed) : 0;
    
    // Calculăm statistici pentru timpul de răspuns
    const responseValues = this.metrics.responseTime.map(item => item.value);
    const avgResponse = responseValues.length > 0 ? responseValues.reduce((sum, value) => sum + value, 0) / responseValues.length : 0;
    const maxResponse = responseValues.length > 0 ? Math.max(...responseValues) : 0;
    
    // Calculăm creșterea de memorie
    let memoryGrowth = 0;
    if (this.metrics.memory.length >= 2) {
      const firstMemory = this.metrics.memory[0].used;
      const lastMemory = this.metrics.memory[this.metrics.memory.length - 1].used;
      memoryGrowth = lastMemory - firstMemory;
    }
    
    // Generăm raportul
    const report = {
      timestamp: new Date().toISOString(),
      duration: (performance.now() / 1000).toFixed(2) + 's',
      fps: {
        average: avgFps.toFixed(2),
        minimum: minFps,
        issues: this.metrics.events.filter(event => event.type === 'low-fps').length
      },
      memory: {
        average: avgMemory.toFixed(2) + 'MB',
        maximum: maxMemory.toFixed(2) + 'MB',
        growth: memoryGrowth.toFixed(2) + 'MB',
        issues: this.metrics.events.filter(event => event.type === 'memory-increase' || event.type === 'high-memory-usage').length
      },
      response: {
        average: avgResponse.toFixed(2) + 'ms',
        maximum: maxResponse.toFixed(2) + 'ms',
        freezes: this.freezeCount
      },
      events: {
        total: this.metrics.events.length,
        types: {
          'low-fps': this.metrics.events.filter(event => event.type === 'low-fps').length,
          'memory-increase': this.metrics.events.filter(event => event.type === 'memory-increase').length,
          'high-memory-usage': this.metrics.events.filter(event => event.type === 'high-memory-usage').length,
          'freeze': this.metrics.events.filter(event => event.type === 'freeze').length,
          'slow-event': this.metrics.events.filter(event => event.type === 'slow-event').length
        }
      }
    };
    
    console.log('Raport de performanță:', report);
    
    // Evaluăm performanța generală
    let performanceRating = 'Excelentă';
    let issues = [];
    
    if (avgFps < 30) {
      performanceRating = 'Slabă';
      issues.push('FPS scăzut');
    } else if (avgFps < 50) {
      performanceRating = 'Medie';
      issues.push('FPS sub optim');
    }
    
    if (memoryGrowth > 50) {
      performanceRating = 'Slabă';
      issues.push('Creștere semnificativă de memorie');
    } else if (memoryGrowth > 20) {
      if (performanceRating === 'Excelentă') performanceRating = 'Bună';
      issues.push('Creștere moderată de memorie');
    }
    
    if (this.freezeCount > 5) {
      performanceRating = 'Slabă';
      issues.push('Înghețări frecvente');
    } else if (this.freezeCount > 0) {
      if (performanceRating === 'Excelentă') performanceRating = 'Bună';
      issues.push('Înghețări ocazionale');
    }
    
    if (avgResponse > 100) {
      if (performanceRating === 'Excelentă') performanceRating = 'Bună';
      issues.push('Timp de răspuns ridicat');
    }
    
    report.evaluation = {
      rating: performanceRating,
      issues: issues
    };
    
    console.log(`Evaluare performanță: ${performanceRating}`);
    if (issues.length > 0) {
      console.log('Probleme identificate:', issues.join(', '));
    } else {
      console.log('Nu s-au identificat probleme de performanță.');
    }
    
    return report;
  }
}

// Creăm și pornim monitorul de performanță
const performanceMonitor = new PerformanceMonitor();
performanceMonitor.start();

// Oprim monitorul și generăm raportul după 5 minute
setTimeout(() => {
  const report = performanceMonitor.generateReport();
  performanceMonitor.stop();
  
  // Afișăm un rezumat al raportului
  console.log('Rezumat raport de performanță:');
  console.log(`- Durată test: ${report.duration}`);
  console.log(`- FPS mediu: ${report.fps.average}`);
  console.log(`- Memorie medie: ${report.memory.average}`);
  console.log(`- Creștere memorie: ${report.memory.growth}`);
  console.log(`- Timp de răspuns mediu: ${report.response.average}`);
  console.log(`- Înghețări detectate: ${report.response.freezes}`);
  console.log(`- Evaluare generală: ${report.evaluation.rating}`);
  
  if (report.evaluation.issues.length > 0) {
    console.log(`- Probleme identificate: ${report.evaluation.issues.join(', ')}`);
  } else {
    console.log('- Nu s-au identificat probleme de performanță.');
  }
}, 5 * 60 * 1000); // 5 minute
