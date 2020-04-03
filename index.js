import Granular from 'granular-js'
import { Rhythm } from 'rhythmical'
import Tone from 'tone'
// import StartAudioContext from 'startaudiocontext'
// import p5 from 'p5'
// import 'p5/lib/addons/p5.sound'

async function getData (url) {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest()

    request.open('GET', url, true)

    request.responseType = 'arraybuffer'

    request.onload = function () {
      const audioData = request.response

      resolve(audioData)
    }

    request.send()
  })
}

function startContext () {
  console.log('Tone is: ', Tone.context.state)
  document.getElementById('context').addEventListener('click', () => {
    Tone.context.resume()
    console.log('Tone is: ', Tone.context.state)
  })
}

startContext() 

async function init () {
  // const audioContext = p5.prototype.getAudioContext()
  const tone = new Tone()
  const audioContext = tone.context
  // new Tone.Context().rawContext
  // otherData = await getData('bowedWav.wav')
  const data = await getData('example.wav')

  // TODO: add some total-serialism
  const afrobell4 = [1, [0, 0.2], 0.1, [0, 1]]
  const afrobell3 = [3, [4, 3], 5, [1, 4]]

  class PlayNotes {
    constructor (notes, cycle) {
      this.notes = notes
      this.cycle = cycle
      // this.data = data
    }

    makeGrain () {
      this.grain = new Granular({
        audioContext,
        envelope: {
          attack: 0.2,
          release: 0.5
        },
        density: 0.7,
        spread: 0.6,
        pitch: 1
      })

      this.grain.on('settingBuffer', () => console.log('setting buffer'))
      this.grain.on('bufferSet', () => console.log('buffer set'))
      this.grain.on('grainCreated', () => console.log('grain created'))

      return this.grain
    }

    setGrain (data) {
      this.grain.setBuffer(data)
    }

    makePart (grain) {
      // TODO: replace this with p5.part
      // https://p5js.org/reference/#/p5.Part
      this.events = Rhythm.render(this.notes, this.cycle)
      return new Tone.Part(
        {
          callback: (time, event) => {
            // console.log(event)
            grain.set({
              pitch: event.value
            })
          },
          events: this.events,
          loop: true,
          loopEnd: this.cycle
        }).start()
    }
  }

  const instrument = new PlayNotes(afrobell4, 2, '')

  const grain = instrument.makeGrain()
  console.log(grain)
  await instrument.setGrain(data)

  instrument.makePart(grain)
}
init()
