import * as dat from 'dat.gui'
import { map, spreadInclusiveFloat } from './utils'
import Nexus from 'nexusui'

// TODO: interpolate between presets
// use pitchController.setValue(10) to set the value between preset1 and deeper 
// and automate back and forth
export const gui = new dat.GUI({
  load: {
    "preset": "another",
    "remembered": {
      "preset1": {
        "0": {
          "pitch": 5.331566469093988,
          "attack": 0.8720000000000002,
          "release": 1.320000000000001,
          "density": 0.6591024555461473
        }
      },
      "deeper": {
        "0": {
          "pitch": 0.7274682472480949,
          "attack": 0.05199999999999981,
          "release": 1.320000000000001,
          "density": 0.10635055038103303
        }
      }, 
      "sparse": {
        "0": {
          "pitch": 2.7274682472480949,
          "attack": 0.05199999999999981,
          "release": 1.320000000000001,
          "density": 0.10635055038103303
        }
      }
    },
    "closed": false,
    "folders": {}
  }
})

export const settings = {
  attack: 0.1,
  release: 0.1,
  pitch: 1,
  density: 1
}

export const pitchController = gui.add(settings, 'pitch', 0.1, 6)

gui.add(settings, 'attack')
gui.add(settings, 'release')
export const densityController = gui.add(settings, 'density', 0, 1)
gui.remember(settings)

const presets = gui.load.remembered
// console.log(presets)

// TODO: allow to pick which presets you go from and to
export function interpolatePresets (steps) {
  let pitches = []
  let density = []
  let preset = {}
  Object.keys(presets).forEach((k, i) => {
    pitches.push(presets[k][0].pitch)
    density.push(presets[k][0].density)
    preset.pitch = new Nexus.Sequence(spreadInclusiveFloat(steps, pitches[0], pitches[1]))
    preset.density = new Nexus.Sequence(spreadInclusiveFloat(steps, density[0], density[1]))
    // console.log(preset)
  })

  return preset
}

const interpolate = interpolatePresets(10)
// const interpolate = interpolatePresets(presets.preset1[0].pitch, presets.deeper[0].pitch, 8)
console.log(interpolate)
