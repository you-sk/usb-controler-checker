class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    createBurst(x, y, color = '#00d4ff') {
        const burstCount = 30;
        
        for (let i = 0; i < burstCount; i++) {
            const angle = (Math.PI * 2 * i) / burstCount;
            const speed = Math.random() * 3 + 2;
            
            this.particles.push({
                x: x,
                y: y,
                size: Math.random() * 3 + 2,
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                opacity: 1,
                color: color,
                life: 60,
                isBurst: true
            });
        }
    }
    
    createTrail(x, y, color = '#00d4ff') {
        this.particles.push({
            x: x,
            y: y,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: 0.8,
            color: color,
            life: 30,
            isTrail: true
        });
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.isBurst || p.isTrail) {
                p.life--;
                p.opacity = p.life / (p.isBurst ? 60 : 30);
                
                if (p.isBurst) {
                    p.speedX *= 0.98;
                    p.speedY *= 0.98;
                    p.speedY += 0.1;
                }
                
                if (p.life <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }
            } else {
                if (p.x < 0) p.x = this.canvas.width;
                if (p.x > this.canvas.width) p.x = 0;
                if (p.y < 0) p.y = this.canvas.height;
                if (p.y > this.canvas.height) p.y = 0;
                
                const dx = this.mouseX - p.x;
                const dy = this.mouseY - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    p.speedX -= (dx / distance) * force * 0.05;
                    p.speedY -= (dy / distance) * force * 0.05;
                }
            }
        }
    }
    
    draw() {
        this.ctx.fillStyle = 'rgba(26, 26, 26, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color || `rgba(0, 212, 255, ${p.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

const particleSystem = new ParticleSystem();