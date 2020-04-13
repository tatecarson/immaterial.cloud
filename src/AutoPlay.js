import SimplexNoise from 'simplex-noise'
import Srl from 'total-serialism/build/ts.es5.min.js'
import Nexus from 'nexusui'

import { settings, interpolatePresets } from './presets'
import { map } from './utils'

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
    // pitchController.setValue(10)
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
      // TODO: remake the interp method here
      // if (interp) {
      //   // run the interp settings
      //   const interpolate = interpolatePresets('deeper', 'sparse', 10)
      //   console.log(interpolate.pitch)
      // granular.set({
      //   pitch: interpolate.pitch.next(), //interpolating between presets
      //   density: interpolate.density.next(),

      // })
      // } else {
      //   // run the normal settings from dat.gui
      // }

      granular.set({

        // pitch: dice.next(),
        pitch: settings.pitch,
        // pitch: deeper.next(), //interpolating between presets
        // density: map(palindrome.next(), 0, 12, 0, 1),
        density: settings.density,
        envelope: {
          // attack: map(x, -1, 1, 0, 0.5),
          attack: settings.release,
          release: settings.attack
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

  // interpolate () {
  //   if (this.running) {
  //     return
  //   }

  //   const { granular } = this

  //   this.running = true

  //   const interpolate = interpolatePresets('deeper', 'sparse', 10)
  //   console.log(interpolate.pitch)

  //   const run = () => {
  //     granular.set({
  //       pitch: interpolate.pitch.next(),
  //       density: interpolate.density.next()
  //     })

  //     if (this.running) {
  //       setTimeout(run)
  //     }
  //   }

  //   run()
  // }

  stop () {
    this.granular.stopVoice(ID)

    this.running = false
  }
}
