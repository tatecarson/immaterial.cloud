import SimplexNoise from 'simplex-noise'
import Srl from 'total-serialism/build/ts.es5.min.js'
import Nexus from 'nexusui'
const Mod = Srl.Transform
const Rand = Srl.Stochastic

const simplex = new SimplexNoise(Math.random)

const ID = 'autoPlay'

export default class AutoPlay {
  constructor (granular) {
    this.granular = granular

    this.running = false
  }

  isRunning () {
    return this.running
  }

  start () {
    if (this.running) {
      return
    }

    const { granular } = this

    this.running = true

    let x = simplex.noise2D(performance.now() / 10000, 0)
    const palindrome = new Nexus.Sequence(Mod.palindrome([0, 7, 12, 3]))
    const dice = new Nexus.Sequence(Rand.dice(10))

    granular.set({
      pitch: 1
    })

    granular.startVoice({
      id: ID,
      position: map(x, -1, 1, 0, 1),
      volume: 0.5
    })

    const run = () => {
      x = simplex.noise2D(performance.now() / 10000, 0)
      
      granular.set({
        
        // pitch: dice.next(),
        density: map(palindrome.next(), 0, 12, 0, 1), 
        // density: 1,
        envelope: {
          // attack: map(x, -1, 1, 0, 0.5),
          // attack: 0.1,
          release: 0.1
        }
      })
      
      granular.updateVoice(ID, {
        position: map(palindrome.next(), 0, 12, 0, 1),
        volume: 0.5
      })

      if (this.running) {
        setTimeout(run)
      }
    }

    run()
  }

  stop () {
    this.granular.stopVoice(ID)

    this.running = false
  }
}

function map (value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
}

