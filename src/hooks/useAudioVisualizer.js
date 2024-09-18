export default function useAudioVisualizer(){  
  return function audioVisualizer(audioEle, canvas, width = 400, height = 400, color = 'rgba(255, 255, 255, 0.8)'){
    if(!audioEle ||!canvas) {
      return;
    }
    
    
    const ctx = canvas.getContext('2d');
    function initCanvas() {
      canvas.width = width;
      canvas.height = height;      
    }
    initCanvas();

    let isInit = false;
    let analyser;
    let dataArray;
    audioEle.addEventListener('play',() => {
        if(isInit) {
          return;
        }
        // 初始化
        const audioCtx = new (window.AudioContext || window?.webkitAudioContext)(); // 创建音频上下文
        const source = audioCtx.createMediaElementSource(audioEle); // 创建音频源
        analyser = audioCtx.createAnalyser(); // 创建分析器    
        const bufferLength = analyser.frequencyBinCount; // 获取频率分辨率
        dataArray = new Uint8Array(bufferLength); // 创建一个 Uint8Array 数组，用于存放频率数据

        analyser.fftSize = 2048; // 设置 FFT 大小,越大越精细,但计算量也越大，2的n次方
        source.connect(analyser); // 将音频源连接到分析器
        analyser.connect(audioCtx.destination); // 将分析器连接到音频上下文的输出
        
        isInit = true;
        console.log('初始化完成');
        
    })

    // 把分析器的数据绘制到 canvas 上
    function draw() {      
      requestAnimationFrame(draw);
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height); // 清空 canvas
      if(!isInit) {
        return;
      }      
      analyser.getByteFrequencyData(dataArray); // 让分析器把结果输出到dataArray中
      const len = Math.floor((dataArray.length * 3) / 4); // 舍弃高频部分数据   
      const r_max = width / 2; // 最大半径
      const r_fx = 60; // 半径修正
      const r = r_max - r_fx; // 半径修正
      const c = 2 * Math.PI * r; // 计算圆周长
      const w_min = c / len; // 最小矩形宽度
      const h_min = 4; // 最小矩形高度
      const w = w_min; // 计算每个矩形的宽度      
      const angle = 2 * Math.PI / len;      
      ctx.fillStyle = color; // 设置填充颜色
      ctx.strokeStyle = color; // 设置描边颜色   
      ctx.save()  // 保存 canvas 上下文
      ctx.translate(width / 2, height / 2); // 移动坐标轴到 canvas 中心
      for (let i = 0; i < len; i++) {
        const value = dataArray[i]; // value 是一个 0-255 的数值，表示当前频率的强度
        const h = value / 256 * 50; // h 是一个 0-140 的数值，表示矩形的高度 
        ctx.save()
        ctx.rotate(i * angle); // 旋转坐标轴
        ctx.beginPath();        
        ctx.fillRect(0, r, w < w_min ? w_min : w, h < h_min ? h_min : h); // 绘制矩形
        ctx.fill();
        ctx.restore();
      }
      ctx.restore() // 恢复 canvas 上下文
    }
    draw();
  }
}