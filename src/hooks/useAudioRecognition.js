import { InstantiateRuntime, GenerateFP } from '@/tools/audio/afp.js'
import { getSongRecognition } from '@/request/musicApi/songs.js'
import { ref } from 'vue'

const recUrl = 'src/tools/audio/rec.js'
const useAudioRecognition = (audio) => {
    const sampleRate = 8000 // 采样率，单位：Hz

    let audioCtx, recorderNode, micSourceNode
    let audioBuffer,bufferHealth // 用于更新画布
    let runtime = InstantiateRuntime() // 实例化运行时
    let micStream
    let result = ref([])

    const RecorderCallback = async (channel, duration) => {
        duration = Math.ceil(duration) // 取整
        let sampleBuffer = new Float32Array(channel.subarray(0, duration * 8000))   // 采样数据
        let audioFP = GenerateFP(sampleBuffer)  // 生成音频指纹
        let res = await getSongRecognition(audioFP, duration)  // 识别音乐
        
        if(!res.data.data.result) {
            console.log('未识别到音乐')
            return [];
        }
        return res.data.data.result
    }

    const initAudioCtx = async () => {

        runtime.then(() => {
            console.log('Runtime loaded.')
        })
        // AFP.wasm can't do it with anything other than 8KHz
        audioCtx = new window.AudioContext({
            sampleRate: sampleRate
        })
        if (audioCtx.state ==='suspended'){
            await audioCtx.resume()
            return
        } else if (audioCtx.state === 'running') {
            console.log('AudioContext is already running.')
        }

        let audioNode = audioCtx.createMediaElementSource(audio)
        await audioCtx.audioWorklet.addModule(recUrl)
        recorderNode = new AudioWorkletNode(audioCtx, "timed-recorder")
        audioNode.connect(recorderNode) // 连接到音频节点
        audioNode.connect(audioCtx.destination) // 连接到音频输出
        recorderNode.port.onmessage = async event => { // 监听工作线程的消息                
            switch (event.data.message) {
                case 'finished': // 录音结束
                    stopMicStream()
                    if (event.data.recording.length === 0) {
                        break
                    }
                    result.value = await RecorderCallback(event.data.recording, event.data.duration)
                    break
                case 'bufferhealth': // 录音中
                    bufferHealth = event.data.health
                    audioBuffer = event.data.recording
                    break
                default:
                    break
            }
        }
        console.log('Microphone connected.');  
    }

    const startMicStream = async () => {
        if (micStream || micSourceNode) {
            stopMicStream()
        }
        // Attempt to get user's microphone and connect it to the AudioContext.
        micStream = await navigator.mediaDevices.getUserMedia({
            audio: { // Only get audio.
                echoCancellation: false,
                autoGainControl: false,
                noiseSuppression: false,
                latency: 0,
            },
        })
        micSourceNode = audioCtx.createMediaStreamSource(micStream) 
        micSourceNode.connect(recorderNode) // 连接到音频输出  
    }

    const stopMicStream = () => {
        if (micSourceNode) {
            micSourceNode.disconnect(recorderNode) // 断开连接
            micSourceNode = null
        }
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop()) // 停止麦克风
            micStream = null
        }
    }

    const startRecording = async (duration) => {
        if (!audioCtx) {
            return false
        }
              
        startMicStream()
        recorderNode.port.postMessage({
            message: 'start',
            duration: duration
        })
    }

    const stopRecording = () => {
        if (!audioCtx) {
            return false
        }
        recorderNode.port.postMessage({
            message: 'abort'
        })
    }

    const getAudioVisual = () => {
        return {
            bufferHealth,
            audioBuffer
        }
    }

    const getResult = () => {
        return result
    }

    initAudioCtx()
    return {
        startRecording,
        stopRecording,
        getAudioVisual,
        getResult
    }
}
export default useAudioRecognition