import * as dat from 'dat.gui'
import { spreadInclusiveFloat } from './utils'
import Nexus from 'nexusui'

export const gui = new dat.GUI({
  load: {
    'preset': 'another',
    'remembered': {
      'preset1': {
        '0': {
          'pitch': 5.331566469093988,
          'attack': 0.8720000000000002,
          'release': 1.320000000000001,
          'density': 0.6591024555461473
        }
      },
      'deeper': {
        '0': {
          'pitch': 0.7274682472480949,
          'attack': 0.05199999999999981,
          'release': 1.320000000000001,
          'density': 0.10635055038103303
        }
      },
      'sparse': {
        '0': {
          'pitch': 2.7274682472480949,
          'attack': 0.05199999999999981,
          'release': 1.320000000000001,
          'density': 0.10635055038103303
        }
      }
    },
    'closed': false,
    'folders': {}
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

export function interpolatePresets (startPreset, endPreset, steps) {
  let pitches = []
  let density = []
  let preset = {}

  let start = presets[startPreset][0]
  let end = presets[endPreset][0]

  Object.keys(start).forEach((setting, i) => {
    console.log(start[setting], setting, i)
    if (setting === 'pitch') {
      pitches.push(start[setting])
    } else if (setting === 'density') {
      density.push(start[setting])
    }
  })

  Object.keys(end).forEach((setting, i) => {
    if (setting === 'pitch') {
      pitches.push(end[setting])
      preset.pitch = new Nexus.Sequence(spreadInclusiveFloat(steps, pitches[0], pitches[1]))
    } else if (setting === 'density') {
      density.push(end[setting])
      preset.density = new Nexus.Sequence(spreadInclusiveFloat(steps, density[0], density[1]))
    }
  })
  
  return preset
}
// const interpolate = interpolatePresets('preset1', 'sparse', 10)
// console.log(interpolate)
